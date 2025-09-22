import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface SearchResult {
  id: string;
  name: string;
  file_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  status: string | null;
  tags: string[] | null;
  category: string | null;
  department: string | null;
  folder_path: string | null;
  created_at: string;
  updated_at: string;
  is_physical: boolean | null;
  content_text: string | null;
}

interface SearchStats {
  totalResults: number;
  fileTypes: { [key: string]: number };
  sizesGB: number;
  categories: { [key: string]: number };
}

interface SearchResponse {
  documents: SearchResult[];
  stats: SearchStats;
  appliedFilters: SearchFilters;
  searchQuery?: string;
}

export const useAdvancedSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null);
  const [lastSearchFilters, setLastSearchFilters] = useState<SearchFilters>({});
  const { toast } = useToast();

  const performAdvancedSearch = useCallback(async (
    filters: SearchFilters,
    searchQuery?: string
  ): Promise<SearchResponse | null> => {
    setIsSearching(true);
    
    try {
      console.log('Performing advanced search:', { filters, searchQuery });

      const { data, error } = await supabase.functions.invoke('advanced-search', {
        body: {
          filters,
          searchQuery
        }
      });

      if (error) {
        console.error('Search function error:', error);
        throw error;
      }

      const response = data as SearchResponse;
      
      setSearchResults(response.documents);
      setSearchStats(response.stats);
      setLastSearchFilters(filters);

      toast({
        title: "Search Completed",
        description: `Found ${response.stats.totalResults} documents matching your criteria`,
      });

      return response;

    } catch (error) {
      console.error('Advanced search error:', error);
      toast({
        title: "Search Error",
        description: error.message || "Failed to perform search. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  const searchByBarcode = useCallback(async (barcode: string): Promise<SearchResult[]> => {
    setIsSearching(true);
    
    try {
      console.log('Searching by barcode:', barcode);

      // Search for documents with barcode in name, tags, or content
      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .or(`name.ilike.%${barcode}%,tags.cs.{${barcode}},content_text.ilike.%${barcode}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const results = documents || [];
      setSearchResults(results);

      // Update stats
      const stats: SearchStats = {
        totalResults: results.length,
        fileTypes: {},
        sizesGB: 0,
        categories: {},
      };

      results.forEach(doc => {
        if (doc.mime_type) {
          const fileType = doc.mime_type.split('/')[0];
          stats.fileTypes[fileType] = (stats.fileTypes[fileType] || 0) + 1;
        }
        if (doc.file_size) {
          stats.sizesGB += doc.file_size / (1024 * 1024 * 1024);
        }
        if (doc.category) {
          stats.categories[doc.category] = (stats.categories[doc.category] || 0) + 1;
        }
      });

      stats.sizesGB = Math.round(stats.sizesGB * 100) / 100;
      setSearchStats(stats);

      toast({
        title: results.length > 0 ? "Barcode Found!" : "No Results",
        description: results.length > 0 
          ? `Found ${results.length} document(s) matching barcode: ${barcode}`
          : `No documents found matching barcode: ${barcode}`,
        variant: results.length > 0 ? "default" : "destructive",
      });

      return results;

    } catch (error) {
      console.error('Barcode search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search by barcode. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchStats(null);
    setLastSearchFilters({});
  }, []);

  const searchWithAI = useCallback(async (query: string): Promise<SearchResult[]> => {
    setIsSearching(true);
    
    try {
      console.log('Performing AI search:', query);

      // For now, use the advanced search with intelligent query parsing
      // In a real implementation, this would use AI/NLP to understand the query
      
      // Simple query parsing - extract potential filters from natural language
      const filters: SearchFilters = { query };
      
      // Look for date references
      if (query.toLowerCase().includes('today')) {
        filters.dateRange = 'today';
      } else if (query.toLowerCase().includes('this week')) {
        filters.dateRange = 'week';
      } else if (query.toLowerCase().includes('this month')) {
        filters.dateRange = 'month';
      } else if (query.toLowerCase().includes('this year')) {
        filters.dateRange = 'year';
      }

      // Look for document types
      if (query.toLowerCase().includes('pdf')) {
        filters.fileType = 'pdf';
      } else if (query.toLowerCase().includes('word') || query.toLowerCase().includes('doc')) {
        filters.fileType = 'doc';
      } else if (query.toLowerCase().includes('image') || query.toLowerCase().includes('photo')) {
        filters.fileType = 'image';
      } else if (query.toLowerCase().includes('excel') || query.toLowerCase().includes('spreadsheet')) {
        filters.fileType = 'excel';
      }

      // Look for categories
      if (query.toLowerCase().includes('legal')) {
        filters.documentType = 'legal';
      } else if (query.toLowerCase().includes('financial')) {
        filters.documentType = 'financial';
      } else if (query.toLowerCase().includes('hr')) {
        filters.documentType = 'hr';
      }

      const response = await performAdvancedSearch(filters, query);
      return response?.documents || [];

    } catch (error) {
      console.error('AI search error:', error);
      toast({
        title: "AI Search Error",
        description: "Failed to perform AI search. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  }, [performAdvancedSearch, toast]);

  return {
    isSearching,
    searchResults,
    searchStats,
    lastSearchFilters,
    performAdvancedSearch,
    searchByBarcode,
    searchWithAI,
    clearSearch,
  };
};