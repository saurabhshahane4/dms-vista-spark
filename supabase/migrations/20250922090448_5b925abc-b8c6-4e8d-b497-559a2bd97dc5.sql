-- Add foreign key constraints to customer_rack_assignments table
ALTER TABLE public.customer_rack_assignments
ADD CONSTRAINT fk_customer_rack_assignments_customer
FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;

ALTER TABLE public.customer_rack_assignments
ADD CONSTRAINT fk_customer_rack_assignments_rack
FOREIGN KEY (rack_id) REFERENCES public.racks(id) ON DELETE CASCADE;

-- Add foreign key constraint to customers table for user_id
ALTER TABLE public.customers
ADD CONSTRAINT fk_customers_user
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraint to assignment_rules table for user_id  
ALTER TABLE public.assignment_rules
ADD CONSTRAINT fk_assignment_rules_user
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;