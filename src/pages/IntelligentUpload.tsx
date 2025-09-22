import { useState } from 'react';
import { ArrowLeft, Settings, FileTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import FileUploadZone from '@/components/upload/FileUploadZone';
import DocumentClassificationPanel from '@/components/upload/DocumentClassificationPanel';
import LocationAssignmentPanel from '@/components/upload/LocationAssignmentPanel';
import MetadataPanel from '@/components/upload/MetadataPanel';
import WorkflowPreviewPanel from '@/components/upload/WorkflowPreviewPanel';
import { useIntelligentUpload } from '@/hooks/useIntelligentUpload';
import { useNavigation } from '@/contexts/NavigationContext';

const IntelligentUpload = () => {
  const { setActiveTab } = useNavigation();
  const [batchMode, setBatchMode] = useState(false);
  const [showWorkflowPreview, setShowWorkflowPreview] = useState(false);
  
  const {
    uploadState,
    actions: {
      setFiles,
      setCustomer,
      setDocumentType,
      setLocationAssignment,
      setMetadata,
      validateUpload,
      processUpload
    }
  } = useIntelligentUpload();

  const isUploadValid = uploadState.validationStatus.isValid;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setActiveTab('Documents')}
                className="hover:bg-accent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Documents
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Intelligent Document Upload</h1>
                <p className="text-sm text-muted-foreground">
                  Smart upload with auto-routing and workflow integration
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBatchMode(!batchMode)}
                className={batchMode ? 'bg-primary/10 border-primary' : ''}
              >
                Batch Upload {batchMode && '(Active)'}
              </Button>
              <Button variant="outline" size="sm">
                <FileTemplate className="w-4 h-4 mr-2" />
                Templates
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - File Upload */}
          <div className="lg:col-span-2 space-y-6">
            <FileUploadZone 
              files={uploadState.files}
              onFilesChange={setFiles}
              batchMode={batchMode}
              validationResults={uploadState.validationStatus.fileValidation}
            />
            
            <DocumentClassificationPanel
              customer={uploadState.customer}
              documentType={uploadState.documentType}
              priority={uploadState.priority}
              confidentiality={uploadState.confidentiality}
              onCustomerChange={setCustomer}
              onDocumentTypeChange={setDocumentType}
              onPriorityChange={(priority) => setMetadata({ ...uploadState.metadata, priority })}
              onConfidentialityChange={(confidentiality) => setMetadata({ ...uploadState.metadata, confidentiality })}
            />
            
            <LocationAssignmentPanel
              customer={uploadState.customer}
              documentType={uploadState.documentType}
              assignment={uploadState.locationAssignment}
              onAssignmentChange={setLocationAssignment}
            />
          </div>

          {/* Right Column - Metadata & Workflow */}
          <div className="space-y-6">
            <MetadataPanel
              customer={uploadState.customer}
              documentType={uploadState.documentType}
              locationAssignment={uploadState.locationAssignment}
              metadata={uploadState.metadata}
              onMetadataChange={setMetadata}
              ocrSuggestions={uploadState.ocrSuggestions}
              validationErrors={uploadState.validationStatus.metadataValidation}
            />
            
            <Card className="border border-border/50">
              <div className="p-4">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto"
                  onClick={() => setShowWorkflowPreview(!showWorkflowPreview)}
                >
                  <span className="font-medium">Workflow Preview</span>
                  <span className="text-xs text-muted-foreground">
                    {uploadState.workflowPreview.triggeredWorkflows?.length || 0} workflows
                  </span>
                </Button>
                
                {showWorkflowPreview && (
                  <div className="mt-4">
                    <WorkflowPreviewPanel 
                      workflowPreview={uploadState.workflowPreview}
                      customer={uploadState.customer}
                      documentType={uploadState.documentType}
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {uploadState.files.length} file(s) selected
                {uploadState.customer && ` • Customer: ${uploadState.customer.name}`}
                {uploadState.locationAssignment.assignedRack && 
                  ` • Rack: ${uploadState.locationAssignment.assignedRack.code}`
                }
              </div>
              
              {!isUploadValid && (
                <div className="text-sm text-destructive">
                  {uploadState.validationStatus.errors.join(', ')}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setActiveTab('Documents')}>
                Cancel
              </Button>
              <Button 
                variant="outline"
                onClick={() => {/* Save as draft */}}
                disabled={uploadState.files.length === 0}
              >
                Save Draft
              </Button>
              <Button 
                onClick={processUpload}
                disabled={!isUploadValid || uploadState.uploading}
                className="bg-primary hover:bg-primary/90"
              >
                {uploadState.uploading ? 'Uploading...' : batchMode ? 'Process Batch' : 'Upload Document'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Add padding to prevent content from being hidden by fixed bottom bar */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default IntelligentUpload;