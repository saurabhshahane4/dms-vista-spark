-- Add related_document_type column to metadata_types table
ALTER TABLE public.metadata_types 
ADD COLUMN related_document_type TEXT;