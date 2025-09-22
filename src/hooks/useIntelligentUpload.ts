import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FileWithValidation extends File {
  id: string;
  preview?: string;
  validation?: {
    status: 'valid' | 'error' | 'warning';
    messages: string[];
  };
  uploadProgress?: number;
}

interface Customer {
  id: string;
  name: string;
  code: string;
  priority_level: string;
  document_types: string[];
}

interface DocumentType {
  category: string;
  type: string;
  subtype?: string;
  requiredMetadata?: string[];
}

interface LocationAssignment {
  status: 'auto-assigned' | 'manual-selection' | 'failed' | 'pending';
  assignedRack?: any;
  reason?: string;
  confidence?: number;
  alternatives?: any[];
  estimatedCapacityAfter?: number;
}

interface WorkflowPreview {
  triggeredWorkflows: any[];
  notifications: any[];
  routingRules: any[];
  estimatedProcessingTime: string;
}

interface ValidationStatus {
  isValid: boolean;
  errors: string[];
  fileValidation: Record<string, any>;
  metadataValidation: Record<string, string>;
}

interface OCRSuggestion {
  field: string;
  value: string;
  confidence: number;
}

interface UploadState {
  files: FileWithValidation[];
  customer: Customer | null;
  documentType: DocumentType | null;
  priority: string;
  confidentiality: string;
  locationAssignment: LocationAssignment;
  metadata: Record<string, any>;
  workflowPreview: WorkflowPreview;
  validationStatus: ValidationStatus;
  ocrSuggestions: OCRSuggestion[];
  uploading: boolean;
}

const initialState: UploadState = {
  files: [],
  customer: null,
  documentType: null,
  priority: 'normal',
  confidentiality: 'internal',
  locationAssignment: {
    status: 'pending'
  },
  metadata: {},
  workflowPreview: {
    triggeredWorkflows: [],
    notifications: [],
    routingRules: [],
    estimatedProcessingTime: ''
  },
  validationStatus: {
    isValid: false,
    errors: [],
    fileValidation: {},
    metadataValidation: {}
  },
  ocrSuggestions: [],
  uploading: false
};

