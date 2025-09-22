import { useState, useEffect } from 'react';
import { Search, Scan, MapPin, FileText, Move, History } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWarehouse } from '@/hooks/useWarehouse';
import { useDocuments } from '@/hooks/useDocuments';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface AssignedDocument {
  id: string;
  document_id: string;
  document_name: string;
  rack_id: string;
  rack_code: string;
  full_path: string;
  assigned_at: string;
  notes?: string;
}

const RackAssignment = () => {
  const { user } = useAuth();
  const { warehouses, racks, getWarehouseHierarchy, assignDocumentToRack, moveDocumentToRack } = useWarehouse();
  const { documents } = useDocuments();
  
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [documentSearch, setDocumentSearch] = useState('');
  const [selectedRack, setSelectedRack] = useState<any>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [assignmentDialog, setAssignmentDialog] = useState(false);
  const [moveDialog, setMoveDialog] = useState(false);
  const [reassignDialog, setReassignDialog] = useState(false);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [reassignNotes, setReassignNotes] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<AssignedDocument | null>(null);
  const [newRack, setNewRack] = useState<any>(null);
  const [assignedDocuments, setAssignedDocuments] = useState<AssignedDocument[]>([]);
  const [locationHistory, setLocationHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch assigned documents
  const fetchAssignedDocuments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('document_locations')
        .select(`
          id,
          document_id,
          rack_id,
          assigned_at,
          notes,
          documents(name),
          racks(code, barcode)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Build full path for each assignment
      const enrichedData = await Promise.all(
        (data || []).map(async (item: any) => {
          const fullPath = await buildRackPath(item.rack_id);
          return {
            id: item.id,
            document_id: item.document_id,
            document_name: item.documents?.name || 'Unknown Document',
            rack_id: item.rack_id,
            rack_code: item.racks?.code || 'Unknown Rack',
            full_path: fullPath,
            assigned_at: item.assigned_at,
            notes: item.notes,
          };
        })
      );

      setAssignedDocuments(enrichedData);
    } catch (error) {
      console.error('Error fetching assigned documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch assigned documents",
        variant: "destructive",
      });
    }
  };

  // Build full path for a rack
  const buildRackPath = async (rackId: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('racks')
        .select(`
          code,
          shelves(
            code,
            zones(
              code,
              warehouses(code)
            )
          )
        `)
        .eq('id', rackId)
        .single();

      if (error) throw error;

      const warehouseCode = data.shelves?.zones?.warehouses?.code || 'Unknown';
      const zoneCode = data.shelves?.zones?.code || 'Unknown';
      const shelfCode = data.shelves?.code || 'Unknown';
      const rackCode = data.code || 'Unknown';

      return `${warehouseCode} > ${zoneCode} > ${shelfCode} > ${rackCode}`;
    } catch (error) {
      console.error('Error building rack path:', error);
      return 'Unknown Path';
    }
  };

  // Search rack by barcode
  const searchRackByBarcode = async (barcode: string) => {
    if (!barcode.trim() || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('racks')
        .select(`
          *,
          shelves(
            *,
            zones(
              *,
              warehouses(*)
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('barcode', barcode)
        .single();

      if (error) {
        toast({
          title: "Rack Not Found",
          description: "No rack found with the specified barcode",
          variant: "destructive",
        });
        return;
      }

      setSelectedRack(data);
      toast({
        title: "Rack Found",
        description: `Found rack: ${data.name} (${data.code})`,
      });
    } catch (error) {
      console.error('Error searching rack:', error);
      toast({
        title: "Error",
        description: "Failed to search for rack",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle document assignment
  const handleAssignDocument = async () => {
    if (!selectedDocument || !selectedRack) return;

    const result = await assignDocumentToRack(
      selectedDocument.id,
      selectedRack.id,
      assignmentNotes
    );

    if (result) {
      setAssignmentDialog(false);
      setAssignmentNotes('');
      setSelectedDocument(null);
      await fetchAssignedDocuments();
    }
  };

  // Handle document re-assignment
  const handleReassignDocument = async () => {
    if (!selectedAssignment || !newRack) return;

    const result = await moveDocumentToRack(
      selectedAssignment.document_id,
      selectedAssignment.rack_id,
      newRack.id,
      'reassigned',
      reassignNotes
    );

    if (result) {
      setReassignDialog(false);
      setReassignNotes('');
      setSelectedAssignment(null);
      setNewRack(null);
      await fetchAssignedDocuments();
    }
  };

  // Search rack for reassignment
  const searchRackForReassign = async (barcode: string) => {
    if (!barcode.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('racks')
        .select(`
          *,
          shelves(
            *,
            zones(
              *,
              warehouses(*)
            )
          )
        `)
        .eq('user_id', user.id)
        .or(`barcode.eq.${barcode},code.eq.${barcode}`)
        .single();

      if (error) {
        toast({
          title: "Rack Not Found",
          description: "No rack found with the specified barcode or code",
          variant: "destructive",
        });
        return;
      }

      setNewRack(data);
      toast({
        title: "Rack Found",
        description: `Found rack: ${data.name} (${data.code})`,
      });
    } catch (error) {
      console.error('Error searching rack:', error);
      toast({
        title: "Error",
        description: "Failed to search for rack",
        variant: "destructive",
      });
    }
  };

  // Fetch location history
  const fetchLocationHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('location_history')
        .select(`
          *,
          documents(name),
          from_racks:from_rack_id(code, barcode),
          to_racks:to_rack_id(code, barcode)
        `)
        .eq('user_id', user.id)
        .order('moved_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLocationHistory(data || []);
    } catch (error) {
      console.error('Error fetching location history:', error);
    }
  };

  useEffect(() => {
    fetchAssignedDocuments();
    fetchLocationHistory();
  }, [user]);

  const handleBarcodeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchRackByBarcode(barcodeSearch);
    }
  };

  const unassignedDocuments = documents.filter(doc => 
    !assignedDocuments.some(assigned => assigned.document_id === doc.id)
  );

  const filteredDocuments = unassignedDocuments.filter(doc =>
    doc.name.toLowerCase().includes(documentSearch.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'empty': return 'bg-muted text-muted-foreground';
      case 'partial': return 'bg-status-pending text-white';
      case 'full': return 'bg-status-approved text-white';
      case 'over-capacity': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rack Assignment</h1>
      </div>

      <Tabs defaultValue="assign" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assign">Assign Documents</TabsTrigger>
          <TabsTrigger value="assigned">Assigned Documents</TabsTrigger>
          <TabsTrigger value="history">Location History</TabsTrigger>
        </TabsList>

        <TabsContent value="assign" className="space-y-6">
          {/* Barcode Scanner Section */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Scan className="w-5 h-5" />
              Scan or Enter Barcode
            </h3>
            <div className="flex gap-4">
              <Input
                placeholder="Scan or enter rack barcode..."
                value={barcodeSearch}
                onChange={(e) => setBarcodeSearch(e.target.value)}
                onKeyPress={handleBarcodeKeyPress}
                className="flex-1"
              />
              <Button 
                onClick={() => searchRackByBarcode(barcodeSearch)}
                disabled={loading}
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </Card>

          {/* Selected Rack Info */}
          {selectedRack && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Selected Rack
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-semibold">{selectedRack.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Code</label>
                  <p className="font-semibold">{selectedRack.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Barcode</label>
                  <p className="font-mono text-sm">{selectedRack.barcode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant="secondary" className={getStatusColor(selectedRack.status)}>
                    {selectedRack.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Capacity</label>
                  <p>{selectedRack.current_count}/{selectedRack.capacity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Position</label>
                  <p>({selectedRack.position_x}, {selectedRack.position_y})</p>
                </div>
              </div>
            </Card>
          )}

          {/* Document Selection */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Select Document to Assign
            </h3>
            <div className="mb-4">
              <Input
                placeholder="Search documents..."
                value={documentSearch}
                onChange={(e) => setDocumentSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.slice(0, 10).map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">{document.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{document.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(document.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedDocument(document);
                          setAssignmentDialog(true);
                        }}
                        disabled={!selectedRack}
                      >
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="assigned">
          <Card>
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Assigned Documents</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Location Path</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedDocuments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.document_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {assignment.full_path}
                    </TableCell>
                    <TableCell>{new Date(assignment.assigned_at).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{assignment.notes || '-'}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setReassignDialog(true);
                        }}
                      >
                        <Move className="w-4 h-4 mr-2" />
                        Re-assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <History className="w-5 h-5" />
                Location History
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locationHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.documents?.name || 'Unknown Document'}
                    </TableCell>
                    <TableCell>
                      {entry.from_racks?.code || 'New Assignment'}
                    </TableCell>
                    <TableCell>
                      {entry.to_racks?.code || 'Unassigned'}
                    </TableCell>
                    <TableCell>{new Date(entry.moved_at).toLocaleDateString()}</TableCell>
                    <TableCell>{entry.reason || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assignment Dialog */}
      <Dialog open={assignmentDialog} onOpenChange={setAssignmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Document to Rack</DialogTitle>
            <DialogDescription>
              Assign "{selectedDocument?.name}" to rack "{selectedRack?.name}" ({selectedRack?.code})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this assignment..."
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignmentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignDocument}>
              Assign Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Re-assignment Dialog */}
      <Dialog open={reassignDialog} onOpenChange={setReassignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Re-assign Document</DialogTitle>
            <DialogDescription>
              Move "{selectedAssignment?.document_name}" to a different rack
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Current Location */}
            <div className="p-4 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Current Location</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedAssignment?.full_path}
              </p>
            </div>

            {/* New Rack Selection */}
            <div>
              <Label className="text-sm font-medium">Select New Rack</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Enter rack barcode or code..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      searchRackForReassign(e.currentTarget.value);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    searchRackForReassign(input.value);
                  }}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* New Rack Info */}
            {newRack && (
              <div className="p-4 border rounded-lg">
                <Label className="text-sm font-medium">New Location</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <p className="font-medium">{newRack.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Code:</span>
                    <p className="font-medium">{newRack.code}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Capacity:</span>
                    <p>{newRack.current_count}/{newRack.capacity}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant="secondary" className={getStatusColor(newRack.status)}>
                      {newRack.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <Label htmlFor="reassign-notes">Reason for Re-assignment (optional)</Label>
              <Textarea
                id="reassign-notes"
                placeholder="Enter reason for moving this document..."
                value={reassignNotes}
                onChange={(e) => setReassignNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setReassignDialog(false);
                setNewRack(null);
                setReassignNotes('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReassignDocument}
              disabled={!newRack}
            >
              Re-assign Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RackAssignment;