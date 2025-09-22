import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CustomerWithAssignments, CustomerRackAssignment } from '@/hooks/useCustomerRackAssignment';
import { CapacityIndicator } from './CapacityIndicator';

interface UtilizationDashboardProps {
  customers: CustomerWithAssignments[];
  assignments: CustomerRackAssignment[];
  availableRacks: any[];
}

export const UtilizationDashboard = ({
  customers,
  assignments,
  availableRacks
}: UtilizationDashboardProps) => {
  // Prepare data for charts
  const customerUtilizationData = customers.map(customer => ({
    name: customer.name.length > 15 ? `${customer.name.substring(0, 12)}...` : customer.name,
    fullName: customer.name,
    assigned: customer.assignments.length,
    capacity: customer.totalCapacity,
    used: customer.totalUsed,
    utilization: customer.overallUtilization,
    status: customer.status,
  }));

  // Status distribution data
  const statusData = [
    { name: 'Active', value: customers.filter(c => c.status === 'active').length, color: '#10b981' },
    { name: 'Needs Attention', value: customers.filter(c => c.status === 'needs_attention').length, color: '#f59e0b' },
    { name: 'Over Capacity', value: customers.filter(c => c.status === 'over_capacity').length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Assignment type distribution
  const assignmentTypeData = [
    { name: 'Dedicated', value: assignments.filter(a => a.assignment_type === 'dedicated').length, color: '#3b82f6' },
    { name: 'Shared', value: assignments.filter(a => a.assignment_type === 'shared').length, color: '#f59e0b' },
    { name: 'Overflow', value: assignments.filter(a => a.assignment_type === 'overflow').length, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  // Calculate summary metrics
  const totalCapacity = customers.reduce((sum, c) => sum + c.totalCapacity, 0);
  const totalUsed = customers.reduce((sum, c) => sum + c.totalUsed, 0);
  const overallUtilization = totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0;
  const totalAssignedRacks = assignments.filter(a => a.is_active).length;
  const averageUtilization = customers.length > 0 
    ? customers.reduce((sum, c) => sum + c.overallUtilization, 0) / customers.length 
    : 0;

  // Alerts
  const alerts = customers.filter(c => c.status !== 'active');
  const lowCapacityCustomers = customers.filter(c => c.overallUtilization < 20);
  const nearFullCustomers = customers.filter(c => c.overallUtilization > 85 && c.overallUtilization < 95);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overall Utilization</p>
              <p className="text-2xl font-semibold">{overallUtilization.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-dms-blue/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-dms-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Capacity</p>
              <p className="text-2xl font-semibold">{totalCapacity.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-dms-green/10 rounded-lg">
              <Clock className="w-5 h-5 text-dms-green" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Utilization</p>
              <p className="text-2xl font-semibold">{averageUtilization.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-dms-warning/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-dms-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
              <p className="text-2xl font-semibold">{alerts.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Utilization Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Customer Utilization Overview</h3>
            <p className="text-sm text-muted-foreground">
              Rack utilization by customer
            </p>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerUtilizationData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'utilization') return [`${Number(value).toFixed(1)}%`, 'Utilization'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => {
                    const customer = customerUtilizationData.find(c => c.name === label);
                    return customer?.fullName || label;
                  }}
                />
                <Bar 
                  dataKey="utilization" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status Distribution */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Customer Status</h3>
            <p className="text-sm text-muted-foreground">
              Distribution by status
            </p>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2 mt-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Customer Details Table */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Customer Details</h3>
          <p className="text-sm text-muted-foreground">
            Detailed view of customer rack assignments and utilization
          </p>
        </div>
        
        <div className="space-y-4">
          {customers.map((customer) => (
            <div key={customer.id} className="border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{customer.name}</h4>
                    <Badge 
                      variant={customer.status === 'active' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {customer.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{customer.customer_code}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Assigned Racks</p>
                  <p className="font-medium">{customer.assignments.length}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Capacity Usage</p>
                  <p className="font-medium">{customer.totalUsed} / {customer.totalCapacity}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Utilization</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{customer.overallUtilization.toFixed(1)}%</span>
                    </div>
                    <CapacityIndicator
                      current={customer.totalUsed}
                      capacity={customer.totalCapacity}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {customers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No customer data available</p>
              <p className="text-xs mt-1">Add customers and assign racks to see utilization data</p>
            </div>
          )}
        </div>
      </Card>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Capacity Alerts</h3>
            <p className="text-sm text-muted-foreground">
              Customers requiring attention
            </p>
          </div>
          
          <div className="space-y-3">
            {alerts.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.status === 'needs_attention' 
                        ? `${customer.overallUtilization.toFixed(1)}% utilization - Consider adding more racks`
                        : `Over capacity at ${customer.overallUtilization.toFixed(1)}% - Immediate action required`
                      }
                    </p>
                  </div>
                </div>
                <Badge variant={customer.status === 'over_capacity' ? 'destructive' : 'secondary'}>
                  {customer.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};