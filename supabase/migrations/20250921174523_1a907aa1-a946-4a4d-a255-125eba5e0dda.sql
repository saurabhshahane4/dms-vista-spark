-- Create metadata_types table
CREATE TABLE public.metadata_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'select', 'multi-select', 'date', 'number', 'boolean')),
  required BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  options JSONB DEFAULT '[]'::jsonb, -- For select/multi-select options
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name) -- Prevent duplicate metadata type names per user
);

-- Enable RLS
ALTER TABLE public.metadata_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own metadata types" 
ON public.metadata_types 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own metadata types" 
ON public.metadata_types 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metadata types" 
ON public.metadata_types 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own metadata types" 
ON public.metadata_types 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_metadata_types_updated_at
BEFORE UPDATE ON public.metadata_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default metadata types for new users
INSERT INTO public.metadata_types (user_id, name, type, required, description) VALUES
((SELECT id FROM auth.users LIMIT 1), 'Document Category', 'select', true, 'Main category classification'),
((SELECT id FROM auth.users LIMIT 1), 'Priority Level', 'select', false, 'Document priority rating'),
((SELECT id FROM auth.users LIMIT 1), 'Department', 'text', true, 'Originating department'),
((SELECT id FROM auth.users LIMIT 1), 'Review Date', 'date', false, 'Scheduled review date'),
((SELECT id FROM auth.users LIMIT 1), 'Tags', 'multi-select', false, 'Document tags for filtering');