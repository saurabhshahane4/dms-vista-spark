import { useState } from 'react';
import { Plus, Search, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CustomerWithAssignments, Customer } from '@/hooks/useCustomerRackAssignment';
import { CapacityIndicator } from './CapacityIndicator';

interface CustomerListPanelProps {
  customers: CustomerWithAssignments[];
  searchQuery: string;
  selectedCustomerId: string | null;
  onCustomerSelect: (customerId: string | null) => void;
  onCreateCustomer: (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
}

export const CustomerListPanel = ({
  customers,
  searchQuery,
  selectedCustomerId,
  onCustomerSelect,
  onCreateCustomer
}: CustomerListPanelProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    customer_code: '',
    name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    priority_level: 'medium' as 'high' | 'medium' | 'low',
    document_types: [] as string[],
    auto_assignment_enabled: true,
  });
  const [creating, setCreating] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.customer_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    try {
      setCreating(true);
      await onCreateCustomer(formData);
      setShowAddDialog(false);
      setFormData({
        customer_code: '',
        name: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        priority_level: 'medium',
        document_types: [],
        auto_assignment_enabled: true,
      });
    } catch (error) {
      console.error('Error creating customer:', error);
    } finally {
      setCreating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'needs_attention':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'over_capacity':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
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

  return (
    <Card className="h-[calc(100vh-300px)] flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Customers ({filteredCustomers.length})
          </h3>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_code">Customer Code</Label>
                    <Input
                      id="customer_code"
                      value={formData.customer_code}
                      onChange={(e) => setFormData({ ...formData, customer_code: e.target.value })}
                      placeholder="CUST001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority_level">Priority</Label>
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
                  <Label htmlFor="name">Customer Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Customer Corp"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_email">Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="contact@customer.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_phone">Phone</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Customer address..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto_assignment"
                    checked={formData.auto_assignment_enabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, auto_assignment_enabled: checked })
                    }
                  />
                  <Label htmlFor="auto_assignment">Enable Auto Assignment</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={creating || !formData.name || !formData.customer_code}>
                    {creating ? 'Creating...' : 'Create Customer'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <Card
              key={customer.id}
              className={`p-4 cursor-pointer transition-colors hover:bg-accent/50 ${
                selectedCustomerId === customer.id
                  ? 'ring-2 ring-primary bg-accent/30'
                  : ''
              }`}
              onClick={() => onCustomerSelect(customer.id)}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-sm">{customer.name}</h4>
                      {getStatusIcon(customer.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">{customer.customer_code}</p>
                  </div>
                  
                  <Badge className={`text-xs ${getPriorityColor(customer.priority_level)}`}>
                    {customer.priority_level}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Racks:</span>
                    <span className="ml-1 font-medium">{customer.assignments.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Capacity:</span>
                    <span className="ml-1 font-medium">{customer.totalCapacity}</span>
                  </div>
                </div>

                {/* Utilization */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Utilization</span>
                    <span className="font-medium">{customer.overallUtilization.toFixed(1)}%</span>
                  </div>
                  <CapacityIndicator
                    current={customer.totalUsed}
                    capacity={customer.totalCapacity}
                    size="sm"
                  />
                </div>

                {/* Auto Assignment Status */}
                {customer.auto_assignment_enabled && (
                  <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Auto Assignment Enabled
                  </div>
                )}
              </div>
            </Card>
          ))}

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No customers found</p>
              {searchQuery && (
                <p className="text-xs mt-1">Try adjusting your search</p>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};