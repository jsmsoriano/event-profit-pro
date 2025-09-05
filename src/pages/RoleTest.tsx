import { useState } from 'react';
import { useRole, UserRole } from '@/hooks/useRole';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function RoleTest() {
  const { role, loading, isAdmin, isStaff, canViewBilling, canManageEvents } = useRole();
  const { user } = useAuth();
  const [testRole, setTestRole] = useState<UserRole>('client');
  const [updating, setUpdating] = useState(false);

  const handleRoleUpdate = async () => {
    if (!user?.id) return;
    
    setUpdating(true);
    try {
      // Insert or update user role
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: testRole,
          is_active: true
        }, {
          onConflict: 'user_id,role'
        });

      if (error) throw error;

      toast.success(`Role updated to ${testRole}`);
      // Refresh the page to see changes
      window.location.reload();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading role information...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Role Testing & Management</h1>
        <Badge variant={role === 'owner' ? 'default' : 'secondary'}>
          Current Role: {role || 'None'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Permissions</CardTitle>
            <CardDescription>Based on your current role: {role}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Is Admin:</span>
              <Badge variant={isAdmin() ? 'default' : 'secondary'}>
                {isAdmin() ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Is Staff:</span>
              <Badge variant={isStaff() ? 'default' : 'secondary'}>
                {isStaff() ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Can View Billing:</span>
              <Badge variant={canViewBilling() ? 'default' : 'secondary'}>
                {canViewBilling() ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Can Manage Events:</span>
              <Badge variant={canManageEvents() ? 'default' : 'secondary'}>
                {canManageEvents() ? 'Yes' : 'No'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>Test different roles (for development)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Role:</label>
              <Select value={testRole} onValueChange={(value: UserRole) => setTestRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleRoleUpdate} 
              disabled={updating}
              className="w-full"
            >
              {updating ? 'Updating...' : `Set Role to ${testRole}`}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Descriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-blue-600">Client</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Can book events, view menu, manage their own events
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-green-600">Staff</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Can manage events, view client data, handle day-to-day operations
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-purple-600">Accountant</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Can view billing, financial reports, manage payments
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-orange-600">Manager</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Full access except owner settings, can manage staff and operations
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-red-600">Owner</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Complete access to all features including system settings
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}