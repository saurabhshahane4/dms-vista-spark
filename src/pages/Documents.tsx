import { useState, useEffect } from "react";
import { Search, Grid3X3, List, FolderOpen, Building2, MapPin, ArrowLeft, FileText, DollarSign, Scale, Users, Megaphone, BarChart3, Image, Headphones, Video, Archive, Folder, Sheet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDocuments } from "@/hooks/useDocuments";

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
  MapPin
};

interface DocumentData {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
}

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState("all");
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const { folders, loading } = useDocuments();

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

  const getCurrentFolders = () => {
    return folders.filter(folder =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getCurrentDocuments = (): DocumentData[] => {
    if (currentFolder !== null && folders[currentFolder]) {
      const folder = folders[currentFolder];
      
      return folder.documents
        .filter(doc => {
          const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesType = filterType === "all" || 
            (filterType === "pdf" && doc.mime_type === "application/pdf") ||
            (filterType === "images" && doc.mime_type?.startsWith("image/")) ||
            (filterType === "office" && (
              doc.mime_type?.includes("document") || 
              doc.mime_type?.includes("sheet") || 
              doc.mime_type?.includes("presentation")
            ));
          
          return matchesSearch && matchesType;
        })
        .map(doc => ({
          id: doc.id,
          name: doc.name,
          type: doc.mime_type?.split('/').pop() || 'unknown',
          date: new Date(doc.created_at).toLocaleDateString(),
          size: doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'
        }));
    }
    return [];
  };

  const handleFolderClick = (folderIndex: number) => {
    setCurrentFolder(folderIndex);
  };

  const handleBackClick = () => {
    setCurrentFolder(null);
  };

  const getIconComponent = (iconName: string) => {
    return iconComponents[iconName as keyof typeof iconComponents] || Folder;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isInFolder = currentFolder !== null;
  const currentFolderData = isInFolder ? folders[currentFolder] : null;
  const displayFolders = getCurrentFolders();
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
              {isInFolder ? currentFolderData?.name : 'Document Cabinet'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isInFolder 
                ? `Browse documents in ${currentFolderData?.name}` 
                : 'Browse and manage your digital document archive with hierarchical organization'
              }
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        {isInFolder && (
          <div className="flex items-center gap-2 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackClick}
              className="text-dms-blue hover:text-dms-blue/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Folders
            </Button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={isInFolder ? "Search documents..." : "Search documents and folders..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
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
          {isInFolder ? (
            <>
              <FileText className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground">Documents ({documents.length})</h3>
            </>
          ) : (
            <>
              <FolderOpen className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground">Folders ({displayFolders.length})</h3>
            </>
          )}
        </div>

        {isInFolder ? (
          // Document view
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
            {documents.map((doc) => (
              <Card 
                key={doc.id} 
                className="p-4 hover:shadow-md transition-shadow border border-border/50"
              >
                <div className={viewMode === "grid" ? "space-y-3" : "flex items-center gap-4"}>
                  <div className="w-12 h-12 bg-dms-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-dms-blue" />
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
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-border/50"
                  onClick={() => handleFolderClick(index)}
                >
                  <div className={viewMode === "grid" ? "space-y-3" : "flex items-center gap-4"}>
                    <div className={`w-12 h-12 ${folder.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className={viewMode === "list" ? "flex-1" : ""}>
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
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {(isInFolder ? documents.length === 0 : displayFolders.length === 0) && (
          <div className="text-center py-8">
            {isInFolder ? (
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
    </div>
  );
};

export default Documents;