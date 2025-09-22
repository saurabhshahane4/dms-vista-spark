-- Create sample workflows
INSERT INTO public.workflows (id, name, description, user_id, definition, is_active, status) VALUES
(gen_random_uuid(), 'Document Review Workflow', 'Standard document approval process', auth.uid(), '{"steps": ["review", "approve", "archive"]}', true, 'active'),
(gen_random_uuid(), 'Budget Approval Workflow', 'Financial document approval process', auth.uid(), '{"steps": ["initial_review", "manager_approval", "final_approval"]}', true, 'active'),
(gen_random_uuid(), 'Contract Review Workflow', 'Legal document review process', auth.uid(), '{"steps": ["legal_review", "compliance_check", "signature"]}', true, 'active');

-- Create sample workflow instances
WITH sample_workflows AS (
  SELECT id as workflow_id FROM public.workflows WHERE user_id = auth.uid() LIMIT 3
),
sample_instances AS (
  INSERT INTO public.workflow_instances (id, workflow_id, user_id, status, context_data, current_step) 
  SELECT 
    gen_random_uuid(),
    workflow_id,
    auth.uid(),
    'running',
    jsonb_build_object('document_name', 'Sample Document ' || (row_number() OVER())::text, 'priority', 'high'),
    'approval_pending'
  FROM sample_workflows
  RETURNING id as instance_id, workflow_id
)

-- Create sample approval requests
INSERT INTO public.approval_requests (
  user_id, 
  approver_id, 
  workflow_instance_id, 
  approval_level, 
  status, 
  priority, 
  due_date,
  comments,
  document_id
)
SELECT 
  auth.uid() as user_id,
  auth.uid() as approver_id, -- Same user for demo purposes
  si.instance_id,
  (row_number() OVER())::integer as approval_level,
  CASE 
    WHEN row_number() OVER() <= 2 THEN 'pending'
    ELSE 'approved'
  END as status,
  CASE 
    WHEN row_number() OVER() = 1 THEN 'high'
    WHEN row_number() OVER() = 2 THEN 'medium'
    ELSE 'low'
  END as priority,
  now() + interval '3 days' as due_date,
  'Please review and approve this document for processing.' as comments,
  NULL as document_id
FROM sample_instances si;

-- Create additional "My Requests" (where user is requester, different approver)
WITH sample_workflows AS (
  SELECT id as workflow_id FROM public.workflows WHERE user_id = auth.uid() LIMIT 2
),
additional_instances AS (
  INSERT INTO public.workflow_instances (id, workflow_id, user_id, status, context_data, current_step) 
  SELECT 
    gen_random_uuid(),
    workflow_id,
    auth.uid(),
    'running',
    jsonb_build_object('document_name', 'My Request Document ' || (row_number() OVER())::text, 'type', 'budget_request'),
    'waiting_approval'
  FROM sample_workflows
  RETURNING id as instance_id, workflow_id
)

INSERT INTO public.approval_requests (
  user_id, 
  approver_id, 
  workflow_instance_id, 
  approval_level, 
  status, 
  priority, 
  due_date,
  comments
)
SELECT 
  auth.uid() as user_id,
  gen_random_uuid() as approver_id, -- Different approver for "my requests"
  ai.instance_id,
  1 as approval_level,
  CASE 
    WHEN row_number() OVER() = 1 THEN 'pending'
    ELSE 'rejected'
  END as status,
  'medium' as priority,
  now() + interval '5 days' as due_date,
  'Submitted for your review and approval.' as comments
FROM additional_instances ai;