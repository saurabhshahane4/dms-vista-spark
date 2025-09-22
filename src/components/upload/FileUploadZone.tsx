import { useCallback, useRef, useState } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Image, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface FileWithValidation extends File {
  id: string;
  preview?: string;
  validation?: {
    status: 'valid' | 'error' | 'warning';
    messages: string[];
  };
  uploadProgress?: number;
}

interface FileUploadZoneProps {
  files: FileWithValidation[];
  onFilesChange: (files: FileWithValidation[]) => void;
  batchMode: boolean;
  validationResults?: any;
}

const FileUploadZone = ({ files, onFilesChange, batchMode, validationResults }: FileUploadZoneProps) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFiles = (newFiles: File[]) => {
    const processedFiles: FileWithValidation[] = newFiles.map(file => ({
      ...file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      validation: validateFile(file),
      uploadProgress: 0
    }));

    if (batchMode) {
      onFilesChange([...files, ...processedFiles]);
    } else {
      onFilesChange(processedFiles);
    }
  };

  const validateFile = (file: File) => {
    const messages: string[] = [];
    let status: 'valid' | 'error' | 'warning' = 'valid';

    // File size validation (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      messages.push('File size exceeds 20MB limit');
      status = 'error';
    }

    // File type validation
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      messages.push('Unsupported file type');
      status = 'error';
    }

    // OCR readiness check
    if (file.type.startsWith('image/') && file.size < 50 * 1024) {
      messages.push('Image may be too small for reliable OCR');
      status = 'warning';
    }

    return { status, messages };
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    onFilesChange(updatedFiles);
  };

  const getFileIcon = (file: FileWithValidation) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else {
      return <File className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getValidationIcon = (validation: FileWithValidation['validation']) => {
    switch (validation?.status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="border border-border/50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">File Upload</h3>
            <p className="text-sm text-muted-foreground">
              Drag & drop files or click to browse
              {batchMode && ' • Batch mode active'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Files
          </Button>
        </div>

        {/* Drop Zone */}
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={batchMode}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFiles(Array.from(e.target.files));
              }
            }}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp"
          />

          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <div className="space-y-2">
            <p className="text-foreground font-medium">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PDF, DOC, images • Max 20MB per file
            </p>
            {batchMode && (
              <Badge variant="secondary" className="mt-2">
                Batch Mode: Upload multiple files
              </Badge>
            )}
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              Selected Files ({files.length})
            </h4>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 border border-border rounded-lg bg-card"
                >
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img 
                        src={file.preview} 
                        alt="Preview"
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        {getFileIcon(file)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </p>
                      {getValidationIcon(file.validation)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {/* Validation Messages */}
                    {file.validation?.messages && file.validation.messages.length > 0 && (
                      <div className="mt-1">
                        {file.validation.messages.map((message, index) => (
                          <p 
                            key={index}
                            className={`text-xs ${
                              file.validation?.status === 'error' 
                                ? 'text-red-500' 
                                : 'text-yellow-600'
                            }`}
                          >
                            {message}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Upload Progress */}
                    {file.uploadProgress !== undefined && file.uploadProgress > 0 && (
                      <div className="mt-2">
                        <Progress value={file.uploadProgress} className="h-1" />
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="flex-shrink-0 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FileUploadZone;