import { useState } from 'react';
import { Plus, Edit, Trash2, Settings, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AssignmentRule, CustomerWithAssignments } from '@/hooks/useCustomerRackAssignment';

interface AssignmentRulesProps {
  rules: AssignmentRule[];
  customers: CustomerWithAssignments[];
  onCreateRule: (ruleData: Omit<AssignmentRule, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const AssignmentRules = ({
  rules,
  customers,
  onCreateRule,
  onRefresh
}: AssignmentRulesProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    rule_name: '',
    customer_pattern: '',
    document_type_conditions: [] as string[],
    file_size_min: 0,
    file_size_max: undefined as number | undefined,
    priority_level: 'medium' as 'high' | 'medium' | 'low',
    preferred_rack_patterns: [] as string[],
    fallback_rack_patterns: [] as string[],
    capacity_threshold: 90,
    order_by: 'chronological' as 'chronological' | 'capacity' | 'priority',
    is_active: true,
  });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async () => {
    try {
      setCreating(true);
      await onCreateRule(formData);
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error creating rule:', error);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      rule_name: '',
      customer_pattern: '',
      document_type_conditions: [],
      file_size_min: 0,
      file_size_max: undefined,
      priority_level: 'medium',
      preferred_rack_patterns: [],
      fallback_rack_patterns: [],
      capacity_threshold: 90,
      order_by: 'chronological',
      is_active: true,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const addToArray = (field: 'document_type_conditions' | 'preferred_rack_patterns' | 'fallback_rack_patterns', value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData({
        ...formData,
        [field]: [...formData[field], value.trim()]
      });
    }
  };

  const removeFromArray = (field: 'document_type_conditions' | 'preferred_rack_patterns' | 'fallback_rack_patterns', value: string) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter(item => item !== value)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Assignment Rules</h3>
          <p className="text-sm text-muted-foreground">
            Configure automatic document assignment rules for customers
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Create Assignment Rule</DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium">Basic Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rule_name">Rule Name</Label>
                      <Input
                        id="rule_name"
                        value={formData.rule_name}
                        onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                        placeholder="Customer A Contract Rule"
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority_level">Priority Level</Label>
                      <Select
                        value={formData.priority_level}
                        onValueChange={(value: 'high' | 'medium' | 'low') =>
                          setFormData({ ...formData, priority_level: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customer_pattern">Customer Pattern (Optional)</Label>
                    <Input
                      id="customer_pattern"
                      value={formData.customer_pattern}
                      onChange={(e) => setFormData({ ...formData, customer_pattern: e.target.value })}
                      placeholder="Customer A*, CUST001"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use wildcards (*) to match multiple customers
                    </p>
                  </div>
                </div>

                {/* Assignment Configuration */}
                <div className="space-y-4">
                  <h4 className="font-medium">Assignment Configuration</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="capacity_threshold">Capacity Threshold (%)</Label>
                      <Input
                        id="capacity_threshold"
                        type="number"
                        min="50"
                        max="100"
                        value={formData.capacity_threshold}
                        onChange={(e) => setFormData({ ...formData, capacity_threshold: parseInt(e.target.value) || 90 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="order_by">Assignment Order</Label>
                      <Select
                        value={formData.order_by}
                        onValueChange={(value: 'chronological' | 'capacity' | 'priority') =>
                          setFormData({ ...formData, order_by: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chronological">Chronological</SelectItem>
                          <SelectItem value="capacity">By Capacity</SelectItem>
                          <SelectItem value="priority">By Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="file_size_min">Min File Size (KB)</Label>
                      <Input
                        id="file_size_min"
                        type="number"
                        min="0"
                        value={formData.file_size_min}
                        onChange={(e) => setFormData({ ...formData, file_size_min: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="file_size_max">Max File Size (KB) - Optional</Label>
                      <Input
                        id="file_size_max"
                        type="number"
                        min="0"
                        value={formData.file_size_max || ''}
                        onChange={(e) => setFormData({ ...formData, file_size_max: e.target.value ? parseInt(e.target.value) : undefined })}
                      />
                    </div>
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Rule is Active</Label>
                </div>
              </div>
            </ScrollArea>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={creating || !formData.rule_name}
              >
                {creating ? 'Creating...' : 'Create Rule'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id} className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{rule.rule_name}</h4>
                    <Badge className={getPriorityColor(rule.priority_level || 'medium')}>
                      {rule.priority_level || 'medium'}
                    </Badge>
                    <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {rule.customer_pattern && (
                    <p className="text-sm text-muted-foreground">
                      Pattern: {rule.customer_pattern}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    {rule.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Configuration Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground mb-1">File Size Range</p>
                  <p>
                    {rule.file_size_min} KB - {rule.file_size_max ? `${rule.file_size_max} KB` : 'No limit'}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Capacity Threshold</p>
                  <p>{rule.capacity_threshold}%</p>
                </div>
                
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Assignment Order</p>
                  <p className="capitalize">{rule.order_by}</p>
                </div>
              </div>

              {/* Document Types */}
              {rule.document_type_conditions && rule.document_type_conditions.length > 0 && (
                <div>
                  <p className="font-medium text-muted-foreground mb-2 text-sm">Document Types</p>
                  <div className="flex flex-wrap gap-1">
                    {rule.document_type_conditions.map((type, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}

        {rules.length === 0 && (
          <Card className="p-8 text-center">
            <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-2">No Assignment Rules</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create rules to automatically assign documents to customer racks based on conditions.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Rule
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};