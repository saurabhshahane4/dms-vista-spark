-- Remove the auto-generated folder_path constraint and make it manually settable
ALTER TABLE public.documents 
DROP COLUMN IF EXISTS folder_path;

-- Add a new folder_path column that can be manually set
ALTER TABLE public.documents 
ADD COLUMN folder_path text DEFAULT 'General';

-- Create a folders table to manage the folder hierarchy
CREATE TABLE public.folders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  parent_folder_id uuid REFERENCES public.folders(id) ON DELETE CASCADE,
  full_path text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, parent_folder_id, name)
);

-- Enable RLS on folders table
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Create policies for folders table
CREATE POLICY "Users can view their own folders" 
ON public.folders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders" 
ON public.folders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders" 
ON public.folders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders" 
ON public.folders 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on folders
CREATE TRIGGER update_folders_updated_at
BEFORE UPDATE ON public.folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update full_path when folder hierarchy changes
CREATE OR REPLACE FUNCTION public.update_folder_path()
RETURNS TRIGGER AS $$
DECLARE
  parent_path TEXT := '';
BEGIN
  -- Get parent folder path if it exists
  IF NEW.parent_folder_id IS NOT NULL THEN
    SELECT full_path INTO parent_path 
    FROM public.folders 
    WHERE id = NEW.parent_folder_id AND user_id = NEW.user_id;
    
    IF parent_path IS NULL THEN
      RAISE EXCEPTION 'Parent folder not found or access denied';
    END IF;
    
    NEW.full_path := parent_path || '/' || NEW.name;
  ELSE
    NEW.full_path := NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update full_path
CREATE TRIGGER update_folder_full_path
BEFORE INSERT OR UPDATE ON public.folders
FOR EACH ROW
EXECUTE FUNCTION public.update_folder_path();

-- Insert default folders for existing users
INSERT INTO public.folders (user_id, name, full_path)
SELECT DISTINCT user_id, 'General', 'General'
FROM public.documents
ON CONFLICT (user_id, parent_folder_id, name) DO NOTHING;