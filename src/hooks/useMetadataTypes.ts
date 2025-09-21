import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface MetadataType {
  id: string;
  name: string;
  type: 'text' | 'select' | 'multi-select' | 'date' | 'number' | 'boolean';
  required: boolean;
  description?: string;
  options?: string[];
  related_document_type?: string;
  created_at: string;
  updated_at: string;
}

export const useMetadataTypes = () => {
  const [metadataTypes, setMetadataTypes] = useState<MetadataType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMetadataTypes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('metadata_types')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type as MetadataType['type'],
        required: item.required,
        description: item.description || undefined,
        options: Array.isArray(item.options) 
          ? item.options.filter(opt => typeof opt === 'string') as string[]
          : [],
        related_document_type: item.related_document_type || undefined,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setMetadataTypes(transformedData);
    } catch (error) {
      console.error('Error fetching metadata types:', error);
      toast.error('Failed to load metadata types');
    } finally {
      setLoading(false);
    }
  };

  const createMetadataType = async (metadataType: Omit<MetadataType, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('metadata_types')
        .insert([
          {
            ...metadataType,
            user_id: user.id,
            options: metadataType.options || []
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const transformedData: MetadataType = {
        id: data.id,
        name: data.name,
        type: data.type as MetadataType['type'],
        required: data.required,
        description: data.description || undefined,
        options: Array.isArray(data.options) 
          ? data.options.filter(opt => typeof opt === 'string') as string[]
          : [],
        related_document_type: data.related_document_type || undefined,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setMetadataTypes(prev => [...prev, transformedData]);
      toast.success('Metadata type created successfully');
      return true;
    } catch (error) {
      console.error('Error creating metadata type:', error);
      toast.error('Failed to create metadata type');
      return false;
    }
  };

  const updateMetadataType = async (id: string, updates: Partial<MetadataType>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('metadata_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const transformedData: MetadataType = {
        id: data.id,
        name: data.name,
        type: data.type as MetadataType['type'],
        required: data.required,
        description: data.description || undefined,
        options: Array.isArray(data.options) 
          ? data.options.filter(opt => typeof opt === 'string') as string[]
          : [],
        related_document_type: data.related_document_type || undefined,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setMetadataTypes(prev => prev.map(item => item.id === id ? transformedData : item));
      toast.success('Metadata type updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating metadata type:', error);
      toast.error('Failed to update metadata type');
      return false;
    }
  };

  const deleteMetadataType = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('metadata_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMetadataTypes(prev => prev.filter(item => item.id !== id));
      toast.success('Metadata type deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting metadata type:', error);
      toast.error('Failed to delete metadata type');
      return false;
    }
  };

  useEffect(() => {
    fetchMetadataTypes();
  }, [user]);

  return {
    metadataTypes,
    loading,
    createMetadataType,
    updateMetadataType,
    deleteMetadataType,
    refetch: fetchMetadataTypes
  };
};