import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Move, Trash2, FolderOpen, X, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "@/hooks/useDocuments";

interface BulkOperationsPanelProps {
  selectedDocuments: string[];
  onSelectionClear: () => void;
  onOperationComplete: () => void;
}

interface UploadProgress {
  name: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export const BulkOperationsPanel = ({ 
  selectedDocuments, 
  onSelectionClear, 
  onOperationComplete 
}: BulkOperationsPanelProps) => {
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showBulkMove, setShowBulkMove] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [uploading, setUploading] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string>("");
  const [operating, setOperating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { allFolders, refetch } = useDocuments();

  const handleBulkUpload = async () => {
    if (!files || files.length === 0 || !user) {
      toast({
        title: 'Error',
        description: 'Please select files to upload',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    const fileArray = Array.from(files);
    const progressArray: UploadProgress[] = fileArray.map(file => ({
      name: file.name,
      progress: 0,
      status: 'pending'
    }));
    setUploadProgress(progressArray);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      try {
        // Update status to uploading
        setUploadProgress(prev => prev.map((item, index) => 
          index === i ? { ...item, status: 'uploading', progress: 0 } : item
        ));

        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${file.name}`;

        // Upload file
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);
        
        // Simulate progress for better UX
        setUploadProgress(prev => prev.map((item, index) => 
          index === i ? { ...item, progress: 100 } : item
        ));

        if (uploadError) throw uploadError;

        // Create document record
        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            name: file.name,
            file_path: fileName,
            file_size: file.size,
            mime_type: file.type,
            folder_path: targetFolderId || 'General'
          });

        if (dbError) throw dbError;

        // Update status to success
        setUploadProgress(prev => prev.map((item, index) => 
          index === i ? { ...item, status: 'success', progress: 100 } : item
        ));
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        setUploadProgress(prev => prev.map((item, index) => 
          index === i ? { 
            ...item, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Upload failed' 
          } : item
        ));
      }
    }

    setUploading(false);
    toast({
      title: 'Upload Complete',
      description: `Uploaded ${fileArray.length} files`
    });
    
    onOperationComplete();
    refetch();
  };

  const handleBulkMove = async () => {
    if (!targetFolderId || selectedDocuments.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select a target folder',
        variant: 'destructive'
      });
      return;
    }

    setOperating(true);
    try {
      const { error } = await supabase
        .from('documents')
        .update({ folder_path: targetFolderId })
        .in('id', selectedDocuments);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Moved ${selectedDocuments.length} documents`
      });

      onSelectionClear();
      onOperationComplete();
      setShowBulkMove(false);
      refetch();
    } catch (error) {
      console.error('Error moving documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to move documents',
        variant: 'destructive'
      });
    } finally {
      setOperating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.length === 0) return;

    setOperating(true);
    try {
      // First get the file paths to delete from storage
      const { data: documents, error: fetchError } = await supabase
        .from('documents')
        .select('file_path')
        .in('id', selectedDocuments);

      if (fetchError) throw fetchError;

      // Delete from storage
      if (documents && documents.length > 0) {
        const filePaths = documents.map(doc => doc.file_path).filter(Boolean);
        if (filePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('documents')
            .remove(filePaths);
          
          if (storageError) console.warn('Some files could not be deleted from storage:', storageError);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .in('id', selectedDocuments);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Deleted ${selectedDocuments.length} documents`
      });

      onSelectionClear();
      onOperationComplete();
      setShowBulkDelete(false);
      refetch();
    } catch (error) {
      console.error('Error deleting documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete documents',
        variant: 'destructive'
      });
    } finally {
      setOperating(false);
    }
  };

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-dms-success" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  if (selectedDocuments.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg p-4 min-w-[400px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{selectedDocuments.length} selected</Badge>
          <span className="text-sm text-muted-foreground">documents</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onSelectionClear}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        {/* Bulk Upload */}
        <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="w-4 h-4" />
              Bulk Upload
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bulk Upload Documents</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="bulk-files">Select Files</Label>
                <Input
                  id="bulk-files"
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  disabled={uploading}
                />
              </div>

              <div>
                <Label htmlFor="target-folder">Target Folder (Optional)</Label>
                <Select value={targetFolderId} onValueChange={setTargetFolderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select folder (or leave empty for General)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">General</SelectItem>
                    {allFolders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.full_path}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {uploadProgress.length > 0 && (
                <div className="space-y-2">
                  <Label>Upload Progress</Label>
                  <ScrollArea className="h-40">
                    {uploadProgress.map((item, index) => (
                      <div key={index} className="space-y-1 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="truncate flex-1 mr-2">{item.name}</span>
                          {getStatusIcon(item.status)}
                        </div>
                        <Progress value={item.progress} className="h-2" />
                        {item.error && (
                          <p className="text-xs text-destructive">{item.error}</p>
                        )}
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowBulkUpload(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkUpload}
                  disabled={!files || files.length === 0 || uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Move */}
        <Dialog open={showBulkMove} onOpenChange={setShowBulkMove}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Move className="w-4 h-4" />
              Move
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Move {selectedDocuments.length} Documents</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="move-target-folder">Target Folder</Label>
                <Select value={targetFolderId} onValueChange={setTargetFolderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    {allFolders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4" />
                          {folder.full_path}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowBulkMove(false)}
                  disabled={operating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkMove}
                  disabled={!targetFolderId || operating}
                >
                  {operating ? 'Moving...' : 'Move Documents'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Delete */}
        <Dialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete {selectedDocuments.length} Documents</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete {selectedDocuments.length} documents? 
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowBulkDelete(false)}
                  disabled={operating}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={operating}
                >
                  {operating ? 'Deleting...' : 'Delete Documents'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};