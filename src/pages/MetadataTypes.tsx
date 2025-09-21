import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/contexts/NavigationContext';
import { Database, ArrowLeft, Plus } from 'lucide-react';

const MetadataTypes = () => {
  const { setActiveTab } = useNavigation();
  
  const handleBackToSettings = () => {
    setActiveTab('Settings');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Button 
        variant="ghost" 
        onClick={handleBackToSettings}
        className="mb-6 flex items-center gap-2 hover:bg-muted"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Setup Items
      </Button>
      
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-muted rounded-lg">
          <Database className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Metadata Types</h1>
          <p className="text-muted-foreground">Configure metadata types for document classification and organization.</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Available Metadata Types</h2>
          <p className="text-sm text-muted-foreground">Manage custom metadata fields for your documents</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Metadata Type
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[
          { name: 'Document Category', type: 'Select', required: true, description: 'Main category classification' },
          { name: 'Priority Level', type: 'Select', required: false, description: 'Document priority rating' },
          { name: 'Department', type: 'Text', required: true, description: 'Originating department' },
          { name: 'Review Date', type: 'Date', required: false, description: 'Scheduled review date' },
          { name: 'Tags', type: 'Multi-select', required: false, description: 'Document tags for filtering' },
        ].map((metadata, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-foreground">{metadata.name}</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                    {metadata.type}
                  </span>
                  {metadata.required && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-destructive/10 text-destructive">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{metadata.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">Edit</Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MetadataTypes;