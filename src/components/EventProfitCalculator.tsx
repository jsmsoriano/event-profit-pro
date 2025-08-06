import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calculator, DollarSign, Users, Percent, Target, TrendingUp, Plus, Edit2, Trash2, RotateCcw, RefreshCw, Save, Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import FinancialSummary from '@/pages/FinancialSummary';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

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
  payType: 'percentage' | 'fixed';
  revenuePercentage?: number;
  gratuityPercentage?: number;
  fixedAmount?: number;
  calculatedCost?: number; // This will store the final calculated cost for display
}

interface MiscExpense {
  id: string;
  type: string;
  cost: number;
  costType: 'fixed' | 'percentage'; // fixed dollar amount or percentage of revenue
}

interface FoodCostItem {
  id: string;
  type: string;
  cost: number;
}

interface AdminSettings {
  laborRevenuePercentage: number;
  laborRoles: { id: string; name: string; payType: 'percentage' | 'fixed'; revenuePercentage?: number; fixedAmount?: number; }[];
  expenseTypes: string[];
  foodCostTypes: string[];
}

const defaultAdminSettings: AdminSettings = {
  laborRevenuePercentage: 30,
  laborRoles: [
    { id: 'chef-default', name: 'Chef', payType: 'percentage', revenuePercentage: 20 }
  ],
  expenseTypes: ['Equipment Rental', 'Transportation', 'Utilities', 'Insurance', 'Marketing', 'Supplies'],
  foodCostTypes: ['Proteins', 'Vegetables', 'Grains', 'Dairy', 'Beverages', 'Seasonings']
};

