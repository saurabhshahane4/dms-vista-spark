import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create embedding for the search query
    let queryEmbedding = null;
    try {
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: query,
        }),
      });

      if (embeddingResponse.ok) {
        const embeddingData = await embeddingResponse.json();
        queryEmbedding = embeddingData.data[0].embedding;
      }
    } catch (embeddingError) {
      console.error('Error creating query embedding:', embeddingError);
    }

    let documents = [];
    let searchMethod = 'keyword';

    // Try hybrid search if we have embeddings
    if (queryEmbedding) {
      try {
        const { data: hybridResults, error: hybridError } = await supabase
          .rpc('hybrid_search_documents', {
            search_query: query,
            query_embedding: queryEmbedding,
            user_id_param: user.id,
            max_results: 5
          });

        if (!hybridError && hybridResults && hybridResults.length > 0) {
          documents = hybridResults;
          searchMethod = 'hybrid';
        }
      } catch (hybridError) {
        console.error('Hybrid search error:', hybridError);
      }
    }

    // Fall back to keyword search if hybrid search failed or returned no results
    if (documents.length === 0) {
      const { data: keywordResults, error: searchError } = await supabase
        .from('documents')
        .select('id, name, content_text, file_path, created_at, tags, status')
        .eq('user_id', user.id)
        .or(`name.ilike.%${query}%, content_text.ilike.%${query}%, tags.cs.{${query}}`);

      if (!searchError) {
        documents = keywordResults || [];
        searchMethod = 'keyword';
      }
    }

    // Generate RAG response using the found documents
    if (documents.length > 0) {
      try {
        // Prepare context from relevant documents
        const context = documents
          .slice(0, 3) // Use top 3 most relevant documents
          .map((doc, index) => {
            const contentSnippet = doc.content_text 
              ? doc.content_text.substring(0, 500) + '...' 
              : 'No content extracted';
            return `Document ${index + 1}: "${doc.name}" (${doc.status})\nContent: ${contentSnippet}`;
          })
          .join('\n\n');

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an intelligent document assistant with access to the user's document library. 
                
                Your role is to:
                1. Answer questions based on the provided document context
                2. Provide specific information from the documents when available
                3. Cite which documents contain the information
                4. If the question can't be answered from the provided documents, say so clearly
                5. Be concise but comprehensive in your responses
                
                Always reference the specific documents you're drawing information from using their names.`
              },
              {
                role: 'user',
                content: `User Query: "${query}"
                
                Available Documents Context:
                ${context}
                
                Please provide a helpful response based on the above documents. If the documents don't contain relevant information to answer the query, let the user know and suggest they might need to search for different terms or check if the relevant documents have been uploaded.`
              }
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        const aiData = await response.json();
        const ragResponse = aiData.choices[0]?.message?.content;

        // Also provide document references
        const documentReferences = documents.slice(0, 3).map(doc => ({
          id: doc.id,
          name: doc.name,
          status: doc.status,
          created_at: doc.created_at,
          tags: doc.tags,
          similarity: doc.search_rank || doc.similarity || 'N/A'
        }));

        return new Response(JSON.stringify({
          response: ragResponse,
          documents: documentReferences,
          searchMethod,
          totalResults: documents.length,
          hasContent: documents.some(doc => doc.content_text)
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (aiError) {
        console.error('OpenAI RAG error:', aiError);
        // Fall back to simple summary
      }
    }

    // Fallback response when no documents found or AI failed
    return new Response(JSON.stringify({
      response: documents.length > 0 
        ? `I found ${documents.length} document(s) related to "${query}", but I need more context to provide a detailed answer. The documents found are: ${documents.map(d => d.name).join(', ')}.`
        : `I couldn't find any documents related to "${query}". You might want to try different search terms or check if the relevant documents have been uploaded and processed.`,
      documents: documents.slice(0, 5).map(doc => ({
        id: doc.id,
        name: doc.name,
        status: doc.status,
        created_at: doc.created_at,
        tags: doc.tags
      })),
      searchMethod,
      totalResults: documents.length,
      hasContent: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-search function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});