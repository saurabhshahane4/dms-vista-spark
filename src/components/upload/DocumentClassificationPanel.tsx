import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, FileText, AlertTriangle, Shield, Clock } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface DocumentClassificationPanelProps {
  customer: Customer | null;
  documentType: DocumentType | null;
  priority: string;
  confidentiality: string;
  onCustomerChange: (customer: Customer | null) => void;
  onDocumentTypeChange: (documentType: DocumentType | null) => void;
  onPriorityChange: (priority: string) => void;
  onConfidentialityChange: (confidentiality: string) => void;
}

const DocumentClassificationPanel = ({
  customer,
  documentType,
  priority,
  confidentiality,
  onCustomerChange,
  onDocumentTypeChange,
  onPriorityChange,
  onConfidentialityChange
}: DocumentClassificationPanelProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [recentCustomers] = useState<Customer[]>([]); // Would be loaded from storage
  const [favoriteCustomers] = useState<Customer[]>([]); // Would be loaded from user preferences

  // Mock customers data - in real app, this would come from Supabase
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'Acme Corporation',
        code: 'ACME',
        priority_level: 'high',
        document_types: ['contract', 'invoice', 'legal']
      },
      {
        id: '2', 
        name: 'Global Tech Solutions',
        code: 'GTS',
        priority_level: 'medium',
        document_types: ['contract', 'technical', 'hr']
      },
      {
        id: '3',
        name: 'Phoenix Industries',
        code: 'PHX',
        priority_level: 'high',
        document_types: ['financial', 'compliance', 'legal']
      }
    ];
    setCustomers(mockCustomers);
  }, []);

  const documentCategories = {
    legal: {
      types: ['contract', 'agreement', 'compliance', 'litigation'],
      icon: <Shield className="w-4 h-4" />,
      color: 'text-purple-600'
    },
    financial: {
      types: ['invoice', 'receipt', 'statement', 'audit'],
      icon: <FileText className="w-4 h-4" />,
      color: 'text-green-600'
    },
    hr: {
      types: ['resume', 'policy', 'evaluation', 'training'],
      icon: <Building2 className="w-4 h-4" />,
      color: 'text-blue-600'
    },
    technical: {
      types: ['specification', 'manual', 'documentation', 'report'],
      icon: <FileText className="w-4 h-4" />,
      color: 'text-orange-600'
    }
  };

  const priorityLevels = [
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800 border-gray-200' }
  ];

  const confidentialityLevels = [
    { value: 'public', label: 'Public', description: 'Can be shared openly' },
    { value: 'internal', label: 'Internal', description: 'Internal use only' },
    { value: 'confidential', label: 'Confidential', description: 'Restricted access' },
    { value: 'restricted', label: 'Restricted', description: 'Highly sensitive' }
  ];

  const handleCustomerSelect = (customerId: string) => {
    const selectedCustomer = customers.find(c => c.id === customerId);
    onCustomerChange(selectedCustomer || null);
    setCustomerSearchOpen(false);
    
    // Reset document type when customer changes
    onDocumentTypeChange(null);
    
    // Auto-set priority based on customer
    if (selectedCustomer?.priority_level) {
      onPriorityChange(selectedCustomer.priority_level);
    }
  };

  const handleDocumentTypeSelect = (category: string, type: string) => {
    const newDocumentType: DocumentType = {
      category,
      type,
      requiredMetadata: getRequiredMetadata(category, type)
    };
    onDocumentTypeChange(newDocumentType);
  };

  const getRequiredMetadata = (category: string, type: string): string[] => {
    // Return required metadata fields based on document type
    const metadataMap: Record<string, string[]> = {
      'legal-contract': ['parties', 'effective_date', 'expiry_date', 'contract_value'],
      'financial-invoice': ['invoice_number', 'po_number', 'amount', 'due_date'],
      'hr-resume': ['candidate_name', 'position', 'experience_years'],
      'technical-specification': ['project_code', 'version', 'approval_required']
    };
    return metadataMap[`${category}-${type}`] || [];
  };

  return (
    <Card className="border border-border/50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Document Classification</h3>
            <p className="text-sm text-muted-foreground">
              Specify customer, document type, and handling requirements
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Selection */}
          <div className="space-y-3">
            <Label htmlFor="customer" className="text-sm font-medium">
              Customer *
            </Label>
            
            <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={customerSearchOpen}
                  className="w-full justify-between"
                >
                  {customer ? (
                    <div className="flex items-center gap-2">
                      <span>{customer.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {customer.code}
                      </Badge>
                    </div>
                  ) : (
                    "Select customer..."
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search customers..." />
                  <CommandEmpty>No customer found.</CommandEmpty>
                  
                  {favoriteCustomers.length > 0 && (
                    <CommandGroup heading="Favorites">
                      {favoriteCustomers.map((cust) => (
                        <CommandItem
                          key={cust.id}
                          onSelect={() => handleCustomerSelect(cust.id)}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 h-4 w-4",
                              customer?.id === cust.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex items-center gap-2">
                            <span>{cust.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {cust.code}
                            </Badge>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  
                  {recentCustomers.length > 0 && (
                    <CommandGroup heading="Recent">
                      {recentCustomers.map((cust) => (
                        <CommandItem
                          key={cust.id}
                          onSelect={() => handleCustomerSelect(cust.id)}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 h-4 w-4",
                              customer?.id === cust.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex items-center gap-2">
                            <span>{cust.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {cust.code}
                            </Badge>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  
                  <CommandGroup heading="All Customers">
                    {customers.map((cust) => (
                      <CommandItem
                        key={cust.id}
                        onSelect={() => handleCustomerSelect(cust.id)}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            customer?.id === cust.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex items-center gap-2">
                          <span>{cust.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {cust.code}
                          </Badge>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            
            {customer && (
              <div className="text-xs text-muted-foreground">
                Priority Level: <Badge variant="secondary">{customer.priority_level}</Badge>
              </div>
            )}
          </div>

          {/* Document Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Document Type *</Label>
            
            <div className="space-y-2">
              {/* Category Selection */}
              <Select
                value={documentType?.category || ''}
                onValueChange={(category) => {
                  if (category) {
                    handleDocumentTypeSelect(category, documentCategories[category as keyof typeof documentCategories].types[0]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(documentCategories).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span className={config.color}>{config.icon}</span>
                        <span className="capitalize">{key}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type Selection */}
              {documentType?.category && (
                <Select
                  value={documentType?.type || ''}
                  onValueChange={(type) => {
                    if (type && documentType?.category) {
                      handleDocumentTypeSelect(documentType.category, type);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {documentCategories[documentType.category as keyof typeof documentCategories].types.map((type) => (
                      <SelectItem key={type} value={type}>
                        <span className="capitalize">{type}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Customer Document Type Compatibility */}
            {customer && documentType && (
              <div className="text-xs">
                {customer.document_types.includes(documentType.type) ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckIcon className="w-3 h-3" />
                    <span>Compatible with customer</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Not in customer's usual document types</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Priority Level */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Priority Level</Label>
            <div className="grid grid-cols-2 gap-2">
              {priorityLevels.map((level) => (
                <Button
                  key={level.value}
                  variant={priority === level.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPriorityChange(level.value)}
                  className="justify-start"
                >
                  {priority === level.value && <Clock className="w-3 h-3 mr-1" />}
                  {level.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Confidentiality Level */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Confidentiality</Label>
            <Select value={confidentiality} onValueChange={onConfidentialityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select level..." />
              </SelectTrigger>
              <SelectContent>
                {confidentialityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-xs text-muted-foreground">{level.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected Classification Summary */}
        {customer && documentType && (
          <div className="mt-6 p-4 bg-accent/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Classification Complete</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="outline">{customer.name}</Badge>
              <Badge variant="outline">{documentType.category}/{documentType.type}</Badge>
              <Badge variant="outline">{priority}</Badge>
              <Badge variant="outline">{confidentiality}</Badge>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DocumentClassificationPanel;