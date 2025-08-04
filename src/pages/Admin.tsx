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
  laborPercentage: number; // percentage of labor budget for this role
}

interface BudgetProfile {
  id: string;
  name: string;
  laborPercent: number;
  foodPercent: number;
  taxesPercent: number;
  profitPercent: number;
}

interface AdminSettings {
  laborRevenuePercentage: number;
  laborRoles: LaborRole[];
  expenseTypes: string[];
  foodCostTypes: string[];
  budgetProfiles: BudgetProfile[];
}

// Default roles for labor allocation
const defaultChefRole: LaborRole = {
  id: 'chef-default',
  name: 'Chef',
  laborPercentage: 60,
};

const defaultAssistantRole: LaborRole = {
  id: 'assistant-default',
  name: 'Assistant',
  laborPercentage: 40,
};

const defaultBudgetProfiles: BudgetProfile[] = [
  {
    id: 'cash-only',
    name: 'Cash Only',
    laborPercent: 55,
    foodPercent: 35,
    taxesPercent: 0,
    profitPercent: 10
  },
  {
    id: 'credit-card',
    name: 'Credit Card Payments',
    laborPercent: 30,
    foodPercent: 35,
    taxesPercent: 20,
    profitPercent: 15
  }
];

const defaultSettings: AdminSettings = {
  laborRevenuePercentage: 30,
  laborRoles: [defaultChefRole, defaultAssistantRole],
  expenseTypes: ['Equipment Rental', 'Transportation', 'Utilities', 'Insurance', 'Marketing', 'Supplies'],
  foodCostTypes: ['Proteins', 'Vegetables', 'Grains', 'Dairy', 'Beverages', 'Seasonings'],
  budgetProfiles: defaultBudgetProfiles
};

