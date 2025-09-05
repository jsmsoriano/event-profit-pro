import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'customer' | 'admin';

export function useRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user role:', error);
          setRole('customer'); // Default to customer
        } else {
          setRole(data?.role || 'customer');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('customer'); // Default to customer
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.id]);

  const hasRole = (requiredRoles: UserRole[]) => {
    return role && requiredRoles.includes(role);
  };

  const isAdmin = () => {
    return role === 'admin';
  };

  const isCustomer = () => {
    return role === 'customer';
  };

  return {
    role,
    loading,
    hasRole,
    isAdmin,
    isCustomer,
    // Additional convenience properties
    isAdminUser: role === 'admin',
    isCustomerUser: role === 'customer',
  };
}