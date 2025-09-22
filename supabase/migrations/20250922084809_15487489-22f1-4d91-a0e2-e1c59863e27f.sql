-- Create function to trigger workflows on document events
CREATE OR REPLACE FUNCTION public.trigger_document_workflows()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  workflow_trigger RECORD;
BEGIN
  -- Loop through active workflow triggers for this event type
  FOR workflow_trigger IN 
    SELECT dwt.*, w.name as workflow_name FROM public.document_workflow_triggers dwt
    JOIN public.workflows w ON dwt.workflow_id = w.id
    WHERE dwt.trigger_event = TG_ARGV[0] 
    AND dwt.user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND dwt.is_active = TRUE
    AND w.is_active = TRUE
  LOOP
    -- Create workflow instance
    INSERT INTO public.workflow_instances (
      workflow_id,
      document_id, 
      user_id,
      status,
      context_data
    ) VALUES (
      workflow_trigger.workflow_id,
      COALESCE(NEW.id, OLD.id),
      COALESCE(NEW.user_id, OLD.user_id),
      'running',
      jsonb_build_object(
        'trigger_event', TG_ARGV[0],
        'document_name', COALESCE(NEW.name, OLD.name),
        'document_category', COALESCE(NEW.category, OLD.category),
        'file_size', COALESCE(NEW.file_size, OLD.file_size)
      )
    );
    
    -- Create notification
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      metadata
    ) VALUES (
      COALESCE(NEW.user_id, OLD.user_id),
      'Workflow Triggered',
      'Workflow "' || workflow_trigger.workflow_name || '" has been triggered by document ' || TG_ARGV[0],
      'info',
      jsonb_build_object(
        'workflow_id', workflow_trigger.workflow_id,
        'document_id', COALESCE(NEW.id, OLD.id),
        'event', TG_ARGV[0]
      )
    );
  END LOOP;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for document events
CREATE TRIGGER document_upload_workflow_trigger
  AFTER INSERT ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.trigger_document_workflows('upload');

CREATE TRIGGER document_update_workflow_trigger
  AFTER UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.trigger_document_workflows('update');