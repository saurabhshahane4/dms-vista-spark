import { useState } from 'react';
import { Search, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
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

  const suggestedQueries = [
    "Show me recent contracts",
    "Find financial reports from Q4", 
    "Search for safety documents",
    "What documents need approval?"
  ];

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
    if (e.key === 'Enter' && !isSearching) {
      handleSearch(query);
    }
  };

  const handleSuggestedQuery = (suggestedQuery: string) => {
    setQuery(suggestedQuery);
    handleSearch(suggestedQuery);
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <>
      <Button 
        variant="ghost" 
        className="text-muted-foreground hover:text-foreground flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">AI Search</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-dms-blue rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-foreground">AI Document Search</DialogTitle>
                  <p className="text-sm text-muted-foreground">Ask me anything about your documents</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 flex flex-col p-6">
            {/* AI Assistant Message */}
            <div className="mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-dms-blue" />
                </div>
                <div className="bg-muted/50 rounded-lg p-4 max-w-lg">
                  <p className="text-sm text-foreground mb-4">
                    Hello! I'm your document search assistant. Ask me anything about your documents - I can search by content, date, department, or any other criteria.
                  </p>
                  
                  {/* Suggested Queries */}
                  <div className="flex flex-wrap gap-2">
                    {suggestedQueries.map((suggestedQuery, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleSuggestedQuery(suggestedQuery)}
                      >
                        {suggestedQuery}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 ml-11">{getCurrentTime()}</p>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto">
              {isSearching && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-dms-blue" />
                </div>
              )}

              {results && (
                <div className="space-y-4">
                  {results.aiSummary && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-dms-blue" />
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 max-w-lg">
                        <p className="text-sm text-foreground">{results.aiSummary}</p>
                      </div>
                    </div>
                  )}

                  {results.documents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        Found {results.totalResults} document{results.totalResults !== 1 ? 's' : ''}:
                      </p>
                      {results.documents.slice(0, 5).map((doc) => (
                        <div key={doc.id} className="p-3 border border-border/30 rounded-lg">
                          <h4 className="font-medium text-foreground text-sm">{doc.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {new Date(doc.created_at).toLocaleDateString()}
                            </Badge>
                            {doc.tags && doc.tags.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {doc.tags[0]}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {doc.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.documents.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        No documents found for "{query}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Ask about your documents..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSearching || !session}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleSearch(query)}
                  disabled={isSearching || !query.trim() || !session}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {!session && (
                <p className="text-xs text-muted-foreground mt-2">Please sign in to search</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AISearchInput;