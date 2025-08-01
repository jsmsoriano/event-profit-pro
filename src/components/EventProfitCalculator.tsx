import React, { useState, useCallback, useMemo } from 'react';
import { Calculator, DollarSign, Users, Percent, Target, TrendingUp, Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface LaborRole {
  id: string;
  name: string;
  cost: number;
}

interface MiscExpense {
  id: string;
  name: string;
  cost: number;
}

const EventProfitCalculator = () => {
  // Main calculator states
  const [numberOfGuests, setNumberOfGuests] = useState(50);
  const [pricePerPerson, setPricePerPerson] = useState(85);
  const [gratuityPercentage, setGratuityPercentage] = useState(18);
  const [useSliders, setUseSliders] = useState(true);

  // Expenses states
  const [laborRoles, setLaborRoles] = useState<LaborRole[]>([
    { id: '1', name: 'Chef 1', cost: 200 },
    { id: '2', name: 'Chef 2', cost: 180 },
    { id: '3', name: 'Assistant', cost: 120 }
  ]);
  const [foodCostMode, setFoodCostMode] = useState<'percentage' | 'fixed'>('percentage');
  const [foodCostPercentage, setFoodCostPercentage] = useState(30);
  const [foodCostFixed, setFoodCostFixed] = useState(1500);
  const [miscExpenses, setMiscExpenses] = useState<MiscExpense[]>([
    { id: '1', name: 'Equipment rental', cost: 300 },
    { id: '2', name: 'Transportation', cost: 150 }
  ]);

  // Profit target states
  const [targetProfitMargin, setTargetProfitMargin] = useState(25);
  const [businessTaxPercentage, setBusinessTaxPercentage] = useState(8);

  // Edit states
  const [editingLabor, setEditingLabor] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [newLaborName, setNewLaborName] = useState('');
  const [newLaborCost, setNewLaborCost] = useState('');
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseCost, setNewExpenseCost] = useState('');

  // Revenue calculations
  const baseRevenue = useMemo(() => numberOfGuests * pricePerPerson, [numberOfGuests, pricePerPerson]);
  const gratuityAmount = useMemo(() => baseRevenue * (gratuityPercentage / 100), [baseRevenue, gratuityPercentage]);
  const totalRevenue = useMemo(() => baseRevenue + gratuityAmount, [baseRevenue, gratuityAmount]);

  // Expense calculations
  const totalLaborCosts = useMemo(() => laborRoles.reduce((sum, role) => sum + role.cost, 0), [laborRoles]);
  const foodCost = useMemo(() => 
    foodCostMode === 'percentage' ? baseRevenue * (foodCostPercentage / 100) : foodCostFixed,
    [foodCostMode, baseRevenue, foodCostPercentage, foodCostFixed]
  );
  const totalMiscCosts = useMemo(() => miscExpenses.reduce((sum, expense) => sum + expense.cost, 0), [miscExpenses]);
  const totalCosts = useMemo(() => totalLaborCosts + foodCost + totalMiscCosts, [totalLaborCosts, foodCost, totalMiscCosts]);

  // Profit calculations
  const actualProfit = useMemo(() => totalRevenue - totalCosts, [totalRevenue, totalCosts]);
  const actualProfitPercentage = useMemo(() => totalRevenue > 0 ? (actualProfit / totalRevenue) * 100 : 0, [actualProfit, totalRevenue]);
  const businessTax = useMemo(() => actualProfit > 0 ? actualProfit * (businessTaxPercentage / 100) : 0, [actualProfit, businessTaxPercentage]);
  const netProfit = useMemo(() => actualProfit - businessTax, [actualProfit, businessTax]);

  // Target profit calculations
  const targetRevenue = useMemo(() => totalCosts / (1 - targetProfitMargin / 100), [totalCosts, targetProfitMargin]);
  const adjustedPricePerPerson = useMemo(() => 
    numberOfGuests > 0 ? (targetRevenue - gratuityAmount) / numberOfGuests : 0,
    [targetRevenue, gratuityAmount, numberOfGuests]
  );
  const adjustedProfit = useMemo(() => targetRevenue - totalCosts, [targetRevenue, totalCosts]);

  // Break-even calculation
  const breakEvenGuests = useMemo(() => 
    pricePerPerson > 0 ? Math.ceil(totalCosts / (pricePerPerson * (1 + gratuityPercentage / 100))) : 0,
    [totalCosts, pricePerPerson, gratuityPercentage]
  );

  // Labor role management
  const addLaborRole = useCallback(() => {
    if (newLaborName && newLaborCost) {
      const newRole: LaborRole = {
        id: Date.now().toString(),
        name: newLaborName,
        cost: parseFloat(newLaborCost)
      };
      setLaborRoles(prev => [...prev, newRole]);
      setNewLaborName('');
      setNewLaborCost('');
    }
  }, [newLaborName, newLaborCost]);

  const updateLaborRole = useCallback((id: string, name: string, cost: number) => {
    setLaborRoles(prev => prev.map(role => role.id === id ? { ...role, name, cost } : role));
    setEditingLabor(null);
  }, []);

  const deleteLaborRole = useCallback((id: string) => {
    setLaborRoles(prev => prev.filter(role => role.id !== id));
  }, []);

  // Misc expense management
  const addMiscExpense = useCallback(() => {
    if (newExpenseName && newExpenseCost) {
      const newExpense: MiscExpense = {
        id: Date.now().toString(),
        name: newExpenseName,
        cost: parseFloat(newExpenseCost)
      };
      setMiscExpenses(prev => [...prev, newExpense]);
      setNewExpenseName('');
      setNewExpenseCost('');
    }
  }, [newExpenseName, newExpenseCost]);

  const updateMiscExpense = useCallback((id: string, name: string, cost: number) => {
    setMiscExpenses(prev => prev.map(expense => expense.id === id ? { ...expense, name, cost } : expense));
    setEditingExpense(null);
  }, []);

  const deleteMiscExpense = useCallback((id: string) => {
    setMiscExpenses(prev => prev.filter(expense => expense.id !== id));
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="w-8 h-8 text-white" />
            <h1 className="text-4xl font-bold text-white">Event Profit Calculator</h1>
          </div>
          <p className="text-white/80 text-lg">Plan and optimize your event profitability</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column - Inputs */}
          <div className="xl:col-span-8 space-y-6">
            {/* Event Details */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Users className="w-5 h-5" />
                  Event Details
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUseSliders(!useSliders)}
                    className="ml-auto"
                  >
                    {useSliders ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {useSliders ? 'Sliders' : 'Inputs'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="guests" className="text-card-foreground font-medium">Number of Guests</Label>
                    {useSliders ? (
                      <div className="mt-2 space-y-2">
                        <Slider
                          value={[numberOfGuests]}
                          onValueChange={(value) => setNumberOfGuests(value[0])}
                          max={500}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="text-center text-2xl font-bold text-primary">{numberOfGuests}</div>
                      </div>
                    ) : (
                      <Input
                        id="guests"
                        type="number"
                        value={numberOfGuests}
                        onChange={(e) => setNumberOfGuests(parseInt(e.target.value) || 0)}
                        className="input-modern mt-2"
                        min="1"
                      />
                    )}
                  </div>

                  <div>
                    <Label htmlFor="price" className="text-card-foreground font-medium">Price per Person</Label>
                    {useSliders ? (
                      <div className="mt-2 space-y-2">
                        <Slider
                          value={[pricePerPerson]}
                          onValueChange={(value) => setPricePerPerson(value[0])}
                          max={500}
                          min={10}
                          step={5}
                          className="w-full"
                        />
                        <div className="text-center text-2xl font-bold text-primary">{formatCurrency(pricePerPerson)}</div>
                      </div>
                    ) : (
                      <Input
                        id="price"
                        type="number"
                        value={pricePerPerson}
                        onChange={(e) => setPricePerPerson(parseFloat(e.target.value) || 0)}
                        className="input-modern mt-2"
                        min="0"
                        step="0.01"
                      />
                    )}
                  </div>

                  <div>
                    <Label htmlFor="gratuity" className="text-card-foreground font-medium">Gratuity (%)</Label>
                    {useSliders ? (
                      <div className="mt-2 space-y-2">
                        <Slider
                          value={[gratuityPercentage]}
                          onValueChange={(value) => setGratuityPercentage(value[0])}
                          max={30}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                        <div className="text-center text-2xl font-bold text-primary">{gratuityPercentage}%</div>
                      </div>
                    ) : (
                      <Input
                        id="gratuity"
                        type="number"
                        value={gratuityPercentage}
                        onChange={(e) => setGratuityPercentage(parseFloat(e.target.value) || 0)}
                        className="input-modern mt-2"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expenses */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <DollarSign className="w-5 h-5" />
                  Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Labor Costs */}
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-3">Labor Roles</h3>
                  <div className="space-y-2">
                    {laborRoles.map((role) => (
                      <div key={role.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        {editingLabor === role.id ? (
                          <>
                            <Input
                              value={role.name}
                              onChange={(e) => updateLaborRole(role.id, e.target.value, role.cost)}
                              className="flex-1 input-modern"
                              placeholder="Role name"
                            />
                            <Input
                              type="number"
                              value={role.cost}
                              onChange={(e) => updateLaborRole(role.id, role.name, parseFloat(e.target.value) || 0)}
                              className="w-24 input-modern"
                              placeholder="Cost"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingLabor(null)}
                            >
                              Save
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 font-medium text-card-foreground">{role.name}</span>
                            <span className="font-bold text-card-foreground">{formatCurrency(role.cost)}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingLabor(role.id)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteLaborRole(role.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                    <div className="flex gap-3 p-3 bg-white/30 rounded-lg">
                      <Input
                        placeholder="Role name"
                        value={newLaborName}
                        onChange={(e) => setNewLaborName(e.target.value)}
                        className="flex-1 input-modern"
                      />
                      <Input
                        type="number"
                        placeholder="Cost"
                        value={newLaborCost}
                        onChange={(e) => setNewLaborCost(e.target.value)}
                        className="w-24 input-modern"
                      />
                      <Button onClick={addLaborRole} className="btn-primary">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Food Costs */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-card-foreground">Food Costs</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFoodCostMode(foodCostMode === 'percentage' ? 'fixed' : 'percentage')}
                    >
                      {foodCostMode === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {foodCostMode === 'percentage' ? (
                      <div>
                        <Label className="text-card-foreground">Food Cost Percentage</Label>
                        <div className="mt-2 space-y-2">
                          <Slider
                            value={[foodCostPercentage]}
                            onValueChange={(value) => setFoodCostPercentage(value[0])}
                            max={50}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                          <div className="text-center text-xl font-bold text-primary">{foodCostPercentage}%</div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Label className="text-card-foreground">Fixed Food Cost</Label>
                        <Input
                          type="number"
                          value={foodCostFixed}
                          onChange={(e) => setFoodCostFixed(parseFloat(e.target.value) || 0)}
                          className="input-modern mt-2"
                        />
                      </div>
                    )}
                    <div className="flex items-end">
                      <div className="p-4 bg-white/50 rounded-lg w-full text-center">
                        <span className="text-sm text-muted-foreground">Food Cost</span>
                        <div className="text-xl font-bold text-card-foreground">{formatCurrency(foodCost)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Miscellaneous Expenses */}
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-3">Miscellaneous Expenses</h3>
                  <div className="space-y-2">
                    {miscExpenses.map((expense) => (
                      <div key={expense.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        {editingExpense === expense.id ? (
                          <>
                            <Input
                              value={expense.name}
                              onChange={(e) => updateMiscExpense(expense.id, e.target.value, expense.cost)}
                              className="flex-1 input-modern"
                              placeholder="Expense name"
                            />
                            <Input
                              type="number"
                              value={expense.cost}
                              onChange={(e) => updateMiscExpense(expense.id, expense.name, parseFloat(e.target.value) || 0)}
                              className="w-24 input-modern"
                              placeholder="Cost"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingExpense(null)}
                            >
                              Save
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 font-medium text-card-foreground">{expense.name}</span>
                            <span className="font-bold text-card-foreground">{formatCurrency(expense.cost)}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingExpense(expense.id)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteMiscExpense(expense.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                    <div className="flex gap-3 p-3 bg-white/30 rounded-lg">
                      <Input
                        placeholder="Expense name"
                        value={newExpenseName}
                        onChange={(e) => setNewExpenseName(e.target.value)}
                        className="flex-1 input-modern"
                      />
                      <Input
                        type="number"
                        placeholder="Cost"
                        value={newExpenseCost}
                        onChange={(e) => setNewExpenseCost(e.target.value)}
                        className="w-24 input-modern"
                      />
                      <Button onClick={addMiscExpense} className="btn-primary">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profit Target */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Target className="w-5 h-5" />
                  Profit Target
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-card-foreground font-medium">Target Profit Margin (%)</Label>
                    <div className="mt-2 space-y-2">
                      <Slider
                        value={[targetProfitMargin]}
                        onValueChange={(value) => setTargetProfitMargin(value[0])}
                        max={50}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-center text-xl font-bold text-primary">{targetProfitMargin}%</div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-card-foreground font-medium">Business Tax (%)</Label>
                    <div className="mt-2 space-y-2">
                      <Slider
                        value={[businessTaxPercentage]}
                        onValueChange={(value) => setBusinessTaxPercentage(value[0])}
                        max={25}
                        min={0}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="text-center text-xl font-bold text-primary">{businessTaxPercentage}%</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/50 rounded-lg text-center">
                    <span className="text-sm text-muted-foreground">Adjusted Price per Person</span>
                    <div className="text-xl font-bold text-card-foreground">{formatCurrency(adjustedPricePerPerson)}</div>
                  </div>
                  <div className="p-4 bg-white/50 rounded-lg text-center">
                    <span className="text-sm text-muted-foreground">Target Profit</span>
                    <div className="text-xl font-bold text-card-foreground">{formatCurrency(adjustedProfit)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="xl:col-span-4 space-y-6">
            {/* Revenue Summary */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <TrendingUp className="w-5 h-5" />
                  Revenue Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Revenue</span>
                    <span className="font-bold text-card-foreground">{formatCurrency(baseRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gratuity ({gratuityPercentage}%)</span>
                    <span className="font-bold text-card-foreground">{formatCurrency(gratuityAmount)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-card-foreground">Total Revenue</span>
                      <span className="font-bold text-xl text-primary">{formatCurrency(totalRevenue)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Costs Summary */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Labor Costs</span>
                    <span className="font-bold text-card-foreground">{formatCurrency(totalLaborCosts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Food Costs</span>
                    <span className="font-bold text-card-foreground">{formatCurrency(foodCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Miscellaneous</span>
                    <span className="font-bold text-card-foreground">{formatCurrency(totalMiscCosts)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-card-foreground">Total Costs</span>
                      <span className="font-bold text-xl text-destructive">{formatCurrency(totalCosts)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profit Summary */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Profit Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Profit</span>
                    <span className={`font-bold ${actualProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(actualProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Business Tax ({businessTaxPercentage}%)</span>
                    <span className="font-bold text-card-foreground">{formatCurrency(businessTax)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-card-foreground">Net Profit</span>
                      <span className={`font-bold text-xl ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(netProfit)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Profit Margin</span>
                      <span className={`font-bold ${actualProfitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {actualProfitPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${actualProfitPercentage < 0 ? 'profit-negative' : ''}`}
                        style={{ width: `${Math.min(Math.abs(actualProfitPercentage), 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white/50 rounded-lg text-center">
                    <span className="text-sm text-muted-foreground">Break-even Guests</span>
                    <div className="text-2xl font-bold text-card-foreground">{breakEvenGuests}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventProfitCalculator;