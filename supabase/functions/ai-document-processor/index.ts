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
    const { fileName, documentType, documentTitle } = await req.json();
    
    if (!fileName) {
      return new Response(JSON.stringify({ error: 'File name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing document:', { fileName, documentType, documentTitle });

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

    // Get the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(fileName);

    if (downloadError) {
      console.error('Download error:', downloadError);
      return new Response(JSON.stringify({ error: 'Failed to download file' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Convert file to base64 for OpenAI (for images) or extract text content
    let contentForAI = '';
    let processingType = 'text';

    const fileType = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'webp'].includes(fileType || '')) {
      // For images, convert to base64
      const arrayBuffer = await fileData.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      contentForAI = `data:image/${fileType};base64,${base64}`;
      processingType = 'image';
    } else {
      // For text files, extract text content
      contentForAI = await fileData.text();
      processingType = 'text';
    }

    // Use OpenAI to analyze the document
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Calling OpenAI for document analysis...');

    let messages;
    
    if (processingType === 'image') {
      messages = [
        {
          role: 'system',
          content: 'You are a document analysis AI. Analyze the uploaded image/document and provide insights about its content, type, key information, and suggested tags.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this document image. Document type: ${documentType}, Title: ${documentTitle}. Please provide: 1) Content summary 2) Key information extracted 3) Suggested tags 4) Document classification 5) Any important dates or numbers found.`
            },
            {
              type: 'image_url',
              image_url: {
                url: contentForAI
              }
            }
          ]
        }
      ];
    } else {
      messages = [
        {
          role: 'system',
          content: 'You are a document analysis AI. Analyze the uploaded text document and provide insights about its content, type, key information, and suggested tags.'
        },
        {
          role: 'user',
          content: `Analyze this document content. Document type: ${documentType}, Title: ${documentTitle}, Content: ${contentForAI.substring(0, 3000)}... Please provide: 1) Content summary 2) Key information extracted 3) Suggested tags 4) Document classification 5) Any important dates or numbers found.`
        }
      ];
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: processingType === 'image' ? 'gpt-4o-mini' : 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    const aiData = await response.json();
    console.log('OpenAI response received');

    if (!aiData.choices || !aiData.choices[0]) {
      throw new Error('Invalid OpenAI response');
    }

    const analysis = aiData.choices[0].message.content;

    // Parse the analysis to extract structured data
    const analysisData = {
      summary: analysis,
      processingType,
      fileSize: fileData.size,
      processed: true,
      aiAnalysis: analysis
    };

    console.log('Document analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisData,
      message: 'Document processed successfully with AI analysis'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-document-processor function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});