export const useIntelligentUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>(initialState);
  const { user } = useAuth();
  const { toast } = useToast();

  // Auto-validate when state changes
  useEffect(() => {
    const errors: string[] = [];
    const metadataValidation: Record<string, string> = {};

    // File validation
    if (uploadState.files.length === 0) {
      errors.push('Please select at least one file');
    }

    // Customer validation
    if (!uploadState.customer) {
      errors.push('Please select a customer');
    }

    // Document type validation
    if (!uploadState.documentType) {
      errors.push('Please specify document type');
    }

    // Location assignment validation
    if (!uploadState.locationAssignment.assignedRack) {
      errors.push('Please assign a storage location');
    }

    // Required metadata validation
    if (uploadState.documentType?.requiredMetadata) {
      uploadState.documentType.requiredMetadata.forEach(field => {
        if (!uploadState.metadata[field] || uploadState.metadata[field].trim() === '') {
          metadataValidation[field] = 'This field is required';
          errors.push(`Missing required field: ${field}`);
        }
      });
    }

    // Always require title
    if (!uploadState.metadata.title || uploadState.metadata.title.trim() === '') {
      metadataValidation.title = 'Document title is required';
      errors.push('Document title is required');
    }

    const validationStatus: ValidationStatus = {
      isValid: errors.length === 0,
      errors,
      fileValidation: {},
      metadataValidation
    };

    setUploadState(prev => ({
      ...prev,
      validationStatus
    }));
  }, [uploadState.files, uploadState.customer, uploadState.documentType, uploadState.locationAssignment, uploadState.metadata]);

  const validateUpload = useCallback(() => {
    const errors: string[] = [];
    const metadataValidation: Record<string, string> = {};

    // File validation
    if (uploadState.files.length === 0) {
      errors.push('Please select at least one file');
    }

    // Customer validation
    if (!uploadState.customer) {
      errors.push('Please select a customer');
    }

    // Document type validation
    if (!uploadState.documentType) {
      errors.push('Please specify document type');
    }

    // Location assignment validation
    if (!uploadState.locationAssignment.assignedRack) {
      errors.push('Please assign a storage location');
    }

    // Required metadata validation
    if (uploadState.documentType?.requiredMetadata) {
      uploadState.documentType.requiredMetadata.forEach(field => {
        if (!uploadState.metadata[field] || uploadState.metadata[field].trim() === '') {
          metadataValidation[field] = 'This field is required';
          errors.push(`Missing required field: ${field}`);
        }
      });
    }

    // Always require title
    if (!uploadState.metadata.title || uploadState.metadata.title.trim() === '') {
      metadataValidation.title = 'Document title is required';
      errors.push('Document title is required');
    }

    const validationStatus: ValidationStatus = {
      isValid: errors.length === 0,
      errors,
      fileValidation: {},
      metadataValidation
    };

    setUploadState(prev => ({
      ...prev,
      validationStatus
    }));

    return validationStatus.isValid;
  }, [uploadState]);

  const setFiles = useCallback((files: FileWithValidation[]) => {
    setUploadState(prev => ({
      ...prev,
      files
    }));

    // Simulate OCR processing for images
    if (files.length > 0) {
      const imageFiles = files.filter(f => f.type && f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        // Mock OCR suggestions
        setTimeout(() => {
          const mockSuggestions: OCRSuggestion[] = [
            {
              field: 'title',
              value: 'Contract Agreement - ' + new Date().getFullYear(),
              confidence: 87
            },
            {
              field: 'contract_number',
              value: `CNT-${new Date().getFullYear()}-001`,
              confidence: 95
            },
            {
              field: 'effective_date',
              value: new Date().toISOString().split('T')[0],
              confidence: 92
            }
          ];

          setUploadState(prev => ({
            ...prev,
            ocrSuggestions: mockSuggestions
          }));
        }, 2000);
      }
    }
  }, []);

  const setCustomer = useCallback((customer: Customer | null) => {
    setUploadState(prev => ({
      ...prev,
      customer,
      locationAssignment: {
        status: 'pending'
      }
    }));
  }, []);

  const setDocumentType = useCallback((documentType: DocumentType | null) => {
    setUploadState(prev => ({
      ...prev,
      documentType,
      metadata: {
        ...prev.metadata,
        // Clear type-specific metadata when type changes
        ...(documentType ? {} : {})
      }
    }));
  }, []);

  const setLocationAssignment = useCallback((assignment: LocationAssignment) => {
    setUploadState(prev => ({
      ...prev,
      locationAssignment: assignment
    }));
  }, []);

  const setMetadata = useCallback((metadata: Record<string, any>) => {
    setUploadState(prev => ({
      ...prev,
      metadata
    }));
  }, []);

  const processUpload = useCallback(async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to upload documents.',
        variant: 'destructive'
      });
      return;
    }

    if (!validateUpload()) {
      toast({
        title: 'Validation Error',
        description: 'Please complete all required fields before uploading.',
        variant: 'destructive'
      });
      return;
    }

    setUploadState(prev => ({ ...prev, uploading: true }));

    try {
      // Process each file
      for (const file of uploadState.files) {
        // Upload file to Supabase Storage
        const fileExtension = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExtension}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        // Create document record
        const documentData = {
          user_id: user.id,
          name: uploadState.metadata.title || file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          category: uploadState.documentType?.category,
          department: uploadState.customer?.name,
          tags: uploadState.metadata.tags ? uploadState.metadata.tags.split(',').map((tag: string) => tag.trim()) : [],
          is_physical: true,
          status: 'active',
          extraction_status: 'pending'
        };

        const { data: document, error: documentError } = await supabase
          .from('documents')
          .insert(documentData)
          .select()
          .single();

        if (documentError) {
          throw documentError;
        }

        // Assign to rack if location is selected
        if (uploadState.locationAssignment.assignedRack) {
          const { error: locationError } = await supabase
            .from('document_locations')
            .insert({
              user_id: user.id,
              document_id: document.id,
              rack_id: uploadState.locationAssignment.assignedRack.id,
              assigned_by: user.id
            });

          if (locationError) {
            console.error('Location assignment error:', locationError);
            // Don't throw - document is still uploaded
          }
        }

        // Create location history entry
        if (uploadState.locationAssignment.assignedRack) {
          const { error: historyError } = await supabase
            .from('location_history')
            .insert({
              user_id: user.id,
              document_id: document.id,
              to_rack_id: uploadState.locationAssignment.assignedRack.id,
              moved_by: user.id,
              reason: 'Initial upload assignment',
              notes: `Auto-assigned via intelligent upload: ${uploadState.locationAssignment.reason}`
            });

          if (historyError) {
            console.error('History entry error:', historyError);
          }
        }
      }

      toast({
        title: 'Upload Successful',
        description: `${uploadState.files.length} document(s) uploaded and assigned successfully.`
      });

      // Reset form
      setUploadState(initialState);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'An error occurred during upload.',
        variant: 'destructive'
      });
    } finally {
      setUploadState(prev => ({ ...prev, uploading: false }));
    }
  }, [user, uploadState, validateUpload, toast]);

  return {
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
  };
};