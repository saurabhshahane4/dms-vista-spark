import { useState } from 'react';
import { ChevronRight, ChevronDown, Package, Building, Layers, Grid3X3 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CapacityIndicator } from './CapacityIndicator';

interface WarehouseTreePickerProps {
  availableRacks: any[];
  selectedRacks: string[];
  onRackSelect: (selectedRacks: string[]) => void;
}

interface TreeNode {
  id: string;
  name: string;
  type: 'warehouse' | 'zone' | 'shelf' | 'rack';
  children?: TreeNode[];
  data?: any;
}

export const WarehouseTreePicker = ({
  availableRacks,
  selectedRacks,
  onRackSelect
}: WarehouseTreePickerProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Build hierarchical tree structure
  const buildTree = (): TreeNode[] => {
    const warehouseMap = new Map<string, TreeNode>();
    const zoneMap = new Map<string, TreeNode>();
    const shelfMap = new Map<string, TreeNode>();

    availableRacks.forEach(rack => {
      const warehouse = rack.shelves?.zones?.warehouses;
      const zone = rack.shelves?.zones;
      const shelf = rack.shelves;

      if (!warehouse || !zone || !shelf) return;

      // Create warehouse node
      if (!warehouseMap.has(warehouse.id)) {
        warehouseMap.set(warehouse.id, {
          id: warehouse.id,
          name: warehouse.name,
          type: 'warehouse',
          children: [],
          data: warehouse
        });
      }

      // Create zone node
      const zoneKey = `${warehouse.id}-${zone.id}`;
      if (!zoneMap.has(zoneKey)) {
        const zoneNode: TreeNode = {
          id: zoneKey,
          name: zone.name,
          type: 'zone',
          children: [],
          data: zone
        };
        zoneMap.set(zoneKey, zoneNode);
        warehouseMap.get(warehouse.id)!.children!.push(zoneNode);
      }

      // Create shelf node
      const shelfKey = `${warehouse.id}-${zone.id}-${shelf.id}`;
      if (!shelfMap.has(shelfKey)) {
        const shelfNode: TreeNode = {
          id: shelfKey,
          name: shelf.name,
          type: 'shelf',
          children: [],
          data: shelf
        };
        shelfMap.set(shelfKey, shelfNode);
        zoneMap.get(zoneKey)!.children!.push(shelfNode);
      }

      // Add rack node
      const rackNode: TreeNode = {
        id: rack.id,
        name: rack.code,
        type: 'rack',
        data: rack
      };
      shelfMap.get(shelfKey)!.children!.push(rackNode);
    });

    return Array.from(warehouseMap.values());
  };

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleRackToggle = (rackId: string) => {
    const newSelected = selectedRacks.includes(rackId)
      ? selectedRacks.filter(id => id !== rackId)
      : [...selectedRacks, rackId];
    onRackSelect(newSelected);
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'warehouse':
        return <Building className="w-4 h-4 text-blue-500" />;
      case 'zone':
        return <Layers className="w-4 h-4 text-green-500" />;
      case 'shelf':
        return <Grid3X3 className="w-4 h-4 text-orange-500" />;
      case 'rack':
        return <Package className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'empty':
        return 'text-gray-500';
      case 'partial':
        return 'text-green-500';
      case 'full':
        return 'text-orange-500';
      case 'over-capacity':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const renderNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isRack = node.type === 'rack';
    const isSelected = selectedRacks.includes(node.id);

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50 cursor-pointer`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(node.id)}
              className="p-0.5 hover:bg-accent rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          {!hasChildren && (
            <div className="w-5" /> // Spacer for alignment
          )}

          {isRack && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleRackToggle(node.id)}
            />
          )}

          {getNodeIcon(node.type)}

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm truncate">{node.name}</span>
              
              {isRack && node.data && (
                <>
                  <Badge variant="outline" className="text-xs">
                    {node.data.capacity} slots
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getStatusColor(node.data.status)}`}
                  >
                    {node.data.status}
                  </Badge>
                </>
              )}
            </div>

            {isRack && node.data && (
              <div className="mt-1">
                <CapacityIndicator
                  current={node.data.current_count || 0}
                  capacity={node.data.capacity || 0}
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree();

  if (tree.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No available racks found</p>
        <p className="text-xs mt-1">All racks may already be assigned</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Available Racks</h4>
        {selectedRacks.length > 0 && (
          <Badge variant="secondary">
            {selectedRacks.length} selected
          </Badge>
        )}
      </div>

      <div className="space-y-1">
        {tree.map(node => renderNode(node))}
      </div>
    </div>
  );
};