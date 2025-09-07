import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LaborRoleManager from "@/components/LaborRoleManager";

interface LaborRole {
  id: string;
  name: string;
  laborPercentage: number;
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

const BreakevenAnalysis = () => {
  const { toast } = useToast();
  const [guestCount, setGuestCount] = useState(15);
  const [pricePerPerson, setPricePerPerson] = useState(60);
  const [gratuityPercent, setGratuityPercent] = useState(20);
  const [laborPercent, setLaborPercent] = useState(30);
  const [foodPercent, setFoodPercent] = useState(35);
  const [businessReservesPercent, setBusinessReservesPercent] = useState(20);
  const [profitPercent, setProfitPercent] = useState(15);
  const [laborRoles, setLaborRoles] = useState<LaborRole[]>([]);
  const [budgetProfiles, setBudgetProfiles] = useState<BudgetProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [defaultProfileId, setDefaultProfileId] = useState<string>('');
  const [editingProfile, setEditingProfile] = useState<BudgetProfile | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileLabor, setNewProfileLabor] = useState(30);
  const [newProfileFood, setNewProfileFood] = useState(35);
  const [newProfileReserves, setNewProfileReserves] = useState(20);
  const [newProfileProfit, setNewProfileProfit] = useState(15);

  useEffect(() => {
    // Load admin settings to get labor roles and budget profiles
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        const roles = parsed.laborRoles || [
          { id: 'chef-default', name: 'Chef', laborPercentage: 60 },
          { id: 'assistant-default', name: 'Assistant', laborPercentage: 40 }
        ];
        setLaborRoles(roles);

        const profiles = parsed.budgetProfiles || [
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
        setBudgetProfiles(profiles);

        // Set initial percentages from credit card profile as default
        const creditCardProfile = profiles.find(p => p.id === 'credit-card');
        if (creditCardProfile) {
          setLaborPercent(creditCardProfile.laborPercent);
          setFoodPercent(creditCardProfile.foodPercent);
          setBusinessReservesPercent(creditCardProfile.businessReservesPercent);
          setProfitPercent(creditCardProfile.profitPercent);
          setSelectedProfileId(creditCardProfile.id);
          setDefaultProfileId(creditCardProfile.id);
        }
      } catch (error) {
        console.error('Error parsing admin settings:', error);
        // Use default values if parsing fails
        setLaborRoles([
          { id: 'chef-default', name: 'Chef', laborPercentage: 60 },
          { id: 'assistant-default', name: 'Assistant', laborPercentage: 40 }
        ]);
        setBudgetProfiles([
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
        ]);
      }
    } else {
      // Use default values if no settings found
      setLaborRoles([
        { id: 'chef-default', name: 'Chef', laborPercentage: 60 },
        { id: 'assistant-default', name: 'Assistant', laborPercentage: 40 }
      ]);
      setBudgetProfiles([
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
      ]);
    }
  }, []);

  const selectProfile = (profileId: string) => {
    const profile = budgetProfiles.find(p => p.id === profileId);
    if (profile) {
      setLaborPercent(profile.laborPercent);
      setFoodPercent(profile.foodPercent);
      setBusinessReservesPercent(profile.businessReservesPercent);
      setProfitPercent(profile.profitPercent);
      setSelectedProfileId(profileId);
    }
  };

  const setAsDefaultProfile = (profileId: string) => {
    const profile = budgetProfiles.find(p => p.id === profileId);
    if (profile) {
      setDefaultProfileId(profileId);
      setLaborPercent(profile.laborPercent);
      setFoodPercent(profile.foodPercent);
      setBusinessReservesPercent(profile.businessReservesPercent);
      setProfitPercent(profile.profitPercent);
      setSelectedProfileId(profileId);

      // Save default profile to localStorage
      const savedSettings = localStorage.getItem('adminSettings');
      const adminSettings = savedSettings ? JSON.parse(savedSettings) : {};
      adminSettings.defaultProfileId = profileId;
      localStorage.setItem('adminSettings', JSON.stringify(adminSettings));

      toast({
        title: "Default Profile Set",
        description: `"${profile.name}" is now the default budget profile`,
      });
    }
  };

  const validateProfileTotal = (labor: number, food: number, reserves: number, profit: number) => {
    return labor + food + reserves + profit === 100;
  };

  const createProfile = () => {
    if (!newProfileName.trim()) {
      toast({
        title: "Error",
        description: "Profile name is required",
        variant: "destructive",
      });
      return;
    }

    if (!validateProfileTotal(newProfileLabor, newProfileFood, newProfileReserves, newProfileProfit)) {
      toast({
        title: "Invalid Allocation",
        description: "Profile allocations must total 100%",
        variant: "destructive",
      });
      return;
    }

    const newProfile: BudgetProfile = {
      id: Date.now().toString(),
      name: newProfileName,
      laborPercent: newProfileLabor,
      foodPercent: newProfileFood,
      businessReservesPercent: newProfileReserves,
      profitPercent: newProfileProfit,
    };

    const updatedProfiles = [...budgetProfiles, newProfile];
    setBudgetProfiles(updatedProfiles);
    
    // Save to localStorage
    const savedSettings = localStorage.getItem('adminSettings');
    const adminSettings = savedSettings ? JSON.parse(savedSettings) : {};
    adminSettings.budgetProfiles = updatedProfiles;
    localStorage.setItem('adminSettings', JSON.stringify(adminSettings));

    // Reset form
    setNewProfileName('');
    setNewProfileLabor(30);
    setNewProfileFood(35);
    setNewProfileReserves(20);
    setNewProfileProfit(15);

    toast({
      title: "Profile Created",
      description: `Budget profile "${newProfile.name}" has been created successfully`,
    });
  };

  const updateProfile = () => {
    if (!editingProfile || !newProfileName.trim()) {
      toast({
        title: "Error",
        description: "Profile name is required",
        variant: "destructive",
      });
      return;
    }

    if (!validateProfileTotal(newProfileLabor, newProfileFood, newProfileReserves, newProfileProfit)) {
      toast({
        title: "Invalid Allocation", 
        description: "Profile allocations must total 100%",
        variant: "destructive",
      });
      return;
    }

    const updatedProfile: BudgetProfile = {
      ...editingProfile,
      name: newProfileName,
      laborPercent: newProfileLabor,
      foodPercent: newProfileFood,
      businessReservesPercent: newProfileReserves,
      profitPercent: newProfileProfit,
    };

    const updatedProfiles = budgetProfiles.map(p => p.id === editingProfile.id ? updatedProfile : p);
    setBudgetProfiles(updatedProfiles);

    // Save to localStorage
    const savedSettings = localStorage.getItem('adminSettings');
    const adminSettings = savedSettings ? JSON.parse(savedSettings) : {};
    adminSettings.budgetProfiles = updatedProfiles;
    localStorage.setItem('adminSettings', JSON.stringify(adminSettings));

    // If this was the selected profile, update current percentages
    if (selectedProfileId === editingProfile.id) {
      setLaborPercent(updatedProfile.laborPercent);
      setFoodPercent(updatedProfile.foodPercent);
      setBusinessReservesPercent(updatedProfile.businessReservesPercent);
      setProfitPercent(updatedProfile.profitPercent);
    }

    // If this was the default profile, keep it as default
    if (defaultProfileId === editingProfile.id) {
      setDefaultProfileId(updatedProfile.id);
    }

    setEditingProfile(null);
    resetProfileForm();

    toast({
      title: "Profile Updated",
      description: `Budget profile "${updatedProfile.name}" has been updated successfully`,
    });
  };

  const deleteProfile = (profileId: string) => {
    const updatedProfiles = budgetProfiles.filter(p => p.id !== profileId);
    setBudgetProfiles(updatedProfiles);

    // Save to localStorage
    const savedSettings = localStorage.getItem('adminSettings');
    const adminSettings = savedSettings ? JSON.parse(savedSettings) : {};
    adminSettings.budgetProfiles = updatedProfiles;
    localStorage.setItem('adminSettings', JSON.stringify(adminSettings));

    // If this was the selected or default profile, reset selection
    if (selectedProfileId === profileId) {
      setSelectedProfileId('');
    }
    if (defaultProfileId === profileId) {
      setDefaultProfileId('');
    }

    toast({
      title: "Profile Deleted",
      description: "Budget profile has been deleted successfully",
    });
  };

  const startEditProfile = (profile: BudgetProfile) => {
    setEditingProfile(profile);
    setNewProfileName(profile.name);
    setNewProfileLabor(profile.laborPercent);
    setNewProfileFood(profile.foodPercent);
    setNewProfileReserves(profile.businessReservesPercent);
    setNewProfileProfit(profile.profitPercent);
  };

  const resetProfileForm = () => {
    setNewProfileName('');
    setNewProfileLabor(30);
    setNewProfileFood(35);
    setNewProfileReserves(20);
    setNewProfileProfit(15);
  };

  const cancelEdit = () => {
    setEditingProfile(null);
    resetProfileForm();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateScenario = (guests: number) => {
    const baseRevenue = guests * pricePerPerson;
    const gratuityAmount = (baseRevenue * gratuityPercent) / 100;
    const totalRevenue = baseRevenue + gratuityAmount;
    const businessReservesToSetAside = (totalRevenue * businessReservesPercent) / 100;
    const revenueAfterReserves = totalRevenue - businessReservesToSetAside;
    const laborBudget = (revenueAfterReserves * laborPercent) / 100;
    const foodBudget = (revenueAfterReserves * foodPercent) / 100;
    const profitBudget = (revenueAfterReserves * profitPercent) / 100;
    
    return {
      guests,
      baseRevenue,
      gratuityAmount,
      totalRevenue,
      businessReservesToSetAside,
      revenueAfterReserves,
      laborBudget,
      foodBudget,
      profitBudget,
    };
  };

  const scenarios = [];
  for (let i = 10; i <= 60; i += 5) {
    scenarios.push(calculateScenario(i));
  }

  const currentScenario = calculateScenario(guestCount);

  return (
    <div className="min-h-screen p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold">Event Calculator</h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Plan your event budget and labor costs across different guest scenarios
        </p>
      </div>

      <Tabs defaultValue="parameters" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger 
            value="parameters" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Event Parameters
          </TabsTrigger>
          <TabsTrigger 
            value="labor-budget"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Labor & Budget
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="parameters" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Input Section */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Event Parameters</CardTitle>
                <CardDescription className="text-base sm:text-lg">Enter your event details and budget allocations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-3 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guests" className="text-base sm:text-lg font-medium">Number of Guests</Label>
                    <Input
                      id="guests"
                      type="number"
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      min="1"
                      className="text-base sm:text-lg h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price" className="text-base sm:text-lg font-medium">Price per Person</Label>
                    <Input
                      id="price"
                      type="number"
                      value={pricePerPerson}
                      onChange={(e) => setPricePerPerson(Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className="text-base sm:text-lg h-12"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="gratuity" className="text-base sm:text-lg font-medium">Gratuity (%)</Label>
                    <Input
                      id="gratuity"
                      type="number"
                      value={gratuityPercent}
                      onChange={(e) => setGratuityPercent(Number(e.target.value))}
                      min="0"
                      max="100"
                      className="text-base sm:text-lg h-12"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Scenario */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Current Scenario</CardTitle>
                <CardDescription className="text-base sm:text-lg break-words">
                  {guestCount} guests at {formatCurrency(pricePerPerson)} per person + {gratuityPercent}% gratuity
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground">Base Revenue</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(currentScenario.baseRevenue)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground">Gratuity ({gratuityPercent}%)</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(currentScenario.gratuityAmount)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground">Total Revenue</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">{formatCurrency(currentScenario.totalRevenue)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground">Business Reserves</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(currentScenario.businessReservesToSetAside)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground">Labor Budget</TableCell>
                        <TableCell className="text-right font-semibold text-primary">{formatCurrency(currentScenario.laborBudget)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-muted-foreground">Food & Supplies</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(currentScenario.foodBudget)}</TableCell>
                      </TableRow>
                      <TableRow className="bg-green-50 dark:bg-green-950/20">
                        <TableCell className="font-medium text-muted-foreground">Profit</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">{formatCurrency(currentScenario.profitBudget)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 sm:mt-6 p-4 sm:p-5 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-3 text-base sm:text-lg">Labor Budget Breakdown</h4>
                  <div className="space-y-2 text-sm sm:text-base">
                    <div className="flex justify-between items-center">
                      <span className="truncate">Maximum Labor Budget:</span>
                      <span className="font-semibold text-right">{formatCurrency(currentScenario.laborBudget)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="truncate">Business Reserves:</span>
                      <span className="font-semibold text-orange-600 text-right">{formatCurrency(currentScenario.businessReservesToSetAside)}</span>
                    </div>
                    {laborRoles.map((role) => (
                      <div key={role.id} className="flex justify-between items-center">
                        <span className="truncate">{role.name} Pay ({role.laborPercentage}% of labor):</span>
                        <span className="font-semibold text-primary text-right">{formatCurrency(currentScenario.laborBudget * (role.laborPercentage / 100))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="labor-budget" className="space-y-6">
          {/* Labor & Budget Management */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Labor & Budget Management</CardTitle>
              <CardDescription className="text-base sm:text-lg">
                Manage labor roles and budget profiles for your event
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <Accordion type="multiple" defaultValue={["labor-roles", "budget-allocation"]} className="w-full">
                <AccordionItem value="labor-roles" className="border rounded-lg mb-4">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">Labor Roles</span>
                      <span className="text-sm text-muted-foreground">
                        ({laborRoles.length} role{laborRoles.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <LaborRoleManager 
                      laborRoles={laborRoles} 
                      onRolesChange={setLaborRoles}
                      totalBudget={currentScenario.laborBudget}
                      gratuityAmount={currentScenario.gratuityAmount}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="budget-allocation" className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">Budget Profiles</span>
                      <span className="text-sm text-muted-foreground">
                        ({budgetProfiles.length} profile{budgetProfiles.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-6">
                      {/* Budget Profile Management */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-base">Budget Profiles</h4>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" className="gap-2" onClick={resetProfileForm}>
                                <Plus className="h-4 w-4" />
                                New Profile
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {editingProfile ? 'Edit Budget Profile' : 'Create New Budget Profile'}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Create a budget profile with specific allocation percentages. All percentages must total 100%.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="profile-name">Profile Name</Label>
                                  <Input
                                    id="profile-name"
                                    value={newProfileName}
                                    onChange={(e) => setNewProfileName(e.target.value)}
                                    placeholder="e.g., Cash Only, Credit Card"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="new-labor">Labor (%)</Label>
                                    <Input
                                      id="new-labor"
                                      type="number"
                                      value={newProfileLabor}
                                      onChange={(e) => setNewProfileLabor(Number(e.target.value))}
                                      min="0"
                                      max="100"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="new-food">Food & Supplies (%)</Label>
                                    <Input
                                      id="new-food"
                                      type="number"
                                      value={newProfileFood}
                                      onChange={(e) => setNewProfileFood(Number(e.target.value))}
                                      min="0"
                                      max="100"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="new-reserves">Business Reserves (%)</Label>
                                    <Input
                                      id="new-reserves"
                                      type="number"
                                      value={newProfileReserves}
                                      onChange={(e) => setNewProfileReserves(Number(e.target.value))}
                                      min="0"
                                      max="100"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="new-profit">Profit (%)</Label>
                                    <Input
                                      id="new-profit"
                                      type="number"
                                      value={newProfileProfit}
                                      onChange={(e) => setNewProfileProfit(Number(e.target.value))}
                                      min="0"
                                      max="100"
                                    />
                                  </div>
                                </div>
                                <div className="p-3 bg-muted rounded-lg">
                                  <div className="flex justify-between text-sm">
                                    <span>Total:</span>
                                    <span className={`font-semibold ${
                                      validateProfileTotal(newProfileLabor, newProfileFood, newProfileReserves, newProfileProfit)
                                        ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {newProfileLabor + newProfileFood + newProfileReserves + newProfileProfit}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={cancelEdit}>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={editingProfile ? updateProfile : createProfile}
                                  disabled={!validateProfileTotal(newProfileLabor, newProfileFood, newProfileReserves, newProfileProfit)}
                                >
                                  {editingProfile ? 'Update' : 'Create'} Profile
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        {budgetProfiles.length > 0 && (
                          <div className="space-y-4">
                            <h5 className="font-medium text-sm">Manage Profiles</h5>
                            <div className="space-y-2">
                              {budgetProfiles.map((profile) => (
                                <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{profile.name}</span>
                                      {defaultProfileId === profile.id && (
                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                          Default
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Labor: {profile.laborPercent}% • Food: {profile.foodPercent}% • Reserves: {profile.businessReservesPercent}% • Profit: {profile.profitPercent}%
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    {defaultProfileId !== profile.id && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setAsDefaultProfile(profile.id)}
                                      >
                                        Set Default
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => selectProfile(profile.id)}
                                    >
                                      Use
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => startEditProfile(profile)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Edit Budget Profile</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Modify the budget profile allocation percentages. All percentages must total 100%.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="space-y-4">
                                          <div>
                                            <Label htmlFor="edit-profile-name">Profile Name</Label>
                                            <Input
                                              id="edit-profile-name"
                                              value={newProfileName}
                                              onChange={(e) => setNewProfileName(e.target.value)}
                                              placeholder="e.g., Cash Only, Credit Card"
                                            />
                                          </div>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label htmlFor="edit-labor">Labor (%)</Label>
                                              <Input
                                                id="edit-labor"
                                                type="number"
                                                value={newProfileLabor}
                                                onChange={(e) => setNewProfileLabor(Number(e.target.value))}
                                                min="0"
                                                max="100"
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor="edit-food">Food & Supplies (%)</Label>
                                              <Input
                                                id="edit-food"
                                                type="number"
                                                value={newProfileFood}
                                                onChange={(e) => setNewProfileFood(Number(e.target.value))}
                                                min="0"
                                                max="100"
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor="edit-reserves">Business Reserves (%)</Label>
                                              <Input
                                                id="edit-reserves"
                                                type="number"
                                                value={newProfileReserves}
                                                onChange={(e) => setNewProfileReserves(Number(e.target.value))}
                                                min="0"
                                                max="100"
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor="edit-profit">Profit (%)</Label>
                                              <Input
                                                id="edit-profit"
                                                type="number"
                                                value={newProfileProfit}
                                                onChange={(e) => setNewProfileProfit(Number(e.target.value))}
                                                min="0"
                                                max="100"
                                              />
                                            </div>
                                          </div>
                                          <div className="p-3 bg-muted rounded-lg">
                                            <div className="flex justify-between text-sm">
                                              <span>Total:</span>
                                              <span className={`font-semibold ${
                                                validateProfileTotal(newProfileLabor, newProfileFood, newProfileReserves, newProfileProfit)
                                                  ? 'text-green-600' : 'text-red-600'
                                              }`}>
                                                {newProfileLabor + newProfileFood + newProfileReserves + newProfileProfit}%
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel onClick={cancelEdit}>Cancel</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={updateProfile}
                                            disabled={!validateProfileTotal(newProfileLabor, newProfileFood, newProfileReserves, newProfileProfit)}
                                          >
                                            Update Profile
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="outline">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Budget Profile</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete the budget profile "{profile.name}"? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => deleteProfile(profile.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                     
                      {/* Current Profile Display */}
                      {selectedProfileId && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-base">Current Profile</h4>
                          <div className="p-4 bg-muted rounded-lg">
                            {(() => {
                              const currentProfile = budgetProfiles.find(p => p.id === selectedProfileId);
                              return currentProfile ? (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium">{currentProfile.name}</span>
                                    {defaultProfileId === currentProfile.id && (
                                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between">
                                      <span>Labor:</span>
                                      <span className="font-semibold">{currentProfile.laborPercent}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Food & Supplies:</span>
                                      <span className="font-semibold">{currentProfile.foodPercent}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Business Reserves:</span>
                                      <span className="font-semibold">{currentProfile.businessReservesPercent}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Profit:</span>
                                      <span className="font-semibold">{currentProfile.profitPercent}%</span>
                                    </div>
                                  </div>
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BreakevenAnalysis;
