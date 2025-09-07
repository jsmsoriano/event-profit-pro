import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'customer' | null;

export function useRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
        } else {
          setRole(profile?.role || null);
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setRole(null);
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
    return role === 'admin';
  };

  return {
    role,
    loading,
    hasRole,
    isAdmin,
    // Additional convenience properties
    isAdminUser: role === 'admin',
  };
}