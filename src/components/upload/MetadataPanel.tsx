import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  DollarSign,
  Hash,
  User,
  Building
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MetadataField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number' | 'select' | 'email';
  required: boolean;
  placeholder?: string;
  options?: string[];
  icon?: React.ReactNode;
  validation?: (value: string) => string | null;
}

interface OCRSuggestion {
  field: string;
  value: string;
  confidence: number;
}

interface MetadataPanelProps {
  customer: any;
  documentType: any;
  locationAssignment: any;
  metadata: Record<string, any>;
  onMetadataChange: (metadata: Record<string, any>) => void;
  ocrSuggestions?: OCRSuggestion[];
  validationErrors?: Record<string, string>;
}

const MetadataPanel = ({
  customer,
  documentType,
  locationAssignment,
  metadata,
  onMetadataChange,
  ocrSuggestions = [],
  validationErrors = {}
}: MetadataPanelProps) => {
  const [dynamicFields, setDynamicFields] = useState<MetadataField[]>([]);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  // Base metadata fields that always appear
  const baseFields: MetadataField[] = [
    {
      key: 'title',
      label: 'Document Title',
      type: 'text',
      required: true,
      placeholder: 'Enter document title...',
      icon: <FileText className="w-4 h-4" />
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Brief description of the document...',
      icon: <FileText className="w-4 h-4" />
    },
    {
      key: 'tags',
      label: 'Tags',
      type: 'text',
      required: false,
      placeholder: 'Comma-separated tags...',
      icon: <Hash className="w-4 h-4" />
    }
  ];

  useEffect(() => {
    generateDynamicFields();
  }, [customer, documentType, locationAssignment]);

  const generateDynamicFields = () => {
    let fields: MetadataField[] = [...baseFields];

    // Customer-specific fields
    if (customer) {
      const customerFields = getCustomerSpecificFields(customer.id);
      fields = [...fields, ...customerFields];
    }

    // Document type-specific fields
    if (documentType) {
      const docTypeFields = getDocumentTypeFields(documentType.category, documentType.type);
      fields = [...fields, ...docTypeFields];
    }

    // Location-specific fields
    if (locationAssignment?.assignedRack) {
      const locationFields = getLocationSpecificFields(locationAssignment.assignedRack);
      fields = [...fields, ...locationFields];
    }

    setDynamicFields(fields);
  };

  const getCustomerSpecificFields = (customerId: string): MetadataField[] => {
    const customerFieldsMap: Record<string, MetadataField[]> = {
      '1': [ // Acme Corporation
        {
          key: 'contract_number',
          label: 'Contract Number',
          type: 'text',
          required: true,
          placeholder: 'CNT-YYYY-XXXX',
          icon: <Hash className="w-4 h-4" />
        },
        {
          key: 'legal_entity',
          label: 'Legal Entity',
          type: 'select',
          required: true,
          options: ['Acme Corp', 'Acme Holdings', 'Acme Subsidiary'],
          icon: <Building className="w-4 h-4" />
        },
        {
          key: 'jurisdiction',
          label: 'Jurisdiction',
          type: 'select',
          required: false,
          options: ['Federal', 'State', 'International'],
          icon: <Building className="w-4 h-4" />
        }
      ],
      '2': [ // Global Tech Solutions
        {
          key: 'project_code',
          label: 'Project Code',
          type: 'text',
          required: true,
          placeholder: 'PROJ-YYYY-XXX',
          icon: <Hash className="w-4 h-4" />
        },
        {
          key: 'department',
          label: 'Department',
          type: 'select',
          required: true,
          options: ['Engineering', 'Sales', 'Marketing', 'Operations'],
          icon: <Building className="w-4 h-4" />
        },
        {
          key: 'cost_center',
          label: 'Cost Center',
          type: 'text',
          required: false,
          placeholder: 'CC-XXXX',
          icon: <DollarSign className="w-4 h-4" />
        }
      ]
    };

    return customerFieldsMap[customerId] || [];
  };

  const getDocumentTypeFields = (category: string, type: string): MetadataField[] => {
    const typeFieldsMap: Record<string, MetadataField[]> = {
      'legal-contract': [
        {
          key: 'parties',
          label: 'Contract Parties',
          type: 'textarea',
          required: true,
          placeholder: 'List all parties to the contract...',
          icon: <User className="w-4 h-4" />
        },
        {
          key: 'effective_date',
          label: 'Effective Date',
          type: 'date',
          required: true,
          icon: <Calendar className="w-4 h-4" />
        },
        {
          key: 'expiry_date',
          label: 'Expiry Date',
          type: 'date',
          required: false,
          icon: <Calendar className="w-4 h-4" />
        },
        {
          key: 'contract_value',
          label: 'Contract Value',
          type: 'number',
          required: false,
          placeholder: '0.00',
          icon: <DollarSign className="w-4 h-4" />
        }
      ],
      'financial-invoice': [
        {
          key: 'invoice_number',
          label: 'Invoice Number',
          type: 'text',
          required: true,
          placeholder: 'INV-YYYY-XXXX',
          icon: <Hash className="w-4 h-4" />
        },
        {
          key: 'po_number',
          label: 'PO Number',
          type: 'text',
          required: false,
          placeholder: 'PO-YYYY-XXXX',
          icon: <Hash className="w-4 h-4" />
        },
        {
          key: 'amount',
          label: 'Amount',
          type: 'number',
          required: true,
          placeholder: '0.00',
          icon: <DollarSign className="w-4 h-4" />
        },
        {
          key: 'due_date',
          label: 'Due Date',
          type: 'date',
          required: true,
          icon: <Calendar className="w-4 h-4" />
        }
      ],
      'hr-resume': [
        {
          key: 'candidate_name',
          label: 'Candidate Name',
          type: 'text',
          required: true,
          placeholder: 'Full name...',
          icon: <User className="w-4 h-4" />
        },
        {
          key: 'position',
          label: 'Position Applied For',
          type: 'text',
          required: true,
          placeholder: 'Job title...',
          icon: <Building className="w-4 h-4" />
        },
        {
          key: 'experience_years',
          label: 'Years of Experience',
          type: 'number',
          required: false,
          placeholder: '0',
          icon: <Calendar className="w-4 h-4" />
        }
      ]
    };

    return typeFieldsMap[`${category}-${type}`] || [];
  };

  const getLocationSpecificFields = (rack: any): MetadataField[] => {
    // Add fields based on rack characteristics
    const fields: MetadataField[] = [];

    // If it's a secure zone
    if (rack.warehouse_path.includes('Secure')) {
      fields.push({
        key: 'classification_level',
        label: 'Security Classification',
        type: 'select',
        required: true,
        options: ['Public', 'Internal', 'Confidential', 'Restricted'],
        icon: <FileText className="w-4 h-4" />
      });
      fields.push({
        key: 'access_restrictions',
        label: 'Access Restrictions',
        type: 'textarea',
        required: false,
        placeholder: 'Specify access restrictions...',
        icon: <FileText className="w-4 h-4" />
      });
    }

    // If it's climate controlled
    if (rack.warehouse_path.includes('Climate')) {
      fields.push({
        key: 'temperature_requirements',
        label: 'Temperature Requirements',
        type: 'text',
        required: false,
        placeholder: 'Temperature range...',
        icon: <FileText className="w-4 h-4" />
      });
      fields.push({
        key: 'humidity_sensitive',
        label: 'Humidity Sensitive',
        type: 'select',
        required: false,
        options: ['Yes', 'No'],
        icon: <FileText className="w-4 h-4" />
      });
    }

    return fields;
  };

  const handleFieldChange = (key: string, value: string) => {
    onMetadataChange({
      ...metadata,
      [key]: value
    });
  };

  const applySuggestion = (suggestion: OCRSuggestion) => {
    handleFieldChange(suggestion.field, suggestion.value);
    setAppliedSuggestions(prev => new Set(prev).add(suggestion.field));
  };

  const getSuggestionForField = (fieldKey: string) => {
    return ocrSuggestions.find(s => s.field === fieldKey);
  };

  const renderField = (field: MetadataField) => {
    const suggestion = getSuggestionForField(field.key);
    const hasError = validationErrors[field.key];
    const isApplied = appliedSuggestions.has(field.key);

    return (
      <div key={field.key} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={field.key} className="text-sm font-medium flex items-center gap-2">
            {field.icon}
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </Label>
          
          {suggestion && !isApplied && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applySuggestion(suggestion)}
              className="text-xs h-auto p-1 text-blue-600 hover:text-blue-700"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              OCR ({suggestion.confidence}%)
            </Button>
          )}
        </div>

        {/* OCR Suggestion Display */}
        {suggestion && !isApplied && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span className="text-blue-700">Suggested: </span>
              <span className="font-medium">{suggestion.value}</span>
              <Badge variant="secondary" className="text-xs">
                {suggestion.confidence}% confident
              </Badge>
            </div>
          </div>
        )}

        {/* Field Input */}
        {field.type === 'textarea' ? (
          <Textarea
            id={field.key}
            value={metadata[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? 'border-red-500' : ''}
            rows={3}
          />
        ) : field.type === 'select' ? (
          <Select 
            value={metadata[field.key] || ''} 
            onValueChange={(value) => handleFieldChange(field.key, value)}
          >
            <SelectTrigger className={hasError ? 'border-red-500' : ''}>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={field.key}
            type={field.type}
            value={metadata[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? 'border-red-500' : ''}
          />
        )}

        {/* Validation Error */}
        {hasError && (
          <div className="flex items-center gap-1 text-red-600 text-xs">
            <AlertCircle className="w-3 h-3" />
            <span>{hasError}</span>
          </div>
        )}

        {/* Applied Suggestion Confirmation */}
        {isApplied && (
          <div className="flex items-center gap-1 text-green-600 text-xs">
            <CheckCircle className="w-3 h-3" />
            <span>OCR suggestion applied</span>
          </div>
        )}
      </div>
    );
  };

  const requiredFields = dynamicFields.filter(f => f.required);
  const completedRequired = requiredFields.filter(f => metadata[f.key]).length;
  const isComplete = completedRequired === requiredFields.length;

  return (
    <Card className="border border-border/50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Metadata</h3>
              <p className="text-sm text-muted-foreground">
                Document information and context
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">
              {completedRequired} / {requiredFields.length}
            </div>
            <div className="text-xs text-muted-foreground">Required fields</div>
          </div>
        </div>

        {/* OCR Suggestions Summary */}
        {ocrSuggestions.length > 0 && (
          <Alert className="mb-4">
            <Sparkles className="w-4 h-4" />
            <AlertDescription>
              {ocrSuggestions.length} OCR suggestions available. Click to apply high-confidence values.
            </AlertDescription>
          </Alert>
        )}

        {/* Dynamic Fields */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {dynamicFields.map(renderField)}
        </div>

        {/* Completion Status */}
        <div className="mt-6 pt-4 border-t border-border">
          {isComplete ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">All required metadata complete</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">
                {requiredFields.length - completedRequired} required field(s) remaining
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MetadataPanel;