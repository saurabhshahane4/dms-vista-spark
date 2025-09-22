import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  data: {
    componentId: string;
    label: string;
    config?: any;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export class WorkflowExecutionEngine {
  private workflowId: string;
  private definition: WorkflowDefinition;
  private context: any = {};

  constructor(workflowId: string, definition: WorkflowDefinition) {
    this.workflowId = workflowId;
    this.definition = definition;
  }

  async executeWorkflow(trigger: string, documentId?: string, userId?: string, initialContext: any = {}) {
    try {
      this.context = { ...initialContext, documentId, userId, trigger };
      
      // Create workflow instance
      const instance = await this.createWorkflowInstance();
      if (!instance) throw new Error('Failed to create workflow instance');

      // Log workflow start
      await this.logAuditEvent(instance.id, 'workflow_started', {
        trigger,
        documentId,
        userId,
        context: this.context
      });

      // Find trigger nodes
      const triggerNodes = this.definition.nodes.filter(node => 
        node.type === 'trigger' && node.data.componentId === trigger
      );

      if (triggerNodes.length === 0) {
        throw new Error(`No trigger found for: ${trigger}`);
      }

      // Execute workflow from trigger
      for (const triggerNode of triggerNodes) {
        await this.executeNode(triggerNode.id, instance.id);
      }

      return instance;
    } catch (error) {
      console.error('Workflow execution error:', error);
      throw error;
    }
  }

  private async executeNode(nodeId: string, instanceId: string): Promise<boolean> {
    const node = this.definition.nodes.find(n => n.id === nodeId);
    if (!node) return false;

    try {
      let result = false;

      switch (node.type) {
        case 'trigger':
          result = await this.executeTrigger(node);
          break;
        case 'condition':
          result = await this.executeCondition(node);
          break;
        case 'action':
          result = await this.executeAction(node, instanceId);
          break;
      }

      // Log node execution
      await this.logAuditEvent(instanceId, 'node_executed', {
        nodeId,
        nodeType: node.type,
        componentId: node.data.componentId,
        result,
        context: this.context
      });

      // If node succeeded, execute connected nodes
      if (result) {
        const connectedEdges = this.definition.edges.filter(edge => edge.source === nodeId);
        for (const edge of connectedEdges) {
          await this.executeNode(edge.target, instanceId);
        }
      }

      return result;
    } catch (error) {
      console.error(`Error executing node ${nodeId}:`, error);
      await this.logAuditEvent(instanceId, 'node_error', {
        nodeId,
        error: error.message,
        context: this.context
      });
      return false;
    }
  }

  private async executeTrigger(node: WorkflowNode): Promise<boolean> {
    // Triggers are entry points, always return true
    return true;
  }

  private async executeCondition(node: WorkflowNode): Promise<boolean> {
    const { componentId, config } = node.data;

    switch (componentId) {
      case 'customerIs':
        return this.checkCustomerCondition(config);
      case 'documentType':
        return this.checkDocumentTypeCondition(config);
      case 'fileSize':
        return this.checkFileSizeCondition(config);
      case 'location':
        return this.checkLocationCondition(config);
      default:
        console.warn(`Unknown condition: ${componentId}`);
        return false;
    }
  }

  private async executeAction(node: WorkflowNode, instanceId: string): Promise<boolean> {
    const { componentId, config } = node.data;

    switch (componentId) {
      case 'requireApproval':
        return await this.createApprovalRequest(config, instanceId);
      case 'autoRoute':
        return await this.autoRouteDocument(config);
      case 'sendNotification':
        return await this.sendNotification(config);
      case 'setMetadata':
        return await this.setDocumentMetadata(config);
      default:
        console.warn(`Unknown action: ${componentId}`);
        return false;
    }
  }

  private checkCustomerCondition(config: any): boolean {
    const { customer } = this.context;
    if (!customer || !config?.value) return false;
    
    const pattern = config.value.replace('*', '.*');
    const regex = new RegExp(pattern, 'i');
    return regex.test(customer);
  }

  private checkDocumentTypeCondition(config: any): boolean {
    const { documentType } = this.context;
    if (!documentType || !config?.value) return false;
    
    const types = config.value.split(',').map((t: string) => t.trim().toLowerCase());
    return types.includes(documentType.toLowerCase());
  }

  private checkFileSizeCondition(config: any): boolean {
    const { fileSize } = this.context;
    if (fileSize === undefined || !config?.operator || config?.value === undefined) return false;

    const size = parseFloat(fileSize);
    const threshold = parseFloat(config.value);

    switch (config.operator) {
      case '>': return size > threshold;
      case '>=': return size >= threshold;
      case '<': return size < threshold;
      case '<=': return size <= threshold;
      case '=': return size === threshold;
      default: return false;
    }
  }

  private checkLocationCondition(config: any): boolean {
    const { location } = this.context;
    if (!location || !config?.value) return false;
    
    const pattern = config.value.replace('*', '.*');
    const regex = new RegExp(pattern, 'i');
    return regex.test(location);
  }

  private async createApprovalRequest(config: any, instanceId: string): Promise<boolean> {
    try {
      const { documentId, userId } = this.context;
      
      // Find approver (simplified - in real app would use approval matrix)
      const approverId = config?.approverId || userId;
      
      const { error } = await supabase
        .from('approval_requests')
        .insert({
          workflow_instance_id: instanceId,
          document_id: documentId,
          user_id: userId,
          approver_id: approverId,
          approval_level: 1,
          priority: config?.priority || 'medium',
          due_date: config?.dueDate
        });

      if (error) throw error;
      
      toast.success('Approval request created');
      return true;
    } catch (error) {
      console.error('Error creating approval request:', error);
      return false;
    }
  }

  private async autoRouteDocument(config: any): Promise<boolean> {
    try {
      const { documentId } = this.context;
      if (!documentId) return false;

      // In a real implementation, this would move the document to the specified location
      console.log('Auto-routing document to:', config?.destination);
      
      toast.success(`Document routed to ${config?.destination}`);
      return true;
    } catch (error) {
      console.error('Error auto-routing document:', error);
      return false;
    }
  }

  private async sendNotification(config: any): Promise<boolean> {
    try {
      const { recipients, template, data } = config;
      
      // In a real implementation, this would send emails/SMS
      console.log('Sending notifications to:', recipients);
      console.log('Template:', template);
      console.log('Data:', data);
      
      toast.success(`Notifications sent to ${recipients?.length || 0} recipients`);
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  private async setDocumentMetadata(config: any): Promise<boolean> {
    try {
      const { documentId } = this.context;
      if (!documentId) return false;

      const { error } = await supabase
        .from('documents')
        .update({
          category: config?.category,
          department: config?.department,
          tags: config?.tags
        })
        .eq('id', documentId);

      if (error) throw error;
      
      toast.success('Document metadata updated');
      return true;
    } catch (error) {
      console.error('Error setting document metadata:', error);
      return false;
    }
  }

  private async createWorkflowInstance() {
    try {
      const { data, error } = await supabase
        .from('workflow_instances')
        .insert({
          workflow_id: this.workflowId,
          document_id: this.context.documentId,
          user_id: this.context.userId,
          status: 'running',
          context_data: this.context
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating workflow instance:', error);
      return null;
    }
  }

  private async logAuditEvent(instanceId: string, action: string, details: any) {
    try {
      await supabase
        .from('workflow_audit_log')
        .insert({
          workflow_instance_id: instanceId,
          user_id: this.context.userId,
          action,
          details
        });
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }
}

// Export helper functions for workflow execution
export const executeWorkflow = async (
  workflowId: string, 
  definition: WorkflowDefinition, 
  trigger: string, 
  documentId?: string, 
  userId?: string, 
  context: any = {}
) => {
  const engine = new WorkflowExecutionEngine(workflowId, definition);
  return await engine.executeWorkflow(trigger, documentId, userId, context);
};

export const validateWorkflow = (definition: WorkflowDefinition): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check for trigger nodes
  const triggerNodes = definition.nodes.filter(node => node.type === 'trigger');
  if (triggerNodes.length === 0) {
    errors.push('Workflow must have at least one trigger node');
  }

  // Check for orphaned nodes
  const connectedNodes = new Set<string>();
  definition.edges.forEach(edge => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });

  const orphanedNodes = definition.nodes.filter(node => 
    node.type !== 'trigger' && !connectedNodes.has(node.id)
  );
  
  if (orphanedNodes.length > 0) {
    errors.push(`Found ${orphanedNodes.length} orphaned nodes that are not connected`);
  }

  // Check for circular dependencies (basic check)
  const hasCircularDependency = definition.edges.some(edge => 
    definition.edges.some(otherEdge => 
      edge.source === otherEdge.target && edge.target === otherEdge.source
    )
  );

  if (hasCircularDependency) {
    errors.push('Workflow contains circular dependencies');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};