import { useState } from 'react';
import { Package, Plus, Trash2, Eye, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerRackAssignment } from '@/hooks/useCustomerRackAssignment';
import { WarehouseTreePicker } from './WarehouseTreePicker';
import { AssignmentDialog } from './AssignmentDialog';
import { CapacityIndicator } from './CapacityIndicator';

interface RackAssignmentPanelProps {
  selectedCustomerId: string | null;
  availableRacks: any[];
  assignments: CustomerRackAssignment[];
  onAssignRacks: (
    customerId: string,
    rackIds: string[],
    assignmentData: {
      assignment_type: 'dedicated' | 'shared' | 'overflow';
      capacity_threshold: number;
      document_types: string[];
      notes?: string;
    }
  ) => Promise<void>;
  onRemoveAssignment: (assignmentId: string) => Promise<void>;
}

export const RackAssignmentPanel = ({
  selectedCustomerId,
  availableRacks,
  assignments,
  onAssignRacks,
  onRemoveAssignment
}: RackAssignmentPanelProps) => {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedRacks, setSelectedRacks] = useState<string[]>([]);

  if (!selectedCustomerId) {
    return (
      <Card className="h-[calc(100vh-300px)] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Select a Customer</h3>
          <p>Choose a customer from the list to manage their rack assignments</p>
        </div>
      </Card>
    );
  }

  const getAssignmentTypeColor = (type: string) => {
    switch (type) {
      case 'dedicated':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'shared':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'overflow':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
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

  return (
    <Card className="h-[calc(100vh-300px)] flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Rack Management ({assignments.length} assigned)
          </h3>
          
          <Button onClick={() => setShowAssignDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Assign Racks
          </Button>
        </div>
      </div>

      <div className="flex-1">
        <Tabs defaultValue="assigned" className="h-full flex flex-col">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assigned">Assigned Racks ({assignments.length})</TabsTrigger>
              <TabsTrigger value="available">Available Racks ({availableRacks.length})</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="assigned" className="flex-1 px-4 pb-4">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <Card key={assignment.id} className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{assignment.rack_code}</h4>
                            <Badge className={getAssignmentTypeColor(assignment.assignment_type)}>
                              {assignment.assignment_type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Priority {assignment.priority_order}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {assignment.warehouse_name} → {assignment.zone_name} → {assignment.shelf_name}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onRemoveAssignment(assignment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Status and Capacity */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Status</p>
                          <p className={`text-sm font-medium ${getStatusColor(assignment.rack_status || 'empty')}`}>
                            {assignment.rack_status || 'empty'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Threshold</p>
                          <p className="text-sm font-medium">{assignment.capacity_threshold}%</p>
                        </div>
                      </div>

                      {/* Capacity Indicator */}
                      <CapacityIndicator
                        current={assignment.rack_current_count || 0}
                        capacity={assignment.rack_capacity || 0}
                        showLabels
                      />

                      {/* Document Types */}
                      {assignment.document_types && assignment.document_types.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Document Types</p>
                          <div className="flex flex-wrap gap-1">
                            {assignment.document_types.map((type, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {assignment.notes && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Notes</p>
                          <p className="text-xs bg-muted p-2 rounded">{assignment.notes}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}

                {assignments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No racks assigned to this customer</p>
                    <p className="text-xs mt-1">Click "Assign Racks" to get started</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="available" className="flex-1 px-4 pb-4">
            <ScrollArea className="h-full">
              <WarehouseTreePicker
                availableRacks={availableRacks}
                selectedRacks={selectedRacks}
                onRackSelect={setSelectedRacks}
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Assignment Dialog */}
      <AssignmentDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        availableRacks={availableRacks}
        onAssign={(rackIds, assignmentData) => {
          if (selectedCustomerId) {
            return onAssignRacks(selectedCustomerId, rackIds, assignmentData);
          }
          return Promise.resolve();
        }}
      />
    </Card>
  );
};