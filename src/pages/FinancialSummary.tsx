import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FinancialSummary = () => {
  const navigate = useNavigate();
  const [hasData, setHasData] = useState(false);
  const [financialData, setFinancialData] = useState({
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
    lastUpdated
  } = financialData;

  // Show message if no data is available
  if (!hasData) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-card-foreground">Financial Summary</h1>
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