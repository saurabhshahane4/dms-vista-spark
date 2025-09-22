import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Search, MapPin, Building2, Box, Archive } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useWarehouse, type WarehouseHierarchy } from '@/hooks/useWarehouse';

interface TreeNode {
  id: string;
  name: string;
  type: 'warehouse' | 'zone' | 'shelf' | 'rack';
  code: string;
  status?: 'empty' | 'partial' | 'full' | 'over-capacity';
  capacity?: number;
  current_count?: number;
  children?: TreeNode[];
  parent_id?: string;
}

const LocationTreeView = () => {
  const { warehouses, getWarehouseHierarchy, loading } = useWarehouse();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [filteredTreeData, setFilteredTreeData] = useState<TreeNode[]>([]);

  // Build tree structure from warehouse hierarchy
  useEffect(() => {
    const buildTree = async () => {
      const tree: TreeNode[] = [];
      
      for (const warehouse of warehouses) {
        const hierarchy = await getWarehouseHierarchy(warehouse.id);
        if (!hierarchy) continue;

        const warehouseNode: TreeNode = {
          id: warehouse.id,
          name: warehouse.name,
          type: 'warehouse',
          code: warehouse.code,
          children: [],
        };

        for (const zone of hierarchy.zones || []) {
          const zoneNode: TreeNode = {
            id: zone.id,
            name: zone.name,
            type: 'zone',
            code: zone.code,
            parent_id: warehouse.id,
            children: [],
          };

          for (const shelf of zone.shelves || []) {
            const shelfNode: TreeNode = {
              id: shelf.id,
              name: shelf.name,
              type: 'shelf',
              code: shelf.code,
              parent_id: zone.id,
              children: [],
            };

            for (const rack of shelf.racks || []) {
              const rackNode: TreeNode = {
                id: rack.id,
                name: rack.name,
                type: 'rack',
                code: rack.code,
                status: rack.status,
                capacity: rack.capacity,
                current_count: rack.current_count,
                parent_id: shelf.id,
              };

              shelfNode.children!.push(rackNode);
            }

            zoneNode.children!.push(shelfNode);
          }

          warehouseNode.children!.push(zoneNode);
        }

        tree.push(warehouseNode);
      }

      setTreeData(tree);
    };

    if (warehouses.length > 0) {
      buildTree();
    }
  }, [warehouses, getWarehouseHierarchy]);

  // Filter tree based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTreeData(treeData);
      return;
    }

    const filterTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.reduce((filtered: TreeNode[], node) => {
        const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             node.code.toLowerCase().includes(searchTerm.toLowerCase());
        
        const filteredChildren = node.children ? filterTree(node.children) : [];
        
        if (matchesSearch || filteredChildren.length > 0) {
          filtered.push({
            ...node,
            children: filteredChildren,
          });
          
          // Auto-expand matching nodes
          if (matchesSearch) {
            setExpandedNodes(prev => new Set([...prev, node.id]));
          }
        }
        
        return filtered;
      }, []);
    };

    setFilteredTreeData(filterTree(treeData));
  }, [searchTerm, treeData]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const selectNode = (node: TreeNode) => {
    // Build breadcrumb path
    const buildPath = (nodeId: string, currentPath: string[] = []): string[] => {
      const findNodeAndPath = (nodes: TreeNode[], targetId: string, path: string[]): string[] | null => {
        for (const n of nodes) {
          const newPath = [...path, n.name];
          if (n.id === targetId) {
            return newPath;
          }
          if (n.children) {
            const result = findNodeAndPath(n.children, targetId, newPath);
            if (result) return result;
          }
        }
        return null;
      };

      return findNodeAndPath(treeData, nodeId, []) || [];
    };

    setSelectedPath(buildPath(node.id));
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'empty': return 'bg-muted text-muted-foreground';
      case 'partial': return 'bg-status-pending text-white';
      case 'full': return 'bg-status-approved text-white';
      case 'over-capacity': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warehouse': return <Building2 className="w-4 h-4" />;
      case 'zone': return <MapPin className="w-4 h-4" />;
      case 'shelf': return <Box className="w-4 h-4" />;
      case 'rack': return <Archive className="w-4 h-4" />;
      default: return <Box className="w-4 h-4" />;
    }
  };

  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="select-none">
        <div
          className="flex items-center gap-2 p-2 hover:bg-accent rounded-md cursor-pointer group"
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => selectNode(node)}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          ) : (
            <div className="w-6" />
          )}
          
          <div className="flex items-center gap-2 flex-1">
            {getIcon(node.type)}
            <span className="font-medium">{node.name}</span>
            <span className="text-sm text-muted-foreground">({node.code})</span>
            
            {node.status && (
              <Badge variant="secondary" className={getStatusColor(node.status)}>
                {node.status}
              </Badge>
            )}
            
            {node.capacity !== undefined && (
              <span className="text-sm text-muted-foreground">
                {node.current_count}/{node.capacity}
              </span>
            )}
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {node.children!.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Location Tree View</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {selectedPath.length > 0 && (
        <Card className="p-4">
          <Breadcrumb>
            <BreadcrumbList>
              {selectedPath.map((path, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  {index === selectedPath.length - 1 ? (
                    <BreadcrumbPage>{path}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">{path}</BreadcrumbLink>
                    </BreadcrumbItem>
                  )}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </Card>
      )}

      <Card className="p-4">
        {filteredTreeData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'No locations found matching your search.' : 'No warehouses found. Create your first warehouse to get started.'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredTreeData.map(node => renderTreeNode(node))}
          </div>
        )}
      </Card>

      {/* Status Legend */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Status Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-muted text-muted-foreground">Empty</Badge>
            <span className="text-sm text-muted-foreground">No documents</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-status-pending text-white">Partial</Badge>
            <span className="text-sm text-muted-foreground">Has space available</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-status-approved text-white">Full</Badge>
            <span className="text-sm text-muted-foreground">At capacity</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-destructive text-destructive-foreground">Over-capacity</Badge>
            <span className="text-sm text-muted-foreground">Exceeds capacity</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LocationTreeView;