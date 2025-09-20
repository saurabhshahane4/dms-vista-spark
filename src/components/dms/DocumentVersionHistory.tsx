import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { History, Upload, Download, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface DocumentVersionHistoryProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface DocumentVersion {
  id: string;
  version_number: number;
  file_path: string;
  file_size: number;
  comment: string;
  is_current: boolean;
  created_at: string;
}

export const DocumentVersionHistory = ({ documentId, isOpen, onClose }: DocumentVersionHistoryProps) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingVersion, setUploadingVersion] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [versionComment, setVersionComment] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && documentId) {
      fetchVersions();
    }
  }, [isOpen, documentId]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load version history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadNewVersion = async () => {
    if (!newVersionFile || !user) {
      toast({
        title: 'Error',
        description: 'Please select a file',
        variant: 'destructive'
      });
      return;
    }

    setUploadingVersion(true);
    try {
      // Get next version number
      const nextVersion = Math.max(...versions.map(v => v.version_number), 0) + 1;
      
      // Upload file
      const fileExt = newVersionFile.name.split('.').pop();
      const fileName = `${documentId}/v${nextVersion}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, newVersionFile);

      if (uploadError) throw uploadError;

      // Mark all versions as not current
      await supabase
        .from('document_versions')
        .update({ is_current: false })
        .eq('document_id', documentId);

      // Create new version record
      const { error: versionError } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          user_id: user.id,
          version_number: nextVersion,
          file_path: fileName,
          file_size: newVersionFile.size,
          mime_type: newVersionFile.type,
          comment: versionComment,
          is_current: true
        });

      if (versionError) throw versionError;

      // Update main document record with new file path
      await supabase
        .from('documents')
        .update({ 
          file_path: fileName,
          file_size: newVersionFile.size,
          mime_type: newVersionFile.type
        })
        .eq('id', documentId);

      toast({
        title: 'Success',
        description: `Version ${nextVersion} uploaded successfully`
      });

      // Reset form
      setNewVersionFile(null);
      setVersionComment("");
      fetchVersions();
    } catch (error) {
      console.error('Error uploading version:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload new version',
        variant: 'destructive'
      });
    } finally {
      setUploadingVersion(false);
    }
  };

  const restoreVersion = async (version: DocumentVersion) => {
    if (!user) return;

    try {
      // Mark all versions as not current
      await supabase
        .from('document_versions')
        .update({ is_current: false })
        .eq('document_id', documentId);

      // Mark selected version as current
      await supabase
        .from('document_versions')
        .update({ is_current: true })
        .eq('id', version.id);

      // Update main document record
      await supabase
        .from('documents')
        .update({ 
          file_path: version.file_path,
          file_size: version.file_size
        })
        .eq('id', documentId);

      toast({
        title: 'Success',
        description: `Restored to version ${version.version_number}`
      });

      fetchVersions();
    } catch (error) {
      console.error('Error restoring version:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore version',
        variant: 'destructive'
      });
    }
  };

  const downloadVersion = async (version: DocumentVersion) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(version.file_path);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `document_v${version.version_number}`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading version:', error);
      toast({
        title: 'Error',
        description: 'Failed to download version',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Version History
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload New Version */}
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
            <h3 className="font-medium text-foreground">Upload New Version</h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="version-file">Select File</Label>
                <Input
                  id="version-file"
                  type="file"
                  onChange={(e) => setNewVersionFile(e.target.files?.[0] || null)}
                />
              </div>
              
              <div>
                <Label htmlFor="version-comment">Version Comment</Label>
                <Textarea
                  id="version-comment"
                  placeholder="Describe what changed in this version..."
                  value={versionComment}
                  onChange={(e) => setVersionComment(e.target.value)}
                  rows={2}
                />
              </div>
              
              <Button
                onClick={uploadNewVersion}
                disabled={!newVersionFile || uploadingVersion}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploadingVersion ? 'Uploading...' : 'Upload Version'}
              </Button>
            </div>
          </div>

          {/* Version List */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">All Versions</h3>
            
            <ScrollArea className="h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : versions.length > 0 ? (
                <div className="space-y-3">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">Version {version.version_number}</span>
                          {version.is_current && (
                            <Badge variant="default" className="text-xs">Current</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-1">
                          {version.comment || 'No comment'}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{(version.file_size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>{new Date(version.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadVersion(version)}
                          className="gap-1"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        
                        {!version.is_current && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => restoreVersion(version)}
                            className="gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Restore
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No version history found
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};