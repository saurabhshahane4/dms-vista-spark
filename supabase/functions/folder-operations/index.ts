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
    const { operation, folderName, newFolderName, parentFolderId } = await req.json();
    
    if (!operation) {
      return new Response(JSON.stringify({ error: 'Operation is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Folder operation:', { operation, folderName, newFolderName, parentFolderId });

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
        if (!folderName) {
          return new Response(JSON.stringify({ error: 'Folder name is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Create folder in the folders table
        const { data: newFolder, error: createError } = await supabase
          .from('folders')
          .insert({
            user_id: user.id,
            name: folderName,
            parent_folder_id: parentFolderId || null
          })
          .select()
          .single();

        if (createError) throw createError;

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Folder "${folderName}" created successfully`,
          folder: newFolder
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

        // Update folder name in folders table
        const { error: renameError } = await supabase
          .from('folders')
          .update({ name: newFolderName })
          .eq('user_id', user.id)
          .eq('name', folderName);

        if (renameError) throw renameError;

        // Update documents that reference this folder
        const { error: updateDocsError } = await supabase
          .from('documents')
          .update({ folder_path: newFolderName })
          .eq('user_id', user.id)
          .eq('folder_path', folderName);

        if (updateDocsError) throw updateDocsError;

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Folder renamed to "${newFolderName}"` 
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

        // Get the folder to delete
        const { data: folderToDelete, error: fetchFolderError } = await supabase
          .from('folders')
          .select('*')
          .eq('user_id', user.id)
          .eq('name', folderName)
          .single();

        if (fetchFolderError) throw fetchFolderError;

        // Move documents to General folder
        const { error: moveDocsError } = await supabase
          .from('documents')
          .update({ folder_path: 'General' })
          .eq('user_id', user.id)
          .eq('folder_path', folderToDelete.full_path);

        if (moveDocsError) throw moveDocsError;

        // Delete the folder
        const { error: deleteError } = await supabase
          .from('folders')
          .delete()
          .eq('user_id', user.id)
          .eq('id', folderToDelete.id);

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