import { useState } from 'react';
import { Users, Plus, Settings, Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCustomerRackAssignment } from '@/hooks/useCustomerRackAssignment';
import { CustomerListPanel } from '@/components/customer-assignment/CustomerListPanel';
import { RackAssignmentPanel } from '@/components/customer-assignment/RackAssignmentPanel';
import { AssignmentRules } from '@/components/customer-assignment/AssignmentRules';
import { UtilizationDashboard } from '@/components/customer-assignment/UtilizationDashboard';

export default function CustomerRackAssignment() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('customers');
  
  const {
    customersWithAssignments,
    availableRacks,
    assignments,
    rules,
    loading,
    createCustomer,
    assignRacksToCustomer,
    removeRackAssignment,
    createAssignmentRule,
    simulateDocumentAssignment,
    refetch
  } = useCustomerRackAssignment();

  // Calculate summary statistics
  const summaryStats = {
    totalCustomers: customersWithAssignments.length,
    totalAssignedRacks: assignments.filter(a => a.is_active).length,
    availableRacksCount: availableRacks.length,
    averageUtilization: customersWithAssignments.length > 0 
      ? customersWithAssignments.reduce((sum, c) => sum + c.overallUtilization, 0) / customersWithAssignments.length 
      : 0,
    alertsCount: customersWithAssignments.filter(c => c.status !== 'active').length,
  };

  const handleExportReport = () => {
    const reportData = customersWithAssignments.map(customer => ({
      'Customer Code': customer.customer_code,
      'Customer Name': customer.name,
      'Priority Level': customer.priority_level,
      'Assigned Racks': customer.assignments.length,
      'Total Capacity': customer.totalCapacity,
      'Current Usage': customer.totalUsed,
      'Utilization %': customer.overallUtilization.toFixed(1),
      'Status': customer.status,
      'Auto Assignment': customer.auto_assignment_enabled ? 'Enabled' : 'Disabled',
    }));

    const csvContent = [
      Object.keys(reportData[0] || {}).join(','),
      ...reportData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = 'customer_rack_assignments_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-lg w-full" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg" />
              ))}
            </div>
            <div className="h-96 bg-muted rounded-lg w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-semibold text-foreground">
                  Customer Rack Assignment
                </h1>
              </div>
              <Badge variant="secondary">
                {summaryStats.totalCustomers} Customers
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search customers or racks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Button variant="outline" onClick={handleExportReport}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-semibold">{summaryStats.totalCustomers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-dms-blue/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-dms-blue" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned Racks</p>
                <p className="text-2xl font-semibold">{summaryStats.totalAssignedRacks}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-dms-green/10 rounded-lg">
                <Clock className="w-5 h-5 text-dms-green" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Racks</p>
                <p className="text-2xl font-semibold">{summaryStats.availableRacksCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-dms-purple/10 rounded-lg">
                <Settings className="w-5 h-5 text-dms-purple" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Utilization</p>
                <p className="text-2xl font-semibold">{summaryStats.averageUtilization.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-dms-warning/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-dms-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alerts</p>
                <p className="text-2xl font-semibold">{summaryStats.alertsCount}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="customers">Customer Assignment</TabsTrigger>
            <TabsTrigger value="utilization">Utilization Dashboard</TabsTrigger>
            <TabsTrigger value="rules">Assignment Rules</TabsTrigger>
            <TabsTrigger value="simulation">Assignment Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-0">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-4">
                <CustomerListPanel
                  customers={customersWithAssignments}
                  searchQuery={searchQuery}
                  selectedCustomerId={selectedCustomerId}
                  onCustomerSelect={setSelectedCustomerId}
                  onCreateCustomer={createCustomer}
                />
              </div>
              <div className="col-span-8">
                <RackAssignmentPanel
                  selectedCustomerId={selectedCustomerId}
                  availableRacks={availableRacks}
                  assignments={assignments.filter(a => a.customer_id === selectedCustomerId)}
                  onAssignRacks={assignRacksToCustomer}
                  onRemoveAssignment={removeRackAssignment}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="utilization" className="space-y-0">
            <UtilizationDashboard
              customers={customersWithAssignments}
              assignments={assignments}
              availableRacks={availableRacks}
            />
          </TabsContent>

          <TabsContent value="rules" className="space-y-0">
            <AssignmentRules
              rules={rules}
              customers={customersWithAssignments}
              onCreateRule={createAssignmentRule}
              onRefresh={refetch}
            />
          </TabsContent>

          <TabsContent value="simulation" className="space-y-0">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Document Assignment Simulation</h3>
              <p className="text-muted-foreground mb-6">
                Test how documents would be automatically assigned to customer racks based on your current configuration.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {customersWithAssignments.slice(0, 3).map(customer => {
                  const simulation = simulateDocumentAssignment(customer.id, 'contract', 2048);
                  
                  return (
                    <Card key={customer.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{customer.name}</h4>
                        <Badge 
                          variant={simulation.success ? "default" : "destructive"}
                        >
                          {simulation.success ? "Ready" : "Issues"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Assigned Racks:</span> {customer.assignments.length}</p>
                        <p><span className="font-medium">Utilization:</span> {customer.overallUtilization.toFixed(1)}%</p>
                        
                        {simulation.success && simulation.assignedRack ? (
                          <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                            <p className="text-green-700 dark:text-green-300 text-xs">
                              Next document → {simulation.assignedRack.path}
                            </p>
                          </div>
                        ) : (
                          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                            <p className="text-red-700 dark:text-red-300 text-xs">
                              {simulation.message}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
              
              {customersWithAssignments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No customers configured yet. Add customers to test assignment simulation.</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}