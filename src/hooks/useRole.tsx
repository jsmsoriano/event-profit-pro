import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'owner' | 'manager' | 'staff' | 'accountant' | 'client';

export function useRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          // If no role found, default to client
          setRole('client');
        } else {
          setRole(data.role as UserRole);
        }
      } catch (error) {
        setRole('client'); // Default fallback
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const hasRole = (requiredRoles: UserRole[]) => {
    return role && requiredRoles.includes(role);
  };

  const isAdmin = () => {
    return hasRole(['owner', 'manager']);
  };

  const isStaff = () => {
    return hasRole(['owner', 'manager', 'staff']);
  };

  const canViewBilling = () => {
    return hasRole(['owner', 'manager', 'accountant']);
  };

  const canManageEvents = () => {
    return hasRole(['owner', 'manager', 'staff']);
  };

  return {
    role,
    loading,
    hasRole,
    isAdmin,
    isStaff,
    canViewBilling,
    canManageEvents
  };
}