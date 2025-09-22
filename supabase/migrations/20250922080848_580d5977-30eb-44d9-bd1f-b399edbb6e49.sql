-- Create customers table for rack assignments
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  customer_code TEXT NOT NULL,
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('high', 'medium', 'low')),
  document_types TEXT[],
  auto_assignment_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, customer_code)
);

-- Create customer_rack_assignments table
CREATE TABLE public.customer_rack_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  rack_id UUID NOT NULL,
  assignment_type TEXT DEFAULT 'dedicated' CHECK (assignment_type IN ('dedicated', 'shared', 'overflow')),
  priority_order INTEGER DEFAULT 1,
  capacity_threshold INTEGER DEFAULT 90,
  document_types TEXT[],
  is_active BOOLEAN DEFAULT true,
  assigned_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, customer_id, rack_id)
);

-- Create assignment_rules table for automation
CREATE TABLE public.assignment_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rule_name TEXT NOT NULL,
  customer_pattern TEXT,
  document_type_conditions TEXT[],
  file_size_min INTEGER DEFAULT 0,
  file_size_max INTEGER,
  priority_level TEXT CHECK (priority_level IN ('high', 'medium', 'low')),
  preferred_rack_patterns TEXT[],
  fallback_rack_patterns TEXT[],
  capacity_threshold INTEGER DEFAULT 90,
  order_by TEXT DEFAULT 'chronological' CHECK (order_by IN ('chronological', 'capacity', 'priority')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_rack_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own customers" 
ON public.customers 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own customer rack assignments" 
ON public.customer_rack_assignments 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own assignment rules" 
ON public.assignment_rules 
FOR ALL 
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_rack_assignments_updated_at
BEFORE UPDATE ON public.customer_rack_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignment_rules_updated_at
BEFORE UPDATE ON public.assignment_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();