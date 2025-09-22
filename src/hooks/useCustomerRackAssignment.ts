import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  customer_code: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  priority_level: 'high' | 'medium' | 'low';
  document_types: string[];
  auto_assignment_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerRackAssignment {
  id: string;
  customer_id: string;
  rack_id: string;
  assignment_type: 'dedicated' | 'shared' | 'overflow';
  priority_order: number;
  capacity_threshold: number;
  document_types: string[];
  is_active: boolean;
  assigned_date: string;
  notes?: string;
  // Joined data
  customer?: Customer;
  rack?: any;
  warehouse_name?: string;
  zone_name?: string;
  shelf_name?: string;
  rack_code?: string;
  rack_capacity?: number;
  rack_current_count?: number;
  rack_status?: string;
}

export interface AssignmentRule {
  id: string;
  rule_name: string;
  customer_pattern?: string;
  document_type_conditions: string[];
  file_size_min: number;
  file_size_max?: number;
  priority_level?: 'high' | 'medium' | 'low';
  preferred_rack_patterns: string[];
  fallback_rack_patterns: string[];
  capacity_threshold: number;
  order_by: 'chronological' | 'capacity' | 'priority';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerWithAssignments extends Customer {
  assignments: CustomerRackAssignment[];
  totalCapacity: number;
  totalUsed: number;
  overallUtilization: number;
  status: 'active' | 'needs_attention' | 'over_capacity';
}

export const useCustomerRackAssignment = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [assignments, setAssignments] = useState<CustomerRackAssignment[]>([]);
  const [rules, setRules] = useState<AssignmentRule[]>([]);
  const [availableRacks, setAvailableRacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all customers
  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      setCustomers((data || []) as Customer[]);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive",
      });
    }
  };

  // Fetch all rack assignments with joined data
  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_rack_assignments')
        .select(`
          *,
          customers (
            id,
            name,
            customer_code,
            priority_level
          ),
          racks (
            id,
            code,
            capacity,
            current_count,
            status,
            shelf_id,
            shelves (
              id,
              name,
              zone_id,
              zones (
                id,
                name,
                warehouse_id,
                warehouses (
                  id,
                  name
                )
              )
            )
          )
        `)
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('priority_order');

      if (error) throw error;

      const processedAssignments = (data || []).map((assignment: any) => ({
        ...assignment,
        customer: assignment.customers,
        rack: assignment.racks,
        warehouse_name: assignment.racks?.shelves?.zones?.warehouses?.name,
        zone_name: assignment.racks?.shelves?.zones?.name,
        shelf_name: assignment.racks?.shelves?.name,
        rack_code: assignment.racks?.code,
        rack_capacity: assignment.racks?.capacity,
        rack_current_count: assignment.racks?.current_count,
        rack_status: assignment.racks?.status,
      }));

      setAssignments(processedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch rack assignments",
        variant: "destructive",
      });
    }
  };

  // Fetch assignment rules
  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('assignment_rules')
        .select('*')
        .eq('user_id', user?.id)
        .order('rule_name');

      if (error) throw error;
      setRules((data || []) as AssignmentRule[]);
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  };

  // Fetch available racks (not assigned to any customer)
  const fetchAvailableRacks = async () => {
    try {
      // Get all racks
      const { data: allRacks, error: racksError } = await supabase
        .from('racks')
        .select(`
          *,
          shelves (
            id,
            name,
            zone_id,
            zones (
              id,
              name,
              warehouse_id,
              warehouses (
                id,
                name
              )
            )
          )
        `)
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (racksError) throw racksError;

      // Get assigned rack IDs
      const { data: assignedRacks, error: assignedError } = await supabase
        .from('customer_rack_assignments')
        .select('rack_id')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (assignedError) throw assignedError;

      const assignedRackIds = new Set((assignedRacks || []).map(a => a.rack_id));
      const available = (allRacks || []).filter(rack => !assignedRackIds.has(rack.id));

      setAvailableRacks(available);
    } catch (error) {
      console.error('Error fetching available racks:', error);
    }
  };

  // Create customer
  const createCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...customerData,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchCustomers();
      toast({
        title: "Success",
        description: "Customer created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: "Error",
        description: "Failed to create customer",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Assign racks to customer
  const assignRacksToCustomer = async (
    customerId: string,
    rackIds: string[],
    assignmentData: {
      assignment_type: 'dedicated' | 'shared' | 'overflow';
      capacity_threshold: number;
      document_types: string[];
      notes?: string;
    }
  ) => {
    try {
      const assignments = rackIds.map((rackId, index) => ({
        user_id: user?.id,
        customer_id: customerId,
        rack_id: rackId,
        priority_order: index + 1,
        ...assignmentData,
      }));

      const { error } = await supabase
        .from('customer_rack_assignments')
        .insert(assignments);

      if (error) throw error;

      await fetchAssignments();
      await fetchAvailableRacks();

      toast({
        title: "Success",
        description: `${rackIds.length} rack(s) assigned successfully`,
      });
    } catch (error) {
      console.error('Error assigning racks:', error);
      toast({
        title: "Error",
        description: "Failed to assign racks",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Remove rack assignment
  const removeRackAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('customer_rack_assignments')
        .update({ is_active: false })
        .eq('id', assignmentId)
        .eq('user_id', user?.id);

      if (error) throw error;

      await fetchAssignments();
      await fetchAvailableRacks();

      toast({
        title: "Success",
        description: "Rack assignment removed successfully",
      });
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast({
        title: "Error",
        description: "Failed to remove rack assignment",
        variant: "destructive",
      });
    }
  };

  // Create assignment rule
  const createAssignmentRule = async (ruleData: Omit<AssignmentRule, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('assignment_rules')
        .insert({
          ...ruleData,
          user_id: user?.id,
        });

      if (error) throw error;

      await fetchRules();
      toast({
        title: "Success",
        description: "Assignment rule created successfully",
      });
    } catch (error) {
      console.error('Error creating rule:', error);
      toast({
        title: "Error",
        description: "Failed to create assignment rule",
        variant: "destructive",
      });
    }
  };

  // Get customers with their assignment details
  const getCustomersWithAssignments = (): CustomerWithAssignments[] => {
    return customers.map(customer => {
      const customerAssignments = assignments.filter(a => a.customer_id === customer.id);
      
      const totalCapacity = customerAssignments.reduce((sum, a) => sum + (a.rack_capacity || 0), 0);
      const totalUsed = customerAssignments.reduce((sum, a) => sum + (a.rack_current_count || 0), 0);
      const overallUtilization = totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0;

      let status: 'active' | 'needs_attention' | 'over_capacity' = 'active';
      if (overallUtilization > 95) status = 'over_capacity';
      else if (overallUtilization > 85) status = 'needs_attention';

      return {
        ...customer,
        assignments: customerAssignments,
        totalCapacity,
        totalUsed,
        overallUtilization,
        status,
      };
    });
  };

  // Simulate document assignment
  const simulateDocumentAssignment = (customerId: string, documentType: string, fileSize: number) => {
    const customerAssignments = assignments.filter(a => 
      a.customer_id === customerId && 
      a.is_active &&
      (a.document_types.length === 0 || a.document_types.includes(documentType))
    ).sort((a, b) => a.priority_order - b.priority_order);

    if (customerAssignments.length === 0) {
      return {
        success: false,
        message: 'No suitable racks assigned to this customer',
        assignedRack: null,
      };
    }

    // Find first rack with available capacity
    for (const assignment of customerAssignments) {
      const utilizationPercent = assignment.rack_capacity ? 
        (assignment.rack_current_count / assignment.rack_capacity) * 100 : 0;
      
      if (utilizationPercent < assignment.capacity_threshold) {
        return {
          success: true,
          assignedRack: {
            id: assignment.rack_id,
            path: `${assignment.warehouse_name} > ${assignment.zone_name} > ${assignment.shelf_name} > ${assignment.rack_code}`,
            capacity: assignment.rack_capacity,
            currentCount: assignment.rack_current_count,
            utilizationAfter: utilizationPercent + 1, // Simulated +1 document
          },
          assignment: assignment,
          message: `Document will be assigned to ${assignment.rack_code}`,
        };
      }
    }

    return {
      success: false,
      message: 'All assigned racks are at capacity',
      assignedRack: null,
      suggestedAction: 'Assign additional racks or increase capacity thresholds',
    };
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        fetchCustomers(),
        fetchAssignments(),
        fetchRules(),
        fetchAvailableRacks()
      ]).finally(() => setLoading(false));
    }
  }, [user]);

  return {
    customers,
    assignments,
    rules,
    availableRacks,
    loading,
    customersWithAssignments: getCustomersWithAssignments(),
    // Actions
    createCustomer,
    assignRacksToCustomer,
    removeRackAssignment,
    createAssignmentRule,
    simulateDocumentAssignment,
    // Refresh functions
    refetch: async () => {
      await Promise.all([
        fetchCustomers(),
        fetchAssignments(),
        fetchRules(),
        fetchAvailableRacks()
      ]);
    },
  };
};