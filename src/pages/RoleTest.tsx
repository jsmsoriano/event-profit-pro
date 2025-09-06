import { useState } from 'react';
import { useRole, UserRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function RoleTest() {
  const { role, loading, isAdmin, isCustomer } = useRole();
  const [testRole, setTestRole] = useState<UserRole>('customer');
  const [updating, setUpdating] = useState(false);

  const handleRoleUpdate = async () => {
    setUpdating(true);
    try {
      // Simulate role update - in a real app without auth, this would be handled differently
      toast.success(`Role updated to ${testRole} (simulated)`);
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
        <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
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
              <span>Is Customer:</span>
              <Badge variant={isCustomer() ? 'default' : 'secondary'}>
                {isCustomer() ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Navigation Access:</span>
              <Badge variant="outline">
                {role === 'customer' ? 'Menu, Book Event, Support' : 'Full Admin Access'}
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
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-blue-600">Customer</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Can view menu, book events, and access support. Limited to customer-facing features only.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-red-600">Admin</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Full access to all features including event management, analytics, staff management, inventory, and system settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}