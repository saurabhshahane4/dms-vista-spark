import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { MetadataType } from '@/hooks/useMetadataTypes';

interface MetadataTypeFormProps {
  metadataType?: MetadataType;
  onSubmit: (data: Omit<MetadataType, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  onCancel: () => void;
}

const MetadataTypeForm: React.FC<MetadataTypeFormProps> = ({ 
  metadataType, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'text' as MetadataType['type'],
    required: false,
    description: '',
    options: [] as string[],
    related_document_type: ''
  });
  const [newOption, setNewOption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (metadataType) {
      setFormData({
        name: metadataType.name,
        type: metadataType.type,
        required: metadataType.required,
        description: metadataType.description || '',
        options: metadataType.options || [],
        related_document_type: metadataType.related_document_type || ''
      });
    }
  }, [metadataType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await onSubmit(formData);
    if (success) {
      if (!metadataType) {
        // Reset form for new entries
        setFormData({
          name: '',
          type: 'text',
          required: false,
          description: '',
          options: [],
          related_document_type: ''
        });
        setNewOption('');
      }
      onCancel();
    }
    setIsSubmitting(false);
  };

  const addOption = () => {
    if (newOption.trim() && !formData.options.includes(newOption.trim())) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const removeOption = (option: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt !== option)
    }));
  };

  const needsOptions = formData.type === 'select' || formData.type === 'multi-select';

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {metadataType ? 'Edit Metadata Type' : 'Create New Metadata Type'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Document Category"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: MetadataType['type']) => 
                setFormData(prev => ({ ...prev, type: value, options: [] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-md z-50">
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="select">Select</SelectItem>
                <SelectItem value="multi-select">Multi-select</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this metadata field"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="related_document_type">Related Document Type</Label>
            <Input
              id="related_document_type"
              value={formData.related_document_type}
              onChange={(e) => setFormData(prev => ({ ...prev, related_document_type: e.target.value }))}
              placeholder="e.g., Contract, Invoice, Report"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={formData.required}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: checked }))}
            />
            <Label htmlFor="required">Required field</Label>
          </div>

          {needsOptions && (
            <div className="space-y-4">
              <Label>Options</Label>
              <div className="flex space-x-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Add option"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                />
                <Button type="button" onClick={addOption} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.options.map((option, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {option}
                    <button
                      type="button"
                      onClick={() => removeOption(option)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (metadataType ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MetadataTypeForm;