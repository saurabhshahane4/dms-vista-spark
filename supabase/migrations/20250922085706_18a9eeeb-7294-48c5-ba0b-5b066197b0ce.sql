-- Create a sample user UUID to use for demo data
DO $$
DECLARE
    sample_user_id UUID := '00000000-0000-0000-0000-000000000001';
    sample_approver_id UUID := '00000000-0000-0000-0000-000000000002';
    workflow_1_id UUID;
    workflow_2_id UUID;
    workflow_3_id UUID;
    instance_1_id UUID;
    instance_2_id UUID;
    instance_3_id UUID;
    instance_4_id UUID;
    instance_5_id UUID;
BEGIN
    -- Generate UUIDs for workflows
    workflow_1_id := gen_random_uuid();
    workflow_2_id := gen_random_uuid();
    workflow_3_id := gen_random_uuid();
    
    -- Generate UUIDs for instances
    instance_1_id := gen_random_uuid();
    instance_2_id := gen_random_uuid();
    instance_3_id := gen_random_uuid();
    instance_4_id := gen_random_uuid();
    instance_5_id := gen_random_uuid();

    -- Create sample workflows
    INSERT INTO public.workflows (id, name, description, user_id, definition, is_active, status) VALUES
    (workflow_1_id, 'Document Review Workflow', 'Standard document approval process', sample_user_id, '{"steps": ["review", "approve", "archive"]}', true, 'active'),
    (workflow_2_id, 'Budget Approval Workflow', 'Financial document approval process', sample_user_id, '{"steps": ["initial_review", "manager_approval", "final_approval"]}', true, 'active'),
    (workflow_3_id, 'Contract Review Workflow', 'Legal document review process', sample_user_id, '{"steps": ["legal_review", "compliance_check", "signature"]}', true, 'active');

    -- Create sample workflow instances
    INSERT INTO public.workflow_instances (id, workflow_id, user_id, status, context_data, current_step) VALUES
    (instance_1_id, workflow_1_id, sample_user_id, 'running', '{"document_name": "Annual Budget Report 2024", "priority": "high"}', 'approval_pending'),
    (instance_2_id, workflow_2_id, sample_user_id, 'running', '{"document_name": "Marketing Strategy Document", "priority": "medium"}', 'approval_pending'),
    (instance_3_id, workflow_3_id, sample_user_id, 'running', '{"document_name": "Service Contract - Client ABC", "priority": "high"}', 'approval_pending'),
    (instance_4_id, workflow_1_id, sample_user_id, 'running', '{"document_name": "Employee Handbook Update", "type": "policy_document"}', 'waiting_approval'),
    (instance_5_id, workflow_2_id, sample_user_id, 'completed', '{"document_name": "Quarterly Financial Report", "type": "financial_report"}', 'completed');

    -- Create pending approval requests (where user needs to approve)
    INSERT INTO public.approval_requests (
        user_id, 
        approver_id, 
        workflow_instance_id, 
        approval_level, 
        status, 
        priority, 
        due_date,
        comments
    ) VALUES
    (sample_approver_id, sample_user_id, instance_1_id, 1, 'pending', 'high', now() + interval '2 days', 'Please review this annual budget report and provide approval by end of week.'),
    (sample_approver_id, sample_user_id, instance_2_id, 1, 'pending', 'medium', now() + interval '5 days', 'Marketing strategy requires your approval before implementation.'),
    (sample_approver_id, sample_user_id, instance_3_id, 2, 'pending', 'high', now() + interval '1 day', 'Urgent: Service contract needs final approval before client meeting tomorrow.');

    -- Create "my requests" (where user created the request)
    INSERT INTO public.approval_requests (
        user_id, 
        approver_id, 
        workflow_instance_id, 
        approval_level, 
        status, 
        priority, 
        due_date,
        comments
    ) VALUES
    (sample_user_id, sample_approver_id, instance_4_id, 1, 'pending', 'medium', now() + interval '7 days', 'Submitted employee handbook updates for management review.'),
    (sample_user_id, sample_approver_id, instance_5_id, 1, 'approved', 'low', now() - interval '2 days', 'Quarterly report was approved and processed successfully.'),
    (sample_user_id, gen_random_uuid(), gen_random_uuid(), 1, 'rejected', 'medium', now() - interval '5 days', 'Previous request was rejected due to incomplete documentation.');

END $$;