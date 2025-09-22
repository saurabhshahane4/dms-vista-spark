import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkflow } from '@/hooks/useWorkflow';
import { executeWorkflow, WorkflowDefinition } from '@/components/workflow/WorkflowExecutionEngine';
import { toast } from 'sonner';

export const useDocumentWorkflowTriggers = () => {
  const { user } = useAuth();
  const { workflows } = useWorkflow();

  useEffect(() => {
    if (!user) return;

    // Fetch workflow triggers from the database
    const fetchWorkflowTriggers = async () => {
      const { data: triggers } = await supabase
        .from('document_workflow_triggers')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      return triggers || [];
    };

    // Set up real-time listeners for document operations
    const documentsChannel = supabase
      .channel('document-workflow-triggers')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('Document created, checking triggers:', payload);
          const triggers = await fetchWorkflowTriggers();
          await triggerWorkflows('document_uploaded', payload.new, triggers);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('Document updated, checking triggers:', payload);
          const triggers = await fetchWorkflowTriggers();
          
          // Check if status changed to approved
          if (payload.old.status !== 'approved' && payload.new.status === 'approved') {
            await triggerWorkflows('document_approved', payload.new, triggers);
          }
          
          // Check if document was moved
          if (payload.old.folder_path !== payload.new.folder_path) {
            await triggerWorkflows('document_moved', payload.new, triggers);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'document_locations',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('Document location assigned, checking triggers:', payload);
          const triggers = await fetchWorkflowTriggers();
          await triggerWorkflows('document_assigned', payload.new, triggers);
        }
      )
      .subscribe();

    const triggerWorkflows = async (triggerEvent: string, documentData: any, workflowTriggers: any[]) => {
      try {
        // Find active triggers for this event
        const activeTriggers = workflowTriggers.filter(trigger => 
          trigger.trigger_event === triggerEvent && 
          trigger.is_active &&
          trigger.user_id === user.id
        );

        console.log(`Found ${activeTriggers.length} active triggers for ${triggerEvent}`);

        for (const trigger of activeTriggers) {
          // Find the associated workflow
          const workflow = workflows.find(w => w.id === trigger.workflow_id && w.is_active);
          
          if (!workflow) {
            console.log(`Workflow ${trigger.workflow_id} not found or inactive`);
            continue;
          }

          console.log(`Executing workflow: ${workflow.name} for trigger: ${triggerEvent}`);

          // Prepare context data
          const context = {
            triggerEvent,
            document: documentData,
            documentId: documentData.id,
            documentName: documentData.name,
            documentType: documentData.category,
            fileSize: documentData.file_size,
            customer: extractCustomerFromDocument(documentData),
            location: documentData.folder_path || 'General',
            timestamp: new Date().toISOString()
          };

          // Execute the workflow
          try {
            await executeWorkflow(
              workflow.id,
              workflow.definition as WorkflowDefinition,
              triggerEvent,
              documentData.id,
              user.id,
              context
            );

            toast.success(`Workflow "${workflow.name}" triggered successfully`);
          } catch (workflowError) {
            console.error(`Error executing workflow ${workflow.name}:`, workflowError);
            toast.error(`Failed to execute workflow "${workflow.name}"`);
          }
        }
      } catch (error) {
        console.error('Error processing workflow triggers:', error);
      }
    };

    return () => {
      supabase.removeChannel(documentsChannel);
    };
  }, [user, workflows]);

  // Helper function to extract customer information from document
  const extractCustomerFromDocument = (document: any): string => {
    // Try to extract customer from document name, tags, or other fields
    if (document.tags) {
      const customerTag = document.tags.find((tag: string) => 
        tag.toLowerCase().includes('customer') || tag.toLowerCase().includes('client')
      );
      if (customerTag) return customerTag;
    }

    // Try to extract from document name
    if (document.name) {
      const nameParts = document.name.split(/[-_\s]+/);
      if (nameParts.length > 1) {
        return nameParts[0]; // Assume first part might be customer code
      }
    }

    return 'Unknown';
  };

  return null; // This is a hook that sets up listeners, doesn't render anything
};

// Component that initializes the workflow triggers
export const DocumentWorkflowTriggers = () => {
  useDocumentWorkflowTriggers();
  return null;
};