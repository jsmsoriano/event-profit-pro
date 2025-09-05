import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export type UserRole = 'owner' | 'manager' | 'staff' | 'accountant' | 'client';

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
        // Simple fetch using vanilla fetch to avoid type issues
        const response = await fetch('/api/user-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
        
        if (response.ok) {
          const data = await response.json();
          setRole(data.role || 'client');
        } else {
          setRole('client');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        // For now, determine role based on user existence and set default
        setRole(user ? 'owner' : 'client'); // Default to owner for testing
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
    canManageEvents,
    // Additional convenience properties
    isOwner: role === 'owner',
    isManager: role === 'manager',
    isAccountant: role === 'accountant',
    isClient: role === 'client',
  };
}