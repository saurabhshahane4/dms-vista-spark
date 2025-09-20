import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Share2, History, X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DocumentVersionHistory } from "./DocumentVersionHistory";
import { DocumentSharing } from "./DocumentSharing";
import mammoth from "mammoth";

interface DocumentPreviewProps {
  documentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface DocumentData {
  id: string;
  name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  current_version?: number;
  total_versions?: number;
}

export const DocumentPreview = ({ documentId, isOpen, onClose }: DocumentPreviewProps) => {
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [docxContent, setDocxContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showSharing, setShowSharing] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (documentId && isOpen) {
      fetchDocument();
    }
  }, [documentId, isOpen]);

  const fetchDocument = async () => {
    if (!documentId) return;
    
    setLoading(true);
    setError(null);
    setDocxContent(null); // Reset DOCX content
    setPreviewUrl(null); // Reset preview URL
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) throw error;

      setDocument(data);
      
      // Handle DOCX files differently
      if (data.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
          data.name.toLowerCase().endsWith('.docx')) {
        console.log('Detected DOCX file:', data.name, 'mime_type:', data.mime_type);
        await loadDocxContent(data.file_path);
      } else {
        // Get signed URL for preview
        if (data.file_path) {
          const { data: urlData, error: urlError } = await supabase.storage
            .from('documents')
            .createSignedUrl(data.file_path, 3600);
          
          if (urlError) throw urlError;
          setPreviewUrl(urlData.signedUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      setError('Failed to load document');
      toast({
        title: 'Error',
        description: 'Failed to load document preview',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document?.file_path) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Document downloaded successfully'
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive'
      });
    }
  };

  const loadDocxContent = async (filePath: string) => {
    try {
      console.log('Loading DOCX file:', filePath);
      const { data: fileBlob, error } = await supabase.storage
        .from('documents')
        .download(filePath);
      
      if (error) throw error;
      
      console.log('Downloaded DOCX file, size:', fileBlob.size);
      const arrayBuffer = await fileBlob.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      console.log('DOCX conversion result:', result.value.length, 'characters');
      setDocxContent(result.value);
      
      if (result.messages.length > 0) {
        console.warn('DOCX conversion warnings:', result.messages);
      }
    } catch (error) {
      console.error('Error loading DOCX content:', error);
      setError('Failed to load document content');
    }
  };

  const renderPreview = () => {
    if (!document || !previewUrl) return null;

    const { mime_type } = document;

    if (mime_type?.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-full bg-muted/20">
          <img
            src={previewUrl}
            alt={document.name}
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease'
            }}
          />
        </div>
      );
    }

    if (mime_type === 'application/pdf') {
      return (
        <div className="h-full">
          <iframe
            src={`${previewUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full border-0"
            title={document.name}
          />
        </div>
      );
    }

    if (mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        document.name.toLowerCase().endsWith('.docx')) {
      console.log('Rendering DOCX content, length:', docxContent?.length);
      return (
        <ScrollArea className="h-full">
          <div className="p-6 max-w-4xl mx-auto">
            {docxContent ? (
              <div className="bg-card p-8 rounded-lg shadow-sm min-h-[600px] border border-border">
                <div 
                  className="prose prose-lg max-w-none text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_h4]:text-foreground [&_h5]:text-foreground [&_h6]:text-foreground [&_p]:text-foreground [&_li]:text-foreground [&_td]:text-foreground [&_th]:text-foreground"
                  dangerouslySetInnerHTML={{ __html: docxContent }}
                  style={{
                    fontSize: `${zoom}%`,
                    lineHeight: '1.6'
                  }}
                />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={handleDownload} className="gap-2">
                  <Download className="w-4 h-4" />
                  Download to view
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Converting document...</p>
              </div>
            )}
          </div>
        </ScrollArea>
      );
    }

    if (mime_type?.startsWith('text/') || mime_type?.includes('json')) {
      return (
        <ScrollArea className="h-full p-4">
          <iframe
            src={previewUrl}
            className="w-full min-h-[600px] border-0"
            title={document.name}
          />
        </ScrollArea>
      );
    }

    // Fallback for unsupported file types
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 bg-dms-blue/10 rounded-lg flex items-center justify-center mb-4">
          <Download className="w-8 h-8 text-dms-blue" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Preview not available</h3>
        <p className="text-muted-foreground mb-4">
          This file type cannot be previewed in the browser.
        </p>
        <Button onClick={handleDownload} className="gap-2">
          <Download className="w-4 h-4" />
          Download to view
        </Button>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl h-[90vh] p-0">
          <DialogHeader className="p-6 pb-2 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl">{document?.name || 'Loading...'}</DialogTitle>
                {document && (
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {document.mime_type?.split('/').pop()?.toUpperCase()}
                    </Badge>
                    {document.current_version && (
                      <Badge variant="secondary" className="text-xs">
                        v{document.current_version}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {(document?.mime_type?.startsWith('image/') || 
                  document?.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(Math.max(25, zoom - 25))}
                      disabled={zoom <= 25}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      {zoom}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(Math.min(200, zoom + 25))}
                      disabled={zoom >= 200}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    {document?.mime_type?.startsWith('image/') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRotation((prev) => (prev + 90) % 360)}
                      >
                        <RotateCw className="w-4 h-4" />
                      </Button>
                    )}
                  </>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVersionHistory(true)}
                  className="gap-2"
                >
                  <History className="w-4 h-4" />
                  Versions
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSharing(true)}
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-destructive">{error}</p>
              </div>
            ) : (
              renderPreview()
            )}
          </div>
        </DialogContent>
      </Dialog>

      {document && (
        <>
          <DocumentVersionHistory
            documentId={document.id}
            isOpen={showVersionHistory}
            onClose={() => setShowVersionHistory(false)}
          />
          
          <DocumentSharing
            documentId={document.id}
            documentName={document.name}
            isOpen={showSharing}
            onClose={() => setShowSharing(false)}
          />
        </>
      )}
    </>
  );
};