import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Document {
  id: string;
  name: string;
  status: string;
  is_physical: boolean;
  created_at: string;
  file_size?: number;
  tags?: string[];
}

interface DocumentStats {
  totalDocuments: number;
  physicalFiles: number;
  pendingApprovals: number;
  activeUsers: number;
}

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats>({
    totalDocuments: 0,
    physicalFiles: 0,
    pendingApprovals: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDocuments = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (documentsError) throw documentsError;

      setDocuments(documentsData || []);

      // Calculate stats
      const totalDocuments = documentsData?.length || 0;
      const physicalFiles = documentsData?.filter(doc => doc.is_physical).length || 0;
      const pendingApprovals = documentsData?.filter(doc => doc.status === 'pending').length || 0;

      // Get active users count (simplified - just count profiles)
      const { count: activeUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalDocuments,
        physicalFiles,
        pendingApprovals,
        activeUsers: activeUsersCount || 1,
      });

    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const archiveDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ status: 'archived' })
        .eq('id', documentId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Refresh documents
      fetchDocuments();
      return { success: true };
    } catch (error) {
      console.error('Error archiving document:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchDocuments();

    // Set up real-time subscription
    if (user) {
      const channel = supabase
        .channel('documents-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'documents',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchDocuments();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    documents,
    stats,
    loading,
    refetch: fetchDocuments,
    archiveDocument,
  };
};