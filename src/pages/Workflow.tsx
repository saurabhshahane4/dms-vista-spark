import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Play, Pause, Settings, BarChart3, CheckCircle, XCircle, Clock, AlertCircle, Zap } from 'lucide-react';
import { useWorkflow } from '@/hooks/useWorkflow';
import { WorkflowBuilder } from '@/components/workflow/WorkflowBuilder';
import { ApprovalDashboard } from '@/components/workflow/ApprovalDashboard';
import { ApprovalMatrix } from '@/components/workflow/ApprovalMatrix';
import { RoutingRules } from '@/components/workflow/RoutingRules';
import { WorkflowAnalytics } from '@/components/workflow/WorkflowAnalytics';
import { NotificationSystem } from '@/components/workflow/NotificationSystem';
import { DocumentWorkflowTrigger } from '@/components/workflow/DocumentWorkflowTrigger';

const Workflow = () => {
  const {
    workflows,
    workflowInstances,
    pendingApprovals,
    myRequests,
    loading,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
  } = useWorkflow();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('workflows');

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'inactive': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-3 w-3" />;
      case 'draft': return <Clock className="h-3 w-3" />;
      case 'inactive': return <Pause className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflow Management</h1>
          <p className="text-muted-foreground mt-1">
            Design, manage, and monitor document workflows and approvals
          </p>
        </div>
        <div className="flex gap-3">
          <NotificationSystem />
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('analytics')}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button 
            onClick={() => setActiveTab('builder')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-bold text-foreground">
                  {workflows.filter(w => w.status === 'active').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold text-foreground">{pendingApprovals.length}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Running Instances</p>
                <p className="text-2xl font-bold text-foreground">
                  {workflowInstances.filter(i => i.status === 'running').length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-accent animate-spin" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">My Requests</p>
                <p className="text-2xl font-bold text-foreground">{myRequests.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="triggers">
            <Zap className="h-4 w-4 mr-2" />
            Triggers
          </TabsTrigger>
          <TabsTrigger value="approvals">My Approvals</TabsTrigger>
          <TabsTrigger value="matrix">Approval Matrix</TabsTrigger>
          <TabsTrigger value="routing">Routing Rules</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workflows..."
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Workflows List */}
          <div className="grid gap-4">
            {filteredWorkflows.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No workflows found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'No workflows match your current filters' 
                      : 'Create your first workflow to get started'}
                  </p>
                  <Button onClick={() => setActiveTab('builder')} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Workflow
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredWorkflows.map((workflow) => (
                <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {getStatusIcon(workflow.status)}
                          {workflow.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant(workflow.status)}>
                          {workflow.status}
                        </Badge>
                        <Badge variant="outline">v{workflow.version}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Created: {new Date(workflow.created_at).toLocaleDateString()}</span>
                        <span>Updated: {new Date(workflow.updated_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveTab('builder')}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant={workflow.status === 'active' ? 'secondary' : 'default'}
                          size="sm"
                          onClick={() => updateWorkflow(workflow.id, { 
                            status: workflow.status === 'active' ? 'inactive' : 'active' 
                          })}
                        >
                          {workflow.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="triggers">
          <DocumentWorkflowTrigger />
        </TabsContent>

        <TabsContent value="approvals">
          <ApprovalDashboard />
        </TabsContent>

        <TabsContent value="matrix">
          <ApprovalMatrix />
        </TabsContent>

        <TabsContent value="routing">
          <RoutingRules />
        </TabsContent>

        <TabsContent value="builder">
          <WorkflowBuilder />
        </TabsContent>

        <TabsContent value="analytics">
          <WorkflowAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Workflow;