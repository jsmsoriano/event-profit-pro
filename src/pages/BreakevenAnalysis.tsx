import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { DollarSign } from "lucide-react";
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

const BreakevenAnalysis = () => {
  const [guestCount, setGuestCount] = useState(30);
  const [pricePerPerson, setPricePerPerson] = useState(75);
  const [gratuityPercent, setGratuityPercent] = useState(20);
  const [laborPercent, setLaborPercent] = useState(30);
  const [foodPercent, setFoodPercent] = useState(35);
  const [taxesPercent, setTaxesPercent] = useState(20);
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
        setBudgetProfiles(profiles);

        // Set initial percentages from credit card profile
        const creditCardProfile = profiles.find(p => p.id === 'credit-card');
        if (creditCardProfile) {
          setLaborPercent(creditCardProfile.laborPercent);
          setFoodPercent(creditCardProfile.foodPercent);
          setTaxesPercent(creditCardProfile.taxesPercent);
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
      setTaxesPercent(cashOnlyProfile.taxesPercent);
      setProfitPercent(cashOnlyProfile.profitPercent);
    } else if (!enabled && creditCardProfile) {
      setLaborPercent(creditCardProfile.laborPercent);
      setFoodPercent(creditCardProfile.foodPercent);
      setTaxesPercent(creditCardProfile.taxesPercent);
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
    const taxesToSetAside = (totalRevenue * taxesPercent) / 100;
    const revenueAfterTaxes = totalRevenue - taxesToSetAside;
    const laborBudget = (revenueAfterTaxes * laborPercent) / 100;
    const foodBudget = (revenueAfterTaxes * foodPercent) / 100;
    const profitBudget = (revenueAfterTaxes * profitPercent) / 100;
    const costPerPlate = (laborBudget + foodBudget + taxesToSetAside) / guests;
    
    return {
      guests,
      baseRevenue,
      gratuityAmount,
      totalRevenue,
      taxesToSetAside,
      revenueAfterTaxes,
      laborBudget,
      foodBudget,
      profitBudget,
      costPerPlate,
    };
  };

  const scenarios = [];
  for (let i = 10; i <= 60; i += 5) {
    scenarios.push(calculateScenario(i));
  }

  const currentScenario = calculateScenario(guestCount);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Event Calculator</h1>
        <p className="text-muted-foreground">
          Plan your event budget and labor costs across different guest scenarios
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Event Parameters</CardTitle>
            <CardDescription>Enter your event details and budget allocations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guests">Number of Guests</Label>
                <Input
                  id="guests"
                  type="number"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="price">Price per Person</Label>
                <Input
                  id="price"
                  type="number"
                  value={pricePerPerson}
                  onChange={(e) => setPricePerPerson(Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="gratuity">Gratuity (%)</Label>
                <Input
                  id="gratuity"
                  type="number"
                  value={gratuityPercent}
                  onChange={(e) => setGratuityPercent(Number(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-semibold">Budget Allocation (%)</h3>
                <div className="flex items-center space-x-3 p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <Label htmlFor="cash-only" className="text-sm font-medium text-primary">Cash Only</Label>
                  <Switch
                    id="cash-only"
                    checked={isCashOnly}
                    onCheckedChange={toggleCashOnly}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="labor">Labor (%)</Label>
                  <Input
                    id="labor"
                    type="number"
                    value={laborPercent}
                    onChange={(e) => setLaborPercent(Number(e.target.value))}
                    min="0"
                    max="100"
                    disabled={isCashOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="food">Food & Supplies (%)</Label>
                  <Input
                    id="food"
                    type="number"
                    value={foodPercent}
                    onChange={(e) => setFoodPercent(Number(e.target.value))}
                    min="0"
                    max="100"
                    disabled={isCashOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="taxes">Taxes (%)</Label>
                  <Input
                    id="taxes"
                    type="number"
                    value={taxesPercent}
                    onChange={(e) => setTaxesPercent(Number(e.target.value))}
                    min="0"
                    max="100"
                    disabled={isCashOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="profit">Profit (%)</Label>
                  <Input
                    id="profit"
                    type="number"
                    value={profitPercent}
                    onChange={(e) => setProfitPercent(Number(e.target.value))}
                    min="0"
                    max="100"
                    disabled={isCashOnly}
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Total: {laborPercent + foodPercent + taxesPercent + profitPercent}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Scenario */}
        <Card>
          <CardHeader>
            <CardTitle>Current Scenario</CardTitle>
            <CardDescription>{guestCount} guests at {formatCurrency(pricePerPerson)} per person + {gratuityPercent}% gratuity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Base Revenue</span>
                  <span className="font-semibold">{formatCurrency(currentScenario.baseRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Gratuity ({gratuityPercent}%)</span>
                  <span className="font-semibold">{formatCurrency(currentScenario.gratuityAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <span className="font-semibold text-green-600">{formatCurrency(currentScenario.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Labor Budget</span>
                  <span className="font-semibold text-primary">{formatCurrency(currentScenario.laborBudget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Food & Supplies</span>
                  <span className="font-semibold">{formatCurrency(currentScenario.foodBudget)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Taxes to Set Aside</span>
                  <span className="font-semibold">{formatCurrency(currentScenario.taxesToSetAside)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Profit</span>
                  <span className="font-semibold text-green-600">{formatCurrency(currentScenario.profitBudget)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-sm text-muted-foreground font-medium">Cost Per Plate</span>
                  <span className="font-semibold text-orange-600">{formatCurrency(currentScenario.costPerPlate)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Labor Budget Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Maximum Labor Budget:</span>
                  <span className="font-semibold">{formatCurrency(currentScenario.laborBudget)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recommended Taxes to be set aside:</span>
                  <span className="font-semibold text-orange-600">{formatCurrency(currentScenario.taxesToSetAside)}</span>
                </div>
                {laborRoles.map((role) => (
                  <div key={role.id} className="flex justify-between">
                    <span>{role.name} Pay ({role.laborPercentage}% of labor):</span>
                    <span className="font-semibold text-primary">{formatCurrency(currentScenario.laborBudget * (role.laborPercentage / 100))}</span>
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
      />

    </div>
  );
};

export default BreakevenAnalysis;