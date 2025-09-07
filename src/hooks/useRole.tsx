import { useState, useEffect } from 'react';

export type UserRole = 'admin';

export function useRole() {
  const [role] = useState<UserRole>('admin'); // Default to admin since auth is disabled
  const [loading] = useState(false); // No loading needed since we're not fetching

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