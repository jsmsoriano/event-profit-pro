import React, { useState, useCallback, useMemo } from 'react';
import { Calculator, DollarSign, Users, Percent, Target, TrendingUp, Plus, Edit2, Trash2, Play } from 'lucide-react';
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
  const [gratuityMode, setGratuityMode] = useState<'18' | '20' | 'other'>('18');
  const [gratuityEnabled, setGratuityEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

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
  const gratuityAmount = useMemo(() => gratuityEnabled ? baseRevenue * (gratuityPercentage / 100) : 0, [baseRevenue, gratuityPercentage, gratuityEnabled]);
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
  }, []);

  const saveEditingLabor = useCallback(() => {
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

  const processInputs = useCallback(async () => {
    setIsProcessing(true);
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsProcessing(false);
  }, []);

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">

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
                    onClick={processInputs}
                    disabled={isProcessing}
                    className="ml-auto"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Processing...' : 'Process Inputs'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <Label htmlFor="guests" className="text-card-foreground font-medium">Number of Guests</Label>
                    <Input
                      id="guests"
                      type="number"
                      value={numberOfGuests}
                      onChange={(e) => setNumberOfGuests(parseInt(e.target.value) || 0)}
                      className="input-modern mt-2"
                      min="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price" className="text-card-foreground font-medium">Price per Person</Label>
                    <Input
                      id="price"
                      type="number"
                      value={pricePerPerson}
                      onChange={(e) => setPricePerPerson(parseFloat(e.target.value) || 0)}
                      className="input-modern mt-2"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Label htmlFor="gratuity" className="text-card-foreground font-medium">Gratuity</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGratuityEnabled(!gratuityEnabled)}
                        className={gratuityEnabled ? 'text-green-600' : 'text-red-600'}
                      >
                        {gratuityEnabled ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                    {gratuityEnabled ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Button
                            variant={gratuityMode === '18' ? 'default' : 'outline'}
                            onClick={() => {
                              setGratuityMode('18');
                              setGratuityPercentage(18);
                            }}
                            className="flex-1"
                          >
                            18%
                          </Button>
                          <Button
                            variant={gratuityMode === '20' ? 'default' : 'outline'}
                            onClick={() => {
                              setGratuityMode('20');
                              setGratuityPercentage(20);
                            }}
                            className="flex-1"
                          >
                            20%
                          </Button>
                          <Button
                            variant={gratuityMode === 'other' ? 'default' : 'outline'}
                            onClick={() => setGratuityMode('other')}
                            className="flex-1"
                          >
                            Other
                          </Button>
                        </div>
                        {gratuityMode === 'other' && (
                          <Input
                            id="gratuity"
                            type="number"
                            value={gratuityPercentage}
                            onChange={(e) => setGratuityPercentage(parseFloat(e.target.value) || 0)}
                            className="input-modern"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="Enter percentage"
                          />
                        )}
                        <div className="text-center text-xl font-bold text-primary">
                          {gratuityPercentage}% = {formatCurrency(gratuityAmount)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-lg text-muted-foreground">
                        Gratuity disabled
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-card-foreground font-medium">Total Revenue</Label>
                    <div className="mt-2 p-4 bg-white/50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{formatCurrency(totalRevenue)}</div>
                      <div className="text-sm text-muted-foreground">
                        Base: {formatCurrency(baseRevenue)} + Gratuity: {formatCurrency(gratuityAmount)}
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
              <CardContent className="space-y-6">
                {/* Labor Costs */}
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-3">Labor Roles</h3>
                  <div className="border border-border/20 rounded-lg overflow-hidden">
                    <div className="bg-muted/50 border-b border-border/20 p-3 grid grid-cols-12 gap-3 font-semibold text-sm text-muted-foreground">
                      <div className="col-span-6">Role</div>
                      <div className="col-span-3 text-right">Cost</div>
                      <div className="col-span-3 text-center">Actions</div>
                    </div>
                    {laborRoles.map((role, index) => (
                      <div key={role.id} className={`grid grid-cols-12 gap-3 p-3 items-center ${index !== laborRoles.length - 1 ? 'border-b border-border/10' : ''}`}>
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
                            <div className="col-span-3">
                              <Input
                                type="number"
                                value={role.cost}
                                onChange={(e) => updateLaborRole(role.id, role.name, parseFloat(e.target.value) || 0)}
                                className="input-modern text-right"
                                placeholder="Cost"
                              />
                            </div>
                            <div className="col-span-3 flex justify-center">
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
                            <div className="col-span-3 font-bold text-card-foreground text-right">{formatCurrency(role.cost)}</div>
                            <div className="col-span-3 flex justify-center gap-2">
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
                    <div className="border-t border-border/20 bg-muted/30 p-3 grid grid-cols-12 gap-3">
                      <div className="col-span-6">
                        <Input
                          placeholder="New role name"
                          value={newLaborName}
                          onChange={(e) => setNewLaborName(e.target.value)}
                          className="input-modern"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          placeholder="Cost"
                          value={newLaborCost}
                          onChange={(e) => setNewLaborCost(e.target.value)}
                          className="input-modern text-right"
                        />
                      </div>
                      <div className="col-span-3 flex justify-center">
                        <Button onClick={addLaborRole} className="btn-primary">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="border-t-2 border-primary/20 bg-primary/5 p-3 grid grid-cols-12 gap-3">
                      <div className="col-span-6 font-semibold text-card-foreground">Total Labor Costs</div>
                      <div className="col-span-3 font-bold text-lg text-primary text-right">{formatCurrency(totalLaborCosts)}</div>
                      <div className="col-span-3"></div>
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
                        <Input
                          type="number"
                          value={foodCostPercentage}
                          onChange={(e) => setFoodCostPercentage(parseFloat(e.target.value) || 0)}
                          className="input-modern mt-2"
                          min="0"
                          max="100"
                          step="1"
                        />
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
                  <div className="border border-border/20 rounded-lg overflow-hidden">
                    <div className="bg-muted/50 border-b border-border/20 p-3 grid grid-cols-12 gap-3 font-semibold text-sm text-muted-foreground">
                      <div className="col-span-6">Expense</div>
                      <div className="col-span-3 text-right">Cost</div>
                      <div className="col-span-3 text-center">Actions</div>
                    </div>
                    {miscExpenses.map((expense, index) => (
                      <div key={expense.id} className={`grid grid-cols-12 gap-3 p-3 items-center ${index !== miscExpenses.length - 1 ? 'border-b border-border/10' : ''}`}>
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
                                onChange={(e) => updateMiscExpense(expense.id, expense.name, parseFloat(e.target.value) || 0)}
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
                    <div className="border-t border-border/20 bg-muted/30 p-3 grid grid-cols-12 gap-3">
                      <div className="col-span-6">
                        <Input
                          placeholder="New expense name"
                          value={newExpenseName}
                          onChange={(e) => setNewExpenseName(e.target.value)}
                          className="input-modern"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          placeholder="Cost"
                          value={newExpenseCost}
                          onChange={(e) => setNewExpenseCost(e.target.value)}
                          className="input-modern text-right"
                        />
                      </div>
                      <div className="col-span-3 flex justify-center">
                        <Button onClick={addMiscExpense} className="btn-primary">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="border-t-2 border-primary/20 bg-primary/5 p-3 grid grid-cols-12 gap-3">
                      <div className="col-span-6 font-semibold text-card-foreground">Total Miscellaneous</div>
                      <div className="col-span-3 font-bold text-lg text-primary text-right">{formatCurrency(totalMiscCosts)}</div>
                      <div className="col-span-3"></div>
                    </div>
                  </div>
                </div>

                {/* Total Expenses Summary */}
                <div className="border-2 border-primary/30 bg-primary/10 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-muted-foreground">Labor Costs</div>
                      <div className="text-lg font-bold text-card-foreground">{formatCurrency(totalLaborCosts)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Food + Misc</div>
                      <div className="text-lg font-bold text-card-foreground">{formatCurrency(foodCost + totalMiscCosts)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total Expenses</div>
                      <div className="text-2xl font-bold text-primary">{formatCurrency(totalCosts)}</div>
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
                    <Input
                      type="number"
                      value={targetProfitMargin}
                      onChange={(e) => setTargetProfitMargin(parseFloat(e.target.value) || 0)}
                      className="input-modern mt-2"
                      min="0"
                      max="100"
                      step="1"
                    />
                  </div>
                  <div>
                    <Label className="text-card-foreground font-medium">Business Tax (%)</Label>
                    <Input
                      type="number"
                      value={businessTaxPercentage}
                      onChange={(e) => setBusinessTaxPercentage(parseFloat(e.target.value) || 0)}
                      className="input-modern mt-2"
                      min="0"
                      max="100"
                      step="0.5"
                    />
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

          {/* Right Column - Quick Results */}
          <div className="xl:col-span-4 space-y-6">
            {/* Quick Results Card */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <TrendingUp className="w-5 h-5" />
                  Quick Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-white/50 rounded-lg text-center">
                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                    <div className="text-2xl font-bold text-primary">{formatCurrency(totalRevenue)}</div>
                  </div>
                  <div className="p-4 bg-white/50 rounded-lg text-center">
                    <span className="text-sm text-muted-foreground">Total Costs</span>
                    <div className="text-2xl font-bold text-destructive">{formatCurrency(totalCosts)}</div>
                  </div>
                  <div className="p-4 bg-white/50 rounded-lg text-center">
                    <span className="text-sm text-muted-foreground">Net Profit</span>
                    <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(netProfit)}
                    </div>
                  </div>
                  <div className="p-4 bg-white/50 rounded-lg text-center">
                    <span className="text-sm text-muted-foreground">Profit Margin</span>
                    <div className={`text-xl font-bold ${actualProfitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {actualProfitPercentage.toFixed(1)}%
                    </div>
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