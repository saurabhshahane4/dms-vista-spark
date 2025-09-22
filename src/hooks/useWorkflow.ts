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

  // Fetch approval requests with workflow names
  const fetchApprovalRequests = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          *,
          workflow_instances!inner(
            id,
            workflow_id,
            context_data,
            workflows!inner(
              id,
              name,
              description
            )
          )
        `)
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
      
      // First, check if we already have workflows
      const { data: existingWorkflows, error: checkError } = await supabase
        .from('workflows')
        .select('id, name')
        .eq('user_id', user.id);

      if (checkError) throw checkError;

      let workflows = existingWorkflows;

      // Create sample workflows if none exist
      if (!workflows || workflows.length === 0) {
        const { data: newWorkflows, error: workflowError } = await supabase
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
        workflows = newWorkflows;
      }

      if (!workflows || workflows.length === 0) throw new Error('No workflows available');

      // Check if workflow instances already exist
      const { data: existingInstances, error: checkInstanceError } = await supabase
        .from('workflow_instances')
        .select('id')
        .eq('user_id', user.id);

      if (checkInstanceError) throw checkInstanceError;

      let instances = existingInstances;

      // Create sample workflow instances if none exist
      if (!instances || instances.length === 0) {
        const { data: newInstances, error: instanceError } = await supabase
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
              workflow_id: workflows.length > 1 ? workflows[1].id : workflows[0].id,
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
        instances = newInstances;
      }

      if (!instances || instances.length === 0) throw new Error('No workflow instances available');

      // Check if approval requests already exist
      const { data: existingRequests, error: checkRequestError } = await supabase
        .from('approval_requests')
        .select('id')
        .or(`user_id.eq.${user.id},approver_id.eq.${user.id}`);

      if (checkRequestError) throw checkRequestError;

      // Create sample approval requests if none exist
      if (!existingRequests || existingRequests.length === 0) {
        // Create a demo UUID for other users to make realistic approval scenarios
        const demoRequesterUuid = '00000000-0000-0000-0000-000000000001';
        const demoApproverUuid = '00000000-0000-0000-0000-000000000002';

        const { error: approvalError } = await supabase
          .from('approval_requests')
          .insert([
            // Pending approvals (where current user is the approver)
            {
              user_id: demoRequesterUuid,
              approver_id: user.id,
              workflow_instance_id: instances[0].id,
              approval_level: 1,
              status: 'pending',
              priority: 'high',
              due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              comments: 'Please review this annual budget report and provide approval by end of week.'
            },
            {
              user_id: demoRequesterUuid,
              approver_id: user.id,
              workflow_instance_id: instances[Math.min(1, instances.length - 1)].id,
              approval_level: 1,
              status: 'pending',
              priority: 'medium',
              due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              comments: 'Marketing strategy requires your approval before implementation.'
            },
            {
              user_id: demoRequesterUuid,
              approver_id: user.id,
              workflow_instance_id: instances[Math.min(2, instances.length - 1)].id,
              approval_level: 1,
              status: 'pending',
              priority: 'low',
              due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              comments: 'Document classification update needs your review and approval.'
            },
            // My requests (where current user is the requester)
            {
              user_id: user.id,
              approver_id: demoApproverUuid,
              workflow_instance_id: instances[Math.min(2, instances.length - 1)].id,
              approval_level: 1,
              status: 'pending',
              priority: 'medium',
              due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              comments: 'Submitted employee handbook updates for management review.'
            },
            {
              user_id: user.id,
              approver_id: demoApproverUuid,
              workflow_instance_id: instances[Math.min(1, instances.length - 1)].id,
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

      // Create sample approval matrix with system locations
      const { data: existingMatrix, error: checkMatrixError } = await supabase
        .from('approval_matrix')
        .select('id')
        .eq('user_id', user.id);

      if (checkMatrixError) throw checkMatrixError;

      if (!existingMatrix || existingMatrix.length === 0) {
        const { error: matrixError } = await supabase
          .from('approval_matrix')
          .insert([
            {
              name: 'Standard Document Approval',
              user_id: user.id,
              conditions: {
                document_type: ['contract', 'policy'],
                priority: ['medium', 'high'],
                location: 'headquarters'
              },
              approvers: [
                { 
                  id: user.id, 
                  name: 'Primary Approver', 
                  level: 1,
                  location: 'headquarters'
                }
              ],
              escalation_policy: {
                timeout_days: 3,
                escalate_to: user.id,
                escalation_location: 'regional_office'
              },
              is_active: true,
              priority_order: 1
            },
            {
              name: 'High Priority Approval',
              user_id: user.id,
              conditions: {
                document_type: ['budget', 'financial'],
                priority: ['high'],
                location: 'any'
              },
              approvers: [
                { 
                  id: user.id, 
                  name: 'Finance Manager', 
                  level: 1,
                  location: 'finance_department'
                },
                { 
                  id: user.id, 
                  name: 'Department Head', 
                  level: 2,
                  location: 'executive_office'
                }
              ],
              escalation_policy: {
                timeout_days: 1,
                escalate_to: user.id,
                escalation_location: 'executive_office'
              },
              is_active: true,
              priority_order: 1
            }
          ]);

        if (matrixError) throw matrixError;
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