import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  FileText,
  Activity,
  Download,
  Calendar
} from 'lucide-react';
import { useWorkflow } from '@/hooks/useWorkflow';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

export const WorkflowAnalytics = () => {
  const { 
    workflows, 
    workflowInstances, 
    approvalRequests, 
    loading 
  } = useWorkflow();
  
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('performance');

  // Calculate metrics
  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter(w => w.status === 'active').length;
  const runningInstances = workflowInstances.filter(i => i.status === 'running').length;
  const completedInstances = workflowInstances.filter(i => i.status === 'completed').length;
  
  const pendingApprovals = approvalRequests.filter(r => r.status === 'pending').length;
  const approvedRequests = approvalRequests.filter(r => r.status === 'approved').length;
  const rejectedRequests = approvalRequests.filter(r => r.status === 'rejected').length;
  
  // Calculate approval time metrics
  const approvedWithTimes = approvalRequests.filter(r => r.approved_at && r.created_at);
  const avgApprovalTime = approvedWithTimes.length > 0 
    ? approvedWithTimes.reduce((sum, req) => {
        const created = new Date(req.created_at).getTime();
        const approved = new Date(req.approved_at!).getTime();
        return sum + (approved - created);
      }, 0) / approvedWithTimes.length / (1000 * 60 * 60) // Convert to hours
    : 0;

  const slaCompliance = approvalRequests.length > 0 
    ? Math.round((approvedRequests / approvalRequests.length) * 100)
    : 100;

  // Mock data for charts (in a real app, this would come from the database)
  const workflowVolumeData = [
    { name: 'Mon', uploads: 12, approvals: 8, completions: 15 },
    { name: 'Tue', uploads: 19, approvals: 12, completions: 18 },
    { name: 'Wed', uploads: 15, approvals: 14, completions: 12 },
    { name: 'Thu', uploads: 22, approvals: 18, completions: 20 },
    { name: 'Fri', uploads: 28, approvals: 22, completions: 25 },
    { name: 'Sat', uploads: 8, approvals: 5, completions: 8 },
    { name: 'Sun', uploads: 6, approvals: 3, completions: 6 },
  ];

  const performanceMetrics = {
    avgApprovalTime: Math.round(avgApprovalTime * 10) / 10,
    slaCompliance,
    escalationRate: Math.round((rejectedRequests / Math.max(approvalRequests.length, 1)) * 100),
    bottlenecks: ['Level 2 Approvals', 'Weekend Processing'],
  };

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
          <h2 className="text-2xl font-bold text-foreground">Workflow Analytics</h2>
          <p className="text-muted-foreground">Monitor performance and identify bottlenecks</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Approval Time</p>
                <p className="text-2xl font-bold text-foreground">
                  {performanceMetrics.avgApprovalTime}h
                </p>
                <p className="text-xs text-success">↓ 12% from last month</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">SLA Compliance</p>
                <p className="text-2xl font-bold text-foreground">
                  {performanceMetrics.slaCompliance}%
                </p>
                <p className="text-xs text-success">↑ 5% from last month</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Escalation Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {performanceMetrics.escalationRate}%
                </p>
                <p className="text-xs text-warning">↑ 2% from last month</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-bold text-foreground">{activeWorkflows}</p>
                <p className="text-xs text-muted-foreground">of {totalWorkflows} total</p>
              </div>
              <Activity className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="volume">Volume</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Approval Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Approval Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pending</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-warning h-2 rounded-full" 
                          style={{ width: `${(pendingApprovals / Math.max(approvalRequests.length, 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{pendingApprovals}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Approved</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-success h-2 rounded-full" 
                          style={{ width: `${(approvedRequests / Math.max(approvalRequests.length, 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{approvedRequests}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Rejected</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-destructive h-2 rounded-full" 
                          style={{ width: `${(rejectedRequests / Math.max(approvalRequests.length, 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{rejectedRequests}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workflow Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Workflow Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Running</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(runningInstances / Math.max(workflowInstances.length, 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{runningInstances}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-success h-2 rounded-full" 
                          style={{ width: `${(completedInstances / Math.max(workflowInstances.length, 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{completedInstances}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Workflows</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-accent h-2 rounded-full" 
                          style={{ width: `${(activeWorkflows / Math.max(totalWorkflows, 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{activeWorkflows}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="volume" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Workflow Volume Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={workflowVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="uploads" 
                      stackId="1" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="approvals" 
                      stackId="1" 
                      stroke="hsl(var(--warning))" 
                      fill="hsl(var(--warning))" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="completions" 
                      stackId="1" 
                      stroke="hsl(var(--success))" 
                      fill="hsl(var(--success))" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Identified Bottlenecks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.bottlenecks.map((bottleneck, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      <div>
                        <p className="font-medium">{bottleneck}</p>
                        <p className="text-sm text-muted-foreground">
                          Average delay: {Math.random() * 5 + 1 | 0} hours
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive">High Impact</Badge>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Approver Availability</p>
                      <p className="text-sm text-muted-foreground">
                        Peak load during business hours
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Medium Impact</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Approval Time Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { period: 'Week 1', avgTime: performanceMetrics.avgApprovalTime * 1.25 },
                      { period: 'Week 2', avgTime: performanceMetrics.avgApprovalTime * 1.12 },
                      { period: 'Week 3', avgTime: performanceMetrics.avgApprovalTime * 1.05 },
                      { period: 'Week 4', avgTime: performanceMetrics.avgApprovalTime }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="avgTime" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Contracts', value: 60, fill: 'hsl(var(--primary))' },
                          { name: 'Financial', value: 25, fill: 'hsl(var(--success))' },
                          { name: 'Legal', value: 15, fill: 'hsl(var(--warning))' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};