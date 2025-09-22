import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WarehouseTreePicker } from './WarehouseTreePicker';

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableRacks: any[];
  onAssign: (
    rackIds: string[],
    assignmentData: {
      assignment_type: 'dedicated' | 'shared' | 'overflow';
      capacity_threshold: number;
      document_types: string[];
      notes?: string;
    }
  ) => Promise<void>;
}

export const AssignmentDialog = ({
  open,
  onOpenChange,
  availableRacks,
  onAssign
}: AssignmentDialogProps) => {
  const [selectedRacks, setSelectedRacks] = useState<string[]>([]);
  const [assignmentType, setAssignmentType] = useState<'dedicated' | 'shared' | 'overflow'>('dedicated');
  const [capacityThreshold, setCapacityThreshold] = useState(90);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [newDocumentType, setNewDocumentType] = useState('');
  const [notes, setNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

  const commonDocumentTypes = [
    'contract', 'invoice', 'legal', 'hr', 'financial', 'compliance', 'report', 'correspondence'
  ];

  const handleAddDocumentType = () => {
    if (newDocumentType.trim() && !documentTypes.includes(newDocumentType.trim())) {
      setDocumentTypes([...documentTypes, newDocumentType.trim()]);
      setNewDocumentType('');
    }
  };

  const handleRemoveDocumentType = (type: string) => {
    setDocumentTypes(documentTypes.filter(t => t !== type));
  };

  const handleSubmit = async () => {
    if (selectedRacks.length === 0) return;

    try {
      setAssigning(true);
      await onAssign(selectedRacks, {
        assignment_type: assignmentType,
        capacity_threshold: capacityThreshold,
        document_types: documentTypes,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setSelectedRacks([]);
      setAssignmentType('dedicated');
      setCapacityThreshold(90);
      setDocumentTypes([]);
      setNotes('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning racks:', error);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Assign Racks to Customer</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 h-[60vh]">
          {/* Left Panel - Rack Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Select Racks</Label>
              <p className="text-sm text-muted-foreground">
                Choose racks to assign to this customer
              </p>
            </div>

            <div className="border rounded-lg p-4 h-[calc(100%-60px)]">
              <WarehouseTreePicker
                availableRacks={availableRacks}
                selectedRacks={selectedRacks}
                onRackSelect={setSelectedRacks}
              />
            </div>
          </div>

          {/* Right Panel - Assignment Configuration */}
          <ScrollArea className="h-full">
            <div className="space-y-6 pr-4">
              <div>
                <Label className="text-base font-medium">Assignment Configuration</Label>
                <p className="text-sm text-muted-foreground">
                  Configure how these racks will be used
                </p>
              </div>

              {/* Assignment Type */}
              <div className="space-y-2">
                <Label htmlFor="assignment_type">Assignment Type</Label>
                <Select
                  value={assignmentType}
                  onValueChange={(value: 'dedicated' | 'shared' | 'overflow') =>
                    setAssignmentType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dedicated">
                      <div>
                        <div className="font-medium">Dedicated</div>
                        <div className="text-xs text-muted-foreground">
                          Exclusively for this customer
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="shared">
                      <div>
                        <div className="font-medium">Shared</div>
                        <div className="text-xs text-muted-foreground">
                          Can be shared with other customers
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="overflow">
                      <div>
                        <div className="font-medium">Overflow</div>
                        <div className="text-xs text-muted-foreground">
                          Used when primary racks are full
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Capacity Threshold */}
              <div className="space-y-2">
                <Label htmlFor="capacity_threshold">Capacity Threshold (%)</Label>
                <Input
                  id="capacity_threshold"
                  type="number"
                  min="50"
                  max="100"
                  value={capacityThreshold}
                  onChange={(e) => setCapacityThreshold(parseInt(e.target.value) || 90)}
                />
                <p className="text-xs text-muted-foreground">
                  Switch to next rack when this threshold is reached
                </p>
              </div>

              {/* Document Types */}
              <div className="space-y-2">
                <Label>Document Types (Optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Specify which document types should use these racks
                </p>
                
                {/* Current Document Types */}
                {documentTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {documentTypes.map((type) => (
                      <Badge
                        key={type}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveDocumentType(type)}
                      >
                        {type} ×
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Add Document Type */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add document type..."
                    value={newDocumentType}
                    onChange={(e) => setNewDocumentType(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddDocumentType()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddDocumentType}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Common Types */}
                <div className="flex flex-wrap gap-1">
                  {commonDocumentTypes
                    .filter(type => !documentTypes.includes(type))
                    .map((type) => (
                      <Badge
                        key={type}
                        variant="outline"
                        className="cursor-pointer text-xs"
                        onClick={() => setDocumentTypes([...documentTypes, type])}
                      >
                        + {type}
                      </Badge>
                    ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this assignment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedRacks.length} rack(s) selected
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={assigning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedRacks.length === 0 || assigning}
            >
              {assigning ? 'Assigning...' : `Assign ${selectedRacks.length} Rack(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};