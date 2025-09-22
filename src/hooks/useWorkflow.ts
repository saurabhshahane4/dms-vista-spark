import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  definition: any;
  status: 'draft' | 'active' | 'inactive';
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowInstance {
  id: string;
  workflow_id: string;
  document_id?: string;
  user_id: string;
  status: 'running' | 'completed' | 'error';
  current_step?: string;
  context_data: any;
  started_at: string;
  completed_at?: string;
}

export interface ApprovalRequest {
  id: string;
  workflow_instance_id: string;
  document_id?: string;
  user_id: string;
  approver_id: string;
  approval_level: number;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  approved_at?: string;
  rejected_at?: string;
  comments?: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalMatrix {
  id: string;
  user_id: string;
  name: string;
  conditions: any;
  approvers: any[];
  escalation_policy: any;
  is_active: boolean;
  priority_order: number;
  created_at: string;
  updated_at: string;
}

export interface RoutingRule {
  id: string;
  user_id: string;
  name: string;
  conditions: any;
  actions: any;
  priority_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useWorkflow = () => {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [workflowInstances, setWorkflowInstances] = useState<WorkflowInstance[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [approvalMatrix, setApprovalMatrix] = useState<ApprovalMatrix[]>([]);
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch workflows
  const fetchWorkflows = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data as Workflow[] || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast.error('Failed to fetch workflows');
    }
  };

