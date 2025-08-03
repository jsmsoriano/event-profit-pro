import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface LaborRole {
  id: string;
  name: string;
  payType: 'percentage' | 'fixed'; // percentage for Chef, fixed for others
  revenuePercentage?: number; // only for Chef
  gratuityPercentage?: number; // only for Chef
  fixedAmount?: number; // for other roles
}

interface AdminSettings {
  laborRevenuePercentage: number;
  laborRoles: LaborRole[];
  expenseTypes: string[];
  foodCostTypes: string[];
}

// Default role for Chef with percentage-based pay
const defaultChefRole: LaborRole = {
  id: 'chef-default',
  name: 'Chef',
  payType: 'percentage',
  revenuePercentage: 20,
  gratuityPercentage: 0, // Will be calculated automatically based on labor count
};

const defaultSettings: AdminSettings = {
  laborRevenuePercentage: 30,
  laborRoles: [defaultChefRole],
  expenseTypes: ['Equipment Rental', 'Transportation', 'Utilities', 'Insurance', 'Marketing', 'Supplies'],
  foodCostTypes: ['Proteins', 'Vegetables', 'Grains', 'Dairy', 'Beverages', 'Seasonings']
};

const Admin = () => {
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [editingFoodCost, setEditingFoodCost] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<LaborRole>({
    id: '',
    name: '',
    payType: 'fixed',
    fixedAmount: 0
  });
  const [newExpense, setNewExpense] = useState('');
  const [newFoodCost, setNewFoodCost] = useState('');
  const [isAdmin] = useState(true); // TODO: Implement actual admin check
  const { toast } = useToast();

  useEffect(() => {
    // Load settings from localStorage with migration support
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        
        // Migration: Convert old structure to new structure
        if (parsed.roles && !parsed.laborRoles) {
          console.log('Migrating old admin settings structure...');
          const migratedSettings: AdminSettings = {
            laborRevenuePercentage: parsed.laborRevenuePercentage || 30,
            laborRoles: [
              {
                id: 'chef-migrated',
                name: 'Chef',
                payType: 'percentage',
                revenuePercentage: 20
              }
            ],
            expenseTypes: parsed.expenseTypes || defaultSettings.expenseTypes,
            foodCostTypes: parsed.foodCostTypes || defaultSettings.foodCostTypes
          };
          setSettings(migratedSettings);
          // Save the migrated structure
          localStorage.setItem('adminSettings', JSON.stringify(migratedSettings));
        } else {
          // Ensure all arrays exist with fallbacks
          const safeSettings: AdminSettings = {
            laborRevenuePercentage: parsed.laborRevenuePercentage || 30,
            laborRoles: parsed.laborRoles || defaultSettings.laborRoles,
            expenseTypes: parsed.expenseTypes || defaultSettings.expenseTypes,
            foodCostTypes: parsed.foodCostTypes || defaultSettings.foodCostTypes
          };
          setSettings(safeSettings);
        }
      } catch (error) {
        console.error('Error parsing admin settings:', error);
        setSettings(defaultSettings);
      }
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Admin settings have been successfully saved.",
    });
  };

  const updateLaborPercentage = (percentage: number) => {
    setSettings(prev => ({ ...prev, laborRevenuePercentage: percentage }));
  };

  const addRole = () => {
    if (newRole.name.trim()) {
      const roleWithId: LaborRole = {
        ...newRole,
        id: Date.now().toString(),
        name: newRole.name.trim()
      };
      setSettings(prev => ({
        ...prev,
        laborRoles: [...prev.laborRoles, roleWithId]
      }));
      setNewRole({
        id: '',
        name: '',
        payType: 'fixed',
        fixedAmount: 0
      });
    }
  };

  const updateRole = (id: string, updatedRole: Partial<LaborRole>) => {
    setSettings(prev => ({
      ...prev,
      laborRoles: prev.laborRoles.map(role => 
        role.id === id ? { ...role, ...updatedRole } : role
      )
    }));
    setEditingRole(null);
  };

  const deleteRole = (roleId: string) => {
    setSettings(prev => ({
      ...prev,
      laborRoles: prev.laborRoles.filter(role => role.id !== roleId)
    }));
  };

  const addExpense = () => {
    if (newExpense.trim() && !settings.expenseTypes.includes(newExpense.trim())) {
      setSettings(prev => ({
        ...prev,
        expenseTypes: [...prev.expenseTypes, newExpense.trim()]
      }));
      setNewExpense('');
    }
  };

  const updateExpense = (oldExpense: string, newExpense: string) => {
    if (newExpense.trim()) {
      setSettings(prev => ({
        ...prev,
        expenseTypes: prev.expenseTypes.map(expense => expense === oldExpense ? newExpense.trim() : expense)
      }));
    }
  };

  const deleteExpense = (expenseToDelete: string) => {
    setSettings(prev => ({
      ...prev,
      expenseTypes: prev.expenseTypes.filter(expense => expense !== expenseToDelete)
    }));
  };

  const addFoodCost = () => {
    if (newFoodCost.trim() && !settings.foodCostTypes.includes(newFoodCost.trim())) {
      setSettings(prev => ({
        ...prev,
        foodCostTypes: [...prev.foodCostTypes, newFoodCost.trim()]
      }));
      setNewFoodCost('');
    }
  };

  const updateFoodCost = (oldFoodCost: string, newFoodCost: string) => {
    if (newFoodCost.trim() && !settings.foodCostTypes.includes(newFoodCost.trim())) {
      setSettings(prev => ({
        ...prev,
        foodCostTypes: prev.foodCostTypes.map(foodCost => foodCost === oldFoodCost ? newFoodCost.trim() : foodCost)
      }));
    }
    setEditingFoodCost(null);
  };

  const deleteFoodCost = (foodCostToDelete: string) => {
    setSettings(prev => ({
      ...prev,
      foodCostTypes: prev.foodCostTypes.filter(foodCost => foodCost !== foodCostToDelete)
    }));
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-card-foreground">Admin Settings</h1>
          </div>
          <Button onClick={saveSettings} className="btn-primary">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>

        <Tabs defaultValue="roles" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roles">Labor Roles & Pay</TabsTrigger>
            <TabsTrigger value="expenses">Expense Types</TabsTrigger>
            <TabsTrigger value="food">Food Cost Types</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4 mt-4">
            {/* Labor Settings */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Labor Budget Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-md">
                  <Label htmlFor="laborPercentage" className="text-card-foreground font-medium">
                    Maximum Labor Cost (% of Revenue)
                  </Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Input
                      id="laborPercentage"
                      type="number"
                      value={settings.laborRevenuePercentage}
                      onChange={(e) => updateLaborPercentage(parseFloat(e.target.value) || 0)}
                      className="input-modern"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    This sets the maximum percentage of total revenue that can be allocated to labor costs. 
                    Gratuity will be split among labor roles based on this percentage.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Labor Roles Management */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Manage Labor Roles & Pay Allocation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-border/20 rounded-lg overflow-hidden">
                  <div className="bg-muted/50 border-b border-border/20 p-3 grid grid-cols-12 gap-3 font-semibold text-sm text-muted-foreground">
                    <div className="col-span-3">Role Name</div>
                    <div className="col-span-2">Pay Type</div>
                    <div className="col-span-3">Revenue %</div>
                    <div className="col-span-2">Fixed Amount</div>
                    {isAdmin && <div className="col-span-2 text-center">Actions</div>}
                  </div>
                  {(settings.laborRoles || []).map((role, index) => (
                    <div key={role.id} className={`grid grid-cols-12 gap-3 p-3 items-center ${index !== settings.laborRoles.length - 1 ? 'border-b border-border/10' : ''}`}>
                      {editingRole === role.id ? (
                        <>
                          <div className="col-span-3">
                            <Input
                              value={role.name}
                              onChange={(e) => updateRole(role.id, { name: e.target.value })}
                              className="input-modern"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') setEditingRole(null);
                                if (e.key === 'Escape') setEditingRole(null);
                              }}
                            />
                          </div>
                          <div className="col-span-2">
                            <Select 
                              value={role.payType} 
                              onValueChange={(value: 'percentage' | 'fixed') => 
                                updateRole(role.id, { payType: value })
                              }
                            >
                              <SelectTrigger className="input-modern">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-3">
                            {role.payType === 'percentage' ? (
                              <Input
                                type="number"
                                value={role.revenuePercentage || 0}
                                onChange={(e) => updateRole(role.id, { revenuePercentage: parseFloat(e.target.value) || 0 })}
                                className="input-modern"
                                min="0"
                                max="100"
                                step="0.1"
                                placeholder="% of revenue"
                              />
                            ) : (
                              <span className="text-muted-foreground text-sm">N/A</span>
                            )}
                          </div>
                          <div className="col-span-2">
                            {role.payType === 'fixed' ? (
                              <Input
                                type="number"
                                value={role.fixedAmount || 0}
                                onChange={(e) => updateRole(role.id, { fixedAmount: parseFloat(e.target.value) || 0 })}
                                className="input-modern"
                                min="0"
                                step="0.01"
                                placeholder="Dollar amount"
                              />
                            ) : (
                              <span className="text-muted-foreground text-sm">N/A</span>
                            )}
                          </div>
                          {isAdmin && (
                            <div className="col-span-2 flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingRole(null)}
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingRole(null)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="col-span-3 font-medium text-card-foreground">
                            {role.name}
                            {role.name === 'Chef' && (
                              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">Auto-calculated</span>
                            )}
                          </div>
                          <div className="col-span-2 text-sm text-muted-foreground">
                            {role.payType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                          </div>
                          <div className="col-span-3 text-sm">
                            {role.payType === 'percentage' ? (
                              <span className="font-medium">{role.revenuePercentage}% + gratuity split</span>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </div>
                          <div className="col-span-2 text-sm">
                            {role.payType === 'fixed' ? (
                              <span className="font-medium">${role.fixedAmount}</span>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </div>
                          {isAdmin && (
                            <div className="col-span-2 flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingRole(role.id)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteRole(role.id)}
                                disabled={role.name === 'Chef'} // Prevent deleting Chef
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  <div className="border-t border-border/20 bg-muted/30 p-3">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-3">
                        <Input
                          value={newRole.name}
                          onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Role name"
                          className="input-modern"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addRole();
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <Select 
                          value={newRole.payType} 
                          onValueChange={(value: 'percentage' | 'fixed') => 
                            setNewRole(prev => ({ ...prev, payType: value }))
                          }
                        >
                          <SelectTrigger className="input-modern">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        {newRole.payType === 'percentage' && (
                          <Input
                            type="number"
                            value={newRole.revenuePercentage || ''}
                            onChange={(e) => setNewRole(prev => ({ ...prev, revenuePercentage: parseFloat(e.target.value) || 0 }))}
                            placeholder="% of revenue"
                            className="input-modern"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        )}
                      </div>
                      <div className="col-span-2">
                        {newRole.payType === 'fixed' && (
                          <Input
                            type="number"
                            value={newRole.fixedAmount || ''}
                            onChange={(e) => setNewRole(prev => ({ ...prev, fixedAmount: parseFloat(e.target.value) || 0 }))}
                            placeholder="Dollar amount"
                            className="input-modern"
                            min="0"
                            step="0.01"
                          />
                        )}
                      </div>
                      <div className="col-span-2">
                        <Button onClick={addRole} className="btn-primary w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Role
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4 mt-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Manage Expense Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-border/20 rounded-lg overflow-hidden">
                  <div className="bg-muted/50 border-b border-border/20 p-3 grid grid-cols-12 gap-3 font-semibold text-sm text-muted-foreground">
                    <div className="col-span-8">Expense Type</div>
                    {isAdmin && <div className="col-span-4 text-center">Actions</div>}
                  </div>
                  {(settings.expenseTypes || []).map((expense, index) => (
                    <div key={expense} className={`grid grid-cols-12 gap-3 p-3 items-center ${index !== settings.expenseTypes.length - 1 ? 'border-b border-border/10' : ''}`}>
                      {editingExpense === expense ? (
                        <>
                          <div className="col-span-8">
                            <Input
                              value={editingExpense === expense ? expense : expense}
                              onChange={(e) => {
                                setSettings(prev => ({
                                  ...prev,
                                  expenseTypes: prev.expenseTypes.map(exp => exp === expense ? e.target.value : exp)
                                }));
                              }}
                              className="input-modern"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateExpense(expense, e.currentTarget.value);
                                  setEditingExpense(null);
                                }
                                if (e.key === 'Escape') setEditingExpense(null);
                              }}
                            />
                          </div>
                          <div className="col-span-4 flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                updateExpense(expense, expense);
                                setEditingExpense(null);
                              }}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingExpense(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={`${isAdmin ? 'col-span-8' : 'col-span-12'} font-medium text-card-foreground`}>{expense}</div>
                          {isAdmin && (
                            <div className="col-span-4 flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingExpense(expense)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteExpense(expense)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  <div className="border-t border-border/20 bg-muted/30 p-3">
                    <div className="flex gap-2">
                      <Input
                        value={newExpense}
                        onChange={(e) => setNewExpense(e.target.value)}
                        placeholder="Enter new expense type"
                        className="input-modern"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addExpense();
                        }}
                      />
                      <Button onClick={addExpense} className="btn-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Expense
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="food" className="space-y-4 mt-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Manage Food Cost Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-border/20 rounded-lg overflow-hidden">
                  <div className="bg-muted/50 border-b border-border/20 p-3 grid grid-cols-12 gap-3 font-semibold text-sm text-muted-foreground">
                    <div className="col-span-8">Food Cost Type</div>
                    {isAdmin && <div className="col-span-4 text-center">Actions</div>}
                  </div>
                  {(settings.foodCostTypes || []).map((foodCost, index) => (
                    <div key={foodCost} className={`grid grid-cols-12 gap-3 p-3 items-center ${index !== settings.foodCostTypes.length - 1 ? 'border-b border-border/10' : ''}`}>
                      {editingFoodCost === foodCost ? (
                        <>
                          <div className="col-span-8">
                            <Input
                              value={foodCost}
                              onChange={(e) => updateFoodCost(foodCost, e.target.value)}
                              className="input-modern"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') updateFoodCost(foodCost, e.currentTarget.value);
                                if (e.key === 'Escape') setEditingFoodCost(null);
                              }}
                            />
                          </div>
                          <div className="col-span-4 flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateFoodCost(foodCost, foodCost)}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingFoodCost(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={`${isAdmin ? 'col-span-8' : 'col-span-12'} font-medium text-card-foreground`}>{foodCost}</div>
                          {isAdmin && (
                            <div className="col-span-4 flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingFoodCost(foodCost)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteFoodCost(foodCost)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  <div className="border-t border-border/20 bg-muted/30 p-3">
                    <div className="flex gap-2">
                      <Input
                        value={newFoodCost}
                        onChange={(e) => setNewFoodCost(e.target.value)}
                        placeholder="Enter new food cost type"
                        className="input-modern"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addFoodCost();
                        }}
                      />
                      <Button onClick={addFoodCost} className="btn-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Food Cost
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;