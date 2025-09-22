import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Bot, FileText, Loader, Brain, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  status: string;
  created_at: string;
  tags: string[];
  similarity?: string | number;
}

interface AISearchResponse {
  response: string;
  documents: Document[];
  searchMethod: string;
  totalResults: number;
  hasContent: boolean;
}

export const AISearchBox: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<AISearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const { data, error: searchError } = await supabase.functions.invoke('ai-search', {
        body: { query: query.trim() }
      });

      if (searchError) {
        console.error('AI Search error:', searchError);
        setError(searchError.message || 'Search failed');
        toast.error('Search failed: ' + (searchError.message || 'Unknown error'));
        return;
      }

      setSearchResult(data);
      
      if (data.totalResults === 0) {
        toast.info('No documents found for your query');
      } else {
        toast.success(`Found ${data.totalResults} relevant document(s)`);
      }
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error('Search error: ' + errorMessage);
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch();
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'hybrid': return <Brain className="h-3 w-3" />;
      case 'semantic': return <Bot className="h-3 w-3" />;
      case 'keyword': return <Database className="h-3 w-3" />;
      default: return <Search className="h-3 w-3" />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'hybrid': return 'Hybrid AI + Keyword';
      case 'semantic': return 'AI Semantic Search';
      case 'keyword': return 'Keyword Search';
      default: return 'Search';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Document Search & Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ask about your documents or search for content..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-10"
              disabled={isSearching}
            />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={isSearching || !query.trim()}
            className="gap-2"
          >
            {isSearching ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 border border-destructive/20 rounded-lg bg-destructive/10">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Search Results */}
        {searchResult && (
          <div className="space-y-4">
            {/* Search Method Indicator */}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="gap-1">
                {getMethodIcon(searchResult.searchMethod)}
                {getMethodLabel(searchResult.searchMethod)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {searchResult.totalResults} result(s)
              </span>
            </div>

            {/* AI Response */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Bot className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">AI Response:</p>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {searchResult.response}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document References */}
            {searchResult.documents.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-3">Referenced Documents:</h4>
                  <ScrollArea className="h-60">
                    <div className="space-y-2">
                      {searchResult.documents.map((doc) => (
                        <Card key={doc.id} className="p-3 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(doc.created_at).toLocaleDateString()}
                                </p>
                                {doc.tags && doc.tags.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {doc.tags.slice(0, 2).map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {doc.similarity && doc.similarity !== 'N/A' && (
                                <Badge variant="outline" className="text-xs">
                                  {typeof doc.similarity === 'number' 
                                    ? `${Math.round(doc.similarity * 100)}%`
                                    : doc.similarity
                                  }
                                </Badge>
                              )}
                              <Badge 
                                variant={doc.status === 'active' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {doc.status}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </>
            )}

            {/* No Content Warning */}
            {!searchResult.hasContent && searchResult.documents.length > 0 && (
              <div className="p-3 border border-warning/20 rounded-lg bg-warning/10">
                <p className="text-sm text-warning-foreground">
                  📝 Some documents may not have extracted content yet. 
                  Try processing them for better search results.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Examples */}
        {!searchResult && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "What budget documents do I have?",
                "Show me policy documents",
                "Find contracts from this year"
              ].map((example) => (
                <Button
                  key={example}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2"
                  onClick={() => setQuery(example)}
                >
                  "{example}"
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};