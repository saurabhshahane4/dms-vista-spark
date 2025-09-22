import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Route, 
  MapPin, 
  FileText, 
  Settings,
  Search,
  Filter,
  ArrowRight,
  Tag,
  Bell
} from 'lucide-react';
import { useWorkflow } from '@/hooks/useWorkflow';
import { toast } from 'sonner';

export const RoutingRules = () => {
  const { routingRules, createRoutingRule, loading } = useWorkflow();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    conditions: {
      customer: '',
      documentType: '',
      keywords: '',
      fileSize: { operator: '>', value: 0 },
      age: { operator: '>', days: 0 }
    },
    actions: {
      moveToLocation: {
        warehouse: '',
        zone: '',
        shelf: '',
        autoAssignRack: true
      },
      setMetadata: {
        category: '',
        retention: '',
        confidential: false
      },
      notifications: []
    },
    priority_order: 1,
    is_active: true
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a rule name');
      return;
    }

    await createRoutingRule({
      name: formData.name,
      conditions: formData.conditions,
      actions: formData.actions,
      priority_order: formData.priority_order,
      is_active: formData.is_active
    });

    setIsDialogOpen(false);
    // Reset form
    setFormData({
      name: '',
      conditions: {
        customer: '',
        documentType: '',
        keywords: '',
        fileSize: { operator: '>', value: 0 },
        age: { operator: '>', days: 0 }
      },
      actions: {
        moveToLocation: {
          warehouse: '',
          zone: '',
          shelf: '',
          autoAssignRack: true
        },
        setMetadata: {
          category: '',
          retention: '',
          confidential: false
        },
        notifications: []
      },
      priority_order: 1,
      is_active: true
    });
  };

  const filteredRules = routingRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && rule.is_active) ||
      (statusFilter === 'inactive' && !rule.is_active);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Routing Rules</h2>
          <p className="text-muted-foreground">Configure automatic document classification and routing</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Routing Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Routing Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ruleName">Rule Name</Label>
                  <Input
                    id="ruleName"
                    placeholder="e.g., Customer A Legal Documents"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Conditions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Customer Pattern</Label>
                    <Input
                      placeholder="Customer A, Customer B*"
                      value={formData.conditions.customer}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, customer: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Document Types</Label>
                    <Input
                      placeholder="legal, contract, financial"
                      value={formData.conditions.documentType}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, documentType: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Keywords</Label>
                    <Textarea
                      placeholder="agreement, legal, contract, confidential"
                      value={formData.conditions.keywords}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, keywords: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>File Size (MB)</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.conditions.fileSize.operator}
                        onValueChange={(value) => setFormData(prev => ({
                          ...prev,
                          conditions: { 
                            ...prev.conditions, 
                            fileSize: { ...prev.conditions.fileSize, operator: value }
                          }
                        }))}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=">">{'>'}</SelectItem>
                          <SelectItem value=">=">{'≥'}</SelectItem>
                          <SelectItem value="<">{'<'}</SelectItem>
                          <SelectItem value="<=">{'≤'}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="50"
                        value={formData.conditions.fileSize.value}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          conditions: { 
                            ...prev.conditions, 
                            fileSize: { ...prev.conditions.fileSize, value: Number(e.target.value) }
                          }
                        }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Document Age</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.conditions.age.operator}
                        onValueChange={(value) => setFormData(prev => ({
                          ...prev,
                          conditions: { 
                            ...prev.conditions, 
                            age: { ...prev.conditions.age, operator: value }
                          }
                        }))}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=">">{'>'}</SelectItem>
                          <SelectItem value=">=">{'≥'}</SelectItem>
                          <SelectItem value="<">{'<'}</SelectItem>
                          <SelectItem value="<=">{'≤'}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="365"
                        value={formData.conditions.age.days}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          conditions: { 
                            ...prev.conditions, 
                            age: { ...prev.conditions.age, days: Number(e.target.value) }
                          }
                        }))}
                      />
                      <span className="text-sm text-muted-foreground self-center">days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ArrowRight className="h-5 w-5" />
                  Actions
                </h3>
                
                {/* Move to Location */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Move to Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Warehouse</Label>
                        <Input
                          placeholder="Legal Warehouse"
                          value={formData.actions.moveToLocation.warehouse}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            actions: {
                              ...prev.actions,
                              moveToLocation: { ...prev.actions.moveToLocation, warehouse: e.target.value }
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Zone</Label>
                        <Input
                          placeholder="Customer A Zone"
                          value={formData.actions.moveToLocation.zone}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            actions: {
                              ...prev.actions,
                              moveToLocation: { ...prev.actions.moveToLocation, zone: e.target.value }
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Shelf</Label>
                        <Input
                          placeholder="Legal Shelf"
                          value={formData.actions.moveToLocation.shelf}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            actions: {
                              ...prev.actions,
                              moveToLocation: { ...prev.actions.moveToLocation, shelf: e.target.value }
                            }
                          }))}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="autoAssignRack"
                        checked={formData.actions.moveToLocation.autoAssignRack}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          actions: {
                            ...prev.actions,
                            moveToLocation: { ...prev.actions.moveToLocation, autoAssignRack: checked }
                          }
                        }))}
                      />
                      <Label htmlFor="autoAssignRack">Auto-assign rack</Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Set Metadata */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Set Metadata
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Category</Label>
                        <Input
                          placeholder="legal"
                          value={formData.actions.setMetadata.category}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            actions: {
                              ...prev.actions,
                              setMetadata: { ...prev.actions.setMetadata, category: e.target.value }
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Retention Policy</Label>
                        <Input
                          placeholder="10 years"
                          value={formData.actions.setMetadata.retention}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            actions: {
                              ...prev.actions,
                              setMetadata: { ...prev.actions.setMetadata, retention: e.target.value }
                            }
                          }))}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="confidential"
                        checked={formData.actions.setMetadata.confidential}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          actions: {
                            ...prev.actions,
                            setMetadata: { ...prev.actions.setMetadata, confidential: checked }
                          }
                        }))}
                      />
                      <Label htmlFor="confidential">Mark as confidential</Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <div>
                  <Label>Notification Recipients</Label>
                  <Textarea
                    placeholder="legal-team@company.com, manager@company.com"
                    value={formData.actions.notifications.join('\n')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      actions: { ...prev.actions, notifications: e.target.value.split('\n').filter(n => n.trim()) }
                    }))}
                  />
                </div>
              </div>

              {/* Settings */}
              <div>
                <Label>Priority Order</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.priority_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority_order: Number(e.target.value) }))}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  Create Rule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search routing rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rules</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Routing Rules List */}
      <div className="space-y-4">
        {filteredRules.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No routing rules found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No rules match your current filters' 
                  : 'Create your first routing rule to automate document processing'}
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Routing Rule
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredRules.map((rule) => (
            <Card key={rule.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Route className="h-4 w-4" />
                      {rule.name}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">Priority {rule.priority_order}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Conditions Summary */}
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <Filter className="h-3 w-3" />
                      Conditions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {rule.conditions.customer && (
                        <Badge variant="outline">Customer: {rule.conditions.customer}</Badge>
                      )}
                      {rule.conditions.documentType && (
                        <Badge variant="outline">Type: {rule.conditions.documentType}</Badge>
                      )}
                      {rule.conditions.keywords && (
                        <Badge variant="outline">Keywords: {rule.conditions.keywords}</Badge>
                      )}
                      {rule.conditions.fileSize && (
                        <Badge variant="outline">
                          Size {rule.conditions.fileSize.operator} {rule.conditions.fileSize.value}MB
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions Summary */}
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />
                      Actions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {rule.actions.moveToLocation && (
                        <Badge variant="outline" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          Move to {rule.actions.moveToLocation.warehouse}
                        </Badge>
                      )}
                      {rule.actions.setMetadata && (
                        <Badge variant="outline" className="gap-1">
                          <Tag className="h-3 w-3" />
                          Set metadata
                        </Badge>
                      )}
                      {rule.actions.notifications && rule.actions.notifications.length > 0 && (
                        <Badge variant="outline" className="gap-1">
                          <Bell className="h-3 w-3" />
                          Notify {rule.actions.notifications.length} recipient(s)
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(rule.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};