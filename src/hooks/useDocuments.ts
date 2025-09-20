import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Document {
  id: string;
  user_id: string;
  name: string;
  file_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  status: string | null;
  is_physical: boolean | null;
  tags: string[] | null;
  category: string | null;
  department: string | null;
  folder_path: string | null;
  created_at: string;
  updated_at: string;
}

interface DocumentStats {
  totalDocuments: number;
  physicalFiles: number;
  pendingApprovals: number;
  activeUsers: number;
}

interface FolderData {
  name: string;
  documentCount: number;
  documents: Document[];
  category: string;
  icon: string;
  iconBg: string;
  modified: string;
  tags: string[];
}

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [stats, setStats] = useState<DocumentStats>({
    totalDocuments: 0,
    physicalFiles: 0,
    pendingApprovals: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const getFolderIcon = (folderName: string): string => {
    const iconMap: { [key: string]: string } = {
      'Financial Records': 'DollarSign',
      'Legal Documents': 'Scale',
      'HR Documents': 'Users',
      'Projects': 'FolderOpen',
      'Marketing': 'Megaphone',
      'Reports': 'BarChart3',
      'Images': 'Image',
      'PDF Documents': 'FileText',
      'Spreadsheets': 'Sheet',
      'Documents': 'FileText',
      'Audio Files': 'Headphones',
      'Video Files': 'Video',
      'Archived': 'Archive',
      'General': 'Folder'
    };
    return iconMap[folderName] || 'Folder';
  };

  const getFolderColor = (folderName: string): string => {
    const colorMap: { [key: string]: string } = {
      'Financial Records': 'bg-green-500',
      'Legal Documents': 'bg-blue-500',
      'HR Documents': 'bg-purple-500',
      'Projects': 'bg-orange-500',
      'Marketing': 'bg-pink-500',
      'Reports': 'bg-indigo-500',
      'Images': 'bg-yellow-500',
      'PDF Documents': 'bg-red-500',
      'Spreadsheets': 'bg-emerald-500',
      'Documents': 'bg-gray-500',
      'Audio Files': 'bg-violet-500',
      'Video Files': 'bg-cyan-500',
      'Archived': 'bg-slate-500',
      'General': 'bg-blue-400'
    };
    return colorMap[folderName] || 'bg-gray-400';
  };

  const fetchDocuments = async () => {
    if (!user) {
      setLoading(false);
      setDocuments([]);
      setFolders([]);
      setStats({
        totalDocuments: 0,
        physicalFiles: 0,
        pendingApprovals: 0,
        activeUsers: 0,
      });
      return;
    }

    try {
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (documentsError) throw documentsError;

      const docs = documentsData || [];
      setDocuments(docs);

      // Organize documents into folders
      const folderMap = new Map<string, Document[]>();
      docs.forEach(doc => {
        const folderName = doc.folder_path || 'General';
        if (!folderMap.has(folderName)) {
          folderMap.set(folderName, []);
        }
        folderMap.get(folderName)!.push(doc);
      });

      // Convert to folder structure
      const foldersArray: FolderData[] = Array.from(folderMap.entries()).map(([folderName, folderDocs]) => {
        // Get all unique tags from documents in this folder
        const allTags = new Set<string>();
        folderDocs.forEach(doc => {
          doc.tags?.forEach(tag => allTags.add(tag));
        });

        // Get the most recent modification date
        const mostRecentDate = folderDocs.reduce((latest, doc) => {
          return new Date(doc.updated_at) > new Date(latest) ? doc.updated_at : latest;
        }, folderDocs[0]?.updated_at || new Date().toISOString());

        return {
          name: folderName,
          documentCount: folderDocs.length,
          documents: folderDocs,
          category: folderDocs[0]?.category || 'General',
          icon: getFolderIcon(folderDocs[0]?.category || folderName),
          iconBg: getFolderColor(folderDocs[0]?.category || folderName),
          modified: new Date(mostRecentDate).toLocaleDateString(),
          tags: Array.from(allTags).slice(0, 3) // Show max 3 tags
        };
      });

      setFolders(foldersArray);

      // Calculate stats
      const totalDocuments = docs.length;
      const physicalFiles = docs.filter(doc => doc.is_physical).length;
      const pendingApprovals = docs.filter(doc => doc.status === 'pending').length;

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
    // Only run if user context is available
    if (user !== undefined) {
      fetchDocuments();
    }

    // Set up real-time subscription only when user is available
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
    folders,
    stats,
    loading,
    refetch: fetchDocuments,
    archiveDocument,
  };
};