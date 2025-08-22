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
  businessReservesPercent: number;
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
    businessReservesPercent: 0,
    profitPercent: 10
  },
  {
    id: 'credit-card',
    name: 'Credit Card Payments',
    laborPercent: 30,
    foodPercent: 35,
    businessReservesPercent: 20,
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
  const [editingRoleValue, setEditingRoleValue] = useState<LaborRole>({
    id: '',
    name: '',
    laborPercentage: 0
  });
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
    businessReservesPercent: 0,
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
    businessReservesPercent: 0,
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
        businessReservesPercent: 0,
        profitPercent: 0
      });
    }
  };

  const updateBudgetProfile = (id: string, updatedProfile: Partial<BudgetProfile>) => {
    console.log('updateBudgetProfile called:', id, updatedProfile);
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
      businessReservesPercent: 0,
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
    <div className="min-h-screen p-2 sm:p-4 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-card-foreground truncate">Admin Settings</h1>
          </div>
          <Button onClick={saveSettings} className="btn-primary w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Save Settings</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>

        <Tabs defaultValue="budget" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="budget" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              <span className="hidden sm:inline">Budget Allocation</span>
              <span className="sm:hidden">Budget</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              <span className="hidden sm:inline">Labor Roles & Pay</span>
              <span className="sm:hidden">Roles</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              <span className="hidden sm:inline">Expense Types</span>
              <span className="sm:hidden">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="food" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              <span className="hidden sm:inline">Food Cost Types</span>
              <span className="sm:hidden">Food</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="budget" className="space-y-4 mt-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Budget Allocation Profiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-border/20 rounded-lg overflow-hidden overflow-x-auto">
                  <div className="bg-muted/50 border-b border-border/20 p-3 hidden md:grid grid-cols-12 gap-3 font-semibold text-sm text-muted-foreground">
                    <div className="col-span-3">Profile Name</div>
                    <div className="col-span-2">Labor %</div>
                    <div className="col-span-2">Food %</div>
                    <div className="col-span-2">Business Reserves %</div>
                    <div className="col-span-1">Profit %</div>
                    {isAdmin && <div className="col-span-2 text-center">Actions</div>}
                  </div>
                  {(settings.budgetProfiles || []).map((profile, index) => (
                    <div key={profile.id}>
                      {/* Desktop Grid Layout */}
                      <div className={`hidden md:grid grid-cols-12 gap-3 p-3 items-center ${index !== settings.budgetProfiles.length - 1 ? 'border-b border-border/10' : ''}`}>
                        {editingProfile === profile.id ? (
                          <>
                             <div className="col-span-3">
                               <Input
                                 value={editingProfileValue.name}
                                 onChange={(e) => {
                                   console.log('Budget profile name onChange:', e.target.value);
                                   setEditingProfileValue(prev => ({ ...prev, name: e.target.value }));
                                 }}
                                 className="input-modern"
                                 autoFocus
                                 onKeyDown={(e) => {
                                   if (e.key === 'Enter') updateBudgetProfile(profile.id, editingProfileValue);
                                   if (e.key === 'Escape') {
                                     setEditingProfile(null);
                                      setEditingProfileValue({ id: '', name: '', laborPercent: 0, foodPercent: 0, businessReservesPercent: 0, profitPercent: 0 });
                                   }
                                 }}
                               />
                             </div>
                             <div className="col-span-2">
                               <Input
                                 type="number"
                                 value={editingProfileValue.laborPercent}
                                 onChange={(e) => {
                                   console.log('Budget profile labor onChange:', e.target.value);
                                   setEditingProfileValue(prev => ({ ...prev, laborPercent: parseFloat(e.target.value) || 0 }));
                                 }}
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
                                 onChange={(e) => {
                                   setEditingProfileValue(prev => ({ ...prev, foodPercent: parseFloat(e.target.value) || 0 }));
                                 }}
                                 className="input-modern"
                                 min="0"
                                 max="100"
                                 step="0.1"
                               />
                             </div>
                              <div className="col-span-2">
                                <Input
                                  type="number"
                                  value={editingProfileValue.businessReservesPercent}
                                  onChange={(e) => {
                                    setEditingProfileValue(prev => ({ ...prev, businessReservesPercent: parseFloat(e.target.value) || 0 }));
                                  }}
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
                                 onChange={(e) => {
                                   setEditingProfileValue(prev => ({ ...prev, profitPercent: parseFloat(e.target.value) || 0 }));
                                 }}
                                 className="input-modern"
                                 min="0"
                                 max="100"
                                 step="0.1"
                               />
                             </div>
                            {isAdmin && (
                               <div className="col-span-2 flex justify-center gap-1">
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
                                      setEditingProfileValue({ id: '', name: '', laborPercent: 0, foodPercent: 0, businessReservesPercent: 0, profitPercent: 0 });
                                   }}
                                 >
                                   <X className="w-4 h-4" />
                                 </Button>
                               </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="col-span-3 font-medium text-card-foreground truncate">
                              {profile.name}
                            </div>
                            <div className="col-span-2 text-sm">
                              <span className="font-medium">{profile.laborPercent}%</span>
                            </div>
                            <div className="col-span-2 text-sm">
                              <span className="font-medium">{profile.foodPercent}%</span>
                            </div>
                             <div className="col-span-2 text-sm">
                               <span className="font-medium">{profile.businessReservesPercent}%</span>
                             </div>
                            <div className="col-span-1 text-sm">
                              <span className="font-medium">{profile.profitPercent}%</span>
                            </div>
                            {isAdmin && (
                              <div className="col-span-2 flex justify-center gap-1">
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => {
                                     console.log('Edit button clicked for profile:', profile.id, profile);
                                     setEditingProfile(profile.id);
                                      setEditingProfileValue({
                                        id: profile.id,
                                        name: profile.name,
                                        laborPercent: profile.laborPercent,
                                        foodPercent: profile.foodPercent,
                                        businessReservesPercent: profile.businessReservesPercent,
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
                      
                      {/* Mobile Card Layout */}
                      <div className={`md:hidden p-3 border border-border/20 rounded-lg mb-3 bg-card`}>
                        {editingProfile === profile.id ? (
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Profile Name</Label>
                              <Input
                                value={editingProfileValue.name}
                                onChange={(e) => {
                                  setEditingProfileValue(prev => ({ ...prev, name: e.target.value }));
                                }}
                                className="input-modern mt-1"
                                autoFocus
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs text-muted-foreground">Labor %</Label>
                                <Input
                                  type="number"
                                  value={editingProfileValue.laborPercent}
                                  onChange={(e) => {
                                    setEditingProfileValue(prev => ({ ...prev, laborPercent: parseFloat(e.target.value) || 0 }));
                                  }}
                                  className="input-modern mt-1"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Food %</Label>
                                <Input
                                  type="number"
                                  value={editingProfileValue.foodPercent}
                                  onChange={(e) => {
                                    setEditingProfileValue(prev => ({ ...prev, foodPercent: parseFloat(e.target.value) || 0 }));
                                  }}
                                  className="input-modern mt-1"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                />
                              </div>
                               <div>
                                 <Label className="text-xs text-muted-foreground">Business Reserves %</Label>
                                 <Input
                                   type="number"
                                   value={editingProfileValue.businessReservesPercent}
                                   onChange={(e) => {
                                     setEditingProfileValue(prev => ({ ...prev, businessReservesPercent: parseFloat(e.target.value) || 0 }));
                                   }}
                                   className="input-modern mt-1"
                                   min="0"
                                   max="100"
                                   step="0.1"
                                 />
                               </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Profit %</Label>
                                <Input
                                  type="number"
                                  value={editingProfileValue.profitPercent}
                                  onChange={(e) => {
                                    setEditingProfileValue(prev => ({ ...prev, profitPercent: parseFloat(e.target.value) || 0 }));
                                  }}
                                  className="input-modern mt-1"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                />
                              </div>
                            </div>
                            {isAdmin && (
                              <div className="flex gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateBudgetProfile(profile.id, editingProfileValue)}
                                  className="flex-1"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingProfile(null);
                                    setEditingProfileValue({ id: '', name: '', laborPercent: 0, foodPercent: 0, businessReservesPercent: 0, profitPercent: 0 });
                                  }}
                                  className="flex-1"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="font-medium text-card-foreground text-base">{profile.name}</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Labor:</span>
                                <span className="font-medium">{profile.laborPercent}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Food:</span>
                                <span className="font-medium">{profile.foodPercent}%</span>
                              </div>
                               <div className="flex justify-between">
                                 <span className="text-muted-foreground">Business Reserves:</span>
                                 <span className="font-medium">{profile.businessReservesPercent}%</span>
                               </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Profit:</span>
                                <span className="font-medium">{profile.profitPercent}%</span>
                              </div>
                            </div>
                            {isAdmin && (
                              <div className="flex gap-2 pt-2">
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
                                       businessReservesPercent: profile.businessReservesPercent,
                                       profitPercent: profile.profitPercent
                                     });
                                  }}
                                  className="flex-1"
                                >
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteBudgetProfile(profile.id)}
                                  disabled={settings.budgetProfiles.length <= 2}
                                  className="flex-1"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Add new profile section */}
                  <div className="border-t border-border/20 bg-muted/30 p-3">
                    {/* Desktop Add Form */}
                    <div className="hidden md:grid grid-cols-12 gap-3">
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
                           value={newProfile.businessReservesPercent}
                           onChange={(e) => setNewProfile(prev => ({ ...prev, businessReservesPercent: parseFloat(e.target.value) || 0 }))}
                           placeholder="Business Reserves %"
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
                          <span className="hidden lg:inline">Add Profile</span>
                          <span className="lg:hidden">Add</span>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Mobile Add Form */}
                    <div className="md:hidden space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Profile Name</Label>
                        <Input
                          value={newProfile.name}
                          onChange={(e) => setNewProfile(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter profile name"
                          className="input-modern mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Labor %</Label>
                          <Input
                            type="number"
                            value={newProfile.laborPercent}
                            onChange={(e) => setNewProfile(prev => ({ ...prev, laborPercent: parseFloat(e.target.value) || 0 }))}
                            placeholder="0"
                            className="input-modern mt-1"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Food %</Label>
                          <Input
                            type="number"
                            value={newProfile.foodPercent}
                            onChange={(e) => setNewProfile(prev => ({ ...prev, foodPercent: parseFloat(e.target.value) || 0 }))}
                            placeholder="0"
                            className="input-modern mt-1"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                         <div>
                           <Label className="text-xs text-muted-foreground">Business Reserves %</Label>
                           <Input
                             type="number"
                             value={newProfile.businessReservesPercent}
                             onChange={(e) => setNewProfile(prev => ({ ...prev, businessReservesPercent: parseFloat(e.target.value) || 0 }))}
                             placeholder="0"
                             className="input-modern mt-1"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Profit %</Label>
                          <Input
                            type="number"
                            value={newProfile.profitPercent}
                            onChange={(e) => setNewProfile(prev => ({ ...prev, profitPercent: parseFloat(e.target.value) || 0 }))}
                            placeholder="0"
                            className="input-modern mt-1"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                      </div>
                      <Button onClick={addBudgetProfile} className="btn-primary w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Budget Profile
                      </Button>
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
                               value={editingRoleValue.name}
                               onChange={(e) => setEditingRoleValue(prev => ({ ...prev, name: e.target.value }))}
                               className="input-modern"
                               autoFocus
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter') {
                                   updateRole(role.id, editingRoleValue);
                                   setEditingRole(null);
                                   setEditingRoleValue({ id: '', name: '', laborPercentage: 0 });
                                 }
                                 if (e.key === 'Escape') {
                                   setEditingRole(null);
                                   setEditingRoleValue({ id: '', name: '', laborPercentage: 0 });
                                 }
                               }}
                             />
                           </div>
                           <div className="col-span-4">
                             <div className="flex items-center gap-2">
                               <Input
                                 type="number"
                                 value={editingRoleValue.laborPercentage || 0}
                                 onChange={(e) => setEditingRoleValue(prev => ({ ...prev, laborPercentage: parseFloat(e.target.value) || 0 }))}
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
                                 onClick={() => {
                                   updateRole(role.id, editingRoleValue);
                                   setEditingRole(null);
                                   setEditingRoleValue({ id: '', name: '', laborPercentage: 0 });
                                 }}
                               >
                                 <Save className="w-4 h-4" />
                               </Button>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => {
                                   setEditingRole(null);
                                   setEditingRoleValue({ id: '', name: '', laborPercentage: 0 });
                                 }}
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
                                 onClick={() => {
                                   setEditingRole(role.id);
                                   setEditingRoleValue({
                                     id: role.id,
                                     name: role.name,
                                     laborPercentage: role.laborPercentage
                                   });
                                 }}
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