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
    const { operation, folderName, newFolderName, category, department } = await req.json();
    
    if (!operation) {
      return new Response(JSON.stringify({ error: 'Operation is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Folder operation:', { operation, folderName, newFolderName, category, department });

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

    switch (operation) {
      case 'create':
        if (!folderName || !category || !department) {
          return new Response(JSON.stringify({ error: 'Folder name, category, and department are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Create a placeholder document to establish the folder structure
        const { error: createError } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            name: `.folder_placeholder_${Date.now()}`,
            file_path: `${user.id}/${department}/${category}/.placeholder`,
            file_size: 0,
            mime_type: 'text/plain',
            category: category,
            department: department,
            status: 'active',
            tags: [category.toLowerCase().replace(/\s+/g, '-'), 'folder-placeholder']
          });

        if (createError) throw createError;

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Folder "${folderName}" created successfully` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'rename':
        if (!folderName || !newFolderName) {
          return new Response(JSON.stringify({ error: 'Current and new folder names are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Update all documents in this folder to have the new category name
        const { error: renameError } = await supabase
          .from('documents')
          .update({ category: newFolderName })
          .eq('user_id', user.id)
          .eq('folder_path', folderName);

        if (renameError) throw renameError;

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Folder renamed to "${newFolderName}"` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'copy':
        if (!folderName || !newFolderName) {
          return new Response(JSON.stringify({ error: 'Source and target folder names are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get all documents in the source folder
        const { data: documentsToyCopy, error: fetchError } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .eq('folder_path', folderName);

        if (fetchError) throw fetchError;

        // Create copies of all documents with new category
        if (documentsToyCopy && documentsToyCopy.length > 0) {
          const newDocuments = documentsToyCopy.map(doc => ({
            user_id: doc.user_id,
            name: `Copy of ${doc.name}`,
            file_path: doc.file_path?.replace(folderName, newFolderName),
            file_size: doc.file_size,
            mime_type: doc.mime_type,
            category: newFolderName,
            department: doc.department,
            status: doc.status,
            is_physical: doc.is_physical,
            tags: doc.tags
          }));

          const { error: insertError } = await supabase
            .from('documents')
            .insert(newDocuments);

          if (insertError) throw insertError;

          return new Response(JSON.stringify({ 
            success: true, 
            message: `Folder copied as "${newFolderName}" with ${newDocuments.length} documents`,
            documentCount: newDocuments.length
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Empty folder copied as "${newFolderName}"`,
          documentCount: 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'delete':
        if (!folderName) {
          return new Response(JSON.stringify({ error: 'Folder name is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Move all documents in this folder to "General" category
        const { error: deleteError } = await supabase
          .from('documents')
          .update({ 
            category: 'General',
            status: 'active' // Make sure they're not hidden
          })
          .eq('user_id', user.id)
          .eq('folder_path', folderName);

        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Folder "${folderName}" deleted. Documents moved to General folder.` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Invalid operation' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Error in folder-operations function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});