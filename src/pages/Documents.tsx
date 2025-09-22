import { useState, useEffect } from "react";
import { Search, Grid3X3, List, FolderOpen, Building2, MapPin, ArrowLeft, FileText, DollarSign, Scale, Users, Megaphone, BarChart3, Image, Headphones, Video, Archive, Folder, Sheet, Plus, MoreVertical, Edit, Trash2, Copy, FolderPlus, Eye, CheckSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useDocuments } from "@/hooks/useDocuments";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { BulkOperationsPanel } from "@/components/dms/BulkOperationsPanel";

// Map icon names to actual icon components
const iconComponents = {
  DollarSign,
  Scale,
  Users,
  FolderOpen,
  Megaphone,
  BarChart3,
  Image,
  FileText,
  Sheet,
  Headphones,
  Video,
  Archive,
  Folder,
  Building2,
  MapPin,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  FolderPlus
};

interface DocumentData {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
}

const folderCategories = [
  'Financial Records',
  'Legal Documents', 
  'HR Documents',
  'Projects',
  'Marketing',
  'Reports',
  'Images',
  'PDF Documents',
  'Spreadsheets',
  'Documents',
  'Audio Files',
  'Video Files',
  'General'
];

const departments = [
  'Human Resources',
  'Finance',
  'Legal',
  'Marketing', 
  'Operations',
  'IT',
  'Sales',
  'Administration'
];

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState("all");
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  
  // Advanced document operations states
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  // Removed preview state - now using navigation
  const [selectionMode, setSelectionMode] = useState(false);
  
  // Folder management states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFolderIndex, setSelectedFolderIndex] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderCategory, setNewFolderCategory] = useState("");
  const [newFolderDepartment, setNewFolderDepartment] = useState("");
  const [copyTargetName, setCopyTargetName] = useState("");
  const [operationLoading, setOperationLoading] = useState(false);
  
  const { folders, allFolders, loading, refetch, currentFolderId, breadcrumb, navigateToFolder } = useDocuments();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load view preference from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('documents-view-mode') as "grid" | "list" | null;
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Save view preference to localStorage
  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem('documents-view-mode', mode);
  };

  // Folder Management Functions
  const handleAddFolder = async () => {
    if (!newFolderName.trim() || !user) {
      toast({
        title: 'Error',
        description: 'Please enter a valid folder name',
        variant: 'destructive'
      });
      return;
    }

    setOperationLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('folder-operations', {
        body: { 
          operation: 'create',
          folderName: newFolderName,
          parentFolderId: currentFolderId
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: data.message || `Folder "${newFolderName}" created successfully`,
      });

      // Reset form and close dialog
      setNewFolderName("");
      setNewFolderCategory("");
      setNewFolderDepartment("");
      setShowAddDialog(false);
      refetch();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: 'Error',
        description: 'Failed to create folder',
        variant: 'destructive'
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleRenameFolder = async () => {
    if (!newFolderName.trim() || selectedFolderIndex === null || !user) {
      toast({
        title: 'Error',
        description: 'Please enter a valid folder name',
        variant: 'destructive'
      });
      return;
    }

    setOperationLoading(true);
    try {
      const folderToRename = folders[selectedFolderIndex];
      
      const { data, error } = await supabase.functions.invoke('folder-operations', {
        body: { 
          operation: 'rename',
          folderName: folderToRename.name,
          newFolderName: newFolderName
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: data.message || `Folder renamed to "${newFolderName}"`,
      });

      // Reset form and close dialog
      setNewFolderName("");
      setShowRenameDialog(false);
      setSelectedFolderIndex(null);
      refetch();
    } catch (error) {
      console.error('Error renaming folder:', error);
      toast({
        title: 'Error',
        description: 'Failed to rename folder',
        variant: 'destructive'
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCopyFolder = async () => {
    if (!copyTargetName.trim() || selectedFolderIndex === null || !user) {
      toast({
        title: 'Error',
        description: 'Please enter a valid folder name',
        variant: 'destructive'
      });
      return;
    }

    setOperationLoading(true);
    try {
      const folderToCopy = folders[selectedFolderIndex];
      
      const { data, error } = await supabase.functions.invoke('folder-operations', {
        body: { 
          operation: 'copy',
          folderName: folderToCopy.name,
          newFolderName: copyTargetName
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: data.message || `Folder copied as "${copyTargetName}"`,
      });

      // Reset form and close dialog
      setCopyTargetName("");
      setShowCopyDialog(false);
      setSelectedFolderIndex(null);
      refetch();
    } catch (error) {
      console.error('Error copying folder:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy folder',
        variant: 'destructive'
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (selectedFolderIndex === null || !user) return;

    setOperationLoading(true);
    try {
      const folderToDelete = folders[selectedFolderIndex];
      
      const { data, error } = await supabase.functions.invoke('folder-operations', {
        body: { 
          operation: 'delete',
          folderName: folderToDelete.name
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: data.message || `Folder "${folderToDelete.name}" deleted`,
      });

      // Close dialog and refresh
      setShowDeleteDialog(false);
      setSelectedFolderIndex(null);
      refetch();
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete folder',
        variant: 'destructive'
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const openFolderMenu = (folderIndex: number, action: 'rename' | 'copy' | 'delete') => {
    setSelectedFolderIndex(folderIndex);
    const folder = folders[folderIndex];
    
    switch (action) {
      case 'rename':
        setNewFolderName(folder.name);
        setShowRenameDialog(true);
        break;
      case 'copy':
        setCopyTargetName(`Copy of ${folder.name}`);
        setShowCopyDialog(true);
        break;
      case 'delete':
        setShowDeleteDialog(true);
        break;
    }
  };

  const handleFolderClick = (folderIndex: number) => {
    const folder = folders[folderIndex];
    navigateToFolder(folder.id, folder.name);
  };

  const getIconComponent = (iconName: string) => {
    return iconComponents[iconName as keyof typeof iconComponents] || Folder;
  };

  // Advanced document operations handlers
  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const selectAllDocuments = () => {
    const allDocumentIds = documents.map(doc => doc.id);
    setSelectedDocuments(allDocumentIds);
  };

  const clearSelection = () => {
    setSelectedDocuments([]);
    setSelectionMode(false);
  };

  const handleDocumentClick = (documentId: string, event: React.MouseEvent) => {
    if (selectionMode) {
      event.preventDefault();
      toggleDocumentSelection(documentId);
    } else {
      navigate(`/document/${documentId}`);
    }
  };

  const handleOperationComplete = () => {
    clearSelection();
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAtRoot = currentFolderId === null;
  const displayFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get documents for current folder
  const getCurrentDocuments = () => {
    const currentFolder = allFolders.find(f => f.id === currentFolderId);
    if (!currentFolder) return [];
    
    return currentFolder.documents
      .filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || 
          (filterType === "pdf" && doc.mime_type === "application/pdf") ||
          (filterType === "images" && doc.mime_type?.startsWith("image/")) ||
          (filterType === "office" && (
            doc.mime_type?.includes("document") || 
            doc.mime_type?.includes("sheet") || 
            doc.mime_type?.includes("presentation") ||
            doc.mime_type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            doc.mime_type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            doc.mime_type === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
          ));
        
        return matchesSearch && matchesType;
      })
      .map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
          ? 'DOCX' 
          : doc.mime_type?.split('/').pop() || 'unknown',
        date: new Date(doc.created_at).toLocaleDateString(),
        size: doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'
      }));
  };

  const documents = getCurrentDocuments();

  return (
    <div className="space-y-6">
      {/* Document Cabinet Header */}
      <div className="bg-card rounded-lg p-6 border border-border/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-dms-purple/10 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-dms-purple" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {!isAtRoot ? breadcrumb[breadcrumb.length - 1]?.name : 'Document Cabinet'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {!isAtRoot 
                ? `Browse documents in ${breadcrumb[breadcrumb.length - 1]?.name}` 
                : 'Browse and manage your digital document archive with hierarchical organization'
              }
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          {breadcrumb.map((crumb, index) => (
            <div key={crumb.id || 'root'} className="flex items-center gap-2">
              {index > 0 && <span className="text-muted-foreground">/</span>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateToFolder(crumb.id, crumb.name)}
                className={`text-dms-blue hover:text-dms-blue/80 ${
                  index === breadcrumb.length - 1 ? 'font-medium' : ''
                }`}
              >
                {index === 0 ? (
                  <>
                    <FolderOpen className="w-4 h-4 mr-2" />
                    {crumb.name}
                  </>
                ) : (
                  crumb.name
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={!isAtRoot ? "Search documents..." : "Search documents and folders..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {!isAtRoot && (
            <div className="flex items-center gap-2">
              <Button
                variant={selectionMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectionMode(!selectionMode);
                  if (!selectionMode) clearSelection();
                }}
                className="gap-2"
              >
                <CheckSquare className="w-4 h-4" />
                {selectionMode ? 'Done' : 'Select'}
              </Button>
              
              {selectionMode && documents.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllDocuments}
                  className="gap-2"
                >
                  Select All
                </Button>
              )}
            </div>
          )}
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pdf">PDF Documents</SelectItem>
              <SelectItem value="images">Images</SelectItem>
              <SelectItem value="office">Office Files</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border border-border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewModeChange("grid")}
              className="px-3"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewModeChange("list")}
              className="px-3"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          {!isAtRoot ? (
            <>
              <FileText className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground">Documents ({documents.length})</h3>
            </>
          ) : (
            <>
              <FolderOpen className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground">Folders ({displayFolders.length})</h3>
              <div className="ml-auto">
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <FolderPlus className="w-4 h-4" />
                      Add Folder
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Folder</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="folderName">Folder Name</Label>
                        <Input
                          id="folderName"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          placeholder="Enter folder name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={newFolderCategory} onValueChange={setNewFolderCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {folderCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Select value={newFolderDepartment} onValueChange={setNewFolderDepartment}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowAddDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddFolder}
                          disabled={operationLoading}
                        >
                          {operationLoading ? 'Creating...' : 'Create Folder'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </>
          )}
        </div>

        {!isAtRoot ? (
          // Document view
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
            {documents.map((doc) => (
              <Card 
                key={doc.id} 
                className={`p-4 hover:shadow-md transition-all cursor-pointer border border-border/50 ${
                  selectedDocuments.includes(doc.id) ? 'bg-primary/5 border-primary' : ''
                } ${selectionMode ? 'hover:bg-primary/10' : ''}`}
                onClick={(e) => handleDocumentClick(doc.id, e)}
              >
                <div className={viewMode === "grid" ? "space-y-3" : "flex items-center gap-4"}>
                  <div className="w-12 h-12 bg-dms-blue/10 rounded-lg flex items-center justify-center flex-shrink-0 relative">
                    <FileText className="w-6 h-6 text-dms-blue" />
                    {selectionMode && (
                      <div className="absolute -top-2 -right-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedDocuments.includes(doc.id) 
                            ? 'bg-primary border-primary' 
                            : 'bg-background border-border'
                        }`}>
                          {selectedDocuments.includes(doc.id) && (
                            <CheckSquare className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                    )}
                    {!selectionMode && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className={viewMode === "list" ? "flex-1" : ""}>
                    <h4 className="font-medium text-foreground mb-1">{doc.name}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {doc.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{doc.size}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Modified: {doc.date}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          // Folder view
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
            {displayFolders.map((folder, index) => {
              const IconComponent = getIconComponent(folder.icon);
              
              return (
                <Card 
                  key={folder.name} 
                  className="p-4 hover:shadow-md transition-shadow border border-border/50 group"
                >
                  <div className={viewMode === "grid" ? "space-y-3" : "flex items-center gap-4"}>
                    <div 
                      className={`w-12 h-12 ${folder.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer`}
                      onClick={() => handleFolderClick(index)}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className={`${viewMode === "list" ? "flex-1" : ""} cursor-pointer`} onClick={() => handleFolderClick(index)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-1">{folder.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {folder.documentCount.toLocaleString()} document{folder.documentCount !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-muted-foreground mb-3">
                            Modified: {folder.modified}
                          </p>
                          
                          {folder.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {folder.tags.map((tag, tagIndex) => (
                                <Badge 
                                  key={tagIndex} 
                                  variant="secondary" 
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Folder Actions Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              openFolderMenu(index, 'rename');
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              openFolderMenu(index, 'copy');
                            }}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                openFolderMenu(index, 'delete');
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {(!isAtRoot ? documents.length === 0 : displayFolders.length === 0) && (
          <div className="text-center py-8">
            {!isAtRoot ? (
              <>
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No documents found matching your search.</p>
              </>
            ) : (
              <>
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {folders.length === 0 
                    ? "No documents uploaded yet. Upload some documents to see them organized in folders."
                    : "No folders found matching your search."
                  }
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Document Preview removed - now using dedicated page */}

      {/* Bulk Operations Panel */}
      <BulkOperationsPanel
        selectedDocuments={selectedDocuments}
        onSelectionClear={clearSelection}
        onOperationComplete={handleOperationComplete}
      />

      {/* Rename Folder Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="renameFolderName">New Folder Name</Label>
              <Input
                id="renameFolderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter new folder name"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRenameDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRenameFolder}
                disabled={operationLoading}
              >
                {operationLoading ? 'Renaming...' : 'Rename'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Copy Folder Dialog */}
      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="copyFolderName">New Folder Name</Label>
              <Input
                id="copyFolderName"
                value={copyTargetName}
                onChange={(e) => setCopyTargetName(e.target.value)}
                placeholder="Enter name for copied folder"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCopyDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCopyFolder}
                disabled={operationLoading}
              >
                {operationLoading ? 'Copying...' : 'Copy Folder'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this folder? All documents will be moved to the General folder. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFolder}
              disabled={operationLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {operationLoading ? 'Deleting...' : 'Delete Folder'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Documents;