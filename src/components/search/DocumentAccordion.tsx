import { useState } from 'react';
import { Eye, Download, Move, MoreHorizontal, FileText, Clock, MapPin, User, Tag, CheckCircle, AlertCircle, Calendar, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Document {
  id: string;
  name: string;
  file_size?: number;
  mime_type?: string;
  category?: string;
  department?: string;
  tags?: string[];
  created_at: string;
  updated_at?: string;
  status?: string;
  content_text?: string;
}

interface DocumentAccordionProps {
  documents: Document[];
  loading?: boolean;
}

const DocumentAccordion = ({ documents, loading }: DocumentAccordionProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No documents found</p>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or clear filters to see more results.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Mock additional data for expanded view
  const getMockDocumentDetails = (doc: Document) => ({
    locationHistory: [
      {
        location: 'WH001-Z001-S001-R001',
        fullPath: 'Main Warehouse > Zone A > Shelf 1 > Rack R001',
        movedDate: new Date(doc.created_at).toISOString(),
        movedBy: 'system@company.com',
        reason: 'Initial upload assignment',
        duration: 'Current location'
      }
    ],
    accessHistory: [
      {
        action: 'viewed',
        user: 'john.doe@company.com',
        timestamp: new Date().toISOString(),
        duration: '3 minutes',
        device: 'Desktop - Chrome'
      }
    ],
    workflowStatus: {
      currentWorkflow: 'Document Processing',
      stage: 'Review Complete', 
      status: 'completed',
      assignedTo: 'admin@company.com'
    },
    properties: {
      fileSize: doc.file_size,
      mimeType: doc.mime_type,
      pageCount: Math.floor(Math.random() * 50) + 1,
      language: 'English',
      checksum: 'md5:abc123...'
    }
  });

  return (
    <Accordion type="multiple" value={expandedItems} onValueChange={setExpandedItems}>
      {documents.map((doc) => {
        const details = getMockDocumentDetails(doc);
        
        return (
          <AccordionItem key={doc.id} value={doc.id} className="border border-border rounded-lg mb-4">
            <AccordionTrigger className="hover:no-underline p-6 hover:bg-accent/50">
              <div className="flex items-center justify-between w-full mr-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Document thumbnail/icon */}
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                  
                  {/* Primary Info */}
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-base mb-1">{doc.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {doc.department && (
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {doc.department}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {formatFileSize(doc.file_size)}
                      </div>
                    </div>
                    
                    {/* Tags and Status */}
                    <div className="flex items-center gap-2 mt-2">
                      {doc.category && (
                        <Badge variant="secondary" className="text-xs">
                          {doc.category}
                        </Badge>
                      )}
                      {doc.status && (
                        <Badge className={`text-xs ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </Badge>
                      )}
                      {doc.tags && doc.tags.slice(0, 2).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {doc.tags && doc.tags.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{doc.tags.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Move className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Edit Metadata</DropdownMenuItem>
                      <DropdownMenuItem>Share Document</DropdownMenuItem>
                      <DropdownMenuItem>Archive</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-6 pb-6">
              <Separator className="mb-6" />
              
              <Tabs defaultValue="properties" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="properties">Properties</TabsTrigger>
                  <TabsTrigger value="location">Location History</TabsTrigger>
                  <TabsTrigger value="access">Access History</TabsTrigger>
                  <TabsTrigger value="workflow">Workflow</TabsTrigger>
                </TabsList>

                <TabsContent value="properties" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Basic Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">File Name:</span>
                          <span>{doc.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">File Size:</span>
                          <span>{formatFileSize(details.properties.fileSize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span>{details.properties.mimeType || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pages:</span>
                          <span>{details.properties.pageCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Created:</span>
                          <span>{new Date(doc.created_at).toLocaleString()}</span>
                        </div>
                        {doc.updated_at && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Modified:</span>
                            <span>{new Date(doc.updated_at).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Classification</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Department:</span>
                          <span>{doc.department || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <span>{doc.category || 'General'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className={`text-xs ${getStatusColor(doc.status)}`}>
                            {doc.status || 'Active'}
                          </Badge>
                        </div>
                        {doc.tags && doc.tags.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">Tags:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {doc.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {doc.content_text && (
                    <div>
                      <h4 className="font-medium mb-3">Content Preview</h4>
                      <div className="bg-muted p-4 rounded-lg text-sm">
                        <p className="text-muted-foreground">
                          {doc.content_text.length > 200 
                            ? doc.content_text.substring(0, 200) + '...'
                            : doc.content_text
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="location" className="space-y-4">
                  <h4 className="font-medium">Movement History</h4>
                  <div className="space-y-4">
                    {details.locationHistory.map((location, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                        <MapPin className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{location.location}</p>
                          <p className="text-sm text-muted-foreground">{location.fullPath}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Moved: {new Date(location.movedDate).toLocaleString()}</span>
                            <span>By: {location.movedBy}</span>
                            <span>Duration: {location.duration}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Reason: {location.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="access" className="space-y-4">
                  <h4 className="font-medium">Recent Access Activity</h4>
                  <div className="space-y-4">
                    {details.accessHistory.map((access, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                        <User className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm capitalize">{access.action}</p>
                          <p className="text-sm text-muted-foreground">{access.user}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{new Date(access.timestamp).toLocaleString()}</span>
                            <span>Duration: {access.duration}</span>
                            <span>Device: {access.device}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="workflow" className="space-y-4">
                  <h4 className="font-medium">Current Workflow Status</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">{details.workflowStatus.currentWorkflow}</p>
                        <p className="text-sm text-muted-foreground">
                          Stage: {details.workflowStatus.stage} • 
                          Status: <span className="capitalize">{details.workflowStatus.status}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Assigned to: {details.workflowStatus.assignedTo}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default DocumentAccordion;