import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Zone {
  id: string;
  warehouse_id: string;
  name: string;
  code: string;
  zone_type: string;
  temperature_controlled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Shelf {
  id: string;
  zone_id: string;
  name: string;
  code: string;
  height_cm?: number;
  width_cm?: number;
  depth_cm?: number;
  max_weight_kg?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Rack {
  id: string;
  shelf_id: string;
  name: string;
  code: string;
  position_x: number;
  position_y: number;
  barcode?: string;
  capacity: number;
  current_count: number;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentLocation {
  id: string;
  document_id: string;
  rack_id: string;
  assigned_at: string;
  assigned_by?: string;
  notes?: string;
}

export interface LocationHistory {
  id: string;
  document_id: string;
  from_rack_id?: string;
  to_rack_id?: string;
  moved_at: string;
  moved_by?: string;
  reason?: string;
  notes?: string;
}

export interface WarehouseHierarchy {
  id: string;
  name: string;
  code: string;
  zones: (Zone & {
    shelves: (Shelf & {
      racks: Rack[];
    })[];
  })[];
}

export const useWarehouse = () => {
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [documentLocations, setDocumentLocations] = useState<DocumentLocation[]>([]);
  const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all warehouses
  const fetchWarehouses = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setWarehouses(data || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch warehouses",
        variant: "destructive",
      });
    }
  }, [user]);

  // Fetch zones
  const fetchZones = useCallback(async (warehouseId?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('zones')
        .select('*')
        .eq('user_id', user.id);

      if (warehouseId) {
        query = query.eq('warehouse_id', warehouseId);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      setZones(data || []);
    } catch (error) {
      console.error('Error fetching zones:', error);
      toast({
        title: "Error",
        description: "Failed to fetch zones",
        variant: "destructive",
      });
    }
  }, [user]);

  // Fetch shelves
  const fetchShelves = useCallback(async (zoneId?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('shelves')
        .select('*')
        .eq('user_id', user.id);

      if (zoneId) {
        query = query.eq('zone_id', zoneId);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      setShelves(data || []);
    } catch (error) {
      console.error('Error fetching shelves:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shelves",
        variant: "destructive",
      });
    }
  }, [user]);

  // Fetch racks
  const fetchRacks = useCallback(async (shelfId?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('racks')
        .select('*')
        .eq('user_id', user.id);

      if (shelfId) {
        query = query.eq('shelf_id', shelfId);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      setRacks(data || []);
    } catch (error) {
      console.error('Error fetching racks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch racks",
        variant: "destructive",
      });
    }
  }, [user]);

  // Get full hierarchy for a warehouse
  const getWarehouseHierarchy = useCallback(async (warehouseId: string): Promise<WarehouseHierarchy | null> => {
    if (!user) return null;

    try {
      const { data: warehouseData, error: warehouseError } = await supabase
        .from('warehouses')
        .select(`
          *,
          zones:zones(
            *,
            shelves:shelves(
              *,
              racks:racks(*)
            )
          )
        `)
        .eq('id', warehouseId)
        .eq('user_id', user.id)
        .single();

      if (warehouseError) throw warehouseError;
      
      return {
        id: warehouseData.id,
        name: warehouseData.name,
        code: warehouseData.code,
        zones: warehouseData.zones || [],
      } as WarehouseHierarchy;
    } catch (error) {
      console.error('Error fetching warehouse hierarchy:', error);
      toast({
        title: "Error",
        description: "Failed to fetch warehouse hierarchy",
        variant: "destructive",
      });
      return null;
    }
  }, [user]);

  // Warehouse CRUD operations
  const createWarehouse = useCallback(async (warehouse: Omit<Warehouse, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('warehouses')
        .insert({ ...warehouse, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Warehouse created successfully",
      });

      await fetchWarehouses();
      return data;
    } catch (error) {
      console.error('Error creating warehouse:', error);
      toast({
        title: "Error",
        description: "Failed to create warehouse",
        variant: "destructive",
      });
      return null;
    }
  }, [user, fetchWarehouses]);

  const updateWarehouse = useCallback(async (id: string, updates: Partial<Warehouse>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('warehouses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Warehouse updated successfully",
      });

      await fetchWarehouses();
      return data;
    } catch (error) {
      console.error('Error updating warehouse:', error);
      toast({
        title: "Error",
        description: "Failed to update warehouse",
        variant: "destructive",
      });
      return null;
    }
  }, [user, fetchWarehouses]);

  const deleteWarehouse = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Warehouse deleted successfully",
      });

      await fetchWarehouses();
      return true;
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      toast({
        title: "Error",
        description: "Failed to delete warehouse",
        variant: "destructive",
      });
      return false;
    }
  }, [user, fetchWarehouses]);

  // Zone CRUD operations
  const createZone = useCallback(async (zone: Omit<Zone, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('zones')
        .insert({ ...zone, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Zone created successfully",
      });

      await fetchZones();
      return data;
    } catch (error) {
      console.error('Error creating zone:', error);
      toast({
        title: "Error",
        description: "Failed to create zone",
        variant: "destructive",
      });
      return null;
    }
  }, [user, fetchZones]);

  const updateZone = useCallback(async (id: string, updates: Partial<Zone>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('zones')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Zone updated successfully",
      });

      await fetchZones();
      return data;
    } catch (error) {
      console.error('Error updating zone:', error);
      toast({
        title: "Error",
        description: "Failed to update zone",
        variant: "destructive",
      });
      return null;
    }
  }, [user, fetchZones]);

  const deleteZone = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('zones')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Zone deleted successfully",
      });

      await fetchZones();
      return true;
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast({
        title: "Error",
        description: "Failed to delete zone",
        variant: "destructive",
      });
      return false;
    }
  }, [user, fetchZones]);

  // Shelf CRUD operations
  const createShelf = useCallback(async (shelfData: Omit<Shelf, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('shelves')
        .insert({ ...shelfData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shelf created successfully",
      });

      await fetchShelves();
      return data;
    } catch (error) {
      console.error('Error creating shelf:', error);
      toast({
        title: "Error",
        description: "Failed to create shelf",
        variant: "destructive",
      });
      return null;
    }
  }, [user, fetchShelves]);

  const updateShelf = useCallback(async (id: string, updates: Partial<Shelf>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('shelves')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shelf updated successfully",
      });

      await fetchShelves();
      return data;
    } catch (error) {
      console.error('Error updating shelf:', error);
      toast({
        title: "Error",
        description: "Failed to update shelf",
        variant: "destructive",
      });
      return null;
    }
  }, [user, fetchShelves]);

  const deleteShelf = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('shelves')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shelf deleted successfully",
      });

      await fetchShelves();
      return true;
    } catch (error) {
      console.error('Error deleting shelf:', error);
      toast({
        title: "Error",
        description: "Failed to delete shelf",
        variant: "destructive",
      });
      return false;
    }
  }, [user, fetchShelves]);

  // Rack CRUD operations
  const createRack = useCallback(async (rackData: Omit<Rack, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('racks')
        .insert({ ...rackData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rack created successfully",
      });

      await fetchRacks();
      return data;
    } catch (error) {
      console.error('Error creating rack:', error);
      toast({
        title: "Error",
        description: "Failed to create rack",
        variant: "destructive",
      });
      return null;
    }
  }, [user, fetchRacks]);

  const updateRack = useCallback(async (id: string, updates: Partial<Rack>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('racks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rack updated successfully",
      });

      await fetchRacks();
      return data;
    } catch (error) {
      console.error('Error updating rack:', error);
      toast({
        title: "Error",
        description: "Failed to update rack",
        variant: "destructive",
      });
      return null;
    }
  }, [user, fetchRacks]);

  const deleteRack = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('racks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rack deleted successfully",
      });

      await fetchRacks();
      return true;
    } catch (error) {
      console.error('Error deleting rack:', error);
      toast({
        title: "Error",
        description: "Failed to delete rack",
        variant: "destructive",
      });
      return false;
    }
  }, [user, fetchRacks]);

  // Fetch location history
  const fetchLocationHistory = useCallback(async (documentId?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('location_history')
        .select(`
          *,
          documents(name),
          from_racks:from_rack_id(code, barcode, name),
          to_racks:to_rack_id(code, barcode, name)
        `)
        .eq('user_id', user.id);

      if (documentId) {
        query = query.eq('document_id', documentId);
      }

      const { data, error } = await query
        .order('moved_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLocationHistory(data || []);
    } catch (error) {
      console.error('Error fetching location history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch location history",
        variant: "destructive",
      });
    }
  }, [user]);

  // Create location history entry
  const createLocationHistory = useCallback(async (
    documentId: string, 
    fromRackId: string | null, 
    toRackId: string | null, 
    reason?: string, 
    notes?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('location_history')
        .insert({
          user_id: user.id,
          document_id: documentId,
          from_rack_id: fromRackId,
          to_rack_id: toRackId,
          moved_by: user.id,
          reason,
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchLocationHistory();
      return data;
    } catch (error) {
      console.error('Error creating location history:', error);
      toast({
        title: "Error",
        description: "Failed to create location history entry",
        variant: "destructive",
      });
      return null;
    }
  }, [user, fetchLocationHistory]);

  // Document location management
  const assignDocumentToRack = useCallback(async (documentId: string, rackId: string, notes?: string) => {
    if (!user) return null;

    try {
      // Check if document is already assigned somewhere
      const { data: existingLocation } = await supabase
        .from('document_locations')
        .select('rack_id')
        .eq('document_id', documentId)
        .eq('user_id', user.id)
        .single();

      const { data, error } = await supabase
        .from('document_locations')
        .upsert({
          user_id: user.id,
          document_id: documentId,
          rack_id: rackId,
          assigned_by: user.id,
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      // Create location history entry
      await createLocationHistory(
        documentId,
        existingLocation?.rack_id || null,
        rackId,
        existingLocation ? 'moved' : 'assigned',
        notes
      );

      toast({
        title: "Success",
        description: "Document assigned to rack successfully",
      });

      return data;
    } catch (error) {
      console.error('Error assigning document to rack:', error);
      toast({
        title: "Error",
        description: "Failed to assign document to rack",
        variant: "destructive",
      });
      return null;
    }
  }, [user, createLocationHistory]);

  // Move document between racks
  const moveDocumentToRack = useCallback(async (documentId: string, fromRackId: string, toRackId: string, reason?: string, notes?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('document_locations')
        .update({
          rack_id: toRackId,
          notes,
        })
        .eq('document_id', documentId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Create location history entry
      await createLocationHistory(documentId, fromRackId, toRackId, reason, notes);

      toast({
        title: "Success",
        description: "Document moved successfully",
      });

      return data;
    } catch (error) {
      console.error('Error moving document:', error);
      toast({
        title: "Error",
        description: "Failed to move document",
        variant: "destructive",
      });
      return null;
    }
  }, [user, createLocationHistory]);

  // Fetch document locations
  const fetchDocumentLocations = useCallback(async (rackId?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('document_locations')
        .select(`
          *,
          documents(name, file_path),
          racks(code, barcode, name)
        `)
        .eq('user_id', user.id);

      if (rackId) {
        query = query.eq('rack_id', rackId);
      }

      const { data, error } = await query.order('assigned_at', { ascending: false });

      if (error) throw error;
      setDocumentLocations(data || []);
    } catch (error) {
      console.error('Error fetching document locations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch document locations",
        variant: "destructive",
      });
    }
  }, [user]);

  // Initialize data
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        fetchWarehouses(),
        fetchZones(),
        fetchShelves(),
        fetchRacks(),
        fetchDocumentLocations(),
        fetchLocationHistory(),
      ]).finally(() => setLoading(false));
    }
  }, [user, fetchWarehouses, fetchZones, fetchShelves, fetchRacks, fetchDocumentLocations, fetchLocationHistory]);

  return {
    // Data
    warehouses,
    zones,
    shelves,
    racks,
    documentLocations,
    locationHistory,
    loading,
    
    // Fetch functions
    fetchWarehouses,
    fetchZones,
    fetchShelves,
    fetchRacks,
    fetchDocumentLocations,
    fetchLocationHistory,
    getWarehouseHierarchy,
    
    // CRUD operations
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
    
    // Document location management
    assignDocumentToRack,
    moveDocumentToRack,
    createLocationHistory,
  };
};