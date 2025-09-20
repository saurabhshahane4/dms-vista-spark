import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the user from the request
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { operation, ...params } = await req.json();

    switch (operation) {
      case 'create_version':
        return await createVersion(supabaseClient, user.id, params);
      
      case 'get_versions':
        return await getVersions(supabaseClient, user.id, params);
      
      case 'restore_version':
        return await restoreVersion(supabaseClient, user.id, params);
      
      case 'share_document':
        return await shareDocument(supabaseClient, user.id, params);
      
      case 'get_shares':
        return await getShares(supabaseClient, user.id, params);
      
      case 'revoke_share':
        return await revokeShare(supabaseClient, user.id, params);

      case 'bulk_move':
        return await bulkMove(supabaseClient, user.id, params);

      case 'bulk_delete':
        return await bulkDelete(supabaseClient, user.id, params);

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid operation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Document operations error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createVersion(supabaseClient: any, userId: string, params: any) {
  const { documentId, filePath, fileSize, mimeType, comment, versionNumber } = params;

  try {
    // Mark all existing versions as not current
    await supabaseClient
      .from('document_versions')
      .update({ is_current: false })
      .eq('document_id', documentId)
      .eq('user_id', userId);

    // Create new version
    const { data, error } = await supabaseClient
      .from('document_versions')
      .insert({
        document_id: documentId,
        user_id: userId,
        version_number: versionNumber,
        file_path: filePath,
        file_size: fileSize,
        mime_type: mimeType,
        comment: comment || null,
        is_current: true
      })
      .select()
      .single();

    if (error) throw error;

    // Update main document record
    await supabaseClient
      .from('documents')
      .update({
        file_path: filePath,
        file_size: fileSize,
        mime_type: mimeType
      })
      .eq('id', documentId)
      .eq('user_id', userId);

    return new Response(
      JSON.stringify({ success: true, version: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating version:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create version' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getVersions(supabaseClient: any, userId: string, params: any) {
  const { documentId } = params;

  try {
    const { data, error } = await supabaseClient
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .order('version_number', { ascending: false });

    if (error) throw error;

    return new Response(
      JSON.stringify({ versions: data || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching versions:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch versions' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function restoreVersion(supabaseClient: any, userId: string, params: any) {
  const { documentId, versionId } = params;

  try {
    // Get version details
    const { data: version, error: versionError } = await supabaseClient
      .from('document_versions')
      .select('*')
      .eq('id', versionId)
      .eq('user_id', userId)
      .single();

    if (versionError || !version) throw new Error('Version not found');

    // Mark all versions as not current
    await supabaseClient
      .from('document_versions')
      .update({ is_current: false })
      .eq('document_id', documentId)
      .eq('user_id', userId);

    // Mark selected version as current
    await supabaseClient
      .from('document_versions')
      .update({ is_current: true })
      .eq('id', versionId)
      .eq('user_id', userId);

    // Update main document record
    await supabaseClient
      .from('documents')
      .update({
        file_path: version.file_path,
        file_size: version.file_size,
        mime_type: version.mime_type
      })
      .eq('id', documentId)
      .eq('user_id', userId);

    return new Response(
      JSON.stringify({ success: true, message: `Restored to version ${version.version_number}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error restoring version:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to restore version' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function shareDocument(supabaseClient: any, userId: string, params: any) {
  const { documentId, emailToShare, permissionLevel, expiresAt } = params;

  try {
    // Generate share token
    const shareToken = crypto.randomUUID();

    const { data, error } = await supabaseClient
      .from('document_shares')
      .insert({
        document_id: documentId,
        shared_by: userId,
        shared_with_email: emailToShare,
        permission_level: permissionLevel,
        share_token: shareToken,
        expires_at: expiresAt || null,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, share: data, shareUrl: `${Deno.env.get('SUPABASE_URL')}/shared/${shareToken}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sharing document:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to share document' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getShares(supabaseClient: any, userId: string, params: any) {
  const { documentId } = params;

  try {
    const { data, error } = await supabaseClient
      .from('document_shares')
      .select('*')
      .eq('document_id', documentId)
      .eq('shared_by', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(
      JSON.stringify({ shares: data || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching shares:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch shares' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function revokeShare(supabaseClient: any, userId: string, params: any) {
  const { shareId } = params;

  try {
    const { error } = await supabaseClient
      .from('document_shares')
      .update({ is_active: false })
      .eq('id', shareId)
      .eq('shared_by', userId);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: 'Share revoked successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error revoking share:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to revoke share' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function bulkMove(supabaseClient: any, userId: string, params: any) {
  const { documentIds, targetFolderId } = params;

  try {
    const { error } = await supabaseClient
      .from('documents')
      .update({ folder_path: targetFolderId || 'General' })
      .in('id', documentIds)
      .eq('user_id', userId);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: `Moved ${documentIds.length} documents` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error bulk moving documents:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to move documents' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function bulkDelete(supabaseClient: any, userId: string, params: any) {
  const { documentIds } = params;

  try {
    // Get file paths first
    const { data: documents, error: fetchError } = await supabaseClient
      .from('documents')
      .select('file_path')
      .in('id', documentIds)
      .eq('user_id', userId);

    if (fetchError) throw fetchError;

    // Delete from database first
    const { error: deleteError } = await supabaseClient
      .from('documents')
      .delete()
      .in('id', documentIds)
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    // Try to delete from storage (non-blocking)
    if (documents && documents.length > 0) {
      const filePaths = documents.map(doc => doc.file_path).filter(Boolean);
      if (filePaths.length > 0) {
        await supabaseClient.storage
          .from('documents')
          .remove(filePaths);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: `Deleted ${documentIds.length} documents` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error bulk deleting documents:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete documents' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}