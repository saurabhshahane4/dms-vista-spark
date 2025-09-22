import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchFilters {
  customer?: string;
  documentType?: string;
  dateRange?: string;
  warehouse?: string;
  zone?: string;
  fileType?: string;
  minSize?: string;
  maxSize?: string;
  status?: string[];
  tags?: string;
  dateFrom?: string;
  dateTo?: string;
  priority?: string;
  confidentiality?: string;
  query?: string;
}

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

    // Get user from auth header
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

    const { filters, searchQuery } = await req.json() as { 
      filters: SearchFilters; 
      searchQuery?: string;
    };

    console.log('Advanced search request:', { filters, searchQuery, userId: user.id });

    // Build the query
    let query = supabaseClient
      .from('documents')
      .select(`
        id,
        name,
        file_path,
        file_size,
        mime_type,
        status,
        tags,
        category,
        department,
        folder_path,
        created_at,
        updated_at,
        is_physical,
        content_text
      `)
      .eq('user_id', user.id);

    // Apply text search if provided
    if (searchQuery && searchQuery.trim()) {
      query = query.or(`name.ilike.%${searchQuery}%,content_text.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`);
    }

    // Apply customer filter
    if (filters.customer) {
      // This would typically join with a customer table
      query = query.ilike('name', `%${filters.customer}%`);
    }

    // Apply document type filter
    if (filters.documentType) {
      query = query.eq('category', filters.documentType);
    }

    // Apply date range filters
    if (filters.dateRange) {
      const now = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0);
      }

      query = query.gte('created_at', startDate.toISOString());
    }

    // Apply custom date range
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endDate.toISOString());
    }

    // Apply file type filter
    if (filters.fileType) {
      const mimeTypeMap: { [key: string]: string[] } = {
        'pdf': ['application/pdf'],
        'doc': ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        'excel': ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
      };
      
      const mimeTypes = mimeTypeMap[filters.fileType];
      if (mimeTypes) {
        query = query.in('mime_type', mimeTypes);
      }
    }

    // Apply file size filters
    if (filters.minSize) {
      const minSizeBytes = parseFloat(filters.minSize) * 1024 * 1024; // Convert MB to bytes
      query = query.gte('file_size', minSizeBytes);
    }
    if (filters.maxSize) {
      const maxSizeBytes = parseFloat(filters.maxSize) * 1024 * 1024; // Convert MB to bytes
      query = query.lte('file_size', maxSizeBytes);
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    // Apply tags filter
    if (filters.tags) {
      const tagList = filters.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tagList.length > 0) {
        query = query.overlaps('tags', tagList);
      }
    }

    // Apply department filter (if priority/confidentiality maps to department)
    if (filters.priority) {
      query = query.eq('department', filters.priority);
    }

    // Execute the query
    const { data: documents, error: searchError } = await query
      .order('created_at', { ascending: false })
      .limit(100); // Limit results for performance

    if (searchError) {
      console.error('Search error:', searchError);
      throw searchError;
    }

    // Calculate search statistics
    const stats = {
      totalResults: documents?.length || 0,
      fileTypes: {} as { [key: string]: number },
      sizesGB: 0,
      categories: {} as { [key: string]: number },
    };

    if (documents) {
      documents.forEach(doc => {
        // Count file types
        if (doc.mime_type) {
          const fileType = doc.mime_type.split('/')[0];
          stats.fileTypes[fileType] = (stats.fileTypes[fileType] || 0) + 1;
        }

        // Sum file sizes
        if (doc.file_size) {
          stats.sizesGB += doc.file_size / (1024 * 1024 * 1024);
        }

        // Count categories
        if (doc.category) {
          stats.categories[doc.category] = (stats.categories[doc.category] || 0) + 1;
        }
      });

      stats.sizesGB = Math.round(stats.sizesGB * 100) / 100; // Round to 2 decimal places
    }

    console.log('Search completed:', { 
      resultsCount: documents?.length || 0, 
      filters,
      stats 
    });

    return new Response(
      JSON.stringify({ 
        documents: documents || [], 
        stats,
        appliedFilters: filters,
        searchQuery 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in advanced-search function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});