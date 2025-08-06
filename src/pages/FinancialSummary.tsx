import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, DollarSign, Percent, Users, Target, BarChart3, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FinancialSummary = () => {
  const navigate = useNavigate();
  const [hasData, setHasData] = useState(false);
  const [financialData, setFinancialData] = useState({
    numberOfGuests: 0,
    pricePerPerson: 0,
    baseRevenue: 0,
    gratuityPercentage: 0,
    gratuityAmount: 0,
    totalRevenue: 0,
    totalLaborCosts: 0,
    foodCost: 0,
    totalMiscCosts: 0,
    totalCosts: 0,
    actualProfit: 0,
    businessTaxPercentage: 0,
    businessTax: 0,
    netProfit: 0,
    actualProfitPercentage: 0,
    breakEvenGuests: 0,
    profitMargin: 0,
    foodCostPercentage: 0,
    totalExpensePercentage: 0,
    costPerPlate: 0,
    revenuePerPlate: 0,
    laborCostPercentage: 0,
    miscExpensePercentage: 0,
    lastUpdated: null as string | null
  });

  useEffect(() => {
    const savedData = localStorage.getItem('eventFinancialData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFinancialData(parsedData);
        setHasData(true);
      } catch (error) {
        console.error('Error parsing financial data:', error);
        setHasData(false);
      }
    } else {
      setHasData(false);
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const {
    numberOfGuests,
    pricePerPerson,
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
    profitMargin,
    foodCostPercentage,
    totalExpensePercentage,
    costPerPlate,
    revenuePerPlate,
    laborCostPercentage,
    miscExpensePercentage,
    lastUpdated
  } = financialData;

  // Show message if no data is available
  if (!hasData) {
    return (
      <div className="min-h-screen p-3 sm:p-6 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground">Financial Summary</h1>
            <p className="text-muted-foreground">View your event's financial breakdown and profit analysis</p>
          </div>

          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-2">No Financial Data Available</h3>
              <p className="text-muted-foreground mb-4">
                You need to process inputs in the calculator first to see your financial summary.
              </p>
              <Button onClick={() => navigate('/')} className="btn-primary">
                Go to Calculator
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-card-foreground">Financial Summary</h1>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">View your event's financial breakdown and profit analysis</p>
            {lastUpdated && (
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Key Metrics Cards */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(totalRevenue)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netProfit)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                  <p className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitMargin.toFixed(1)}%
                  </p>
                </div>
                <Percent className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Break-even</p>
                  <p className="text-2xl font-bold text-card-foreground">{breakEvenGuests}</p>
                  <p className="text-xs text-muted-foreground">guests</p>
                </div>
                <Users className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Financial Ratios & Percentages */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <PieChart className="w-5 h-5" />
                Financial Ratios & Percentages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Food Cost %</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-card-foreground">{foodCostPercentage.toFixed(1)}%</span>
                    <div className="w-20 h-2 bg-muted rounded-full">
                      <div 
                        className={`h-full rounded-full ${foodCostPercentage <= 30 ? 'bg-green-500' : foodCostPercentage <= 35 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(foodCostPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Labor Cost %</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-card-foreground">{laborCostPercentage.toFixed(1)}%</span>
                    <div className="w-20 h-2 bg-muted rounded-full">
                      <div 
                        className={`h-full rounded-full ${laborCostPercentage <= 25 ? 'bg-green-500' : laborCostPercentage <= 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(laborCostPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Expense %</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-card-foreground">{totalExpensePercentage.toFixed(1)}%</span>
                    <div className="w-20 h-2 bg-muted rounded-full">
                      <div 
                        className={`h-full rounded-full ${totalExpensePercentage <= 70 ? 'bg-green-500' : totalExpensePercentage <= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(totalExpensePercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Misc Expense %</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-card-foreground">{miscExpensePercentage.toFixed(1)}%</span>
                    <div className="w-20 h-2 bg-muted rounded-full">
                      <div 
                        className={`h-full rounded-full ${miscExpensePercentage <= 10 ? 'bg-green-500' : miscExpensePercentage <= 15 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(miscExpensePercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Per-Plate Analysis */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <BarChart3 className="w-5 h-5" />
                Per-Plate Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Revenue per Plate</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(revenuePerPlate)}</p>
                </div>
                <div className="text-center p-4 bg-destructive/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Cost per Plate</p>
                  <p className="text-xl font-bold text-destructive">{formatCurrency(costPerPlate)}</p>
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Profit per Plate</p>
                <p className={`text-xl font-bold ${(revenuePerPlate - costPerPlate) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(revenuePerPlate - costPerPlate)}
                </p>
              </div>
              
              <div className="mt-4 space-y-2">
                <h5 className="font-semibold text-card-foreground">Cost Breakdown per Plate:</h5>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Food Cost:</span>
                  <span className="font-medium">{formatCurrency(numberOfGuests > 0 ? foodCost / numberOfGuests : 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Labor Cost:</span>
                  <span className="font-medium">{formatCurrency(numberOfGuests > 0 ? totalLaborCosts / numberOfGuests : 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Other Costs:</span>
                  <span className="font-medium">{formatCurrency(numberOfGuests > 0 ? totalMiscCosts / numberOfGuests : 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Financial Breakdown */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <TrendingUp className="w-5 h-5" />
              Detailed Financial Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Revenue Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-card-foreground text-sm uppercase tracking-wide">Revenue</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Revenue ({numberOfGuests} guests × {formatCurrency(pricePerPerson)})</span>
                  <span className="font-bold text-card-foreground">{formatCurrency(baseRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gratuity ({gratuityPercentage}%)</span>
                  <span className="font-bold text-card-foreground">{formatCurrency(gratuityAmount)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-card-foreground">Total Revenue</span>
                    <span className="font-bold text-lg text-primary">{formatCurrency(totalRevenue)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-card-foreground text-sm uppercase tracking-wide">Costs</h4>
              <div className="space-y-2">
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
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-card-foreground">Total Costs</span>
                    <span className="font-bold text-lg text-destructive">{formatCurrency(totalCosts)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profit Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-card-foreground text-sm uppercase tracking-wide">Profit Analysis</h4>
              <div className="space-y-2">
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
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-card-foreground">Net Profit</span>
                    <span className={`font-bold text-xl ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(netProfit)}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Profit Margin</span>
                    <span className={`font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profitMargin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${profitMargin < 0 ? 'profit-negative' : ''}`}
                      style={{ width: `${Math.min(Math.abs(profitMargin), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Insights & Suggestions */}
            <div className="space-y-3">
              <h4 className="font-semibold text-card-foreground text-sm uppercase tracking-wide">Financial Insights & Suggestions</h4>
              <div className="space-y-3">
                {foodCostPercentage > 35 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Food Cost Alert:</strong> Your food cost percentage ({foodCostPercentage.toFixed(1)}%) is above the recommended 30-35% range. Consider reviewing portion sizes, sourcing costs, or menu pricing.
                    </p>
                  </div>
                )}
                {laborCostPercentage > 30 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Labor Cost Notice:</strong> Your labor cost percentage ({laborCostPercentage.toFixed(1)}%) is above the typical 25-30% range. Consider optimizing staff allocation or hourly rates.
                    </p>
                  </div>
                )}
                {profitMargin < 15 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Profit Margin Concern:</strong> Your profit margin ({profitMargin.toFixed(1)}%) is below the healthy 15-25% range. Consider increasing prices or reducing costs.
                    </p>
                  </div>
                )}
                {profitMargin >= 20 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Excellent Profitability:</strong> Your profit margin ({profitMargin.toFixed(1)}%) is in the healthy range. This indicates good cost control and pricing strategy.
                    </p>
                  </div>
                )}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Industry Benchmarks:</strong> Aim for Food Cost: 28-35%, Labor: 25-30%, Total Expenses: 65-75%, Profit Margin: 15-25%.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialSummary;