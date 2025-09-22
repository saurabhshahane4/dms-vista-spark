-- Create warehouse location hierarchy tables
CREATE TABLE public.warehouses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  address text,
  phone text,
  email text,
  manager_name text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, code)
);

CREATE TABLE public.zones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  zone_type text DEFAULT 'standard',
  temperature_controlled boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(warehouse_id, code)
);

CREATE TABLE public.shelves (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  zone_id uuid NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  height_cm integer,
  width_cm integer,
  depth_cm integer,
  max_weight_kg integer,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(zone_id, code)
);

CREATE TABLE public.racks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  shelf_id uuid NOT NULL REFERENCES public.shelves(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  position_x integer DEFAULT 0,
  position_y integer DEFAULT 0,
  barcode text,
  capacity integer DEFAULT 10,
  current_count integer DEFAULT 0,
  status text DEFAULT 'empty' CHECK (status IN ('empty', 'partial', 'full', 'over-capacity')),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(shelf_id, code)
);

-- Create indexes for performance
CREATE INDEX idx_zones_warehouse_id ON public.zones(warehouse_id);
CREATE INDEX idx_shelves_zone_id ON public.shelves(zone_id);
CREATE INDEX idx_racks_shelf_id ON public.racks(shelf_id);
CREATE INDEX idx_racks_barcode ON public.racks(barcode) WHERE barcode IS NOT NULL;

-- Create document location assignments table
CREATE TABLE public.document_locations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  rack_id uuid NOT NULL REFERENCES public.racks(id) ON DELETE CASCADE,
  assigned_at timestamp with time zone DEFAULT now(),
  assigned_by uuid,
  notes text,
  UNIQUE(document_id, rack_id)
);

-- Create location history for audit trail
CREATE TABLE public.location_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  document_id uuid NOT NULL,
  from_rack_id uuid REFERENCES public.racks(id),
  to_rack_id uuid REFERENCES public.racks(id),
  moved_at timestamp with time zone DEFAULT now(),
  moved_by uuid,
  reason text,
  notes text
);

-- Enable RLS on all tables
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.racks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own warehouses" ON public.warehouses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own zones" ON public.zones
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own shelves" ON public.shelves
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own racks" ON public.racks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own document locations" ON public.document_locations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own location history" ON public.location_history
  FOR ALL USING (auth.uid() = user_id);

-- Create function to update rack status based on document count
CREATE OR REPLACE FUNCTION public.update_rack_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current_count and status for the affected rack
  UPDATE public.racks SET
    current_count = (
      SELECT COUNT(*) FROM public.document_locations 
      WHERE rack_id = COALESCE(NEW.rack_id, OLD.rack_id)
    ),
    status = CASE
      WHEN (SELECT COUNT(*) FROM public.document_locations WHERE rack_id = COALESCE(NEW.rack_id, OLD.rack_id)) = 0 THEN 'empty'
      WHEN (SELECT COUNT(*) FROM public.document_locations WHERE rack_id = COALESCE(NEW.rack_id, OLD.rack_id)) >= capacity THEN 
        CASE WHEN (SELECT COUNT(*) FROM public.document_locations WHERE rack_id = COALESCE(NEW.rack_id, OLD.rack_id)) > capacity THEN 'over-capacity' ELSE 'full' END
      ELSE 'partial'
    END
  WHERE id = COALESCE(NEW.rack_id, OLD.rack_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for rack status updates
CREATE TRIGGER update_rack_status_on_insert
  AFTER INSERT ON public.document_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_rack_status();

CREATE TRIGGER update_rack_status_on_delete
  AFTER DELETE ON public.document_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_rack_status();

-- Create function to generate barcodes automatically
CREATE OR REPLACE FUNCTION public.generate_rack_barcode()
RETURNS TRIGGER AS $$
DECLARE
  warehouse_code text;
  zone_code text;
  shelf_code text;
BEGIN
  -- Get the full hierarchy codes to generate barcode
  SELECT w.code, z.code, s.code INTO warehouse_code, zone_code, shelf_code
  FROM public.shelves s
  JOIN public.zones z ON s.zone_id = z.id
  JOIN public.warehouses w ON z.warehouse_id = w.id
  WHERE s.id = NEW.shelf_id;
  
  -- Generate barcode if not provided
  IF NEW.barcode IS NULL THEN
    NEW.barcode := warehouse_code || '-' || zone_code || '-' || shelf_code || '-' || NEW.code;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic barcode generation
CREATE TRIGGER generate_rack_barcode_trigger
  BEFORE INSERT ON public.racks
  FOR EACH ROW EXECUTE FUNCTION public.generate_rack_barcode();

-- Add updated_at triggers
CREATE TRIGGER update_warehouses_updated_at
  BEFORE UPDATE ON public.warehouses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_zones_updated_at
  BEFORE UPDATE ON public.zones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shelves_updated_at
  BEFORE UPDATE ON public.shelves
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_racks_updated_at
  BEFORE UPDATE ON public.racks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();