const EventProfitCalculator = () => {
  // Admin settings
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(defaultAdminSettings);

  // Main calculator states with default values
  const [numberOfGuests, setNumberOfGuests] = useState(10);
  const [pricePerPerson, setPricePerPerson] = useState(55);
  const [gratuityPercentage, setGratuityPercentage] = useState(20);
  const [gratuityMode, setGratuityMode] = useState<'18' | '20' | 'other'>('20');
  const [gratuityEnabled, setGratuityEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Edit states for expenses
  const [editingFoodItem, setEditingFoodItem] = useState<string | null>(null);
  const [editingMiscExpense, setEditingMiscExpense] = useState<string | null>(null);

  // Report functionality states
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [reportName, setReportName] = useState('');
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Expenses states - now using admin-controlled dropdowns
  const [laborRoles, setLaborRoles] = useState<LaborRole[]>([]);
  const [foodCostItems, setFoodCostItems] = useState<FoodCostItem[]>([]);
  const [miscExpenses, setMiscExpenses] = useState<MiscExpense[]>([]);

  // Profit target states
  const [targetProfitMargin, setTargetProfitMargin] = useState(25);
  const [businessTaxPercentage, setBusinessTaxPercentage] = useState(8);

  // Load admin settings and saved calculator data on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      setAdminSettings(JSON.parse(savedSettings));
    }

    // Load saved calculator data to maintain state between screens
    const savedCalculatorData = localStorage.getItem('calculatorState');
    if (savedCalculatorData) {
      try {
        const data = JSON.parse(savedCalculatorData);
        setNumberOfGuests(data.numberOfGuests || 10);
        setPricePerPerson(data.pricePerPerson || 55);
        setGratuityPercentage(data.gratuityPercentage || 20);
        setGratuityMode(data.gratuityMode || '20');
        setGratuityEnabled(data.gratuityEnabled !== undefined ? data.gratuityEnabled : true);
        setLaborRoles(data.laborRoles || []);
        setFoodCostItems(data.foodCostItems || []);
        setMiscExpenses(data.miscExpenses || []);
        setTargetProfitMargin(data.targetProfitMargin || 25);
        setBusinessTaxPercentage(data.businessTaxPercentage || 8);
      } catch (error) {
        console.error('Error loading calculator state:', error);
      }
    }
  }, []);

  // Save calculator state whenever it changes
  useEffect(() => {
    const calculatorState = {
      numberOfGuests,
      pricePerPerson,
      gratuityPercentage,
      gratuityMode,
      gratuityEnabled,
      laborRoles,
      foodCostItems,
      miscExpenses,
      targetProfitMargin,
      businessTaxPercentage
    };
    localStorage.setItem('calculatorState', JSON.stringify(calculatorState));
  }, [numberOfGuests, pricePerPerson, gratuityPercentage, gratuityMode, gratuityEnabled, laborRoles, foodCostItems, miscExpenses, targetProfitMargin, businessTaxPercentage]);

  // Revenue calculations
  const baseRevenue = useMemo(() => numberOfGuests * pricePerPerson, [numberOfGuests, pricePerPerson]);
  const gratuityAmount = useMemo(() => gratuityEnabled ? baseRevenue * (gratuityPercentage / 100) : 0, [baseRevenue, gratuityPercentage, gratuityEnabled]);
  const totalRevenue = useMemo(() => baseRevenue + gratuityAmount, [baseRevenue, gratuityAmount]);

  // Maximum labor budget from admin settings
  const maxLaborBudget = useMemo(() => totalRevenue * (adminSettings.laborRevenuePercentage / 100), [totalRevenue, adminSettings.laborRevenuePercentage]);

  // Calculate labor costs with updated gratuity split logic
  const calculatedLaborRoles = useMemo(() => {
    const gratuityPerRole = laborRoles.length > 0 ? gratuityAmount / laborRoles.length : 0;
    
    return laborRoles.map(role => {
      let calculatedCost = 0;
      
      if (role.payType === 'percentage') {
        // Chef gets percentage of revenue plus split of gratuity
        const revenueAmount = baseRevenue * ((role.revenuePercentage || 0) / 100);
        calculatedCost = revenueAmount + gratuityPerRole;
      } else {
        // Fixed amount roles (like Assistant) get fixed amount plus gratuity split
        calculatedCost = (role.fixedAmount || 0) + gratuityPerRole;
      }
      
      return {
        ...role,
        calculatedCost
      };
    });
  }, [laborRoles, baseRevenue, gratuityAmount]);

  // Expense calculations
  const totalLaborCosts = useMemo(() => calculatedLaborRoles.reduce((sum, role) => sum + (role.calculatedCost || 0), 0), [calculatedLaborRoles]);
  const totalFoodCosts = useMemo(() => foodCostItems.reduce((sum, item) => sum + item.cost, 0), [foodCostItems]);
  const totalMiscCosts = useMemo(() => miscExpenses.reduce((sum, expense) => {
    if (expense.costType === 'percentage') {
      return sum + (baseRevenue * (expense.cost / 100));
    }
    return sum + expense.cost;
  }, 0), [miscExpenses, baseRevenue]);
  const totalCosts = useMemo(() => totalLaborCosts + totalFoodCosts + totalMiscCosts, [totalLaborCosts, totalFoodCosts, totalMiscCosts]);

  // Gratuity is now already included in labor costs for percentage-based roles
  const gratuityForLabor = useMemo(() => {
    return gratuityAmount; // All gratuity goes to labor roles
  }, [gratuityAmount]);

  const adjustedLaborCosts = useMemo(() => totalLaborCosts, [totalLaborCosts]);

  // Profit calculations (gratuity minus what goes to labor is profit)
  const actualProfit = useMemo(() => baseRevenue - totalCosts + (gratuityAmount - gratuityForLabor), [baseRevenue, totalCosts, gratuityAmount, gratuityForLabor]);
  const actualProfitPercentage = useMemo(() => totalRevenue > 0 ? (actualProfit / totalRevenue) * 100 : 0, [actualProfit, totalRevenue]);

  // Break-even calculation
  const breakEvenGuests = useMemo(() => 
    pricePerPerson > 0 ? Math.ceil(totalCosts / (pricePerPerson * (1 + gratuityPercentage / 100))) : 0,
    [totalCosts, pricePerPerson, gratuityPercentage]
  );

  // Labor role management
  const addLaborRole = useCallback(() => {
    if (adminSettings.laborRoles.length > 0) {
      const adminRole = adminSettings.laborRoles[0];
      const newRole: LaborRole = {
        id: Date.now().toString(),
        name: adminRole.name,
        payType: adminRole.payType,
        revenuePercentage: adminRole.revenuePercentage,
        fixedAmount: adminRole.fixedAmount || 0
      };
      setLaborRoles(prev => [...prev, newRole]);
    }
  }, [adminSettings.laborRoles]);

  const updateLaborRole = useCallback((id: string, updates: Partial<LaborRole>) => {
    setLaborRoles(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const deleteLaborRole = useCallback((id: string) => {
    setLaborRoles(prev => prev.filter(role => role.id !== id));
  }, []);

  // Food cost management
  const addFoodCostItem = useCallback(() => {
    if (adminSettings.foodCostTypes.length > 0) {
      const newItem: FoodCostItem = {
        id: Date.now().toString(),
        type: adminSettings.foodCostTypes[0],
        cost: 0
      };
      setFoodCostItems(prev => [...prev, newItem]);
      // Automatically start editing the new item
      setEditingFoodItem(newItem.id);
    }
  }, [adminSettings.foodCostTypes]);

  const updateFoodCostItem = useCallback((id: string, type: string, cost: number) => {
    setFoodCostItems(prev => prev.map(item => item.id === id ? { ...item, type, cost } : item));
  }, []);

  const deleteFoodCostItem = useCallback((id: string) => {
    setFoodCostItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Misc expense management
  const addMiscExpense = useCallback(() => {
    if (adminSettings.expenseTypes.length > 0) {
      const newExpense: MiscExpense = {
        id: Date.now().toString(),
        type: adminSettings.expenseTypes[0],
        cost: 0,
        costType: 'fixed'
      };
      setMiscExpenses(prev => [...prev, newExpense]);
      // Automatically start editing the new expense
      setEditingMiscExpense(newExpense.id);
    }
  }, [adminSettings.expenseTypes]);

  const updateMiscExpense = useCallback((id: string, updates: Partial<MiscExpense>) => {
    setMiscExpenses(prev => prev.map(expense => expense.id === id ? { ...expense, ...updates } : expense));
  }, []);

  const deleteMiscExpense = useCallback((id: string) => {
    setMiscExpenses(prev => prev.filter(expense => expense.id !== id));
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const resetInputs = useCallback(() => {
    setNumberOfGuests(10);
    setPricePerPerson(55);
    setGratuityPercentage(20);
    setGratuityMode('20');
    setGratuityEnabled(true);
    setLaborRoles([]);
    setFoodCostItems([]);
    setMiscExpenses([]);
    setTargetProfitMargin(25);
    setBusinessTaxPercentage(8);
    // Clear saved state
    localStorage.removeItem('calculatorState');
  }, []);

  const processInputs = useCallback(async () => {
    setIsProcessing(true);
    
    // Calculate and save data to localStorage for Financial Summary
    const totalProfitWithGratuity = actualProfit;
    const businessTaxAmount = totalProfitWithGratuity > 0 ? totalProfitWithGratuity * (businessTaxPercentage / 100) : 0;
    const netProfitAfterTax = totalProfitWithGratuity - businessTaxAmount;
    
    const financialData = {
      numberOfGuests,
      pricePerPerson,
      baseRevenue,
      gratuityPercentage,
      gratuityAmount,
                      totalRevenue,
                      totalLaborCosts,
                      foodCost: totalFoodCosts,
                      totalMiscCosts,
                      totalCosts,
                      actualProfit,
                      businessTaxPercentage,
                      businessTax: businessTaxAmount,
                      netProfit: netProfitAfterTax,
                      actualProfitPercentage,
                      breakEvenGuests,
                      gratuityForLabor,
                      maxLaborBudget,
      // Additional metrics for Summary tab
      profitMargin: totalRevenue > 0 ? (totalProfitWithGratuity / totalRevenue * 100) : 0,
      foodCostPercentage: totalRevenue > 0 ? (totalFoodCosts / totalRevenue * 100) : 0,
      totalExpensePercentage: totalRevenue > 0 ? (totalCosts / totalRevenue * 100) : 0,
      costPerPlate: numberOfGuests > 0 ? (totalCosts / numberOfGuests) : 0,
      revenuePerPlate: pricePerPerson,
      laborCostPercentage: totalRevenue > 0 ? (totalLaborCosts / totalRevenue * 100) : 0,
      miscExpensePercentage: totalRevenue > 0 ? (totalMiscCosts / totalRevenue * 100) : 0,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('eventFinancialData', JSON.stringify(financialData));
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsProcessing(false);
  }, [
    numberOfGuests, pricePerPerson, baseRevenue, gratuityPercentage, gratuityAmount, totalRevenue,
    totalLaborCosts, totalFoodCosts, totalMiscCosts, totalCosts,
    actualProfit, businessTaxPercentage, gratuityForLabor, maxLaborBudget
  ]);

  // Load saved reports
  useEffect(() => {
    if (user) {
      loadSavedReports();
    }
  }, [user]);

  const loadSavedReports = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_reports')
        .select('*')
        .eq('report_type', 'event_calculator')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: "Error",
        description: "Failed to load saved reports",
        variant: "destructive",
      });
    }
  };

  const saveReport = async () => {
    if (!user || !reportName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a report name",
        variant: "destructive",
      });
      return;
    }

    try {
      const reportData = {
        eventDetails: {
          guests: numberOfGuests,
          pricePerPerson: pricePerPerson,
          gratuityPercentage: gratuityPercentage
        },
        cashOnlyScenario: {
          revenue: baseRevenue,
          laborBudget: maxLaborBudget * 0.55,
          taxesSetAside: 0,
          profitMargin: actualProfit * 0.1,
          totalCosts: totalCosts,
          netProfit: actualProfit * 0.1
        },
        creditCardScenario: {
          revenue: baseRevenue,
          laborBudget: maxLaborBudget * 0.30,
          taxesSetAside: baseRevenue * 0.20,
          profitMargin: actualProfit * 0.15,
          totalCosts: totalCosts * 0.8,
          netProfit: actualProfit * 0.15
        },
        calculations: {
          baseRevenue,
          totalRevenue,
          gratuityAmount,
          totalLaborCosts,
          totalFoodCosts,
          totalMiscCosts,
          totalCosts,
          actualProfit,
          actualProfitPercentage
        }
      };

      const { error } = await supabase
        .from('saved_reports')
        .insert({
          user_id: user.id,
          report_name: reportName,
          report_data: reportData,
          report_type: 'event_calculator'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report saved successfully",
      });

      setReportName('');
      setSaveDialogOpen(false);
      loadSavedReports();
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: "Error",
        description: "Failed to save report",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    const eventData = [
      ['Event Calculator Report', '', ''],
      ['Generated on', format(new Date(), 'PPP'), ''],
      ['', '', ''],
      ['Event Details', '', ''],
      ['Number of Guests', numberOfGuests, ''],
      ['Price per Person', pricePerPerson, ''],
      ['Gratuity %', gratuityPercentage, ''],
      ['', '', ''],
      ['Revenue', '', ''],
      ['Base Revenue', baseRevenue, ''],
      ['Gratuity Amount', gratuityAmount, ''],
      ['Total Revenue', totalRevenue, ''],
      ['', '', ''],
      ['Expenses', '', ''],
      ['Food Costs', totalFoodCosts, ''],
      ['Labor Costs', totalLaborCosts, ''],
      ['Miscellaneous', totalMiscCosts, ''],
      ['Total Expenses', totalCosts, ''],
      ['', '', ''],
      ['Profit Analysis', '', ''],
      ['Net Profit', actualProfit, ''],
      ['Profit Percentage', actualProfitPercentage, '%'],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(eventData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Event Calculator');
    
    const fileName = `Event_Calculator_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast({
      title: "Success",
      description: "Excel report exported successfully",
    });
  };

  const exportToPDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      pdf.setFontSize(20);
      pdf.text('Event Calculator Report', 20, 20);
      
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${format(new Date(), 'PPP')}`, 20, 30);
      
      pdf.setFontSize(14);
      pdf.text('Event Details', 20, 45);
      pdf.setFontSize(10);
      pdf.text(`Guests: ${numberOfGuests}`, 20, 55);
      pdf.text(`Price per Person: $${pricePerPerson}`, 20, 65);
      pdf.text(`Gratuity: ${gratuityPercentage}%`, 20, 75);
      
      pdf.setFontSize(14);
      pdf.text('Financial Summary', 20, 95);
      pdf.setFontSize(10);
      pdf.text(`Base Revenue: $${baseRevenue.toFixed(2)}`, 20, 105);
      pdf.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 20, 115);
      pdf.text(`Total Expenses: $${totalCosts.toFixed(2)}`, 20, 125);
      pdf.text(`Net Profit: $${actualProfit.toFixed(2)}`, 20, 135);
      
      const fileName = `Event_Calculator_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "Success",
        description: "PDF report exported successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('saved_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
      
      setSavedReports(prev => prev.filter(r => r.id !== reportId));
      
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 max-w-7xl mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-2 sm:gap-3">
          <Calculator className="w-6 h-6 sm:w-10 sm:h-10 text-primary" />
          Event Profit Calculator
        </h1>
        <p className="text-muted-foreground text-sm sm:text-lg px-4">
          Calculate labor costs, food costs, misc costs to get an accurate event profit
        </p>
      </div>
      
      <Tabs defaultValue="event" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="event" className="text-xs sm:text-sm">Event</TabsTrigger>
          <TabsTrigger value="summary" className="text-xs sm:text-sm">Summary</TabsTrigger>
        </TabsList>
          
          <TabsContent value="event" className="space-y-4 mt-4">
            {/* Event Details */}
            <Card className="glass-card w-full">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-card-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-lg sm:text-xl">Event Details</span>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:ml-auto mt-2 sm:mt-0">
                    <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                          <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Save Report</span>
                          <span className="sm:hidden">Save</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Save Report</DialogTitle>
                          <DialogDescription>
                            Enter a name for this event calculator report
                          </DialogDescription>
                        </DialogHeader>
                        <Input
                          placeholder="Report name..."
                          value={reportName}
                          onChange={(e) => setReportName(e.target.value)}
                        />
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={saveReport}>Save</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button onClick={exportToExcel} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                    <Button onClick={exportToPDF} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                  <div className="flex items-center gap-2">
                    <Label htmlFor="gratuityPercent" className="text-card-foreground font-medium min-w-[120px]">Gratuity %</Label>
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

                  <div>
                    <div className="text-center">
                      <Label className="text-card-foreground font-medium">Total Revenue</Label>
                      <div className="mt-1 p-3 bg-white/50 rounded-lg">
                        <div className="text-xl font-bold text-primary text-right">{formatCurrency(totalRevenue)}</div>
                        <div className="text-xs text-muted-foreground text-right">
                          Base: {formatCurrency(baseRevenue)} + Gratuity: {formatCurrency(gratuityAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Labor Budget Info */}
            <Card className="glass-card border-amber-200/50 bg-amber-50/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Target className="w-5 h-5 text-amber-600" />
                  Labor Budget & Gratuity Allocation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Max Labor Budget ({adminSettings.laborRevenuePercentage}% of revenue)</div>
                    <div className="text-lg font-bold text-amber-600">{formatCurrency(maxLaborBudget)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Gratuity Allocated to Labor</div>
                    <div className="text-lg font-bold text-green-600">{formatCurrency(gratuityForLabor)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Remaining for Profit</div>
                    <div className="text-lg font-bold text-primary">{formatCurrency(gratuityAmount - gratuityForLabor)}</div>
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
                      <div className="col-span-6">Food Type</div>
                      <div className="col-span-4 text-right">Cost</div>
                      <div className="col-span-2 text-center">Actions</div>
                    </div>
                     {foodCostItems.map((item, index) => (
                       <div key={item.id} className={`grid grid-cols-12 gap-2 p-2 items-center ${index !== foodCostItems.length - 1 ? 'border-b border-border/10' : ''}`}>
                         {editingFoodItem === item.id ? (
                           <>
                             <div className="col-span-6">
                               <Select value={item.type} onValueChange={(value) => updateFoodCostItem(item.id, value, item.cost)}>
                                 <SelectTrigger className="input-modern">
                                   <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent>
                                   {adminSettings.foodCostTypes.map(type => (
                                     <SelectItem key={type} value={type}>{type}</SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                             </div>
                             <div className="col-span-4">
                               <Input
                                 type="number"
                                 value={item.cost}
                                 onChange={(e) => {
                                   const cleanedValue = handleNumberInput(e.target.value);
                                   updateFoodCostItem(item.id, item.type, parseFloat(cleanedValue) || 0);
                                 }}
                                 className="input-modern text-right"
                                 autoFocus
                                 onKeyDown={(e) => {
                                   if (e.key === 'Enter') setEditingFoodItem(null);
                                   if (e.key === 'Escape') setEditingFoodItem(null);
                                 }}
                               />
                             </div>
                             <div className="col-span-2 flex justify-center gap-1">
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => setEditingFoodItem(null)}
                               >
                                 <DollarSign className="w-4 h-4" />
                               </Button>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => deleteFoodCostItem(item.id)}
                               >
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                             </div>
                           </>
                         ) : (
                           <>
                             <div className="col-span-6 font-medium text-card-foreground">
                               {item.type}
                             </div>
                             <div className="col-span-4 text-right font-bold text-green-600">
                               {formatCurrency(item.cost)}
                             </div>
                             <div className="col-span-2 flex justify-center gap-1">
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => setEditingFoodItem(item.id)}
                               >
                                 <Edit2 className="w-4 h-4" />
                               </Button>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => deleteFoodCostItem(item.id)}
                               >
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                             </div>
                           </>
                         )}
                       </div>
                    ))}
                    <div className="border-t border-border/20 bg-muted/30 p-2 flex justify-end">
                      <Button onClick={addFoodCostItem} className="btn-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Food Cost
                      </Button>
                    </div>
                    <div className="border-t-2 border-primary/20 bg-primary/5 p-2 grid grid-cols-12 gap-2">
                      <div className="col-span-6 font-semibold text-card-foreground">Total Food Costs</div>
                      <div className="col-span-4 font-bold text-lg text-primary text-right">{formatCurrency(totalFoodCosts)}</div>
                      <div className="col-span-2"></div>
                    </div>
                  </div>
                </div>

                {/* Labor Costs */}
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">Labor</h3>
                    <div className="border border-border/20 rounded-lg overflow-hidden">
                      <div className="bg-muted/50 border-b border-border/20 p-2 grid grid-cols-10 gap-2 font-semibold text-sm text-muted-foreground">
                        <div className="col-span-4">Role</div>
                        <div className="col-span-4 text-right">Total Pay Gratuity Split Included</div>
                        <div className="col-span-2 text-center">Actions</div>
                      </div>
                      {calculatedLaborRoles.map((role, index) => (
                        <div key={role.id} className={`grid grid-cols-10 gap-2 p-2 items-center ${index !== calculatedLaborRoles.length - 1 ? 'border-b border-border/10' : ''}`}>
                          <div className="col-span-4">
                            <Select value={role.name} onValueChange={(value) => {
                              const adminRole = adminSettings.laborRoles.find(r => r.name === value);
                              if (adminRole) {
                                updateLaborRole(role.id, {
                                  name: value,
                                  payType: adminRole.payType,
                                  revenuePercentage: adminRole.revenuePercentage,
                                  fixedAmount: adminRole.fixedAmount
                                });
                              }
                            }}>
                              <SelectTrigger className="input-modern">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {adminSettings.laborRoles.map(adminRole => (
                                  <SelectItem key={adminRole.id} value={adminRole.name}>{adminRole.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-4 text-right">
                            <div className="font-bold text-green-600">
                              {formatCurrency(role.calculatedCost || 0)}
                            </div>
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteLaborRole(role.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    <div className="border-t border-border/20 bg-muted/30 p-2 flex justify-end">
                      <Button onClick={addLaborRole} className="btn-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Labor
                      </Button>
                    </div>
                    <div className="border-t-2 border-primary/20 bg-primary/5 p-2 grid grid-cols-10 gap-2">
                      <div className="col-span-6 font-semibold text-card-foreground">Total Labor Costs (with gratuity)</div>
                      <div className="col-span-4 font-bold text-lg text-primary text-right">{formatCurrency(adjustedLaborCosts)}</div>
                    </div>
                    {gratuityForLabor > 0 && (
                      <div className="bg-green-50/50 p-2 grid grid-cols-10 gap-2 text-sm">
                        <div className="col-span-6 text-green-700">Includes gratuity allocation:</div>
                        <div className="col-span-4 font-semibold text-green-700 text-right">+{formatCurrency(gratuityForLabor)}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Miscellaneous Expenses */}
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">Miscellaneous Expenses</h3>
                  <div className="border border-border/20 rounded-lg overflow-hidden">
                     <div className="bg-muted/50 border-b border-border/20 p-2 grid grid-cols-12 gap-3 font-semibold text-sm text-muted-foreground">
                       <div className="col-span-6">Expense Type</div>
                       <div className="col-span-2">Cost Type</div>
                       <div className="col-span-2 text-right">Amount</div>
                       <div className="col-span-2 text-center">Actions</div>
                     </div>
                     {miscExpenses.map((expense, index) => (
                       <div key={expense.id} className={`grid grid-cols-12 gap-3 p-2 items-center ${index !== miscExpenses.length - 1 ? 'border-b border-border/10' : ''}`}>
                         {editingMiscExpense === expense.id ? (
                           <>
                             <div className="col-span-6">
                               <Select value={expense.type} onValueChange={(value) => updateMiscExpense(expense.id, { type: value })}>
                                 <SelectTrigger className="input-modern">
                                   <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent>
                                   {adminSettings.expenseTypes.map(type => (
                                     <SelectItem key={type} value={type}>{type}</SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                             </div>
                             <div className="col-span-2">
                               <Select value={expense.costType} onValueChange={(value: 'fixed' | 'percentage') => updateMiscExpense(expense.id, { costType: value })}>
                                 <SelectTrigger className="input-modern">
                                   <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="fixed">Fixed ($)</SelectItem>
                                   <SelectItem value="percentage">Percentage (%)</SelectItem>
                                 </SelectContent>
                               </Select>
                             </div>
                             <div className="col-span-2">
                               <Input
                                 type="number"
                                 value={expense.cost}
                                 onChange={(e) => {
                                   const cleanedValue = handleNumberInput(e.target.value);
                                   updateMiscExpense(expense.id, { cost: parseFloat(cleanedValue) || 0 });
                                 }}
                                 className="input-modern text-right"
                                 placeholder={expense.costType === 'percentage' ? '%' : '$'}
                                 autoFocus
                                 onKeyDown={(e) => {
                                   if (e.key === 'Enter') setEditingMiscExpense(null);
                                   if (e.key === 'Escape') setEditingMiscExpense(null);
                                 }}
                               />
                             </div>
                             <div className="col-span-2 flex justify-center gap-1">
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => setEditingMiscExpense(null)}
                               >
                                 <DollarSign className="w-4 h-4" />
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
                         ) : (
                           <>
                             <div className="col-span-6 font-medium text-card-foreground">
                               {expense.type}
                             </div>
                             <div className="col-span-2 text-sm text-muted-foreground">
                               {expense.costType === 'fixed' ? 'Fixed ($)' : 'Percentage (%)'}
                             </div>
                             <div className="col-span-2 text-right">
                               <div className="font-bold text-green-600">
                                 {expense.costType === 'percentage' 
                                   ? formatCurrency(baseRevenue * (expense.cost / 100))
                                   : formatCurrency(expense.cost)
                                 }
                               </div>
                               <div className="text-xs text-muted-foreground">
                                 {expense.costType === 'percentage' ? `${expense.cost}%` : 'Fixed'}
                               </div>
                             </div>
                             <div className="col-span-2 flex justify-center gap-1">
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => setEditingMiscExpense(expense.id)}
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
                    <div className="border-t border-border/20 bg-muted/30 p-2 flex justify-end">
                      <Button onClick={addMiscExpense} className="btn-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Expense
                      </Button>
                    </div>
                     <div className="border-t-2 border-primary/20 bg-primary/5 p-2 grid grid-cols-12 gap-3">
                       <div className="col-span-8 font-semibold text-card-foreground">Total Miscellaneous</div>
                       <div className="col-span-2 font-bold text-lg text-primary text-right">{formatCurrency(totalMiscCosts)}</div>
                       <div className="col-span-2"></div>
                     </div>
                  </div>
                </div>

                {/* Total Expenses Summary */}
                <div className="border-2 border-primary/30 bg-primary/10 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Food Cost</div>
                      <div className="text-lg font-bold text-card-foreground">{formatCurrency(totalFoodCosts)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Labor Costs</div>
                      <div className="text-lg font-bold text-card-foreground">{formatCurrency(adjustedLaborCosts)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Miscellaneous</div>
                      <div className="text-lg font-bold text-card-foreground">{formatCurrency(totalMiscCosts)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Total Expenses</div>
                      <div className="text-xl font-bold text-primary">{formatCurrency(totalCosts + gratuityForLabor)}</div>
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
                    <div className="flex justify-between">
                      <span className="text-card-foreground">Gratuity Amount:</span>
                      <span className="font-bold text-card-foreground">{formatCurrency(gratuityAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-card-foreground">Gratuity to Labor:</span>
                      <span className="font-bold text-amber-600">-{formatCurrency(gratuityForLabor)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-card-foreground font-semibold">Total Profit:</span>
                      <span className="font-bold text-lg text-primary">{formatCurrency(actualProfit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-card-foreground">Business Tax (20%):</span>
                      <span className="font-bold text-card-foreground text-red-600">-{formatCurrency(actualProfit * 0.20)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-card-foreground font-semibold text-lg">Net Profit (After Tax):</span>
                        <span className="font-bold text-2xl text-green-600">{formatCurrency(actualProfit * 0.80)}</span>
                      </div>
                      <div className="text-center text-sm text-muted-foreground mt-1">
                        Available for Overhead Expenses
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
  );
};

export default EventProfitCalculator;
