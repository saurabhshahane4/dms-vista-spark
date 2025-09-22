import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  Play, 
  Upload, 
  Move, 
  Calendar, 
  User, 
  CheckCircle, 
  Mail, 
  Settings,
  Plus,
  FileText,
  Filter,
  TestTube
} from 'lucide-react';
import { useWorkflow } from '@/hooks/useWorkflow';
import { WorkflowExecutionEngine, validateWorkflow, executeWorkflow } from './WorkflowExecutionEngine';
import { toast } from 'sonner';

// Custom node types
const nodeTypes = {
  trigger: ({ data }: { data: any }) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-blue-100 border-2 border-blue-500">
      <div className="flex items-center gap-2">
        {data.icon}
        <div className="ml-2">
          <div className="text-lg font-bold">{data.label}</div>
          <div className="text-gray-500 text-sm">{data.description}</div>
        </div>
      </div>
    </div>
  ),
  condition: ({ data }: { data: any }) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-yellow-100 border-2 border-yellow-500">
      <div className="flex items-center gap-2">
        {data.icon}
        <div className="ml-2">
          <div className="text-lg font-bold">{data.label}</div>
          <div className="text-gray-500 text-sm">{data.description}</div>
        </div>
      </div>
    </div>
  ),
  action: ({ data }: { data: any }) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-green-100 border-2 border-green-500">
      <div className="flex items-center gap-2">
        {data.icon}
        <div className="ml-2">
          <div className="text-lg font-bold">{data.label}</div>
          <div className="text-gray-500 text-sm">{data.description}</div>
        </div>
      </div>
    </div>
  ),
};

const workflowComponents = {
  triggers: [
    { id: 'documentUpload', label: 'Document Upload', icon: <Upload className="h-4 w-4" />, description: 'When a document is uploaded' },
    { id: 'moveRequest', label: 'Move Request', icon: <Move className="h-4 w-4" />, description: 'When a document move is requested' },
    { id: 'retentionDue', label: 'Retention Due', icon: <Calendar className="h-4 w-4" />, description: 'When retention period expires' },
    { id: 'manualTrigger', label: 'Manual Trigger', icon: <Play className="h-4 w-4" />, description: 'Manually triggered workflow' },
  ],
  conditions: [
    { id: 'customerIs', label: 'Customer Is', icon: <User className="h-4 w-4" />, description: 'Check customer identity' },
    { id: 'documentType', label: 'Document Type', icon: <FileText className="h-4 w-4" />, description: 'Check document type' },
    { id: 'fileSize', label: 'File Size', icon: <Filter className="h-4 w-4" />, description: 'Check file size limits' },
    { id: 'location', label: 'Location', icon: <Move className="h-4 w-4" />, description: 'Check document location' },
  ],
  actions: [
    { id: 'requireApproval', label: 'Require Approval', icon: <CheckCircle className="h-4 w-4" />, description: 'Send for approval' },
    { id: 'autoRoute', label: 'Auto Route', icon: <Move className="h-4 w-4" />, description: 'Route to location' },
    { id: 'sendNotification', label: 'Send Notification', icon: <Mail className="h-4 w-4" />, description: 'Send email/SMS' },
    { id: 'setMetadata', label: 'Set Metadata', icon: <Settings className="h-4 w-4" />, description: 'Update document metadata' },
  ],
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export const WorkflowBuilder = () => {
  const { createWorkflow } = useWorkflow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [isTestMode, setIsTestMode] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback((component: any, type: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      data: {
        label: component.label,
        icon: component.icon,
        description: component.description,
        componentId: component.id,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const testWorkflow = async () => {
    if (nodes.length === 0) {
      toast.error('Please add some nodes to test the workflow');
      return;
    }

    const workflowDefinition = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type as 'trigger' | 'condition' | 'action',
        data: node.data,
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      })),
    };

    // Validate workflow
    const validation = validateWorkflow(workflowDefinition);
    if (!validation.isValid) {
      toast.error('Workflow validation failed', {
        description: validation.errors.join(', ')
      });
      return;
    }

    setIsTestMode(true);
    
    try {
      // Test with sample data
      const testContext = {
        customer: 'Customer A',
        documentType: 'contract',
        fileSize: 25.5,
        location: 'Warehouse 1'
      };

      const triggerNodes = nodes.filter(n => n.type === 'trigger');
      if (triggerNodes.length > 0) {
        const result = await executeWorkflow(
          'test-workflow',
          workflowDefinition,
          triggerNodes[0].data.componentId,
          'test-document-id',
          'test-user-id',
          testContext
        );

        if (result) {
          toast.success('Workflow test completed successfully!');
        } else {
          toast.error('Workflow test failed');
        }
      }
    } catch (error) {
      console.error('Workflow test error:', error);
      toast.error('Workflow test failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTestMode(false);
    }
  };

  const saveWorkflow = async () => {
    if (!workflowName.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    const workflowDefinition = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      })),
    };

    await createWorkflow({
      name: workflowName,
      description: workflowDescription,
      definition: workflowDefinition,
      status: 'draft',
      version: 1,
      is_active: false,
    });

    toast.success('Workflow saved successfully');
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <ReactFlowProvider>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[800px]">
          {/* Component Palette */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Workflow Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="workflowName">Name</Label>
                  <Input
                    id="workflowName"
                    placeholder="Enter workflow name"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="workflowDescription">Description</Label>
                  <Textarea
                    id="workflowDescription"
                    placeholder="Describe your workflow"
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveWorkflow} className="flex-1 gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2" 
                    onClick={testWorkflow}
                    disabled={isTestMode}
                  >
                    <TestTube className="h-4 w-4" />
                    {isTestMode ? 'Testing...' : 'Test'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Triggers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Triggers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {workflowComponents.triggers.map((trigger) => (
                  <Button
                    key={trigger.id}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 h-auto p-2"
                    onClick={() => addNode(trigger, 'trigger')}
                  >
                    {trigger.icon}
                    <div className="text-left">
                      <div className="font-medium text-xs">{trigger.label}</div>
                      <div className="text-xs text-muted-foreground">{trigger.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {workflowComponents.conditions.map((condition) => (
                  <Button
                    key={condition.id}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 h-auto p-2"
                    onClick={() => addNode(condition, 'condition')}
                  >
                    {condition.icon}
                    <div className="text-left">
                      <div className="font-medium text-xs">{condition.label}</div>
                      <div className="text-xs text-muted-foreground">{condition.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {workflowComponents.actions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 h-auto p-2"
                    onClick={() => addNode(action, 'action')}
                  >
                    {action.icon}
                    <div className="text-left">
                      <div className="font-medium text-xs">{action.label}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Workflow Canvas */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Workflow Canvas</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setNodes([]);
                      setEdges([]);
                    }}>
                      Clear
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Templates
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-80px)]">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  className="workflow-canvas"
                  fitView
                >
                  <Controls />
                  <MiniMap />
                  <Background gap={12} size={1} />
                </ReactFlow>
              </CardContent>
            </Card>
          </div>
        </div>
      </ReactFlowProvider>
    </DndProvider>
  );
};