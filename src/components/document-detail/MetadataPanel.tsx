import { MapPin, User, Calendar, Tag, FileText, HardDrive, Cpu, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MetadataPanelProps {
  document: {
    id: string;
    name: string;
    mime_type: string;
    file_size: number;
    created_at: string;
    updated_at: string;
    tags: string[];
    status: string;
    category?: string;
    department?: string;
    folder_path?: string;
    is_physical: boolean;
    physical_location_id?: string;
  };
  showOCRInfo?: boolean;
}

export const MetadataPanel = ({ document, showOCRInfo = false }: MetadataPanelProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="h-full">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Basic Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Document Name</label>
                <p className="text-sm font-medium break-all">{document.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-sm">
                    {document.mime_type?.split('/')[1]?.toUpperCase() || 'Unknown'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Size</label>
                  <p className="text-sm">{formatFileSize(document.file_size || 0)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">{formatDate(document.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Modified</label>
                  <p className="text-sm">{formatDate(document.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Classification */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Classification
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge 
                    variant={document.status === 'active' ? 'default' : 'secondary'}
                  >
                    {document.status}
                  </Badge>
                </div>
              </div>
              {document.category && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="text-sm">{document.category}</p>
                </div>
              )}
              {document.department && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="text-sm">{document.department}</p>
                </div>
              )}
              {document.tags && document.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tags</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {document.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {document.folder_path && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Folder</label>
                  <p className="text-sm">{document.folder_path}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Physical Location */}
          {document.is_physical && (
            <>
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Physical Location
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Warehouse</label>
                    <p className="text-sm">Main Warehouse</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Zone</label>
                      <p className="text-sm">Zone A</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Shelf</label>
                      <p className="text-sm">Shelf 1</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Rack</label>
                    <p className="text-sm">Rack R001</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Barcode</label>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded text-xs">
                      WH001-Z001-S001-R001
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Access Control */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Access Control
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Owner</label>
                <p className="text-sm">Current User</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Permissions</label>
                <div className="mt-1">
                  <Badge variant="secondary">Owner</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Accessed</label>
                <p className="text-sm">Just now</p>
              </div>
            </div>
          </div>

          {/* OCR Information */}
          {showOCRInfo && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  OCR Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">OCR Engine</label>
                    <p className="text-sm">Tesseract 5.0</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Confidence Score</label>
                    <p className="text-sm">85%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Language Detected</label>
                    <p className="text-sm">English</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Processing Date</label>
                    <p className="text-sm">{formatDate(document.created_at)}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Technical Details */}
          <Separator />
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Technical Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">MIME Type</label>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded text-xs">
                  {document.mime_type}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Document ID</label>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded text-xs break-all">
                  {document.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};