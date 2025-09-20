import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  documents: any[];
  aiSummary?: string;
  totalResults: number;
}

const AISearchInput = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || !session) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-search', {
        body: { query: searchQuery },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setResults(data);
      setIsOpen(true);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to perform search. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="AI Search"
            className="pl-10 w-64 bg-background border-border"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!session}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96 bg-popover" align="start">
        {results ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Search Results</h3>
              <span className="text-sm text-muted-foreground">
                {results.totalResults} result{results.totalResults !== 1 ? 's' : ''}
              </span>
            </div>
            
            {results.aiSummary && (
              <div className="p-3 bg-dms-blue/10 rounded-lg border border-dms-blue/20">
                <p className="text-sm text-dms-blue font-medium mb-1">AI Summary</p>
                <p className="text-sm">{results.aiSummary}</p>
              </div>
            )}

            {results.documents.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {results.documents.map((doc) => (
                  <div key={doc.id} className="p-3 border rounded-lg hover:bg-accent">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Status: {doc.status} • {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {doc.tags.slice(0, 3).map((tag: string, idx: number) => (
                              <span key={idx} className="text-xs bg-secondary px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No documents found for "{query}"
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              {session ? 'Enter a search query and press Enter' : 'Please sign in to search'}
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default AISearchInput;