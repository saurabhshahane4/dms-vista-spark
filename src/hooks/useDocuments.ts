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

interface Folder {
  id: string;
  user_id: string;
  name: string;
  parent_folder_id: string | null;
  full_path: string;
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
  id: string;
  name: string;
  documentCount: number;
  documents: Document[];
  subfolders: FolderData[];
  full_path: string;
  parent_folder_id: string | null;
  icon: string;
  iconBg: string;
  modified: string;
  tags: string[];
}

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [allFolders, setAllFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<Array<{id: string | null, name: string}>>([
    { id: null, name: 'Root' }
  ]);
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

  const buildFolderHierarchy = (allFolders: Folder[], documents: Document[], parentId: string | null = null): FolderData[] => {
    return allFolders
      .filter(folder => folder.parent_folder_id === parentId)
      .map(folder => {
        const folderDocs = documents.filter(doc => doc.folder_path === folder.full_path);
        const subfolders = buildFolderHierarchy(allFolders, documents, folder.id);
        
        // Get all unique tags from documents in this folder
        const allTags = new Set<string>();
        folderDocs.forEach(doc => {
          doc.tags?.forEach(tag => allTags.add(tag));
        });

        // Get the most recent modification date
        const mostRecentDate = folderDocs.length > 0 
          ? folderDocs.reduce((latest, doc) => {
              return new Date(doc.updated_at) > new Date(latest) ? doc.updated_at : latest;
            }, folderDocs[0].updated_at)
          : folder.updated_at;

        return {
          id: folder.id,
          name: folder.name,
          documentCount: folderDocs.length,
          documents: folderDocs,
          subfolders,
          full_path: folder.full_path,
          parent_folder_id: folder.parent_folder_id,
          icon: getFolderIcon(folder.name),
          iconBg: getFolderColor(folder.name),
          modified: new Date(mostRecentDate).toLocaleDateString(),
          tags: Array.from(allTags).slice(0, 3)
        };
      });
  };

  const fetchDocuments = async () => {
    if (!user) {
      setLoading(false);
      setDocuments([]);
      setFolders([]);
      setAllFolders([]);
      setStats({
        totalDocuments: 0,
        physicalFiles: 0,
        pendingApprovals: 0,
        activeUsers: 0,
      });
      return;
    }

    try {
      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (documentsError) throw documentsError;

      // Fetch folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (foldersError) throw foldersError;

      const docs = documentsData || [];
      const allFoldersData = foldersData || [];
      
      setDocuments(docs);
      setAllFolders(allFoldersData);

      // Build hierarchical folder structure
      const hierarchicalFolders = buildFolderHierarchy(allFoldersData, docs);
      
      // Add documents without folders to a "General" folder if not exists
      const documentsWithoutFolder = docs.filter(doc => !doc.folder_path || doc.folder_path === 'General');
      if (documentsWithoutFolder.length > 0) {
        const generalFolder: FolderData = {
          id: 'general',
          name: 'General',
          documentCount: documentsWithoutFolder.length,
          documents: documentsWithoutFolder,
          subfolders: [],
          full_path: 'General',
          parent_folder_id: null,
          icon: getFolderIcon('General'),
          iconBg: getFolderColor('General'),
          modified: new Date().toLocaleDateString(),
          tags: []
        };
        
        // Only add if not already exists
        if (!hierarchicalFolders.find(f => f.name === 'General')) {
          hierarchicalFolders.push(generalFolder);
        }
      }

      setFolders(hierarchicalFolders);

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

  const navigateToFolder = (folderId: string | null, folderName: string) => {
    setCurrentFolderId(folderId);
    
    if (folderId === null) {
      // Navigating to root
      setBreadcrumb([{ id: null, name: 'Root' }]);
    } else {
      // Find the folder and build breadcrumb
      const findFolderPath = (folders: FolderData[], targetId: string, path: Array<{id: string | null, name: string}> = []): Array<{id: string | null, name: string}> | null => {
        for (const folder of folders) {
          const currentPath = [...path, { id: folder.id, name: folder.name }];
          
          if (folder.id === targetId) {
            return currentPath;
          }
          
          const subPath = findFolderPath(folder.subfolders, targetId, currentPath);
          if (subPath) return subPath;
        }
        return null;
      };
      
      const path = findFolderPath(folders, folderId);
      if (path) {
        setBreadcrumb([{ id: null, name: 'Root' }, ...path]);
      }
    }
  };

  const getCurrentFolderContent = (): FolderData[] => {
    if (currentFolderId === null) {
      // Show root level folders
      return folders.filter(f => f.parent_folder_id === null);
    }
    
    // Find the current folder and return its subfolders
    const findFolder = (folders: FolderData[]): FolderData | null => {
      for (const folder of folders) {
        if (folder.id === currentFolderId) return folder;
        const found = findFolder(folder.subfolders);
        if (found) return found;
      }
      return null;
    };
    
    const currentFolder = findFolder(folders);
    return currentFolder ? currentFolder.subfolders : [];
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
      const documentsChannel = supabase
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

      const foldersChannel = supabase
        .channel('folders-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'folders',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchDocuments();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(documentsChannel);
        supabase.removeChannel(foldersChannel);
      };
    }
  }, [user]);

  return {
    documents,
    folders: getCurrentFolderContent(),
    allFolders: folders,
    stats,
    loading,
    currentFolderId,
    breadcrumb,
    refetch: fetchDocuments,
    navigateToFolder,
    archiveDocument,
  };
};