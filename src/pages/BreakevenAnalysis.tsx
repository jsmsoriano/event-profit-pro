import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const BreakevenAnalysis = () => {
  const [guestCount, setGuestCount] = useState(30);
  const [pricePerPerson, setPricePerPerson] = useState(75);
  const [laborPercent, setLaborPercent] = useState(30);
  const [foodPercent, setFoodPercent] = useState(35);
  const [taxesPercent, setTaxesPercent] = useState(20);
  const [profitPercent, setProfitPercent] = useState(15);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateScenario = (guests: number) => {
    const totalRevenue = guests * pricePerPerson;
    const laborBudget = (totalRevenue * laborPercent) / 100;
    const foodBudget = (totalRevenue * foodPercent) / 100;
    const taxesBudget = (totalRevenue * taxesPercent) / 100;
    const profitBudget = (totalRevenue * profitPercent) / 100;
    
    return {
      guests,
      totalRevenue,
      laborBudget,
      foodBudget,
      taxesBudget,
      profitBudget,
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
        <h1 className="text-3xl font-bold">Breakeven Analysis</h1>
        <p className="text-muted-foreground">
          Plan your event budget and labor costs across different guest scenarios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Event Parameters</CardTitle>
            <CardDescription>Enter your event details and budget allocations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Budget Allocation (%)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="labor">Labor</Label>
                  <Input
                    id="labor"
                    type="number"
                    value={laborPercent}
                    onChange={(e) => setLaborPercent(Number(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="food">Food & Supplies</Label>
                  <Input
                    id="food"
                    type="number"
                    value={foodPercent}
                    onChange={(e) => setFoodPercent(Number(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="taxes">Taxes</Label>
                  <Input
                    id="taxes"
                    type="number"
                    value={taxesPercent}
                    onChange={(e) => setTaxesPercent(Number(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="profit">Profit</Label>
                  <Input
                    id="profit"
                    type="number"
                    value={profitPercent}
                    onChange={(e) => setProfitPercent(Number(e.target.value))}
                    min="0"
                    max="100"
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
            <CardDescription>{guestCount} guests at {formatCurrency(pricePerPerson)} per person</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <span className="font-semibold">{formatCurrency(currentScenario.totalRevenue)}</span>
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
                  <span className="text-sm text-muted-foreground">Taxes</span>
                  <span className="font-semibold">{formatCurrency(currentScenario.taxesBudget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Profit</span>
                  <span className="font-semibold text-green-600">{formatCurrency(currentScenario.profitBudget)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Chef Budget Guidelines</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Maximum Labor Budget:</span>
                  <span className="font-semibold">{formatCurrency(currentScenario.laborBudget)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recommended Chef Pay (60% of labor):</span>
                  <span className="font-semibold text-primary">{formatCurrency(currentScenario.laborBudget * 0.6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining for Support Staff:</span>
                  <span className="font-semibold">{formatCurrency(currentScenario.laborBudget * 0.4)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenario Table */}
      <Card>
        <CardHeader>
          <CardTitle>Guest Scenario Analysis</CardTitle>
          <CardDescription>
            Compare budgets across different guest counts (10-60 guests)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guests</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Labor Budget</TableHead>
                <TableHead>Chef Pay (60%)</TableHead>
                <TableHead>Food & Supplies</TableHead>
                <TableHead>Taxes</TableHead>
                <TableHead>Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarios.map((scenario) => (
                <TableRow 
                  key={scenario.guests}
                  className={scenario.guests === guestCount ? "bg-muted/50" : ""}
                >
                  <TableCell className="font-medium">{scenario.guests}</TableCell>
                  <TableCell>{formatCurrency(scenario.totalRevenue)}</TableCell>
                  <TableCell className="font-semibold text-primary">
                    {formatCurrency(scenario.laborBudget)}
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {formatCurrency(scenario.laborBudget * 0.6)}
                  </TableCell>
                  <TableCell>{formatCurrency(scenario.foodBudget)}</TableCell>
                  <TableCell>{formatCurrency(scenario.taxesBudget)}</TableCell>
                  <TableCell>{formatCurrency(scenario.profitBudget)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BreakevenAnalysis;