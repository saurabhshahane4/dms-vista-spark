import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useNavigation } from '@/contexts/NavigationContext';
import { useMetadataTypes, MetadataType } from '@/hooks/useMetadataTypes';
import MetadataTypeForm from '@/components/metadata/MetadataTypeForm';
import { Database, ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';

const MetadataTypes = () => {
  const { setActiveTab } = useNavigation();
  const { metadataTypes, loading, createMetadataType, updateMetadataType, deleteMetadataType } = useMetadataTypes();
  const [showForm, setShowForm] = useState(false);
  const [editingMetadataType, setEditingMetadataType] = useState<MetadataType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<MetadataType | null>(null);
  
  const handleBackToSettings = () => {
    setActiveTab('Settings');
  };

  const handleAdd = () => {
    setEditingMetadataType(null);
    setShowForm(true);
  };

  const handleEdit = (metadataType: MetadataType) => {
    setEditingMetadataType(metadataType);
    setShowForm(true);
  };

  const handleDelete = (metadataType: MetadataType) => {
    setDeleteConfirm(metadataType);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteMetadataType(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleFormSubmit = async (data: Omit<MetadataType, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingMetadataType) {
      return await updateMetadataType(editingMetadataType.id, data);
    } else {
      return await createMetadataType(data);
    }
  };

  const getTypeLabel = (type: MetadataType['type']) => {
    const typeLabels = {
      'text': 'Text',
      'select': 'Select',
      'multi-select': 'Multi-select',
      'date': 'Date',
      'number': 'Number',
      'boolean': 'Boolean'
    };
    return typeLabels[type] || type;
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
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Metadata Type
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {metadataTypes.map((metadata) => (
            <Card key={metadata.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-foreground">{metadata.name}</h3>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                      {getTypeLabel(metadata.type)}
                    </span>
                    {metadata.required && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-destructive/10 text-destructive">
                        Required
                      </span>
                    )}
                    {metadata.related_document_type && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                        {metadata.related_document_type}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{metadata.description}</p>
                  {metadata.options && metadata.options.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {metadata.options.map((option, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-secondary text-secondary-foreground">
                          {option}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEdit(metadata)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(metadata)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {metadataTypes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No metadata types configured yet.</p>
              <Button onClick={handleAdd} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create your first metadata type
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <MetadataTypeForm
            metadataType={editingMetadataType}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Metadata Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MetadataTypes;