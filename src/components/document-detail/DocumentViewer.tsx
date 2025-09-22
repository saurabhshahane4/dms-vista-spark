import { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import mammoth from 'mammoth';

interface DocumentViewerProps {
  document: {
    id: string;
    file_path: string;
    mime_type: string;
    name: string;
  };
}

export const DocumentViewer = ({ document }: DocumentViewerProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [docxContent, setDocxContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(1); // For now, single page - would be calculated for PDFs
  const { toast } = useToast();

  useEffect(() => {
    if (document) {
      loadDocument();
    }
  }, [document]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);

      if (document.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        await loadDocxContent();
      } else {
        const { data, error } = await supabase.storage
          .from('documents')
          .createSignedUrl(document.file_path, 3600);

        if (error) throw error;
        setPreviewUrl(data.signedUrl);
      }
    } catch (error) {
      console.error('Error loading document:', error);
      setError('Failed to load document preview');
      toast({
        title: "Error",
        description: "Failed to load document preview",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDocxContent = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      const arrayBuffer = await data.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setDocxContent(result.value);
    } catch (error) {
      console.error('Error loading DOCX:', error);
      throw error;
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFitToWidth = () => {
    setZoom(100);
  };

  const handlePrint = () => {
    if (previewUrl) {
      const printWindow = window.open(previewUrl, '_blank');
      printWindow?.print();
    }
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <p className="text-destructive mb-2">{error}</p>
            <Button onClick={loadDocument} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </div>
      );
    }

    if (document.mime_type?.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <img
            src={previewUrl || ''}
            alt={document.name}
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
            className="transition-transform duration-200"
          />
        </div>
      );
    }

    if (document.mime_type === 'application/pdf') {
      return (
        <div className="h-full">
          <iframe
            src={previewUrl || ''}
            className="w-full h-full border-none"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            }}
          />
        </div>
      );
    }

    if (docxContent) {
      return (
        <ScrollArea className="h-full p-6">
          <div
            className="prose max-w-none"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'top left',
            }}
            dangerouslySetInnerHTML={{ __html: docxContent }}
          />
        </ScrollArea>
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-center">
        <div>
          <p className="text-muted-foreground mb-2">
            Preview not available for this file type
          </p>
          <p className="text-sm text-muted-foreground">
            {document.mime_type}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-2 min-w-[200px]">
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              min={25}
              max={300}
              step={25}
              className="flex-1"
            />
            <span className="text-sm font-medium min-w-[50px]">{zoom}%</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleFitToWidth}>
            Fit Width
          </Button>
          <Button variant="outline" size="sm" onClick={handleRotate}>
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Page Navigation */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Document Preview */}
      <div className="flex-1 bg-muted/20">
        {renderPreview()}
      </div>
    </Card>
  );
};