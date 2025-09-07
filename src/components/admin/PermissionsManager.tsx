import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users, Settings, Eye, Edit, Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRole } from '@/hooks/useRole';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface RolePermissions {
  role: string;
  permissions: string[];
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  // Events Management
  { id: 'events.view', name: 'View Events', description: 'View event listings and calendar', category: 'Events' },
  { id: 'events.create', name: 'Create Events', description: 'Create new events', category: 'Events' },
  { id: 'events.edit', name: 'Edit Events', description: 'Modify existing events', category: 'Events' },
  { id: 'events.delete', name: 'Delete Events', description: 'Remove events from system', category: 'Events' },
  
  // Menu Management
  { id: 'menu.view', name: 'View Menu', description: 'View menu items and dishes', category: 'Menu' },
  { id: 'menu.create', name: 'Create Menu Items', description: 'Add new dishes and menu items', category: 'Menu' },
  { id: 'menu.edit', name: 'Edit Menu Items', description: 'Modify menu items and pricing', category: 'Menu' },
  { id: 'menu.delete', name: 'Delete Menu Items', description: 'Remove menu items', category: 'Menu' },
  
  // Client Management
  { id: 'clients.view', name: 'View Clients', description: 'View client information', category: 'Clients' },
  { id: 'clients.create', name: 'Create Clients', description: 'Add new clients', category: 'Clients' },
  { id: 'clients.edit', name: 'Edit Clients', description: 'Modify client details', category: 'Clients' },
  { id: 'clients.delete', name: 'Delete Clients', description: 'Remove clients', category: 'Clients' },
  
  // Financial Management
  { id: 'billing.view', name: 'View Billing', description: 'View invoices and financial data', category: 'Finance' },
  { id: 'billing.create', name: 'Create Invoices', description: 'Generate invoices', category: 'Finance' },
  { id: 'billing.edit', name: 'Edit Billing', description: 'Modify billing information', category: 'Finance' },
  
  // Analytics & Reporting
  { id: 'analytics.view', name: 'View Analytics', description: 'Access reports and analytics', category: 'Analytics' },
  { id: 'analytics.export', name: 'Export Data', description: 'Export reports and data', category: 'Analytics' },
  
  // Staff Management
  { id: 'staff.view', name: 'View Staff', description: 'View staff members and assignments', category: 'Staff' },
  { id: 'staff.manage', name: 'Manage Staff', description: 'Add, edit, and remove staff', category: 'Staff' },
  
  // System Administration
  { id: 'admin.settings', name: 'System Settings', description: 'Access system configuration', category: 'Admin' },
  { id: 'admin.users', name: 'User Management', description: 'Manage user accounts and roles', category: 'Admin' },
  { id: 'admin.permissions', name: 'Permission Management', description: 'Configure role permissions', category: 'Admin' },
];

const DEFAULT_ROLE_PERMISSIONS: { [key: string]: string[] } = {
  admin: [
    'events.view', 'events.create', 'events.edit', 'events.delete',
    'menu.view', 'menu.create', 'menu.edit', 'menu.delete',
    'clients.view', 'clients.create', 'clients.edit', 'clients.delete',
    'billing.view', 'billing.create', 'billing.edit',
    'analytics.view', 'analytics.export',
    'staff.view', 'staff.manage',
    'admin.settings', 'admin.users', 'admin.permissions'
  ],
  employee: [
    'events.view', 'events.create', 'events.edit',
    'menu.view', 'menu.create', 'menu.edit',
    'clients.view', 'clients.create', 'clients.edit',
    'billing.view',
    'staff.view'
  ],
  client: [
    'events.view',
    'menu.view',
    'billing.view'
  ]
};

export function PermissionsManager() {
  const { isAdmin } = useRole();
  const [roles] = useState(['admin', 'employee', 'client']);
  const [selectedRole, setSelectedRole] = useState('admin');
  const [rolePermissions, setRolePermissions] = useState<{ [key: string]: string[] }>(DEFAULT_ROLE_PERMISSIONS);
  const [saving, setSaving] = useState(false);

  if (!isAdmin()) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-muted-foreground text-center">
            Only administrators can manage user permissions and roles.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handlePermissionToggle = (role: string, permissionId: string) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: prev[role]?.includes(permissionId)
        ? prev[role].filter(p => p !== permissionId)
        : [...(prev[role] || []), permissionId]
    }));
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would save to the database
      // For now, we'll simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Permissions updated successfully');
    } catch (error) {
      toast.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const getPermissionsByCategory = (role: string) => {
    const categories = AVAILABLE_PERMISSIONS.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as { [key: string]: Permission[] });

    return categories;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'employee': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Permission Management</CardTitle>
            </div>
            <Button onClick={handleSavePermissions} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedRole} onValueChange={setSelectedRole}>
            <TabsList className="grid w-full grid-cols-3">
              {roles.map(role => (
                <TabsTrigger key={role} value={role} className="capitalize">
                  <div className="flex items-center space-x-2">
                    <Badge className={getRoleColor(role)}>{role}</Badge>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {roles.map(role => (
              <TabsContent key={role} value={role} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold capitalize">
                    {role} Permissions
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {rolePermissions[role]?.length || 0} permissions enabled
                  </div>
                </div>

                <div className="space-y-6">
                  {Object.entries(getPermissionsByCategory(role)).map(([category, permissions]) => (
                    <Card key={category} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4">
                          {permissions.map(permission => (
                            <div key={permission.id} className="flex items-center space-x-3">
                              <Checkbox
                                id={`${role}-${permission.id}`}
                                checked={rolePermissions[role]?.includes(permission.id) || false}
                                onCheckedChange={() => handlePermissionToggle(role, permission.id)}
                              />
                              <div className="flex-1">
                                <label 
                                  htmlFor={`${role}-${permission.id}`}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {permission.name}
                                </label>
                                <p className="text-xs text-muted-foreground">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Role Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Role Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {roles.map(role => (
              <Card key={role} className="border-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getRoleColor(role)}>{role}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {rolePermissions[role]?.length || 0} permissions
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(getPermissionsByCategory(role)).map(([category, permissions]) => {
                      const enabledCount = permissions.filter(p => 
                        rolePermissions[role]?.includes(p.id)
                      ).length;
                      return (
                        <div key={category} className="flex justify-between text-xs">
                          <span>{category}</span>
                          <span className="text-muted-foreground">
                            {enabledCount}/{permissions.length}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}