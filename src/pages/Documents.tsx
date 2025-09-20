import { useState, useEffect } from "react";
import { Search, Grid3X3, List, FolderOpen, Building2, MapPin, ArrowLeft, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDocuments } from "@/hooks/useDocuments";

interface FolderData {
  id: number;
  name: string;
  icon: React.ComponentType<any>;
  iconBg: string;
  documentCount: number;
  modified: string;
  tags: string[];
  tagColors: string[];
  documents: DocumentData[];
}

interface DocumentData {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
}

const folderData: FolderData[] = [
  {
    id: 1,
    name: "Projects",
    icon: FolderOpen,
    iconBg: "bg-blue-500",
    documentCount: 1247,
    modified: "2024-01-15",
    tags: ["restricted", "projects"],
    tagColors: ["bg-red-100 text-red-800", "bg-blue-100 text-blue-800"],
    documents: [
      { id: "proj-1", name: "Project Alpha Contract", type: "pdf", date: "2024-01-10", size: "2.4 MB" },
      { id: "proj-2", name: "Budget Planning Q1", type: "xlsx", date: "2024-01-08", size: "1.2 MB" },
      { id: "proj-3", name: "Technical Specifications", type: "docx", date: "2024-01-05", size: "845 KB" }
    ]
  },
  {
    id: 2,
    name: "Departments",
    icon: Building2,
    iconBg: "bg-orange-500",
    documentCount: 2156,
    modified: "2024-01-16",
    tags: ["deliverables"],
    tagColors: ["bg-pink-100 text-pink-800"],
    documents: [
      { id: "dept-1", name: "HR Policy Update", type: "pdf", date: "2024-01-14", size: "3.1 MB" },
      { id: "dept-2", name: "Marketing Campaign Brief", type: "pptx", date: "2024-01-12", size: "5.2 MB" },
      { id: "dept-3", name: "Finance Report Q4", type: "xlsx", date: "2024-01-11", size: "2.8 MB" }
    ]
  },
  {
    id: 3,
    name: "Locations",
    icon: MapPin,
    iconBg: "bg-pink-500",
    documentCount: 892,
    modified: "2024-01-12",
    tags: [],
    tagColors: [],
    documents: [
      { id: "loc-1", name: "Office Lease Agreement", type: "pdf", date: "2024-01-09", size: "1.8 MB" },
      { id: "loc-2", name: "Site Survey Report", type: "docx", date: "2024-01-07", size: "4.3 MB" }
    ]
  }
];

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState("all");
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const { documents: userDocuments } = useDocuments();

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

  const getCurrentFolders = (): FolderData[] => {
    return folderData.filter(folder =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getCurrentDocuments = (): DocumentData[] => {
    if (currentFolder !== null) {
      const folder = folderData.find(f => f.id === currentFolder);
      if (!folder) return [];
      
      return folder.documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || 
          (filterType === "pdf" && doc.type === "pdf") ||
          (filterType === "images" && ["jpg", "jpeg", "png"].includes(doc.type)) ||
          (filterType === "office" && ["docx", "xlsx", "pptx"].includes(doc.type));
        
        return matchesSearch && matchesType;
      });
    }
    return [];
  };

  const handleFolderClick = (folderId: number) => {
    setCurrentFolder(folderId);
  };

  const handleBackClick = () => {
    setCurrentFolder(null);
  };

  const isInFolder = currentFolder !== null;
  const currentFolderData = isInFolder ? folderData.find(f => f.id === currentFolder) : null;
  const folders = getCurrentFolders();
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
              <h3 className="text-lg font-medium text-foreground">Documents</h3>
            </>
          ) : (
            <>
              <FolderOpen className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground">Folders</h3>
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
            {folders.map((folder) => (
              <Card 
                key={folder.id} 
                className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-border/50"
                onClick={() => handleFolderClick(folder.id)}
              >
                <div className={viewMode === "grid" ? "space-y-3" : "flex items-center gap-4"}>
                  <div className={`w-12 h-12 ${folder.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <folder.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className={viewMode === "list" ? "flex-1" : ""}>
                    <h4 className="font-medium text-foreground mb-1">{folder.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {folder.documentCount.toLocaleString()} documents
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Modified: {folder.modified}
                    </p>
                    
                    {folder.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {folder.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className={`text-xs ${folder.tagColors[index] || 'bg-gray-100 text-gray-800'}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {(isInFolder ? documents.length === 0 : folders.length === 0) && (
          <div className="text-center py-8">
            {isInFolder ? (
              <>
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No documents found matching your search.</p>
              </>
            ) : (
              <>
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No folders found matching your search.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;