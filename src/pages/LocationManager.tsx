import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building2, MapPin, Box, Archive } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useWarehouse, type Warehouse, type Zone, type Shelf, type Rack } from '@/hooks/useWarehouse';
import { useForm } from 'react-hook-form';

interface WarehouseFormData {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  is_active: boolean;
}

interface ZoneFormData {
  warehouse_id: string;
  name: string;
  code: string;
  zone_type: string;
  temperature_controlled: boolean;
  is_active: boolean;
}

interface ShelfFormData {
  zone_id: string;
  name: string;
  code: string;
  height_cm?: number;
  width_cm?: number;
  depth_cm?: number;
  max_weight_kg?: number;
  is_active: boolean;
}

interface RackFormData {
  shelf_id: string;
  name: string;
  code: string;
  position_x: number;
  position_y: number;
  capacity: number;
  current_count: number;
  status: string;
  is_active: boolean;
}

const LocationManager = () => {
  const {
    warehouses,
    zones,
    shelves,
    racks,
    loading,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    createZone,
    updateZone,
    deleteZone,
    createShelf,
    updateShelf,
    deleteShelf,
    createRack,
    updateRack,
    deleteRack,
    fetchZones,
    fetchShelves,
    fetchRacks,
  } = useWarehouse();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('warehouses');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);

  const warehouseForm = useForm<WarehouseFormData>({
    defaultValues: {
      is_active: true,
    }
  });

  const zoneForm = useForm<ZoneFormData>({
    defaultValues: {
      zone_type: 'standard',
      temperature_controlled: false,
      is_active: true,
    }
  });

  const shelfForm = useForm<ShelfFormData>({
    defaultValues: {
      is_active: true,
    }
  });

  const rackForm = useForm<RackFormData>({
    defaultValues: {
      position_x: 0,
      position_y: 0,
      capacity: 10,
      current_count: 0,
      status: 'empty',
      is_active: true,
    }
  });

  const handleCreateWarehouse = async (data: WarehouseFormData) => {
    const result = await createWarehouse(data);
    if (result) {
      setIsDialogOpen(false);
      warehouseForm.reset();
    }
  };

  const handleCreateZone = async (data: ZoneFormData) => {
    const result = await createZone(data);
    if (result) {
      setIsDialogOpen(false);
      zoneForm.reset();
      fetchZones();
    }
  };

  const handleCreateShelf = async (data: ShelfFormData) => {
    const result = await createShelf(data);
    if (result) {
      setIsDialogOpen(false);
      shelfForm.reset();
      fetchShelves();
    }
  };

  const handleCreateRack = async (data: RackFormData) => {
    const result = await createRack(data);
    if (result) {
      setIsDialogOpen(false);
      rackForm.reset();
      fetchRacks();
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (type === 'warehouse') {
      await deleteWarehouse(id);
    } else if (type === 'zone') {
      await deleteZone(id);
    } else if (type === 'shelf') {
      await deleteShelf(id);
    } else if (type === 'rack') {
      await deleteRack(id);
    }
    setDeleteConfirm(null);
  };

  const openEditDialog = (type: string, item: any) => {
    setEditingItem({ type, ...item });
    
    if (type === 'warehouse') {
      warehouseForm.reset(item);
    } else if (type === 'zone') {
      zoneForm.reset(item);
    } else if (type === 'shelf') {
      shelfForm.reset(item);
    } else if (type === 'rack') {
      rackForm.reset(item);
    }
    
    setIsDialogOpen(true);
  };

  const openCreateDialog = (type: string) => {
    setEditingItem(null);
    setActiveTab(type);
    setIsDialogOpen(true);
  };

  // Load initial data when switching tabs
  useEffect(() => {
    if (activeTab === 'zones') {
      fetchZones();
    } else if (activeTab === 'shelves') {
      fetchShelves();
    } else if (activeTab === 'racks') {
      fetchRacks();
    }
  }, [activeTab, fetchZones, fetchShelves, fetchRacks]);

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? "default" : "secondary"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );

  const getRackStatusBadge = (status: string) => {
    const colors = {
      empty: 'bg-muted text-muted-foreground',
      partial: 'bg-status-pending text-white',
      full: 'bg-status-approved text-white',
      'over-capacity': 'bg-destructive text-destructive-foreground',
    };
    
    return (
      <Badge variant="secondary" className={colors[status as keyof typeof colors]}>
        {status}
      </Badge>
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
        <h1 className="text-2xl font-bold">Location Manager</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="warehouses" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Warehouses
          </TabsTrigger>
          <TabsTrigger value="zones" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Zones
          </TabsTrigger>
          <TabsTrigger value="shelves" className="flex items-center gap-2">
            <Box className="w-4 h-4" />
            Shelves
          </TabsTrigger>
          <TabsTrigger value="racks" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Racks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="warehouses">
          <Card>
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Warehouses</h3>
              <Button onClick={() => openCreateDialog('warehouses')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Warehouse
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell className="font-medium">{warehouse.name}</TableCell>
                    <TableCell>{warehouse.code}</TableCell>
                    <TableCell>{warehouse.address || '-'}</TableCell>
                    <TableCell>{warehouse.manager_name || '-'}</TableCell>
                    <TableCell>{getStatusBadge(warehouse.is_active)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog('warehouse', warehouse)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm({ type: 'warehouse', id: warehouse.id, name: warehouse.name })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="zones">
          <Card>
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Zones</h3>
              <Button onClick={() => openCreateDialog('zones')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Zone
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Temperature Controlled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zones.map((zone) => (
                  <TableRow key={zone.id}>
                    <TableCell className="font-medium">{zone.name}</TableCell>
                    <TableCell>{zone.code}</TableCell>
                    <TableCell>{zone.zone_type}</TableCell>
                    <TableCell>{zone.temperature_controlled ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{getStatusBadge(zone.is_active)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog('zone', zone)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm({ type: 'zone', id: zone.id, name: zone.name })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="shelves">
          <Card>
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Shelves</h3>
              <Button onClick={() => openCreateDialog('shelves')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Shelf
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Dimensions (cm)</TableHead>
                  <TableHead>Max Weight (kg)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shelves.map((shelf) => (
                  <TableRow key={shelf.id}>
                    <TableCell className="font-medium">{shelf.name}</TableCell>
                    <TableCell>{shelf.code}</TableCell>
                    <TableCell>
                      {shelf.height_cm && shelf.width_cm && shelf.depth_cm
                        ? `${shelf.height_cm} × ${shelf.width_cm} × ${shelf.depth_cm}`
                        : '-'
                      }
                    </TableCell>
                    <TableCell>{shelf.max_weight_kg || '-'}</TableCell>
                    <TableCell>{getStatusBadge(shelf.is_active)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog('shelf', shelf)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm({ type: 'shelf', id: shelf.id, name: shelf.name })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="racks">
          <Card>
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Racks</h3>
              <Button onClick={() => openCreateDialog('racks')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Rack
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {racks.map((rack) => (
                  <TableRow key={rack.id}>
                    <TableCell className="font-medium">{rack.name}</TableCell>
                    <TableCell>{rack.code}</TableCell>
                    <TableCell className="font-mono text-sm">{rack.barcode || '-'}</TableCell>
                    <TableCell>({rack.position_x}, {rack.position_y})</TableCell>
                    <TableCell>{rack.current_count}/{rack.capacity}</TableCell>
                    <TableCell>{getRackStatusBadge(rack.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog('rack', rack)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm({ type: 'rack', id: rack.id, name: rack.name })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit' : 'Create'} {activeTab.slice(0, -1)}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the' : 'Add a new'} {activeTab.slice(0, -1)} to your warehouse system.
            </DialogDescription>
          </DialogHeader>

          {activeTab === 'warehouses' && (
            <form onSubmit={warehouseForm.handleSubmit(handleCreateWarehouse)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input {...warehouseForm.register('name', { required: true })} />
                </div>
                <div>
                  <Label htmlFor="code">Code *</Label>
                  <Input {...warehouseForm.register('code', { required: true })} />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea {...warehouseForm.register('address')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input {...warehouseForm.register('phone')} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" {...warehouseForm.register('email')} />
                </div>
              </div>
              <div>
                <Label htmlFor="manager_name">Manager Name</Label>
                <Input {...warehouseForm.register('manager_name')} />
              </div>
              <div className="flex items-center space-x-2">
                <Switch {...warehouseForm.register('is_active')} />
                <Label>Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          )}

          {activeTab === 'zones' && (
            <form onSubmit={zoneForm.handleSubmit(handleCreateZone)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="warehouse_id">Warehouse *</Label>
                  <Select onValueChange={(value) => zoneForm.setValue('warehouse_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="zone_type">Zone Type</Label>
                  <Select onValueChange={(value) => zoneForm.setValue('zone_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="climate-controlled">Climate Controlled</SelectItem>
                      <SelectItem value="secure">Secure</SelectItem>
                      <SelectItem value="archive">Archive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input {...zoneForm.register('name', { required: true })} />
                </div>
                <div>
                  <Label htmlFor="code">Code *</Label>
                  <Input {...zoneForm.register('code', { required: true })} />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch {...zoneForm.register('temperature_controlled')} />
                <Label>Temperature Controlled</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch {...zoneForm.register('is_active')} />
                <Label>Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          )}

          {activeTab === 'shelves' && (
            <form onSubmit={shelfForm.handleSubmit(handleCreateShelf)} className="space-y-4">
              <div>
                <Label htmlFor="zone_id">Zone *</Label>
                <Select onValueChange={(value) => shelfForm.setValue('zone_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name} ({zone.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input {...shelfForm.register('name', { required: true })} />
                </div>
                <div>
                  <Label htmlFor="code">Code *</Label>
                  <Input {...shelfForm.register('code', { required: true })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="height_cm">Height (cm)</Label>
                  <Input 
                    type="number" 
                    {...shelfForm.register('height_cm', { valueAsNumber: true })} 
                  />
                </div>
                <div>
                  <Label htmlFor="width_cm">Width (cm)</Label>
                  <Input 
                    type="number" 
                    {...shelfForm.register('width_cm', { valueAsNumber: true })} 
                  />
                </div>
                <div>
                  <Label htmlFor="depth_cm">Depth (cm)</Label>
                  <Input 
                    type="number" 
                    {...shelfForm.register('depth_cm', { valueAsNumber: true })} 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="max_weight_kg">Max Weight (kg)</Label>
                <Input 
                  type="number" 
                  {...shelfForm.register('max_weight_kg', { valueAsNumber: true })} 
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch {...shelfForm.register('is_active')} />
                <Label>Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          )}

          {activeTab === 'racks' && (
            <form onSubmit={rackForm.handleSubmit(handleCreateRack)} className="space-y-4">
              <div>
                <Label htmlFor="shelf_id">Shelf *</Label>
                <Select onValueChange={(value) => rackForm.setValue('shelf_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shelf" />
                  </SelectTrigger>
                  <SelectContent>
                    {shelves.map((shelf) => (
                      <SelectItem key={shelf.id} value={shelf.id}>
                        {shelf.name} ({shelf.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input {...rackForm.register('name', { required: true })} />
                </div>
                <div>
                  <Label htmlFor="code">Code *</Label>
                  <Input {...rackForm.register('code', { required: true })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position_x">Position X</Label>
                  <Input 
                    type="number" 
                    {...rackForm.register('position_x', { valueAsNumber: true })} 
                  />
                </div>
                <div>
                  <Label htmlFor="position_y">Position Y</Label>
                  <Input 
                    type="number" 
                    {...rackForm.register('position_y', { valueAsNumber: true })} 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="capacity">Capacity *</Label>
                <Input 
                  type="number" 
                  {...rackForm.register('capacity', { required: true, valueAsNumber: true })} 
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch {...rackForm.register('is_active')} />
                <Label>Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteConfirm?.name}" and all its related data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm.type, deleteConfirm.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LocationManager;