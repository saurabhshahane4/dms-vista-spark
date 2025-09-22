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
  Settings, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Filter,
  Search
} from 'lucide-react';
import { useWorkflow } from '@/hooks/useWorkflow';
import { toast } from 'sonner';

export const ApprovalMatrix = () => {
  const { approvalMatrix, createApprovalMatrix, loading } = useWorkflow();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    conditions: {
      customer: '',
      documentType: '',
      location: '',
      value: { operator: '>', amount: 0 },
      urgency: ''
    },
    approvers: [
      { level: 1, users: [''], required: 1, roles: [''] }
    ],
    escalation_policy: {
      hours: 24,
      action: 'notify_next_level'
    },
    is_active: true,
    priority_order: 1
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a rule name');
      return;
    }

    await createApprovalMatrix({
      name: formData.name,
      conditions: formData.conditions,
      approvers: formData.approvers,
      escalation_policy: formData.escalation_policy,
      is_active: formData.is_active,
      priority_order: formData.priority_order
    });

    setIsDialogOpen(false);
    setFormData({
      name: '',
      conditions: {
        customer: '',
        documentType: '',
        location: '',
        value: { operator: '>', amount: 0 },
        urgency: ''
      },
      approvers: [
        { level: 1, users: [''], required: 1, roles: [''] }
      ],
      escalation_policy: {
        hours: 24,
        action: 'notify_next_level'
      },
      is_active: true,
      priority_order: 1
    });
  };

  const addApproverLevel = () => {
    setFormData(prev => ({
      ...prev,
      approvers: [
        ...prev.approvers,
        { level: prev.approvers.length + 1, users: [''], required: 1, roles: [''] }
      ]
    }));
  };

  const updateApproverLevel = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      approvers: prev.approvers.map((approver, i) => 
        i === index ? { ...approver, [field]: value } : approver
      )
    }));
  };

  const filteredMatrix = approvalMatrix.filter(rule => {
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
          <h2 className="text-2xl font-bold text-foreground">Approval Matrix</h2>
          <p className="text-muted-foreground">Configure approval rules and escalation policies</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Approval Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Approval Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ruleName">Rule Name</Label>
                  <Input
                    id="ruleName"
                    placeholder="e.g., High Value Customer Documents"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Conditions</h3>
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
                    <Label>Document Type</Label>
                    <Input
                      placeholder="contract, financial, legal"
                      value={formData.conditions.documentType}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, documentType: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Location Pattern</Label>
                    <Input
                      placeholder="Warehouse1, Zone A*"
                      value={formData.conditions.location}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, location: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Value Threshold</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.conditions.value.operator}
                        onValueChange={(value) => setFormData(prev => ({
                          ...prev,
                          conditions: { 
                            ...prev.conditions, 
                            value: { ...prev.conditions.value, operator: value }
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
                        placeholder="10000"
                        value={formData.conditions.value.amount}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          conditions: { 
                            ...prev.conditions, 
                            value: { ...prev.conditions.value, amount: Number(e.target.value) }
                          }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Approvers */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Approval Levels</h3>
                  <Button variant="outline" size="sm" onClick={addApproverLevel}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Level
                  </Button>
                </div>
                {formData.approvers.map((approver, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-sm">Level {approver.level}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Users (email addresses)</Label>
                        <Textarea
                          placeholder="manager@company.com, director@company.com"
                          value={approver.users.join(', ')}
                          onChange={(e) => updateApproverLevel(index, 'users', e.target.value.split(', '))}
                        />
                      </div>
                      <div>
                        <Label>Roles</Label>
                        <Input
                          placeholder="manager, director"
                          value={approver.roles.join(', ')}
                          onChange={(e) => updateApproverLevel(index, 'roles', e.target.value.split(', '))}
                        />
                      </div>
                      <div>
                        <Label>Required Approvals</Label>
                        <Input
                          type="number"
                          min="1"
                          value={approver.required}
                          onChange={(e) => updateApproverLevel(index, 'required', Number(e.target.value))}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Escalation Policy */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Escalation Policy</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Escalation Time (hours)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.escalation_policy.hours}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        escalation_policy: { 
                          ...prev.escalation_policy, 
                          hours: Number(e.target.value) 
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Escalation Action</Label>
                    <Select
                      value={formData.escalation_policy.action}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        escalation_policy: { ...prev.escalation_policy, action: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="notify_next_level">Notify Next Level</SelectItem>
                        <SelectItem value="auto_approve">Auto Approve</SelectItem>
                        <SelectItem value="auto_reject">Auto Reject</SelectItem>
                        <SelectItem value="escalate_admin">Escalate to Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <div>
                    <Label>Priority Order</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.priority_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority_order: Number(e.target.value) }))}
                    />
                  </div>
                </div>
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
            placeholder="Search approval rules..."
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

      {/* Approval Matrix List */}
      <div className="space-y-4">
        {filteredMatrix.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No approval rules found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No rules match your current filters' 
                  : 'Create your first approval rule to get started'}
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Approval Rule
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredMatrix.map((rule) => (
            <Card key={rule.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
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
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Conditions</h4>
                    <div className="flex flex-wrap gap-2">
                      {rule.conditions.customer && (
                        <Badge variant="outline">Customer: {rule.conditions.customer}</Badge>
                      )}
                      {rule.conditions.documentType && (
                        <Badge variant="outline">Type: {rule.conditions.documentType}</Badge>
                      )}
                      {rule.conditions.location && (
                        <Badge variant="outline">Location: {rule.conditions.location}</Badge>
                      )}
                      {rule.conditions.value && (
                        <Badge variant="outline">
                          Value {rule.conditions.value.operator} {rule.conditions.value.amount}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Approvers Summary */}
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Approval Levels</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {rule.approvers.length} levels
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {rule.escalation_policy.hours}h escalation
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        {rule.escalation_policy.action.replace('_', ' ')}
                      </div>
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