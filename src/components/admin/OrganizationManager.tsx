import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Edit, Save, X, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Organization {
  id: string;
  name: string;
  tax_rate: number;
  created_at: string;
  user_count?: number;
}

export function OrganizationManager() {
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', tax_rate: 0 });

  useEffect(() => {
    if (user && isAdmin()) {
      loadOrganizations();
    }
  }, [user, isAdmin]);

  const loadOrganizations = async () => {
    try {
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (orgsError) throw orgsError;

      // Get user count for each organization
      const orgsWithUserCount = await Promise.all(
        orgsData.map(async (org) => {
          const { count } = await supabase
            .from('profiles')
            .select('id', { count: 'exact' })
            .eq('organization_id', org.id);

          return {
            ...org,
            user_count: count || 0
          };
        })
      );

      setOrganizations(orgsWithUserCount);
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (org: Organization) => {
    setEditingId(org.id);
    setEditForm({ name: org.name, tax_rate: org.tax_rate || 0 });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ name: '', tax_rate: 0 });
  };

  const saveOrganization = async (orgId: string) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: editForm.name,
          tax_rate: editForm.tax_rate,
          updated_at: new Date().toISOString()
        })
        .eq('id', orgId);

      if (error) throw error;

      toast.success('Organization updated successfully');
      setEditingId(null);
      loadOrganizations();
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error('Failed to update organization');
    }
  };

  const createOrganization = async () => {
    if (!editForm.name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('organizations')
        .insert({
          name: editForm.name,
          tax_rate: editForm.tax_rate
        });

      if (error) throw error;

      toast.success('Organization created successfully');
      setEditForm({ name: '', tax_rate: 0 });
      loadOrganizations();
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Failed to create organization');
    }
  };

  if (!isAdmin()) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-muted-foreground text-center">
            Only administrators can manage organizations.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-pulse text-center">
            <Building2 className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading organizations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Organization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Create New Organization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="new-org-name">Organization Name</Label>
              <Input
                id="new-org-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter organization name"
              />
            </div>
            <div>
              <Label htmlFor="new-org-tax">Tax Rate (%)</Label>
              <Input
                id="new-org-tax"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={editForm.tax_rate}
                onChange={(e) => setEditForm(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={createOrganization}>
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Organizations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Organizations ({organizations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {organizations.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Organizations</h3>
              <p className="text-muted-foreground">
                Create your first organization to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {organizations.map((org) => (
                <Card key={org.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    {editingId === org.id ? (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <Label>Organization Name</Label>
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Tax Rate (%)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={editForm.tax_rate}
                              onChange={(e) => setEditForm(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={cancelEditing}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          <Button size="sm" onClick={() => saveOrganization(org.id)}>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{org.name}</h3>
                            <Badge variant="outline">
                              <Users className="h-3 w-3 mr-1" />
                              {org.user_count} users
                            </Badge>
                            {org.tax_rate > 0 && (
                              <Badge variant="secondary">
                                {org.tax_rate}% tax
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Created on {new Date(org.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => startEditing(org)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}