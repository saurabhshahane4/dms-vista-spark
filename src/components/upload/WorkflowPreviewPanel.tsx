import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Workflow, 
  Clock, 
  User, 
  Bell, 
  CheckCircle, 
  AlertCircle,
  PlayCircle,
  Users,
  Mail,
  Calendar
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface WorkflowStep {
  stage: string;
  approver: string;
  eta: string;
  description?: string;
  required?: boolean;
}

interface TriggeredWorkflow {
  id: string;
  name: string;
  type: 'approval' | 'routing' | 'notification' | 'processing';
  steps: WorkflowStep[];
  estimatedCompletion: string;
  priority: 'high' | 'medium' | 'low';
}

interface WorkflowNotification {
  recipient: string;
  type: 'document_received' | 'new_document' | 'approval_required' | 'archive_complete';
  timing: 'immediate' | 'on_completion' | 'scheduled';
  description: string;
}

interface RoutingRule {
  rule: string;
  applied: boolean;
  description?: string;
}

interface WorkflowPreview {
  triggeredWorkflows: TriggeredWorkflow[];
  notifications: WorkflowNotification[];
  routingRules: RoutingRule[];
  estimatedProcessingTime: string;
}

interface WorkflowPreviewPanelProps {
  workflowPreview: WorkflowPreview;
  customer: any;
  documentType: any;
}

