import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FinancialSummary = () => {
  // Mock data for now - in a real app, this would come from context or props
  const mockData = {
    baseRevenue: 4250,
    gratuityPercentage: 18,
    gratuityAmount: 765,
    totalRevenue: 5015,
    totalLaborCosts: 500,
    foodCost: 1275,
    totalMiscCosts: 450,
    totalCosts: 2225,
    actualProfit: 2790,
    businessTaxPercentage: 8,
    businessTax: 223.2,
    netProfit: 2566.8,
    actualProfitPercentage: 55.6,
    breakEvenGuests: 26
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const {
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
    breakEvenGuests
  } = mockData;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-card-foreground">Financial Summary</h1>
          <p className="text-muted-foreground">View your event's financial breakdown and profit analysis</p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <TrendingUp className="w-5 h-5" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Revenue Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-card-foreground text-sm uppercase tracking-wide">Revenue</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Revenue</span>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialSummary;