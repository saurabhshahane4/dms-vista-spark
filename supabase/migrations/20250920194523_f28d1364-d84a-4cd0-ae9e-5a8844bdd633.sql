-- Fix the search path security issue for the folder path function
CREATE OR REPLACE FUNCTION public.update_folder_path()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;