const Admin = () => {
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [editingExpenseValue, setEditingExpenseValue] = useState('');
  const [editingFoodCost, setEditingFoodCost] = useState<string | null>(null);
  const [editingFoodCostValue, setEditingFoodCostValue] = useState('');
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [editingProfileValue, setEditingProfileValue] = useState<BudgetProfile>({
    id: '',
    name: '',
    laborPercent: 0,
    foodPercent: 0,
    taxesPercent: 0,
    profitPercent: 0
  });
  const [newRole, setNewRole] = useState<LaborRole>({
    id: '',
    name: '',
    laborPercentage: 0
  });
  const [newExpense, setNewExpense] = useState('');
  const [newFoodCost, setNewFoodCost] = useState('');
  const [newProfile, setNewProfile] = useState<BudgetProfile>({
    id: '',
    name: '',
    laborPercent: 0,
    foodPercent: 0,
    taxesPercent: 0,
    profitPercent: 0
  });
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
                laborPercentage: 60
              },
              {
                id: 'assistant-migrated',
                name: 'Assistant',
                laborPercentage: 40
              }
            ],
            expenseTypes: parsed.expenseTypes || defaultSettings.expenseTypes,
            foodCostTypes: parsed.foodCostTypes || defaultSettings.foodCostTypes,
            budgetProfiles: defaultBudgetProfiles
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
            foodCostTypes: parsed.foodCostTypes || defaultSettings.foodCostTypes,
            budgetProfiles: parsed.budgetProfiles || defaultBudgetProfiles
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

  const addBudgetProfile = () => {
    if (newProfile.name.trim()) {
      const profileWithId: BudgetProfile = {
        ...newProfile,
        id: Date.now().toString(),
        name: newProfile.name.trim()
      };
      setSettings(prev => ({
        ...prev,
        budgetProfiles: [...prev.budgetProfiles, profileWithId]
      }));
      setNewProfile({
        id: '',
        name: '',
        laborPercent: 0,
        foodPercent: 0,
        taxesPercent: 0,
        profitPercent: 0
      });
    }
  };

  const updateBudgetProfile = (id: string, updatedProfile: Partial<BudgetProfile>) => {
    setSettings(prev => ({
      ...prev,
      budgetProfiles: prev.budgetProfiles.map(profile => 
        profile.id === id ? { ...profile, ...updatedProfile } : profile
      )
    }));
    setEditingProfile(null);
    setEditingProfileValue({
      id: '',
      name: '',
      laborPercent: 0,
      foodPercent: 0,
      taxesPercent: 0,
      profitPercent: 0
    });
  };

  const deleteBudgetProfile = (profileId: string) => {
    // Don't allow deleting if it's one of the last two profiles
    if (settings.budgetProfiles.length <= 2) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least two budget allocation profiles.",
        variant: "destructive"
      });
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      budgetProfiles: prev.budgetProfiles.filter(profile => profile.id !== profileId)
    }));
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
        laborPercentage: 0
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
    setEditingExpense(null);
    setEditingExpenseValue('');
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
    setEditingFoodCostValue('');
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

        <Tabs defaultValue="budget" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="budget">Budget Allocation</TabsTrigger>
            <TabsTrigger value="roles">Labor Roles & Pay</TabsTrigger>
            <TabsTrigger value="expenses">Expense Types</TabsTrigger>
            <TabsTrigger value="food">Food Cost Types</TabsTrigger>
          </TabsList>

          <TabsContent value="budget" className="space-y-4 mt-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Budget Allocation Profiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-border/20 rounded-lg overflow-hidden">
                  <div className="bg-muted/50 border-b border-border/20 p-3 grid grid-cols-12 gap-3 font-semibold text-sm text-muted-foreground">
                    <div className="col-span-3">Profile Name</div>
                    <div className="col-span-2">Labor %</div>
                    <div className="col-span-2">Food %</div>
                    <div className="col-span-2">Taxes %</div>
                    <div className="col-span-1">Profit %</div>
                    {isAdmin && <div className="col-span-2 text-center">Actions</div>}
                  </div>
                  {(settings.budgetProfiles || []).map((profile, index) => (
                    <div key={profile.id} className={`grid grid-cols-12 gap-3 p-3 items-center ${index !== settings.budgetProfiles.length - 1 ? 'border-b border-border/10' : ''}`}>
                      {editingProfile === profile.id ? (
                        <>
                           <div className="col-span-3">
                             <Input
                               value={editingProfileValue.name}
                               onChange={(e) => setEditingProfileValue(prev => ({ ...prev, name: e.target.value }))}
                               className="input-modern"
                               autoFocus
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter') updateBudgetProfile(profile.id, editingProfileValue);
                                 if (e.key === 'Escape') {
                                   setEditingProfile(null);
                                   setEditingProfileValue({ id: '', name: '', laborPercent: 0, foodPercent: 0, taxesPercent: 0, profitPercent: 0 });
                                 }
                               }}
                               onBlur={() => updateBudgetProfile(profile.id, editingProfileValue)}
                             />
                           </div>
                           <div className="col-span-2">
                             <Input
                               type="number"
                               value={editingProfileValue.laborPercent}
                               onChange={(e) => setEditingProfileValue(prev => ({ ...prev, laborPercent: parseFloat(e.target.value) || 0 }))}
                               className="input-modern"
                               min="0"
                               max="100"
                               step="0.1"
                             />
                           </div>
                           <div className="col-span-2">
                             <Input
                               type="number"
                               value={editingProfileValue.foodPercent}
                               onChange={(e) => setEditingProfileValue(prev => ({ ...prev, foodPercent: parseFloat(e.target.value) || 0 }))}
                               className="input-modern"
                               min="0"
                               max="100"
                               step="0.1"
                             />
                           </div>
                           <div className="col-span-2">
                             <Input
                               type="number"
                               value={editingProfileValue.taxesPercent}
                               onChange={(e) => setEditingProfileValue(prev => ({ ...prev, taxesPercent: parseFloat(e.target.value) || 0 }))}
                               className="input-modern"
                               min="0"
                               max="100"
                               step="0.1"
                             />
                           </div>
                           <div className="col-span-1">
                             <Input
                               type="number"
                               value={editingProfileValue.profitPercent}
                               onChange={(e) => setEditingProfileValue(prev => ({ ...prev, profitPercent: parseFloat(e.target.value) || 0 }))}
                               className="input-modern"
                               min="0"
                               max="100"
                               step="0.1"
                             />
                           </div>
                          {isAdmin && (
                             <div className="col-span-2 flex justify-center gap-2">
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => updateBudgetProfile(profile.id, editingProfileValue)}
                               >
                                 <Save className="w-4 h-4" />
                               </Button>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => {
                                   setEditingProfile(null);
                                   setEditingProfileValue({ id: '', name: '', laborPercent: 0, foodPercent: 0, taxesPercent: 0, profitPercent: 0 });
                                 }}
                               >
                                 <X className="w-4 h-4" />
                               </Button>
                             </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="col-span-3 font-medium text-card-foreground">
                            {profile.name}
                          </div>
                          <div className="col-span-2 text-sm">
                            <span className="font-medium">{profile.laborPercent}%</span>
                          </div>
                          <div className="col-span-2 text-sm">
                            <span className="font-medium">{profile.foodPercent}%</span>
                          </div>
                          <div className="col-span-2 text-sm">
                            <span className="font-medium">{profile.taxesPercent}%</span>
                          </div>
                          <div className="col-span-1 text-sm">
                            <span className="font-medium">{profile.profitPercent}%</span>
                          </div>
                          {isAdmin && (
                            <div className="col-span-2 flex justify-center gap-2">
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => {
                                   setEditingProfile(profile.id);
                                   setEditingProfileValue({
                                     id: profile.id,
                                     name: profile.name,
                                     laborPercent: profile.laborPercent,
                                     foodPercent: profile.foodPercent,
                                     taxesPercent: profile.taxesPercent,
                                     profitPercent: profile.profitPercent
                                   });
                                 }}
                               >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteBudgetProfile(profile.id)}
                                disabled={settings.budgetProfiles.length <= 2}
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
                          value={newProfile.name}
                          onChange={(e) => setNewProfile(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Profile name"
                          className="input-modern"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addBudgetProfile();
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={newProfile.laborPercent}
                          onChange={(e) => setNewProfile(prev => ({ ...prev, laborPercent: parseFloat(e.target.value) || 0 }))}
                          placeholder="Labor %"
                          className="input-modern"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={newProfile.foodPercent}
                          onChange={(e) => setNewProfile(prev => ({ ...prev, foodPercent: parseFloat(e.target.value) || 0 }))}
                          placeholder="Food %"
                          className="input-modern"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={newProfile.taxesPercent}
                          onChange={(e) => setNewProfile(prev => ({ ...prev, taxesPercent: parseFloat(e.target.value) || 0 }))}
                          placeholder="Taxes %"
                          className="input-modern"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          value={newProfile.profitPercent}
                          onChange={(e) => setNewProfile(prev => ({ ...prev, profitPercent: parseFloat(e.target.value) || 0 }))}
                          placeholder="Profit %"
                          className="input-modern"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Button onClick={addBudgetProfile} className="btn-primary w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                  <div className="bg-muted/50 border-b border-border/20 p-3 grid grid-cols-10 gap-3 font-semibold text-sm text-muted-foreground">
                    <div className="col-span-4">Role Name</div>
                    <div className="col-span-4">Labor Budget %</div>
                    {isAdmin && <div className="col-span-2 text-center">Actions</div>}
                  </div>
                  {(settings.laborRoles || []).map((role, index) => (
                    <div key={role.id} className={`grid grid-cols-10 gap-3 p-3 items-center ${index !== settings.laborRoles.length - 1 ? 'border-b border-border/10' : ''}`}>
                      {editingRole === role.id ? (
                        <>
                          <div className="col-span-4">
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
                          <div className="col-span-4">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={role.laborPercentage || 0}
                                onChange={(e) => updateRole(role.id, { laborPercentage: parseFloat(e.target.value) || 0 })}
                                className="input-modern"
                                min="0"
                                max="100"
                                step="0.1"
                                placeholder="% of labor budget"
                              />
                              <span className="text-muted-foreground">%</span>
                            </div>
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
                          <div className="col-span-4 font-medium text-card-foreground">
                            {role.name}
                          </div>
                          <div className="col-span-4 text-sm">
                            <span className="font-medium">{role.laborPercentage}% of labor budget</span>
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
                    <div className="grid grid-cols-10 gap-3">
                      <div className="col-span-4">
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
                      <div className="col-span-4">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={newRole.laborPercentage}
                            onChange={(e) => setNewRole(prev => ({ ...prev, laborPercentage: parseFloat(e.target.value) || 0 }))}
                            placeholder="% of labor budget"
                            className="input-modern"
                            min="0"
                            max="100"
                            step="0.1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') addRole();
                            }}
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
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
                              value={editingExpenseValue}
                              onChange={(e) => setEditingExpenseValue(e.target.value)}
                              className="input-modern"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateExpense(expense, editingExpenseValue);
                                }
                                if (e.key === 'Escape') {
                                  setEditingExpense(null);
                                  setEditingExpenseValue('');
                                }
                              }}
                              onBlur={() => updateExpense(expense, editingExpenseValue)}
                            />
                          </div>
                          <div className="col-span-4 flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateExpense(expense, editingExpenseValue)}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingExpense(null);
                                setEditingExpenseValue('');
                              }}
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
                                onClick={() => {
                                  setEditingExpense(expense);
                                  setEditingExpenseValue(expense);
                                }}
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
                              value={editingFoodCostValue}
                              onChange={(e) => setEditingFoodCostValue(e.target.value)}
                              className="input-modern"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') updateFoodCost(foodCost, editingFoodCostValue);
                                if (e.key === 'Escape') {
                                  setEditingFoodCost(null);
                                  setEditingFoodCostValue('');
                                }
                              }}
                              onBlur={() => updateFoodCost(foodCost, editingFoodCostValue)}
                            />
                          </div>
                          <div className="col-span-4 flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateFoodCost(foodCost, editingFoodCostValue)}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingFoodCost(null);
                                setEditingFoodCostValue('');
                              }}
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
                                onClick={() => {
                                  setEditingFoodCost(foodCost);
                                  setEditingFoodCostValue(foodCost);
                                }}
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