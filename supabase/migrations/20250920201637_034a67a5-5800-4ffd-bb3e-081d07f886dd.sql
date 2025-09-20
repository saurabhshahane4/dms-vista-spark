-- Enable the vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Add content and embedding columns to documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS content_text text,
ADD COLUMN IF NOT EXISTS embedding vector(1536),
ADD COLUMN IF NOT EXISTS content_extracted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS extraction_status text DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed'));

-- Create an index for vector similarity search
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON public.documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create a function to search documents by similarity
CREATE OR REPLACE FUNCTION public.search_documents_by_similarity(
  query_embedding vector(1536),
  user_id_param uuid,
  similarity_threshold float DEFAULT 0.7,
  max_results integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  content_text text,
  similarity float,
  file_path text,
  created_at timestamp with time zone,
  tags text[],
  status text
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
    d.content_text,
    1 - (d.embedding <=> query_embedding) as similarity,
    d.file_path,
    d.created_at,
    d.tags,
    d.status
  FROM public.documents d
  WHERE d.user_id = user_id_param 
    AND d.embedding IS NOT NULL
    AND d.content_text IS NOT NULL
    AND (1 - (d.embedding <=> query_embedding)) > similarity_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT max_results;
END;
$$;

-- Create a hybrid search function that combines keyword and semantic search
CREATE OR REPLACE FUNCTION public.hybrid_search_documents(
  search_query text,
  query_embedding vector(1536),
  user_id_param uuid,
  max_results integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  name text,
  content_text text,
  file_path text,
  created_at timestamp with time zone,
  tags text[],
  status text,
  search_rank float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH keyword_search AS (
    SELECT 
      d.id,
      d.name,
      d.content_text,
      d.file_path,
      d.created_at,
      d.tags,
      d.status,
      ts_rank_cd(
        to_tsvector('english', COALESCE(d.name, '') || ' ' || COALESCE(d.content_text, '') || ' ' || COALESCE(array_to_string(d.tags, ' '), '')),
        plainto_tsquery('english', search_query)
      ) * 0.5 as keyword_rank
    FROM public.documents d
    WHERE d.user_id = user_id_param
      AND to_tsvector('english', COALESCE(d.name, '') || ' ' || COALESCE(d.content_text, '') || ' ' || COALESCE(array_to_string(d.tags, ' '), ''))
          @@ plainto_tsquery('english', search_query)
  ),
  semantic_search AS (
    SELECT 
      d.id,
      d.name,
      d.content_text,
      d.file_path,
      d.created_at,
      d.tags,
      d.status,
      (1 - (d.embedding <=> query_embedding)) * 0.5 as semantic_rank
    FROM public.documents d
    WHERE d.user_id = user_id_param 
      AND d.embedding IS NOT NULL
      AND (1 - (d.embedding <=> query_embedding)) > 0.6
  ),
  combined_results AS (
    SELECT 
      COALESCE(k.id, s.id) as id,
      COALESCE(k.name, s.name) as name,
      COALESCE(k.content_text, s.content_text) as content_text,
      COALESCE(k.file_path, s.file_path) as file_path,
      COALESCE(k.created_at, s.created_at) as created_at,
      COALESCE(k.tags, s.tags) as tags,
      COALESCE(k.status, s.status) as status,
      COALESCE(k.keyword_rank, 0) + COALESCE(s.semantic_rank, 0) as combined_rank
    FROM keyword_search k
    FULL OUTER JOIN semantic_search s ON k.id = s.id
  )
  SELECT 
    cr.id,
    cr.name,
    cr.content_text,
    cr.file_path,
    cr.created_at,
    cr.tags,
    cr.status,
    cr.combined_rank as search_rank
  FROM combined_results cr
  WHERE cr.combined_rank > 0
  ORDER BY cr.combined_rank DESC
  LIMIT max_results;
END;
$$;