-- Fix the missing foreign key relationship between approval_requests and workflow_instances
-- This will allow proper joins in queries

-- First, let's check if the foreign key already exists and add it if missing
DO $$ 
BEGIN
    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'approval_requests_workflow_instance_id_fkey' 
        AND table_name = 'approval_requests'
    ) THEN
        ALTER TABLE public.approval_requests 
        ADD CONSTRAINT approval_requests_workflow_instance_id_fkey 
        FOREIGN KEY (workflow_instance_id) 
        REFERENCES public.workflow_instances(id) 
        ON DELETE CASCADE;
    END IF;
END $$;