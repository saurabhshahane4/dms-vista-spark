import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import mammoth from "https://esm.sh/mammoth@1.6.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { documentId } = await req.json();

    if (!documentId) {
      return new Response(JSON.stringify({ error: 'Document ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get document details
    const { data: document, error: docError } = await supabaseClient
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (docError || !document) {
      return new Response(JSON.stringify({ error: 'Document not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update status to processing
    await supabaseClient
      .from('documents')
      .update({ extraction_status: 'processing' })
      .eq('id', documentId);

    let extractedText = '';

    try {
      // Download the file
      const { data: fileBlob, error: downloadError } = await supabaseClient.storage
        .from('documents')
        .download(document.file_path);

      if (downloadError) throw downloadError;

      // Extract text based on file type
      const mimeType = document.mime_type;
      
      if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // DOCX files
        const arrayBuffer = await fileBlob.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else if (mimeType === 'application/pdf') {
        // For PDFs, we'll need a different approach - for now, store filename as content
        extractedText = `PDF Document: ${document.name}`;
      } else if (mimeType?.startsWith('text/')) {
        // Text files
        extractedText = await fileBlob.text();
      } else if (mimeType?.startsWith('image/')) {
        // For images, use the filename and any existing tags
        extractedText = `Image: ${document.name} ${document.tags ? document.tags.join(' ') : ''}`;
      } else {
        // For other file types, use metadata
        extractedText = `Document: ${document.name} ${document.tags ? document.tags.join(' ') : ''}`;
      }

      // Create embedding using OpenAI
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      let embedding = null;

      if (openaiApiKey && extractedText.trim()) {
        try {
          const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'text-embedding-3-small',
              input: extractedText.substring(0, 8000), // Limit to 8000 chars
            }),
          });

          if (embeddingResponse.ok) {
            const embeddingData = await embeddingResponse.json();
            embedding = embeddingData.data[0].embedding;
          }
        } catch (embeddingError) {
          console.error('Error creating embedding:', embeddingError);
        }
      }

      // Update document with extracted content and embedding
      const updateData: any = {
        content_text: extractedText,
        content_extracted_at: new Date().toISOString(),
        extraction_status: 'completed'
      };

      if (embedding) {
        updateData.embedding = embedding;
      }

      const { error: updateError } = await supabaseClient
        .from('documents')
        .update(updateData)
        .eq('id', documentId);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({
        success: true,
        contentLength: extractedText.length,
        hasEmbedding: !!embedding
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (extractionError) {
      console.error('Content extraction error:', extractionError);
      
      // Update status to failed
      await supabaseClient
        .from('documents')
        .update({ extraction_status: 'failed' })
        .eq('id', documentId);

      return new Response(JSON.stringify({
        error: 'Failed to extract document content',
        details: extractionError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Extract document content error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});