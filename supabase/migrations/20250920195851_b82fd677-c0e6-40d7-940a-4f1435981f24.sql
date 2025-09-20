-- Create document versions table for version control
CREATE TABLE public.document_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  file_path text NOT NULL,
  file_size bigint,
  mime_type text,
  comment text,
  is_current boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(document_id, version_number)
);

-- Enable RLS on document versions
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- Create policies for document versions
CREATE POLICY "Users can view their own document versions"
ON public.document_versions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own document versions"
ON public.document_versions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own document versions"
ON public.document_versions
FOR UPDATE
USING (auth.uid() = user_id);

-- Create document shares table for sharing functionality
CREATE TABLE public.document_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  shared_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email text NOT NULL,
  permission_level text NOT NULL CHECK (permission_level IN ('view', 'edit')),
  share_token text NOT NULL UNIQUE,
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on document shares
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;

-- Create policies for document shares
CREATE POLICY "Users can view shares they created"
ON public.document_shares
FOR SELECT
USING (auth.uid() = shared_by);

CREATE POLICY "Users can create document shares"
ON public.document_shares
FOR INSERT
WITH CHECK (auth.uid() = shared_by);

CREATE POLICY "Users can update their own shares"
ON public.document_shares
FOR UPDATE
USING (auth.uid() = shared_by);

CREATE POLICY "Users can delete their own shares"
ON public.document_shares
FOR DELETE
USING (auth.uid() = shared_by);

-- Add trigger for automatic timestamp updates on document_shares
CREATE TRIGGER update_document_shares_updated_at
BEFORE UPDATE ON public.document_shares
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get document with current version
CREATE OR REPLACE FUNCTION public.get_document_with_version(doc_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  file_path text,
  current_version integer,
  total_versions bigint,
  version_comment text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    COALESCE(dv.file_path, d.file_path) as file_path,
    COALESCE(dv.version_number, 1) as current_version,
    COALESCE(version_count.total, 0) as total_versions,
    dv.comment as version_comment
  FROM public.documents d
  LEFT JOIN public.document_versions dv ON d.id = dv.document_id AND dv.is_current = true
  LEFT JOIN (
    SELECT document_id, COUNT(*) as total
    FROM public.document_versions
    GROUP BY document_id
  ) version_count ON d.id = version_count.document_id
  WHERE d.id = doc_id AND d.user_id = auth.uid();
END;
$$;

-- Create function to generate share token
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$;