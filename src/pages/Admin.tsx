import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface AdminSettings {
  laborRevenuePercentage: number;
  roles: string[];
  expenseTypes: string[];
  foodCostTypes: string[];
}

const defaultSettings: AdminSettings = {
  laborRevenuePercentage: 30,
  roles: ['Chef', 'Sous Chef', 'Line Cook', 'Server', 'Bartender', 'Manager'],
  expenseTypes: ['Equipment Rental', 'Transportation', 'Utilities', 'Insurance', 'Marketing', 'Supplies'],
  foodCostTypes: ['Proteins', 'Vegetables', 'Grains', 'Dairy', 'Beverages', 'Seasonings']
};

const Admin = () => {
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [editingFoodCost, setEditingFoodCost] = useState<string | null>(null);
  const [newRole, setNewRole] = useState('');
  const [newExpense, setNewExpense] = useState('');
  const [newFoodCost, setNewFoodCost] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
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
    if (newRole.trim() && !settings.roles.includes(newRole.trim())) {
      setSettings(prev => ({
        ...prev,
        roles: [...prev.roles, newRole.trim()]
      }));
      setNewRole('');
    }
  };

  const updateRole = (oldRole: string, newRole: string) => {
    if (newRole.trim() && !settings.roles.includes(newRole.trim())) {
      setSettings(prev => ({
        ...prev,
        roles: prev.roles.map(role => role === oldRole ? newRole.trim() : role)
      }));
    }
    setEditingRole(null);
  };

  const deleteRole = (roleToDelete: string) => {
    setSettings(prev => ({
      ...prev,
      roles: prev.roles.filter(role => role !== roleToDelete)
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
    if (newExpense.trim() && !settings.expenseTypes.includes(newExpense.trim())) {
      setSettings(prev => ({
        ...prev,
        expenseTypes: prev.expenseTypes.map(expense => expense === oldExpense ? newExpense.trim() : expense)
      }));
    }
    setEditingExpense(null);
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

        <Tabs defaultValue="labor" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="labor">Labor Settings</TabsTrigger>
            <TabsTrigger value="roles">Role Types</TabsTrigger>
            <TabsTrigger value="expenses">Expense Types</TabsTrigger>
            <TabsTrigger value="food">Food Cost Types</TabsTrigger>
          </TabsList>

          <TabsContent value="labor" className="space-y-4 mt-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Labor Revenue Percentage</CardTitle>
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
          </TabsContent>

          <TabsContent value="roles" className="space-y-4 mt-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Manage Role Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-border/20 rounded-lg overflow-hidden">
                  <div className="bg-muted/50 border-b border-border/20 p-3 grid grid-cols-12 gap-3 font-semibold text-sm text-muted-foreground">
                    <div className="col-span-8">Role Name</div>
                    <div className="col-span-4 text-center">Actions</div>
                  </div>
                  {settings.roles.map((role, index) => (
                    <div key={role} className={`grid grid-cols-12 gap-3 p-3 items-center ${index !== settings.roles.length - 1 ? 'border-b border-border/10' : ''}`}>
                      {editingRole === role ? (
                        <>
                          <div className="col-span-8">
                            <Input
                              value={role}
                              onChange={(e) => updateRole(role, e.target.value)}
                              className="input-modern"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') updateRole(role, e.currentTarget.value);
                                if (e.key === 'Escape') setEditingRole(null);
                              }}
                            />
                          </div>
                          <div className="col-span-4 flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateRole(role, role)}
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
                        </>
                      ) : (
                        <>
                          <div className="col-span-8 font-medium text-card-foreground">{role}</div>
                          <div className="col-span-4 flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingRole(role)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteRole(role)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <div className="border-t border-border/20 bg-muted/30 p-3">
                    <div className="flex gap-2">
                      <Input
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="Enter new role name"
                        className="input-modern"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addRole();
                        }}
                      />
                      <Button onClick={addRole} className="btn-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Role
                      </Button>
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
                    <div className="col-span-4 text-center">Actions</div>
                  </div>
                  {settings.expenseTypes.map((expense, index) => (
                    <div key={expense} className={`grid grid-cols-12 gap-3 p-3 items-center ${index !== settings.expenseTypes.length - 1 ? 'border-b border-border/10' : ''}`}>
                      {editingExpense === expense ? (
                        <>
                          <div className="col-span-8">
                            <Input
                              value={expense}
                              onChange={(e) => updateExpense(expense, e.target.value)}
                              className="input-modern"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') updateExpense(expense, e.currentTarget.value);
                                if (e.key === 'Escape') setEditingExpense(null);
                              }}
                            />
                          </div>
                          <div className="col-span-4 flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateExpense(expense, expense)}
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
                          <div className="col-span-8 font-medium text-card-foreground">{expense}</div>
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
                    <div className="col-span-4 text-center">Actions</div>
                  </div>
                  {settings.foodCostTypes.map((foodCost, index) => (
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
                          <div className="col-span-8 font-medium text-card-foreground">{foodCost}</div>
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