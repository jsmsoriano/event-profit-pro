import { useState, useEffect } from 'react';

export type UserRole = 'customer' | 'admin';

export function useRole() {
  const [role] = useState<UserRole>('admin'); // Default to admin since auth is disabled
  const [loading] = useState(false);

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