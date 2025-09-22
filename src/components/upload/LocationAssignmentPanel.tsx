import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Settings,
  Package,
  Warehouse,
  Target
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WarehouseTreePicker } from '@/components/customer-assignment/WarehouseTreePicker';

interface Rack {
  id: string;
  code: string;
  name: string;
  capacity: number;
  current_count: number;
  status: 'empty' | 'partial' | 'full' | 'over-capacity';
  warehouse_path: string;
}

interface LocationAssignment {
  status: 'auto-assigned' | 'manual-selection' | 'failed' | 'pending';
  assignedRack?: Rack;
  reason?: string;
  confidence?: number;
  alternatives?: Rack[];
  estimatedCapacityAfter?: number;
}

interface LocationAssignmentPanelProps {
  customer: any;
  documentType: any;
  assignment: LocationAssignment;
  onAssignmentChange: (assignment: LocationAssignment) => void;
}

const LocationAssignmentPanel = ({
  customer,
  documentType,
  assignment,
  onAssignmentChange
}: LocationAssignmentPanelProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualSelection, setShowManualSelection] = useState(false);
  const [availableRacks, setAvailableRacks] = useState<Rack[]>([]);

  useEffect(() => {
    if (customer) {
      performAutoAssignment();
    }
  }, [customer, documentType]);

  const performAutoAssignment = async () => {
    if (!customer) return;

    setIsProcessing(true);
    try {
      // Simulate API call for auto-assignment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock assignment logic
      const mockRacks: Rack[] = [
        {
          id: '1',
          code: 'WH001-Z001-S001-R001',
          name: 'Rack 001',
          capacity: 100,
          current_count: 75,
          status: 'partial',
          warehouse_path: 'Main Warehouse > Zone A > Shelf 1'
        },
        {
          id: '2', 
          code: 'WH001-Z001-S001-R002',
          name: 'Rack 002',
          capacity: 100,
          current_count: 45,
          status: 'partial',
          warehouse_path: 'Main Warehouse > Zone A > Shelf 1'
        }
      ];

      // Simulate customer having dedicated racks
      const customerHasDedicatedRacks = customer.id === '1' || customer.id === '2';
      
      if (customerHasDedicatedRacks) {
        const primaryRack = mockRacks[0];
        onAssignmentChange({
          status: 'auto-assigned',
          assignedRack: primaryRack,
          reason: `${customer.name} dedicated rack`,
          confidence: 95,
          alternatives: [mockRacks[1]],
          estimatedCapacityAfter: primaryRack.current_count + 1
        });
      } else {
        // No dedicated racks - require manual selection
        setAvailableRacks(mockRacks);
        onAssignmentChange({
          status: 'failed',
          reason: 'No customer assignment or routing rules',
          alternatives: mockRacks
        });
      }
    } catch (error) {
      onAssignmentChange({
        status: 'failed',
        reason: 'Assignment engine error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualRackSelection = (selectedRacks: string[]) => {
    if (selectedRacks.length > 0) {
      const selectedRack = availableRacks.find(r => r.id === selectedRacks[0]);
      if (selectedRack) {
        onAssignmentChange({
          status: 'manual-selection',
          assignedRack: selectedRack,
          reason: 'Manually selected',
          confidence: 100,
          estimatedCapacityAfter: selectedRack.current_count + 1
        });
        setShowManualSelection(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'auto-assigned':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'manual-selection':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card className="border border-border/50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Location Assignment</h3>
              <p className="text-sm text-muted-foreground">
                Smart rack assignment based on customer and document type
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={performAutoAssignment}
              disabled={isProcessing || !customer}
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Retry Auto-Assignment
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowManualSelection(true)}
              disabled={!customer}
            >
              <Settings className="w-4 h-4" />
              Manual Selection
            </Button>
          </div>
        </div>

        {/* Assignment Status */}
        {!customer ? (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Please select a customer first to enable location assignment.
            </AlertDescription>
          </Alert>
        ) : isProcessing ? (
          <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
            <div>
              <p className="font-medium text-foreground">Processing Assignment...</p>
              <p className="text-sm text-muted-foreground">
                Analyzing customer racks and routing rules
              </p>
            </div>
          </div>
        ) : assignment.status === 'auto-assigned' && assignment.assignedRack ? (
          /* Successful Auto-Assignment */
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 border border-green-200 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-green-800">Auto-Assignment Successful</span>
                  <Badge variant="secondary" className="text-xs">
                    {assignment.confidence}% confidence
                  </Badge>
                </div>
                <p className="text-sm text-green-700">{assignment.reason}</p>
              </div>
            </div>

            {/* Assigned Rack Details */}
            <div className="p-4 border border-border rounded-lg bg-card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">
                      {assignment.assignedRack.code}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {assignment.assignedRack.warehouse_path}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={assignment.assignedRack.status === 'partial' ? 'border-yellow-200 text-yellow-700' : ''}
                >
                  {assignment.assignedRack.status}
                </Badge>
              </div>

              {/* Capacity Information */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Capacity:</span>
                  <span className={getCapacityColor((assignment.assignedRack.current_count / assignment.assignedRack.capacity) * 100)}>
                    {assignment.assignedRack.current_count} / {assignment.assignedRack.capacity}
                  </span>
                </div>
                <Progress 
                  value={(assignment.assignedRack.current_count / assignment.assignedRack.capacity) * 100} 
                  className="h-2"
                />
                {assignment.estimatedCapacityAfter && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>After upload:</span>
                    <span>{assignment.estimatedCapacityAfter} / {assignment.assignedRack.capacity}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Alternative Racks */}
            {assignment.alternatives && assignment.alternatives.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Alternative Options:</p>
                <div className="space-y-2">
                  {assignment.alternatives.map((rack) => (
                    <div 
                      key={rack.id}
                      className="flex items-center justify-between p-2 border border-border rounded bg-muted/30"
                    >
                      <div className="text-sm">
                        <span className="font-mono">{rack.code}</span>
                        <span className="text-muted-foreground ml-2">
                          ({rack.current_count}/{rack.capacity})
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                         onClick={() => handleManualRackSelection([rack.id])}
                      >
                        Use This
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : assignment.status === 'failed' ? (
          /* Failed Assignment - Manual Selection Required */
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>Manual Selection Required:</strong> {assignment.reason}
              </AlertDescription>
            </Alert>

            {assignment.alternatives && assignment.alternatives.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Available Racks:</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {assignment.alternatives.map((rack) => (
                    <div 
                      key={rack.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/30 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Warehouse className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{rack.code}</span>
                          <Badge variant="outline" className="text-xs">
                            {rack.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{rack.warehouse_path}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress 
                            value={(rack.current_count / rack.capacity) * 100} 
                            className="h-1 w-20"
                          />
                          <span className="text-xs text-muted-foreground">
                            {rack.current_count}/{rack.capacity}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManualRackSelection([rack.id])}
                      >
                        <Target className="w-4 h-4 mr-1" />
                        Select
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : assignment.status === 'manual-selection' && assignment.assignedRack ? (
          /* Manual Selection Made */
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <Target className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <span className="font-medium text-blue-800">Manually Selected</span>
                <p className="text-sm text-blue-700">Rack selected by user</p>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">
                  {assignment.assignedRack.code}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {assignment.assignedRack.warehouse_path}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Capacity:</span>
                  <span>{assignment.assignedRack.current_count} / {assignment.assignedRack.capacity}</span>
                </div>
                <Progress 
                  value={(assignment.assignedRack.current_count / assignment.assignedRack.capacity) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* Manual Selection Modal/Panel */}
        {showManualSelection && (
          <div className="mt-6 p-4 border-2 border-dashed border-border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-foreground">Manual Rack Selection</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowManualSelection(false)}
              >
                Cancel
              </Button>
            </div>
            
            <WarehouseTreePicker
              availableRacks={availableRacks}
              selectedRacks={[]}
              onRackSelect={handleManualRackSelection}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default LocationAssignmentPanel;