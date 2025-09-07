import { useState } from 'react';
import { useRole, UserRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function RoleTest() {
  const { role, loading, isAdmin } = useRole();
  const [updating, setUpdating] = useState(false);

  const handleRoleUpdate = async () => {
    setUpdating(true);
    try {
      // Simulate role update - in a real app without auth, this would be handled differently
      toast.success(`Admin role confirmed (simulated)`);
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
        <h1 className="text-3xl font-bold">Admin Settings & Management</h1>
        <Badge variant="default">
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
              <span>Navigation Access:</span>
              <Badge variant="outline">
                Full Admin Access
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Current system status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">System Role:</label>
              <div className="p-2 bg-muted rounded">Admin</div>
            </div>
            <Button 
              onClick={handleRoleUpdate} 
              disabled={updating}
              className="w-full"
            >
              {updating ? 'Updating...' : 'Confirm Admin Access'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Role Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-primary">Administrator</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Full access to all business management features including event management, analytics, 
              staff management, menu management, billing, client management, and system settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}