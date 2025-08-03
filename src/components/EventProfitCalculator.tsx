import React, { useState, useCallback, useMemo } from 'react';
import { Calculator, DollarSign, Users, Percent, Target, TrendingUp, Plus, Edit2, Trash2, RotateCcw, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FinancialSummary from '@/pages/FinancialSummary';

// Utility function to handle number input values and remove leading zeros
const handleNumberInput = (value: string): string => {
  // Remove leading zeros but keep the value if it's just "0"
  if (value === '' || value === '0') return value;
  // Remove leading zeros
  const cleanedValue = value.replace(/^0+/, '');
  // If all digits were zeros, return "0"
  return cleanedValue === '' ? '0' : cleanedValue;
};

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
  const [gratuityMode, setGratuityMode] = useState<'18' | '20' | 'other'>('18');
  const [gratuityEnabled, setGratuityEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Expenses states
  const [laborRoles, setLaborRoles] = useState<LaborRole[]>([
    { id: '1', name: 'Chef 1', cost: 200 },
    { id: '2', name: 'Chef 2', cost: 180 },
    { id: '3', name: 'Assistant', cost: 120 }
  ]);
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
  const gratuityAmount = useMemo(() => gratuityEnabled ? baseRevenue * (gratuityPercentage / 100) : 0, [baseRevenue, gratuityPercentage, gratuityEnabled]);
  const totalRevenue = useMemo(() => baseRevenue + gratuityAmount, [baseRevenue, gratuityAmount]);

  // Expense calculations
  const totalLaborCosts = useMemo(() => laborRoles.reduce((sum, role) => sum + role.cost, 0), [laborRoles]);
  const foodCost = useMemo(() => foodCostFixed, [foodCostFixed]);
  const totalMiscCosts = useMemo(() => miscExpenses.reduce((sum, expense) => sum + expense.cost, 0), [miscExpenses]);
  const totalCosts = useMemo(() => totalLaborCosts + foodCost + totalMiscCosts, [totalLaborCosts, foodCost, totalMiscCosts]);

  // Profit calculations
  const actualProfit = useMemo(() => baseRevenue - totalCosts, [baseRevenue, totalCosts]);
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
    const name = prompt('Enter labor role name:');
    const cost = prompt('Enter labor cost:');
    if (name && cost) {
      const newRole: LaborRole = {
        id: Date.now().toString(),
        name: name,
        cost: parseFloat(cost) || 0
      };
      setLaborRoles(prev => [...prev, newRole]);
    }
  }, []);

  const updateLaborRole = useCallback((id: string, name: string, cost: number) => {
    setLaborRoles(prev => prev.map(role => role.id === id ? { ...role, name, cost } : role));
  }, []);

  const saveEditingLabor = useCallback(() => {
    setEditingLabor(null);
  }, []);

  const deleteLaborRole = useCallback((id: string) => {
    setLaborRoles(prev => prev.filter(role => role.id !== id));
  }, []);

  // Misc expense management
  const addMiscExpense = useCallback(() => {
    const name = prompt('Enter expense name:');
    const cost = prompt('Enter expense cost:');
    if (name && cost) {
      const newExpense: MiscExpense = {
        id: Date.now().toString(),
        name: name,
        cost: parseFloat(cost) || 0
      };
      setMiscExpenses(prev => [...prev, newExpense]);
    }
  }, []);

  const updateMiscExpense = useCallback((id: string, name: string, cost: number) => {
    setMiscExpenses(prev => prev.map(expense => expense.id === id ? { ...expense, name, cost } : expense));
  }, []);

  const saveEditingExpense = useCallback(() => {
    setEditingExpense(null);
  }, []);

  const deleteMiscExpense = useCallback((id: string) => {
    setMiscExpenses(prev => prev.filter(expense => expense.id !== id));
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const resetInputs = useCallback(() => {
    setNumberOfGuests(0);
    setPricePerPerson(0);
    setGratuityPercentage(18);
    setGratuityMode('18');
    setGratuityEnabled(true);
    setLaborRoles([]);
    setFoodCostFixed(0);
    setMiscExpenses([]);
    setTargetProfitMargin(25);
    setBusinessTaxPercentage(8);
    setEditingLabor(null);
    setEditingExpense(null);
    setNewLaborName('');
    setNewLaborCost('');
    setNewExpenseName('');
    setNewExpenseCost('');
  }, []);

  const processInputs = useCallback(async () => {
    setIsProcessing(true);
    
    // Calculate and save data to localStorage for Financial Summary
    const financialData = {
      baseRevenue,
      gratuityPercentage,
      gratuityAmount,
      totalRevenue,
      totalLaborCosts,
      foodCost,
      totalMiscCosts,
      totalCosts,
      actualProfit,
      businessTaxPercentage,
      businessTax,
      netProfit,
      actualProfitPercentage,
      breakEvenGuests,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('eventFinancialData', JSON.stringify(financialData));
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsProcessing(false);
  }, [
    baseRevenue, gratuityPercentage, gratuityAmount, totalRevenue,
    totalLaborCosts, foodCost, totalMiscCosts, totalCosts,
    actualProfit, businessTaxPercentage, businessTax, netProfit,
    actualProfitPercentage, breakEvenGuests
  ]);

  return (
    <div className="min-h-screen p-2 lg:p-4">
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="event" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="event">Event</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="event" className="space-y-4 mt-4">
            {/* Event Details */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Users className="w-5 h-5" />
                  Event Details
                  <div className="ml-auto flex gap-2">
                    <Button
                      onClick={resetInputs}
                      variant="outline"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    <Button
                      onClick={processInputs}
                      disabled={isProcessing}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Refresh'}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="guests" className="text-card-foreground font-medium min-w-[120px]">Number of Guests</Label>
                    <Input
                      id="guests"
                      type="number"
                      value={numberOfGuests}
                      onChange={(e) => {
                        const cleanedValue = handleNumberInput(e.target.value);
                        setNumberOfGuests(parseInt(cleanedValue) || 0);
                      }}
                      className="input-modern text-right"
                      min="1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor="price" className="text-card-foreground font-medium min-w-[120px]">Price per Person</Label>
                    <Input
                      id="price"
                      type="number"
                      value={pricePerPerson}
                      onChange={(e) => {
                        const cleanedValue = handleNumberInput(e.target.value);
                        setPricePerPerson(parseFloat(cleanedValue) || 0);
                      }}
                      className="input-modern text-right"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <div className="text-center">
                      <Label className="text-card-foreground font-medium">Base Revenue</Label>
                      <div className="mt-1 p-3 bg-white/50 rounded-lg">
                        <div className="text-xl font-bold text-primary text-right">{formatCurrency(baseRevenue)}</div>
                      </div>
                    </div>
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
              <CardContent className="space-y-4">
                {/* Food Costs */}
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">Food Costs</h3>
                  <div className="border border-border/20 rounded-lg overflow-hidden">
                    <div className="bg-muted/50 border-b border-border/20 p-2 grid grid-cols-12 gap-2 font-semibold text-sm text-muted-foreground">
                      <div className="col-span-6">Item</div>
                      <div className="col-span-4 text-right">Cost</div>
                      <div className="col-span-2 text-center">Actions</div>
                    </div>
                    <div className="grid grid-cols-12 gap-2 p-2 items-center">
                      <div className="col-span-6 font-medium text-card-foreground">Food Cost</div>
                      <div className="col-span-4">
                        <Input
                          type="number"
                          value={foodCostFixed}
                          onChange={(e) => {
                            const cleanedValue = handleNumberInput(e.target.value);
                            setFoodCostFixed(parseFloat(cleanedValue) || 0);
                          }}
                          className="input-modern text-right"
                        />
                      </div>
                      <div className="col-span-2"></div>
                    </div>
                    <div className="border-t-2 border-primary/20 bg-primary/5 p-2 grid grid-cols-12 gap-2">
                      <div className="col-span-6 font-semibold text-card-foreground">Total Food Costs</div>
                      <div className="col-span-4 font-bold text-lg text-primary text-right">{formatCurrency(foodCost)}</div>
                      <div className="col-span-2"></div>
                    </div>
                  </div>
                </div>

                {/* Labor Costs */}
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">Labor</h3>
                  <div className="border border-border/20 rounded-lg overflow-hidden">
                    <div className="bg-muted/50 border-b border-border/20 p-2 grid grid-cols-12 gap-2 font-semibold text-sm text-muted-foreground">
                      <div className="col-span-6">Role</div>
                      <div className="col-span-4 text-right">Cost</div>
                      <div className="col-span-2 text-center">Actions</div>
                    </div>
                    {laborRoles.map((role, index) => (
                      <div key={role.id} className={`grid grid-cols-12 gap-2 p-2 items-center ${index !== laborRoles.length - 1 ? 'border-b border-border/10' : ''}`}>
                        {editingLabor === role.id ? (
                          <>
                            <div className="col-span-6">
                              <Input
                                value={role.name}
                                onChange={(e) => updateLaborRole(role.id, e.target.value, role.cost)}
                                className="input-modern"
                                placeholder="Role name"
                              />
                            </div>
                            <div className="col-span-4">
                              <Input
                                type="number"
                                value={role.cost}
                                onChange={(e) => {
                                  const cleanedValue = handleNumberInput(e.target.value);
                                  updateLaborRole(role.id, role.name, parseFloat(cleanedValue) || 0);
                                }}
                                className="input-modern text-right"
                                placeholder="Cost"
                              />
                            </div>
                            <div className="col-span-2 flex justify-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={saveEditingLabor}
                              >
                                Save
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="col-span-6 font-medium text-card-foreground">{role.name}</div>
                            <div className="col-span-4 font-bold text-card-foreground text-right">{formatCurrency(role.cost)}</div>
                            <div className="col-span-2 flex justify-center gap-1">
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
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    <div className="border-t border-border/20 bg-muted/30 p-2 flex justify-center">
                      <Button onClick={addLaborRole} className="btn-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Labor
                      </Button>
                    </div>
                    <div className="border-t-2 border-primary/20 bg-primary/5 p-2 grid grid-cols-12 gap-2">
                      <div className="col-span-6 font-semibold text-card-foreground">Total Labor Costs</div>
                      <div className="col-span-4 font-bold text-lg text-primary text-right">{formatCurrency(totalLaborCosts)}</div>
                      <div className="col-span-2"></div>
                    </div>
                  </div>
                </div>

                {/* Miscellaneous Expenses */}
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">Miscellaneous Expenses</h3>
                  <div className="border border-border/20 rounded-lg overflow-hidden">
                    <div className="bg-muted/50 border-b border-border/20 p-2 grid grid-cols-12 gap-3 font-semibold text-sm text-muted-foreground">
                      <div className="col-span-6">Expense</div>
                      <div className="col-span-3 text-right">Cost</div>
                      <div className="col-span-3 text-center">Actions</div>
                    </div>
                    {miscExpenses.map((expense, index) => (
                      <div key={expense.id} className={`grid grid-cols-12 gap-3 p-2 items-center ${index !== miscExpenses.length - 1 ? 'border-b border-border/10' : ''}`}>
                        {editingExpense === expense.id ? (
                          <>
                            <div className="col-span-6">
                              <Input
                                value={expense.name}
                                onChange={(e) => updateMiscExpense(expense.id, e.target.value, expense.cost)}
                                className="input-modern"
                                placeholder="Expense name"
                              />
                            </div>
                            <div className="col-span-3">
                              <Input
                                type="number"
                                value={expense.cost}
                                onChange={(e) => {
                                  const cleanedValue = handleNumberInput(e.target.value);
                                  updateMiscExpense(expense.id, expense.name, parseFloat(cleanedValue) || 0);
                                }}
                                className="input-modern text-right"
                                placeholder="Cost"
                              />
                            </div>
                            <div className="col-span-3 flex justify-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={saveEditingExpense}
                              >
                                Save
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="col-span-6 font-medium text-card-foreground">{expense.name}</div>
                            <div className="col-span-3 font-bold text-card-foreground text-right">{formatCurrency(expense.cost)}</div>
                            <div className="col-span-3 flex justify-center gap-2">
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
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    <div className="border-t border-border/20 bg-muted/30 p-2 flex justify-center">
                      <Button onClick={addMiscExpense} className="btn-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Expense
                      </Button>
                    </div>
                    <div className="border-t-2 border-primary/20 bg-primary/5 p-2 grid grid-cols-12 gap-3">
                      <div className="col-span-6 font-semibold text-card-foreground">Total Miscellaneous</div>
                      <div className="col-span-3 font-bold text-lg text-primary text-right">{formatCurrency(totalMiscCosts)}</div>
                      <div className="col-span-3"></div>
                    </div>
                  </div>
                </div>

                {/* Total Expenses Summary */}
                <div className="border-2 border-primary/30 bg-primary/10 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Food Cost</div>
                      <div className="text-lg font-bold text-card-foreground">{formatCurrency(foodCost)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Labor Costs</div>
                      <div className="text-lg font-bold text-card-foreground">{formatCurrency(totalLaborCosts)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Miscellaneous</div>
                      <div className="text-lg font-bold text-card-foreground">{formatCurrency(totalMiscCosts)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Total Expenses</div>
                      <div className="text-xl font-bold text-primary">{formatCurrency(totalCosts)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profit Analysis */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <TrendingUp className="w-5 h-5" />
                  Profit Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-card-foreground">Number of Guests:</span>
                      <span className="font-bold text-card-foreground">{numberOfGuests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-card-foreground">Price per Person:</span>
                      <span className="font-bold text-card-foreground">{formatCurrency(pricePerPerson)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-card-foreground">Base Revenue:</span>
                      <span className="font-bold text-card-foreground">{formatCurrency(baseRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-card-foreground">Total Expenses:</span>
                      <span className="font-bold text-card-foreground">{formatCurrency(totalCosts)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-card-foreground font-semibold">Net Profit:</span>
                        <span className="font-bold text-lg text-primary">{formatCurrency(actualProfit)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="gratuityPercent" className="text-card-foreground font-medium min-w-[120px]">Gratuity %:</Label>
                      <Input
                        id="gratuityPercent"
                        type="number"
                        value={gratuityPercentage}
                        onChange={(e) => {
                          const cleanedValue = handleNumberInput(e.target.value);
                          setGratuityPercentage(parseFloat(cleanedValue) || 0);
                        }}
                        className="input-modern text-right"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="Enter %"
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-card-foreground">Gratuity Amount:</span>
                      <span className="font-bold text-card-foreground">{formatCurrency(gratuityAmount)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-card-foreground font-semibold text-lg">Total Profit:</span>
                        <span className="font-bold text-2xl text-primary">{formatCurrency(actualProfit + gratuityAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="summary" className="space-y-4 mt-4">
            <FinancialSummary />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EventProfitCalculator;