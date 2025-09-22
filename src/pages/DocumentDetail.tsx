import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, FileText, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentViewer } from '@/components/document-detail/DocumentViewer';
import { MetadataPanel } from '@/components/document-detail/MetadataPanel';
import { OCRTextViewer } from '@/components/document-detail/OCRTextViewer';
import { EventTimeline } from '@/components/document-detail/EventTimeline';

interface DocumentData {
  id: string;
  name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  content_text?: string;
  tags: string[];
  status: string;
  category?: string;
  department?: string;
  folder_path?: string;
  is_physical: boolean;
  physical_location_id?: string;
}

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('preview');
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!id || !user) return;
    fetchDocument();
    fetchEvents();
  }, [id, user]);

  const fetchDocument = async () => {
    if (!id || !user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      setDocument(data);
      
      // Log document view event
      await logEvent('viewed', {
        user_id: user.id,
        details: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Error fetching document:', error);
      toast({
        title: "Error",
        description: "Failed to load document",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    if (!id || !user) return;

    try {
      // This would fetch from an audit log table - for now we'll create mock data
      const mockEvents = [
        {
          id: '1',
          type: 'created',
          user_name: 'John Doe',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          details: { source: 'upload' }
        },
        {
          id: '2',
          type: 'viewed',
          user_name: 'Jane Smith',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          details: { duration: '5 minutes' }
        }
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const logEvent = async (eventType: string, details: any) => {
    // This would log to an audit table
    console.log('Event logged:', eventType, details);
  };

  const handleDownload = async () => {
    if (!document) return;

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      a.click();
      URL.revokeObjectURL(url);

      await logEvent('downloaded', {
        user_id: user?.id,
        details: { format: document.mime_type }
      });

      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-lg w-full" />
            <div className="h-96 bg-muted rounded-lg w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Document not found</h1>
            <p className="text-muted-foreground mb-4">
              The document you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documents
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  {document.name}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary">
                    {document.mime_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                  </Badge>
                  <Badge 
                    variant={document.status === 'active' ? 'default' : 'secondary'}
                  >
                    {document.status}
                  </Badge>
                  {document.is_physical && (
                    <Badge variant="outline">Physical</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Document Preview
            </TabsTrigger>
            <TabsTrigger value="ocr" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              OCR Text View
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Event Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-0">
            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
              <div className="col-span-8">
                <DocumentViewer document={document} />
              </div>
              <div className="col-span-4">
                <MetadataPanel document={document} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ocr" className="space-y-0">
            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
              <div className="col-span-8">
                <OCRTextViewer document={document} />
              </div>
              <div className="col-span-4">
                <MetadataPanel document={document} showOCRInfo />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-0">
            <div className="h-[calc(100vh-200px)]">
              <EventTimeline events={events} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}