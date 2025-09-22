import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'manager' | 'user' | 'viewer';

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export const useUserRoles = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [allUserRoles, setAllUserRoles] = useState<UserRoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch current user's role
  const fetchUserRole = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase.rpc('get_user_role', {
        _user_id: user.id
      });

      if (error) throw error;

      setUserRole(data);
      setIsAdmin(data === 'admin');
    } catch (error) {
      console.error('Error fetching user role:', error);
      // Default to 'user' role if no role found
      setUserRole('user');
      setIsAdmin(false);
    }
  };

  // Fetch all user roles (admin only)
  const fetchAllUserRoles = async () => {
    if (!user?.id || !isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAllUserRoles(data || []);
    } catch (error) {
      console.error('Error fetching all user roles:', error);
      toast.error('Failed to fetch user roles');
    }
  };

  // Check if user has specific role
  const hasRole = async (userId: string, role: UserRole): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: role
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  };

  // Assign role to user (admin only)
  const assignRole = async (userId: string, role: UserRole) => {
    if (!isAdmin) {
      toast.error('Insufficient permissions');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role
        });

      if (error) throw error;

      toast.success(`Role ${role} assigned successfully`);
      await fetchAllUserRoles();
      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
      return false;
    }
  };

  // Remove role from user (admin only)
  const removeRole = async (userId: string, role: UserRole) => {
    if (!isAdmin) {
      toast.error('Insufficient permissions');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      toast.success(`Role ${role} removed successfully`);
      await fetchAllUserRoles();
      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
      return false;
    }
  };

  // Check permissions
  const canManageUsers = isAdmin || userRole === 'manager';
  const canManageDocuments = isAdmin || userRole === 'manager' || userRole === 'user';
  const canViewOnly = userRole === 'viewer';

  useEffect(() => {
    if (user?.id) {
      const loadRoles = async () => {
        setLoading(true);
        await fetchUserRole();
        setLoading(false);
      };
      loadRoles();
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllUserRoles();
    }
  }, [isAdmin]);

  return {
    userRole,
    allUserRoles,
    loading,
    isAdmin,
    canManageUsers,
    canManageDocuments,
    canViewOnly,
    hasRole,
    assignRole,
    removeRole,
    refetch: fetchUserRole
  };
};