  // Fetch workflow instances
  const fetchWorkflowInstances = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('workflow_instances')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflowInstances(data as WorkflowInstance[] || []);
    } catch (error) {
      console.error('Error fetching workflow instances:', error);
      toast.error('Failed to fetch workflow instances');
    }
  };

  // Fetch approval requests
  const fetchApprovalRequests = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select('*')
        .or(`user_id.eq.${user.id},approver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApprovalRequests(data as ApprovalRequest[] || []);
    } catch (error) {
      console.error('Error fetching approval requests:', error);
      toast.error('Failed to fetch approval requests');
    }
  };

  // Fetch approval matrix
  const fetchApprovalMatrix = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('approval_matrix')
        .select('*')
        .eq('user_id', user.id)
        .order('priority_order', { ascending: true });

      if (error) throw error;
      setApprovalMatrix(data as ApprovalMatrix[] || []);
    } catch (error) {
      console.error('Error fetching approval matrix:', error);
      toast.error('Failed to fetch approval matrix');
    }
  };

  // Fetch routing rules
  const fetchRoutingRules = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('routing_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('priority_order', { ascending: true });

      if (error) throw error;
      setRoutingRules(data || []);
    } catch (error) {
      console.error('Error fetching routing rules:', error);
      toast.error('Failed to fetch routing rules');
    }
  };

  // Create workflow
  const createWorkflow = async (workflow: Omit<Workflow, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          ...workflow,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchWorkflows();
      toast.success('Workflow created successfully');
      return data;
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error('Failed to create workflow');
      return null;
    }
  };

  // Update workflow
  const updateWorkflow = async (id: string, updates: Partial<Workflow>) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('workflows')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchWorkflows();
      toast.success('Workflow updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast.error('Failed to update workflow');
      return null;
    }
  };

  // Delete workflow
  const deleteWorkflow = async (id: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchWorkflows();
      toast.success('Workflow deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Failed to delete workflow');
      return false;
    }
  };

  // Create approval request
  const createApprovalRequest = async (request: Omit<ApprovalRequest, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .insert(request)
        .select()
        .single();

      if (error) throw error;
      
      await fetchApprovalRequests();
      toast.success('Approval request created');
      return data;
    } catch (error) {
      console.error('Error creating approval request:', error);
      toast.error('Failed to create approval request');
      return null;
    }
  };

  // Update approval request
  const updateApprovalRequest = async (id: string, updates: Partial<ApprovalRequest>) => {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchApprovalRequests();
      return data;
    } catch (error) {
      console.error('Error updating approval request:', error);
      toast.error('Failed to update approval request');
      return null;
    }
  };

  // Approve request
  const approveRequest = async (id: string, comments?: string) => {
    return updateApprovalRequest(id, {
      status: 'approved',
      approved_at: new Date().toISOString(),
      comments,
    });
  };

  // Reject request
  const rejectRequest = async (id: string, comments?: string) => {
    return updateApprovalRequest(id, {
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      comments,
    });
  };

  // Create approval matrix rule
  const createApprovalMatrix = async (matrix: Omit<ApprovalMatrix, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('approval_matrix')
        .insert({
          ...matrix,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchApprovalMatrix();
      toast.success('Approval rule created');
      return data;
    } catch (error) {
      console.error('Error creating approval matrix:', error);
      toast.error('Failed to create approval rule');
      return null;
    }
  };

  // Create routing rule
  const createRoutingRule = async (rule: Omit<RoutingRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('routing_rules')
        .insert({
          ...rule,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchRoutingRules();
      toast.success('Routing rule created');
      return data;
    } catch (error) {
      console.error('Error creating routing rule:', error);
      toast.error('Failed to create routing rule');
      return null;
    }
  };

  // Create sample data for demonstration
  const createSampleData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Create sample workflows
      const { data: workflows, error: workflowError } = await supabase
        .from('workflows')
        .insert([
          {
            name: 'Document Review Workflow',
            description: 'Standard document approval process',
            user_id: user.id,
            definition: { steps: ['review', 'approve', 'archive'] },
            is_active: true,
            status: 'active'
          },
          {
            name: 'Budget Approval Workflow', 
            description: 'Financial document approval process',
            user_id: user.id,
            definition: { steps: ['initial_review', 'manager_approval', 'final_approval'] },
            is_active: true,
            status: 'active'
          }
        ])
        .select();

      if (workflowError) throw workflowError;

      if (workflows && workflows.length > 0) {
        // Create sample workflow instances
        const { data: instances, error: instanceError } = await supabase
          .from('workflow_instances')
          .insert([
            {
              workflow_id: workflows[0].id,
              user_id: user.id,
              status: 'running',
              context_data: { document_name: 'Annual Budget Report 2024', priority: 'high' },
              current_step: 'approval_pending'
            },
            {
              workflow_id: workflows[1].id,
              user_id: user.id,
              status: 'running',
              context_data: { document_name: 'Marketing Strategy Document', priority: 'medium' },
              current_step: 'approval_pending'
            },
            {
              workflow_id: workflows[0].id,
              user_id: user.id,
              status: 'running',
              context_data: { document_name: 'Employee Handbook Update', type: 'policy_document' },
              current_step: 'waiting_approval'
            }
          ])
          .select();

        if (instanceError) throw instanceError;

        if (instances && instances.length > 0) {
          // Create sample approval requests
          const { error: approvalError } = await supabase
            .from('approval_requests')
            .insert([
              // Pending approvals (where current user is the approver)
              {
                user_id: '00000000-0000-0000-0000-000000000002',
                approver_id: user.id,
                workflow_instance_id: instances[0].id,
                approval_level: 1,
                status: 'pending',
                priority: 'high',
                due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                comments: 'Please review this annual budget report and provide approval by end of week.'
              },
              {
                user_id: '00000000-0000-0000-0000-000000000002',
                approver_id: user.id,
                workflow_instance_id: instances[1].id,
                approval_level: 1,
                status: 'pending',
                priority: 'medium',
                due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                comments: 'Marketing strategy requires your approval before implementation.'
              },
              // My requests (where current user is the requester)
              {
                user_id: user.id,
                approver_id: '00000000-0000-0000-0000-000000000002',
                workflow_instance_id: instances[2].id,
                approval_level: 1,
                status: 'pending',
                priority: 'medium',
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                comments: 'Submitted employee handbook updates for management review.'
              },
              {
                user_id: user.id,
                approver_id: '00000000-0000-0000-0000-000000000002',
                workflow_instance_id: instances[1].id,
                approval_level: 1,
                status: 'approved',
                priority: 'low',
                due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                comments: 'Quarterly report was approved and processed successfully.',
                approved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
              }
            ]);

          if (approvalError) throw approvalError;
        }
      }

      // Refetch all data after creating samples
      await Promise.all([
        fetchWorkflows(),
        fetchWorkflowInstances(),
        fetchApprovalRequests(),
        fetchApprovalMatrix(),
        fetchRoutingRules()
      ]);
      
      toast.success('Sample data created successfully!');
      
    } catch (error) {
      console.error('Error creating sample data:', error);
      toast.error('Failed to create sample data');
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    if (user?.id) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          fetchWorkflows(),
          fetchWorkflowInstances(),
          fetchApprovalRequests(),
          fetchApprovalMatrix(),
          fetchRoutingRules(),
        ]);
        setLoading(false);
      };
      loadData();
    }
  }, [user?.id]);

  // Get pending approvals for current user
  const getPendingApprovals = () => {
    return approvalRequests.filter(
      req => req.approver_id === user?.id && req.status === 'pending'
    );
  };

  // Get my requests (created by current user)
  const getMyRequests = () => {
    return approvalRequests.filter(req => req.user_id === user?.id);
  };

  return {
    // Data
    workflows,
    workflowInstances,
    approvalRequests,
    approvalMatrix,
    routingRules,
    loading,

    // Computed data
    pendingApprovals: getPendingApprovals(),
    myRequests: getMyRequests(),

    // Actions
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    createApprovalRequest,
    updateApprovalRequest,
    approveRequest,
    rejectRequest,
    createApprovalMatrix,
    createRoutingRule,
    createSampleData,

    // Refresh functions
    refetch: () => Promise.all([
      fetchWorkflows(),
      fetchWorkflowInstances(),
      fetchApprovalRequests(),
      fetchApprovalMatrix(),
      fetchRoutingRules(),
    ]),
  };
};