const WorkflowPreviewPanel = ({
  workflowPreview,
  customer,
  documentType
}: WorkflowPreviewPanelProps) => {
  const [simulatedWorkflows, setSimulatedWorkflows] = useState<TriggeredWorkflow[]>([]);

  useEffect(() => {
    if (customer && documentType) {
      generateWorkflowSimulation();
    }
  }, [customer, documentType]);

  const generateWorkflowSimulation = () => {
    // Mock workflow generation based on customer and document type
    const mockWorkflows: TriggeredWorkflow[] = [];

    if (customer && documentType?.category === 'legal' && documentType?.type === 'contract') {
      mockWorkflows.push({
        id: '1',
        name: `${customer.name} Legal Document Approval`,
        type: 'approval',
        priority: customer.priority_level === 'high' ? 'high' : 'medium',
        steps: [
          {
            stage: 'Initial Review',
            approver: 'document-admin@company.com',
            eta: '2 hours',
            description: 'Document validation and metadata verification',
            required: true
          },
          {
            stage: 'Legal Review', 
            approver: 'legal-team@company.com',
            eta: '1-2 business days',
            description: 'Legal compliance and content review',
            required: true
          },
          {
            stage: 'Manager Approval',
            approver: 'manager@company.com', 
            eta: '1 business day',
            description: 'Final approval before archiving',
            required: true
          },
          {
            stage: 'Archive Completion',
            approver: 'system',
            eta: '1 hour',
            description: 'Automated archival and indexing',
            required: false
          }
        ],
        estimatedCompletion: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 4 days from now
      });
    }

    if (customer && documentType?.category === 'financial') {
      mockWorkflows.push({
        id: '2',
        name: 'Financial Document Processing',
        type: 'processing',
        priority: 'medium',
        steps: [
          {
            stage: 'OCR Processing',
            approver: 'system',
            eta: '15 minutes',
            description: 'Extract financial data and amounts',
            required: true
          },
          {
            stage: 'Finance Review',
            approver: 'finance@company.com',
            eta: '4 hours',
            description: 'Verify amounts and approve for storage',
            required: true
          },
          {
            stage: 'Archive',
            approver: 'system',
            eta: '30 minutes', 
            description: 'Store in financial records system',
            required: false
          }
        ],
        estimatedCompletion: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 day from now
      });
    }

    // Always add a routing workflow
    mockWorkflows.push({
      id: '3',
      name: 'Document Routing & Notification',
      type: 'routing',
      priority: 'low',
      steps: [
        {
          stage: 'Customer Notification',
          approver: 'system',
          eta: 'immediate',
          description: 'Notify customer of document receipt',
          required: false
        },
        {
          stage: 'Internal Routing',
          approver: 'system',
          eta: '5 minutes',
          description: 'Route to appropriate department',
          required: true
        }
      ],
      estimatedCompletion: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 hour from now
    });

    setSimulatedWorkflows(mockWorkflows);
  };

  const getWorkflowIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'routing':
        return <Workflow className="w-4 h-4 text-green-500" />;
      case 'notification':
        return <Bell className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <PlayCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <Workflow className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getApproverInitials = (approver: string) => {
    if (approver === 'system') return 'SYS';
    if (approver.includes('@')) {
      return approver.split('@')[0].split('.').map(p => p[0]?.toUpperCase()).join('') || 'U';
    }
    return approver.split(' ').map(n => n[0]?.toUpperCase()).join('') || 'U';
  };

  const mockNotifications: WorkflowNotification[] = [
    {
      recipient: customer?.contact_email || 'customer@example.com',
      type: 'document_received',
      timing: 'immediate',
      description: 'Document successfully received and processing started'
    },
    {
      recipient: 'archive-team@company.com',
      type: 'new_document',
      timing: 'immediate', 
      description: 'New document added to system requiring processing'
    }
  ];

  const mockRoutingRules: RoutingRule[] = [
    {
      rule: `${customer?.name} Documents → Legal Warehouse Zone`,
      applied: documentType?.category === 'legal',
      description: 'Routes legal documents to appropriate storage zone'
    },
    {
      rule: 'High Priority → Express Processing',
      applied: customer?.priority_level === 'high',
      description: 'Expedited workflow for high priority customers'
    }
  ];

  if (!customer || !documentType) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Workflow className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Select customer and document type to preview workflows</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Workflow Summary */}
      <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {simulatedWorkflows.length} workflow(s) will be triggered
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Est. 2-4 days total</span>
        </div>
      </div>

      {/* Triggered Workflows */}
      {simulatedWorkflows.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <PlayCircle className="w-4 h-4" />
            Triggered Workflows
          </h4>
          
          {simulatedWorkflows.map((workflow, index) => (
            <Card key={workflow.id} className="border border-border/30">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getWorkflowIcon(workflow.type)}
                    <div>
                      <p className="text-sm font-medium text-foreground">{workflow.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {workflow.type} workflow
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getPriorityColor(workflow.priority)}>
                    {workflow.priority} priority
                  </Badge>
                </div>

                {/* Workflow Steps */}
                <div className="space-y-2">
                  {workflow.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-2 flex-1">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {getApproverInitials(step.approver)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{step.stage}</div>
                          {step.description && (
                            <div className="text-xs text-muted-foreground">{step.description}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {step.eta}
                      </div>
                      {step.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                  ))}
                </div>

                {/* Completion Estimate */}
                <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Estimated completion:</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span className="font-medium">{workflow.estimatedCompletion}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Notifications */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notifications
        </h4>
        
        <div className="space-y-1">
          {mockNotifications.map((notification, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded text-xs">
              <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium">{notification.recipient}</div>
                <div className="text-muted-foreground">{notification.description}</div>
              </div>
              <Badge variant="outline" className="text-xs">
                {notification.timing}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Routing Rules */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Workflow className="w-4 h-4" />
          Routing Rules
        </h4>
        
        <div className="space-y-1">
          {mockRoutingRules.map((rule, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded text-xs">
              {rule.applied ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-gray-400" />
              )}
              <div className="flex-1">
                <div className={rule.applied ? 'font-medium' : 'text-muted-foreground'}>
                  {rule.rule}
                </div>
                {rule.description && (
                  <div className="text-muted-foreground">{rule.description}</div>
                )}
              </div>
              <Badge variant={rule.applied ? "default" : "outline"} className="text-xs">
                {rule.applied ? "Active" : "Inactive"}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Processing Summary */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Ready to Process</span>
        </div>
        <p className="text-xs text-blue-700">
          All workflows are configured and will be triggered upon document upload.
        </p>
      </div>
    </div>
  );
};

export default WorkflowPreviewPanel;