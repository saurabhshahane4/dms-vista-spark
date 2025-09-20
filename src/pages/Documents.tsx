import { useState } from "react";
import { Search, Grid3X3, List, FolderOpen, Building2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const folderData = [
  {
    id: 1,
    name: "Projects",
    icon: FolderOpen,
    iconBg: "bg-blue-500",
    documentCount: 1247,
    modified: "2024-01-15",
    tags: ["restricted", "projects"],
    tagColors: ["bg-red-100 text-red-800", "bg-blue-100 text-blue-800"]
  },
  {
    id: 2,
    name: "Departments",
    icon: Building2,
    iconBg: "bg-orange-500",
    documentCount: 2156,
    modified: "2024-01-16",
    tags: ["deliverables"],
    tagColors: ["bg-pink-100 text-pink-800"]
  },
  {
    id: 3,
    name: "Locations",
    icon: MapPin,
    iconBg: "bg-pink-500",
    documentCount: 892,
    modified: "2024-01-12",
    tags: [],
    tagColors: []
  }
];

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState("all");

  const filteredFolders = folderData.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Document Cabinet Header */}
      <div className="bg-card rounded-lg p-6 border border-border/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-dms-purple/10 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-dms-purple" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Document Cabinet</h2>
            <p className="text-sm text-muted-foreground">Browse and manage your digital document archive with hierarchical organization</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search documents and folders..."
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
              onClick={() => setViewMode("grid")}
              className="px-3"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="px-3"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Folders Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground">Folders</h3>
        </div>

        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
          {filteredFolders.map((folder) => (
            <Card key={folder.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-border/50">
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

        {filteredFolders.length === 0 && (
          <div className="text-center py-8">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No folders found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;