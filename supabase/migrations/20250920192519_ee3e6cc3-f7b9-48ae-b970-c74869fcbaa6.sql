-- Add folder organization columns to documents table
ALTER TABLE public.documents 
ADD COLUMN folder_path text GENERATED ALWAYS AS (
  CASE 
    WHEN status = 'active' THEN
      COALESCE(
        CASE 
          WHEN tags && ARRAY['financial', 'finance', 'budget', 'invoice', 'receipt'] THEN 'Financial Records'
          WHEN tags && ARRAY['legal', 'contract', 'agreement', 'compliance'] THEN 'Legal Documents'
          WHEN tags && ARRAY['hr', 'employee', 'hiring', 'policy'] THEN 'HR Documents'
          WHEN tags && ARRAY['project', 'development', 'planning'] THEN 'Projects'
          WHEN tags && ARRAY['marketing', 'campaign', 'promotion'] THEN 'Marketing'
          WHEN tags && ARRAY['report', 'analytics', 'analysis'] THEN 'Reports'
          ELSE 'General'
        END,
        CASE
          WHEN mime_type LIKE 'image/%' THEN 'Images'
          WHEN mime_type = 'application/pdf' THEN 'PDF Documents'
          WHEN mime_type LIKE '%sheet%' OR mime_type LIKE '%excel%' THEN 'Spreadsheets'
          WHEN mime_type LIKE '%document%' OR mime_type LIKE '%word%' THEN 'Documents'
          WHEN mime_type LIKE 'audio/%' THEN 'Audio Files'
          WHEN mime_type LIKE 'video/%' THEN 'Video Files'
          ELSE 'General'
        END
      )
    ELSE 'Archived'
  END
) STORED;

-- Add category column for better organization
ALTER TABLE public.documents 
ADD COLUMN category text;

-- Add department column for departmental organization
ALTER TABLE public.documents 
ADD COLUMN department text;

-- Update existing documents to have proper categories based on their data
UPDATE public.documents 
SET category = CASE 
  WHEN tags && ARRAY['financial', 'finance', 'budget', 'invoice', 'receipt'] THEN 'Financial Records'
  WHEN tags && ARRAY['legal', 'contract', 'agreement', 'compliance'] THEN 'Legal Documents'
  WHEN tags && ARRAY['hr', 'employee', 'hiring', 'policy'] THEN 'HR Documents'
  WHEN tags && ARRAY['project', 'development', 'planning'] THEN 'Projects'
  WHEN tags && ARRAY['marketing', 'campaign', 'promotion'] THEN 'Marketing'
  WHEN tags && ARRAY['report', 'analytics', 'analysis'] THEN 'Reports'
  ELSE 'General'
END
WHERE category IS NULL;

-- Set default department to HR if not specified
UPDATE public.documents 
SET department = 'HR'
WHERE department IS NULL;

-- Create index for better query performance on folder_path
CREATE INDEX IF NOT EXISTS idx_documents_folder_path ON public.documents(folder_path);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_department ON public.documents(department);