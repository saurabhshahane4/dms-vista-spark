import { useState, useEffect } from 'react';
import { Search, Copy, Download, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface OCRTextViewerProps {
  document: {
    id: string;
    content_text?: string;
    name: string;
  };
}

export const OCRTextViewer = ({ document }: OCRTextViewerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{ index: number; text: string }[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [highlightedText, setHighlightedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Mock OCR text if none exists
  const ocrText = document.content_text || `This is sample OCR extracted text from the document "${document.name}".

The optical character recognition (OCR) process has been completed with high confidence levels. This text demonstrates various formatting capabilities and shows how the original document structure is preserved.

Key features of the OCR system:
• High accuracy text recognition
• Confidence scoring for each word
• Automatic language detection
• Support for multiple document formats

Technical specifications:
- Engine: Tesseract 5.0
- Language: English (auto-detected)
- Confidence: 85% average
- Processing time: 2.3 seconds

This text can be searched, copied, and exported for further use. The OCR extraction maintains the logical flow of the original document while making it fully searchable and accessible.

Please note that some formatting from the original document may not be perfectly preserved, but the content accuracy remains high.`;

  useEffect(() => {
    if (searchTerm && ocrText) {
      performSearch();
    } else {
      setSearchResults([]);
      setHighlightedText(ocrText);
    }
  }, [searchTerm, ocrText]);

  const performSearch = () => {
    if (!searchTerm.trim()) return;

    const regex = new RegExp(searchTerm.trim(), 'gi');
    const matches = Array.from(ocrText.matchAll(regex));
    
    const results = matches.map((match, index) => ({
      index,
      text: match[0]
    }));

    setSearchResults(results);
    setCurrentResultIndex(0);

    // Highlight search results
    const highlighted = ocrText.replace(regex, (match) => 
      `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">${match}</mark>`
    );
    setHighlightedText(highlighted);
  };

  const navigateToResult = (direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = (currentResultIndex + 1) % searchResults.length;
    } else {
      newIndex = currentResultIndex === 0 ? searchResults.length - 1 : currentResultIndex - 1;
    }
    setCurrentResultIndex(newIndex);
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(ocrText);
      toast({
        title: "Success",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      });
    }
  };

  const exportText = () => {
    const blob = new Blob([ocrText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.name}_extracted_text.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Text exported successfully",
    });
  };

  const reprocessOCR = async () => {
    setIsProcessing(true);
    // Mock reprocessing delay
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Success",
        description: "OCR text has been reprocessed",
      });
    }, 3000);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 dark:text-green-400';
    if (confidence >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search in text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToResult('prev')}
                >
                  ↑
                </Button>
                <span className="text-sm">
                  {currentResultIndex + 1} of {searchResults.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToResult('next')}
                >
                  ↓
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={reprocessOCR}
              disabled={isProcessing}
            >
              <RotateCw className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
              Reprocess
            </Button>
            <Button variant="outline" size="sm" onClick={copyText}>
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </Button>
            <Button variant="outline" size="sm" onClick={exportText}>
              <Download className="w-4 h-4 mr-2" />
              Export TXT
            </Button>
          </div>
        </div>

        {/* OCR Stats */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Confidence:</span>
            <Badge variant="secondary" className={getConfidenceColor(85)}>
              85%
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Words:</span>
            <Badge variant="outline">
              {ocrText.split(/\s+/).length}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Characters:</span>
            <Badge variant="outline">
              {ocrText.length}
            </Badge>
          </div>
          {searchResults.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Matches:</span>
              <Badge variant="outline">
                {searchResults.length}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Text Content */}
      <div className="flex-1 bg-muted/20">
        <ScrollArea className="h-full p-6">
          {isProcessing ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Reprocessing OCR text...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Page breaks and text content */}
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Page 1</h4>
                  <Badge variant="outline" className={getConfidenceColor(85)}>
                    85% confidence
                  </Badge>
                </div>
                
                <div
                  className="prose max-w-none text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightedText.replace(/\n/g, '<br>') 
                  }}
                />
              </div>

              {/* Additional pages would be rendered here */}
            </div>
          )}
        </ScrollArea>
      </div>
    </Card>
  );
};