import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
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
  const [guestCount, setGuestCount] = useState(15);
  const [pricePerPerson, setPricePerPerson] = useState(60);
  const [gratuityPercent, setGratuityPercent] = useState(20);
  const [laborPercent, setLaborPercent] = useState(30);
  const [foodPercent, setFoodPercent] = useState(35);
  const [businessReservesPercent, setBusinessReservesPercent] = useState(20);
  const [profitPercent, setProfitPercent] = useState(15);
  const [laborRoles, setLaborRoles] = useState<LaborRole[]>([]);
  const [budgetProfiles, setBudgetProfiles] = useState<BudgetProfile[]>([]);
  const [isCashOnly, setIsCashOnly] = useState(false);

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

        // Set initial percentages from credit card profile
        const creditCardProfile = profiles.find(p => p.id === 'credit-card');
        if (creditCardProfile) {
          setLaborPercent(creditCardProfile.laborPercent);
          setFoodPercent(creditCardProfile.foodPercent);
          setBusinessReservesPercent(creditCardProfile.businessReservesPercent);
          setProfitPercent(creditCardProfile.profitPercent);
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

  const toggleCashOnly = (enabled: boolean) => {
    setIsCashOnly(enabled);
    const cashOnlyProfile = budgetProfiles.find(p => p.id === 'cash-only');
    const creditCardProfile = budgetProfiles.find(p => p.id === 'credit-card');
    
    if (enabled && cashOnlyProfile) {
      setLaborPercent(cashOnlyProfile.laborPercent);
      setFoodPercent(cashOnlyProfile.foodPercent);
      setBusinessReservesPercent(cashOnlyProfile.businessReservesPercent);
      setProfitPercent(cashOnlyProfile.profitPercent);
    } else if (!enabled && creditCardProfile) {
      setLaborPercent(creditCardProfile.laborPercent);
      setFoodPercent(creditCardProfile.foodPercent);
      setBusinessReservesPercent(creditCardProfile.businessReservesPercent);
      setProfitPercent(creditCardProfile.profitPercent);
    }
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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="font-semibold text-base sm:text-lg">Payment Settings</h3>
              <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg">
                <Label htmlFor="cash-only" className="text-base sm:text-lg font-medium whitespace-nowrap">Cash Only</Label>
                <Switch
                  id="cash-only"
                  checked={isCashOnly}
                  onCheckedChange={toggleCashOnly}
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-400"
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

      {/* Labor Roles Management */}
      <LaborRoleManager 
        laborRoles={laborRoles} 
        onRolesChange={setLaborRoles}
        totalBudget={currentScenario.laborBudget}
        gratuityAmount={currentScenario.gratuityAmount}
      />

      {/* Budget Allocation Settings */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Budget Allocation</CardTitle>
          <CardDescription className="text-base sm:text-lg">
            Set percentage allocations for different budget categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-3 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="labor-percent" className="text-base sm:text-lg font-medium">
                Labor Budget (%)
              </Label>
              <Input
                id="labor-percent"
                type="number"
                value={laborPercent}
                onChange={(e) => setLaborPercent(Number(e.target.value))}
                min="0"
                max="100"
                className="text-base sm:text-lg h-12"
              />
            </div>
            <div>
              <Label htmlFor="food-percent" className="text-base sm:text-lg font-medium">
                Food & Supplies (%)
              </Label>
              <Input
                id="food-percent"
                type="number"
                value={foodPercent}
                onChange={(e) => setFoodPercent(Number(e.target.value))}
                min="0"
                max="100"
                className="text-base sm:text-lg h-12"
              />
            </div>
            <div>
              <Label htmlFor="reserves-percent" className="text-base sm:text-lg font-medium">
                Business Reserves (%)
              </Label>
              <Input
                id="reserves-percent"
                type="number"
                value={businessReservesPercent}
                onChange={(e) => setBusinessReservesPercent(Number(e.target.value))}
                min="0"
                max="100"
                className="text-base sm:text-lg h-12"
              />
            </div>
            <div>
              <Label htmlFor="profit-percent" className="text-base sm:text-lg font-medium">
                Profit Target (%)
              </Label>
              <Input
                id="profit-percent"
                type="number"
                value={profitPercent}
                onChange={(e) => setProfitPercent(Number(e.target.value))}
                min="0"
                max="100"
                className="text-base sm:text-lg h-12"
              />
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2 text-base sm:text-lg">Allocation Summary</h4>
            <div className="text-sm sm:text-base space-y-1">
              <div className="flex justify-between">
                <span>Total Allocation:</span>
                <span className={`font-semibold ${(laborPercent + foodPercent + businessReservesPercent + profitPercent) === 100 ? 'text-green-600' : 'text-red-600'}`}>
                  {laborPercent + foodPercent + businessReservesPercent + profitPercent}%
                </span>
              </div>
              {(laborPercent + foodPercent + businessReservesPercent + profitPercent) !== 100 && (
                <p className="text-red-600 text-xs mt-2">
                  Note: Total allocation should equal 100% for optimal budget planning
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default BreakevenAnalysis;