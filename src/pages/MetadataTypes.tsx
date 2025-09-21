import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useNavigation } from '@/contexts/NavigationContext';
import { useMetadataTypes, MetadataType } from '@/hooks/useMetadataTypes';
import MetadataTypeForm from '@/components/metadata/MetadataTypeForm';
import { Database, ArrowLeft, Plus, Edit, Trash2, ArrowUpDown, Search, Filter } from 'lucide-react';

const MetadataTypes = () => {
  const { setActiveTab } = useNavigation();
  const { metadataTypes, loading, createMetadataType, updateMetadataType, deleteMetadataType } = useMetadataTypes();
  const [showForm, setShowForm] = useState(false);
  const [editingMetadataType, setEditingMetadataType] = useState<MetadataType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<MetadataType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [requiredFilter, setRequiredFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof MetadataType>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  // Filtering and sorting logic
  const filteredAndSortedData = useMemo(() => {
    let filtered = metadataTypes.filter(metadata => {
      const matchesSearch = metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (metadata.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (metadata.related_document_type?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = typeFilter === 'all' || metadata.type === typeFilter;
      const matchesRequired = requiredFilter === 'all' || 
                            (requiredFilter === 'required' && metadata.required) ||
                            (requiredFilter === 'optional' && !metadata.required);
      
      return matchesSearch && matchesType && matchesRequired;
    });

    // Sort the filtered data
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle undefined values
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';
      
      // Convert to string for comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    return filtered;
  }, [metadataTypes, searchTerm, typeFilter, requiredFilter, sortField, sortDirection]);

  const handleSort = (field: keyof MetadataType) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
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

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search metadata types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-md z-50">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="select">Select</SelectItem>
            <SelectItem value="multi-select">Multi-select</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="boolean">Boolean</SelectItem>
          </SelectContent>
        </Select>
        <Select value={requiredFilter} onValueChange={setRequiredFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by required" />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-md z-50">
            <SelectItem value="all">All Fields</SelectItem>
            <SelectItem value="required">Required Only</SelectItem>
            <SelectItem value="optional">Optional Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredAndSortedData.length === 0 ? (
        <div className="text-center py-8">
          {metadataTypes.length === 0 ? (
            <>
              <p className="text-muted-foreground">No metadata types configured yet.</p>
              <Button onClick={handleAdd} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create your first metadata type
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">No metadata types match your current filters.</p>
          )}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => handleSort('name')}
                  >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => handleSort('type')}
                  >
                    Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => handleSort('required')}
                  >
                    Required
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => handleSort('related_document_type')}
                  >
                    Document Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Options</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((metadata) => (
                <TableRow key={metadata.id}>
                  <TableCell className="font-medium">{metadata.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getTypeLabel(metadata.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {metadata.required ? (
                      <Badge variant="destructive">Required</Badge>
                    ) : (
                      <Badge variant="outline">Optional</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {metadata.related_document_type ? (
                      <Badge variant="default">{metadata.related_document_type}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">None</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {metadata.description || (
                      <span className="text-muted-foreground text-sm">No description</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {metadata.options && metadata.options.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {metadata.options.slice(0, 3).map((option, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {option}
                          </Badge>
                        ))}
                        {metadata.options.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{metadata.options.length - 3} more
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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