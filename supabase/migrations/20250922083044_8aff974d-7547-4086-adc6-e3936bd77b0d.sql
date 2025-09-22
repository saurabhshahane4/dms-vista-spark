-- Fix function search path issues by updating existing functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_folder_path() SET search_path = public;
ALTER FUNCTION public.update_storage_analytics() SET search_path = public;
ALTER FUNCTION public.get_document_with_version(uuid) SET search_path = public;
ALTER FUNCTION public.generate_share_token() SET search_path = public;
ALTER FUNCTION public.search_documents_by_similarity(vector, uuid, double precision, integer) SET search_path = public;
ALTER FUNCTION public.hybrid_search_documents(text, vector, uuid, integer) SET search_path = public;