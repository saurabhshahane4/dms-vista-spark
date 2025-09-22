import React, { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Download, Loader } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentProcessorProps {
  document: {
    id: string;
    name: string;
    file_path: string;
    extraction_status?: string;
    content_text?: string;
    embedding?: any;
  };
  onUpdate?: () => void;
}

export const DocumentProcessor: React.FC<DocumentProcessorProps> = ({ document, onUpdate }) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const processDocument = useCallback(async () => {
    if (!document.id) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-document-content', {
        body: { documentId: document.id }
      });

      if (error) {
        console.error('OCR processing error:', error);
        toast.error('Failed to process document: ' + error.message);
        return;
      }

      if (data?.success) {
        toast.success(`Document processed successfully! Extracted ${data.contentLength} characters.`);
        onUpdate?.();
      } else {
        toast.error('Document processing failed');
      }
    } catch (error) {
      console.error('Error processing document:', error);
      toast.error('Error processing document');
    } finally {
      setIsProcessing(false);
    }
  }, [document.id, onUpdate]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'completed': return 'Processed';
      case 'processing': return 'Processing';
      case 'failed': return 'Failed';
      default: return 'Pending';
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 border rounded-lg bg-card">
      <FileText className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{document.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={getStatusColor(document.extraction_status)} className="text-xs">
            {getStatusText(document.extraction_status)}
          </Badge>
          {document.content_text && (
            <span className="text-xs text-muted-foreground">
              {document.content_text.length} chars extracted
            </span>
          )}
          {document.embedding && (
            <Badge variant="secondary" className="text-xs">
              Embedded
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {document.extraction_status !== 'completed' && (
          <Button
            size="sm"
            variant="outline"
            onClick={processDocument}
            disabled={isProcessing}
            className="h-8 px-2"
          >
            {isProcessing ? (
              <Loader className="h-3 w-3 animate-spin" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
          </Button>
        )}
        {document.content_text && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const blob = new Blob([document.content_text!], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const element = window.document.createElement('a');
              element.href = url;
              element.download = `${document.name}_content.txt`;
              element.click();
              URL.revokeObjectURL(url);
            }}
            className="h-8 px-2"
          >
            <Download className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};