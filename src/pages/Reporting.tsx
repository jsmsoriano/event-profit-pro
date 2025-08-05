import { useState, useEffect } from "react";
import { FileText, Download, Printer, Save, Trash2, Calendar, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from "date-fns";

interface SavedReport {
  id: string;
  report_name: string;
  report_data: any;
  created_at: string;
}

interface ReportData {
  eventDetails: {
    guests: number;
    pricePerPerson: number;
    gratuityPercentage: number;
  };
  cashOnlyScenario: {
    baseRevenue: number;
    gratuityAmount: number;
    revenue: number;
    foodCosts: number;
    laborBudget: number;
    chefPay: number;
    assistantPay: number;
    miscExpenses: number;
    taxesSetAside: number;
    creditCardFees: number;
    totalCosts: number;
    profitMargin: number;
    netProfit: number;
  };
  creditCardScenario: {
    baseRevenue: number;
    gratuityAmount: number;
    revenue: number;
    foodCosts: number;
    laborBudget: number;
    chefPay: number;
    assistantPay: number;
    miscExpenses: number;
    taxesSetAside: number;
    creditCardFees: number;
    totalCosts: number;
    profitMargin: number;
    netProfit: number;
  };
}

export default function Reporting() {
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Editable event details
  const [guests, setGuests] = useState(50);
  const [pricePerPerson, setPricePerPerson] = useState(120);
  const [gratuityPercentage, setGratuityPercentage] = useState(18);

  // Calculate scenarios based on inputs
  const calculateScenarios = () => {
    const baseRevenue = guests * pricePerPerson;
    const gratuityAmount = baseRevenue * (gratuityPercentage / 100);
    const totalRevenue = baseRevenue + gratuityAmount;
    
    // Food costs (35% of revenue for both scenarios)
    const foodCosts = baseRevenue * 0.35;
    
    // Miscellaneous expenses (10% of revenue for both scenarios)
    const miscExpenses = baseRevenue * 0.10;

    return {
      eventDetails: { guests, pricePerPerson, gratuityPercentage },
      cashOnlyScenario: {
        baseRevenue,
        gratuityAmount,
        revenue: totalRevenue,
        foodCosts,
        laborBudget: totalRevenue * 0.55,
        chefPay: totalRevenue * 0.33,
        assistantPay: totalRevenue * 0.22,
        miscExpenses,
        taxesSetAside: 0,
        creditCardFees: 0,
        totalCosts: foodCosts + (totalRevenue * 0.55) + miscExpenses,
        profitMargin: totalRevenue - (foodCosts + (totalRevenue * 0.55) + miscExpenses),
        netProfit: totalRevenue - (foodCosts + (totalRevenue * 0.55) + miscExpenses)
      },
      creditCardScenario: {
        baseRevenue,
        gratuityAmount,
        revenue: totalRevenue,
        foodCosts,
        laborBudget: totalRevenue * 0.30,
        chefPay: totalRevenue * 0.18,
        assistantPay: totalRevenue * 0.12,
        miscExpenses,
        taxesSetAside: totalRevenue * 0.20,
        creditCardFees: totalRevenue * 0.03,
        totalCosts: foodCosts + (totalRevenue * 0.30) + miscExpenses + (totalRevenue * 0.20) + (totalRevenue * 0.03),
        profitMargin: totalRevenue - (foodCosts + (totalRevenue * 0.30) + miscExpenses + (totalRevenue * 0.20) + (totalRevenue * 0.03)),
        netProfit: totalRevenue - (foodCosts + (totalRevenue * 0.30) + miscExpenses + (totalRevenue * 0.20) + (totalRevenue * 0.03))
      }
    };
  };

  const [reportData, setReportData] = useState<ReportData>(calculateScenarios());

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

  const deleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('saved_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
      
      setSavedReports(prev => prev.filter(r => r.id !== reportId));
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
      
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

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Create comparison sheet
    const comparisonData = [
      ['Event Scenarios Comparison', '', ''],
      ['', 'Cash Only', 'Credit Card'],
      ['Event Details', '', ''],
      ['Guests', reportData.eventDetails.guests, reportData.eventDetails.guests],
      ['Price per Person', `$${reportData.eventDetails.pricePerPerson}`, `$${reportData.eventDetails.pricePerPerson}`],
      ['Gratuity %', `${reportData.eventDetails.gratuityPercentage}%`, `${reportData.eventDetails.gratuityPercentage}%`],
      ['', '', ''],
      ['Financial Breakdown', '', ''],
      ['Revenue', `$${reportData.cashOnlyScenario.revenue}`, `$${reportData.creditCardScenario.revenue}`],
      ['Labor Budget', `$${reportData.cashOnlyScenario.laborBudget}`, `$${reportData.creditCardScenario.laborBudget}`],
      ['Taxes Set Aside', `$${reportData.cashOnlyScenario.taxesSetAside}`, `$${reportData.creditCardScenario.taxesSetAside}`],
      ['Total Costs', `$${reportData.cashOnlyScenario.totalCosts}`, `$${reportData.creditCardScenario.totalCosts}`],
      ['Net Profit', `$${reportData.cashOnlyScenario.netProfit}`, `$${reportData.creditCardScenario.netProfit}`],
      ['Profit Margin', `$${reportData.cashOnlyScenario.profitMargin}`, `$${reportData.creditCardScenario.profitMargin}`],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(comparisonData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Scenarios Comparison');
    
    const fileName = `Event_Scenarios_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast({
      title: "Success",
      description: "Excel report exported successfully",
    });
  };

  const exportToPDF = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `Event_Scenarios_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
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

  const printReport = () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Event Scenarios Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .comparison-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .comparison-table th, .comparison-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .comparison-table th { background-color: #f5f5f5; font-weight: bold; }
            .scenario-header { background-color: #f0f9ff; font-weight: bold; }
            .difference { font-weight: bold; color: #16a34a; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateDifference = (creditCard: number, cashOnly: number) => {
    const diff = creditCard - cashOnly;
    return {
      amount: diff,
      percentage: cashOnly !== 0 ? ((diff / cashOnly) * 100) : 0
    };
  };

  const generateReport = () => {
    setReportData(calculateScenarios());
    toast({
      title: "Success",
      description: "Report generated with updated values",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Event Reports</h1>
          <p className="text-muted-foreground">Generate and manage your event scenario reports</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateReport} className="gap-2">
            <Calculator className="h-4 w-4" />
            Generate
          </Button>
          <Button onClick={exportToExcel} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <Button onClick={exportToPDF} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button onClick={printReport} variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saved Reports Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Saved Reports
              </CardTitle>
              <CardDescription>
                Your previously saved event reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {savedReports.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No saved reports yet
                </p>
              ) : (
                savedReports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedReport?.id === report.id
                        ? 'bg-primary/5 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate">
                          {report.report_name}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(report.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteReport(report.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Report Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Event Scenarios Comparison</CardTitle>
              <CardDescription>
                Side-by-side comparison of Cash Only vs Credit Card payment scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div id="report-content" className="space-y-6">
                {/* Editable Event Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Event Details</h3>
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <Label htmlFor="guests">Guests</Label>
                      <Input
                        id="guests"
                        type="number"
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="text-center font-bold text-lg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pricePerPerson">Price per Person</Label>
                      <Input
                        id="pricePerPerson"
                        type="number"
                        value={pricePerPerson}
                        onChange={(e) => setPricePerPerson(Number(e.target.value))}
                        className="text-center font-bold text-lg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gratuity">Gratuity %</Label>
                      <Input
                        id="gratuity"
                        type="number"
                        value={gratuityPercentage}
                        onChange={(e) => setGratuityPercentage(Number(e.target.value))}
                        className="text-center font-bold text-lg"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Scenarios Comparison */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Financial Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Metric</th>
                          <th className="text-center p-3 font-medium bg-blue-50">Cash Only</th>
                          <th className="text-center p-3 font-medium bg-green-50">Credit Card</th>
                          <th className="text-center p-3 font-medium bg-yellow-50">Difference</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-muted/20 bg-gray-50">
                          <td colSpan={4} className="p-3 font-bold text-center">REVENUE BREAKDOWN</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20">
                          <td className="p-3 font-medium">Base Revenue</td>
                          <td className="text-center p-3">{formatCurrency(reportData.cashOnlyScenario.baseRevenue)}</td>
                          <td className="text-center p-3">{formatCurrency(reportData.creditCardScenario.baseRevenue)}</td>
                          <td className="text-center p-3 text-muted-foreground">-</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20">
                          <td className="p-3 font-medium">Gratuity Amount</td>
                          <td className="text-center p-3">{formatCurrency(reportData.cashOnlyScenario.gratuityAmount)}</td>
                          <td className="text-center p-3">{formatCurrency(reportData.creditCardScenario.gratuityAmount)}</td>
                          <td className="text-center p-3 text-muted-foreground">-</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20">
                          <td className="p-3 font-medium">Total Revenue</td>
                          <td className="text-center p-3 font-semibold">{formatCurrency(reportData.cashOnlyScenario.revenue)}</td>
                          <td className="text-center p-3 font-semibold">{formatCurrency(reportData.creditCardScenario.revenue)}</td>
                          <td className="text-center p-3 text-muted-foreground">-</td>
                        </tr>
                        
                        <tr className="border-b hover:bg-muted/20 bg-gray-50">
                          <td colSpan={4} className="p-3 font-bold text-center">EXPENSES BREAKDOWN</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20">
                          <td className="p-3 font-medium">Food Costs</td>
                          <td className="text-center p-3">{formatCurrency(reportData.cashOnlyScenario.foodCosts)}</td>
                          <td className="text-center p-3">{formatCurrency(reportData.creditCardScenario.foodCosts)}</td>
                          <td className="text-center p-3 text-muted-foreground">-</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20">
                          <td className="p-3 font-medium">Labor Budget</td>
                          <td className="text-center p-3">{formatCurrency(reportData.cashOnlyScenario.laborBudget)}</td>
                          <td className="text-center p-3">{formatCurrency(reportData.creditCardScenario.laborBudget)}</td>
                          <td className="text-center p-3">
                            {(() => {
                              const diff = calculateDifference(reportData.creditCardScenario.laborBudget, reportData.cashOnlyScenario.laborBudget);
                              return (
                                <span className={diff.amount < 0 ? 'text-green-600' : 'text-red-600'}>
                                  {formatCurrency(Math.abs(diff.amount))} {diff.amount < 0 ? '↓' : '↑'}
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20">
                          <td className="p-3 font-medium pl-6">• Chef Pay</td>
                          <td className="text-center p-3">{formatCurrency(reportData.cashOnlyScenario.chefPay)}</td>
                          <td className="text-center p-3">{formatCurrency(reportData.creditCardScenario.chefPay)}</td>
                          <td className="text-center p-3">
                            {(() => {
                              const diff = calculateDifference(reportData.creditCardScenario.chefPay, reportData.cashOnlyScenario.chefPay);
                              return (
                                <span className={diff.amount < 0 ? 'text-green-600' : 'text-red-600'}>
                                  {formatCurrency(Math.abs(diff.amount))} {diff.amount < 0 ? '↓' : '↑'}
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20">
                          <td className="p-3 font-medium pl-6">• Assistant Pay</td>
                          <td className="text-center p-3">{formatCurrency(reportData.cashOnlyScenario.assistantPay)}</td>
                          <td className="text-center p-3">{formatCurrency(reportData.creditCardScenario.assistantPay)}</td>
                          <td className="text-center p-3">
                            {(() => {
                              const diff = calculateDifference(reportData.creditCardScenario.assistantPay, reportData.cashOnlyScenario.assistantPay);
                              return (
                                <span className={diff.amount < 0 ? 'text-green-600' : 'text-red-600'}>
                                  {formatCurrency(Math.abs(diff.amount))} {diff.amount < 0 ? '↓' : '↑'}
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20">
                          <td className="p-3 font-medium">Miscellaneous Expenses</td>
                          <td className="text-center p-3">{formatCurrency(reportData.cashOnlyScenario.miscExpenses)}</td>
                          <td className="text-center p-3">{formatCurrency(reportData.creditCardScenario.miscExpenses)}</td>
                          <td className="text-center p-3 text-muted-foreground">-</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20">
                          <td className="p-3 font-medium">Credit Card Fees</td>
                          <td className="text-center p-3">{formatCurrency(reportData.cashOnlyScenario.creditCardFees)}</td>
                          <td className="text-center p-3">{formatCurrency(reportData.creditCardScenario.creditCardFees)}</td>
                          <td className="text-center p-3">
                            {(() => {
                              const diff = calculateDifference(reportData.creditCardScenario.creditCardFees, reportData.cashOnlyScenario.creditCardFees);
                              return (
                                <span className={diff.amount > 0 ? 'text-red-600' : 'text-green-600'}>
                                  {formatCurrency(Math.abs(diff.amount))} {diff.amount > 0 ? '↑' : '↓'}
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20">
                          <td className="p-3 font-medium">Taxes Set Aside</td>
                          <td className="text-center p-3">{formatCurrency(reportData.cashOnlyScenario.taxesSetAside)}</td>
                          <td className="text-center p-3">{formatCurrency(reportData.creditCardScenario.taxesSetAside)}</td>
                          <td className="text-center p-3">
                            {(() => {
                              const diff = calculateDifference(reportData.creditCardScenario.taxesSetAside, reportData.cashOnlyScenario.taxesSetAside);
                              return (
                                <span className={diff.amount > 0 ? 'text-red-600' : 'text-green-600'}>
                                  {formatCurrency(Math.abs(diff.amount))} {diff.amount > 0 ? '↑' : '↓'}
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20">
                          <td className="p-3 font-semibold">Total Costs</td>
                          <td className="text-center p-3 font-semibold">{formatCurrency(reportData.cashOnlyScenario.totalCosts)}</td>
                          <td className="text-center p-3 font-semibold">{formatCurrency(reportData.creditCardScenario.totalCosts)}</td>
                          <td className="text-center p-3">
                            {(() => {
                              const diff = calculateDifference(reportData.creditCardScenario.totalCosts, reportData.cashOnlyScenario.totalCosts);
                              return (
                                <span className={diff.amount < 0 ? 'text-green-600' : 'text-red-600'}>
                                  {formatCurrency(Math.abs(diff.amount))} {diff.amount < 0 ? '↓' : '↑'}
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                        
                        <tr className="border-b hover:bg-muted/20 bg-primary/5">
                          <td className="p-3 font-bold">NET PROFIT</td>
                          <td className="text-center p-3 font-bold text-lg">{formatCurrency(reportData.cashOnlyScenario.netProfit)}</td>
                          <td className="text-center p-3 font-bold text-lg">{formatCurrency(reportData.creditCardScenario.netProfit)}</td>
                          <td className="text-center p-3 font-bold">
                            {(() => {
                              const diff = calculateDifference(reportData.creditCardScenario.netProfit, reportData.cashOnlyScenario.netProfit);
                              return (
                                <span className={diff.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {formatCurrency(Math.abs(diff.amount))} {diff.amount > 0 ? '↑' : '↓'}
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Key Insights</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Credit card payments reduce labor budget allocation by {formatCurrency(reportData.cashOnlyScenario.laborBudget - reportData.creditCardScenario.laborBudget)}</li>
                    <li>• Tax obligations increase by {formatCurrency(reportData.creditCardScenario.taxesSetAside)} with credit card processing</li>
                    <li>• Net profit difference: {formatCurrency(Math.abs(reportData.creditCardScenario.netProfit - reportData.cashOnlyScenario.netProfit))} {reportData.creditCardScenario.netProfit > reportData.cashOnlyScenario.netProfit ? 'higher' : 'lower'} with credit cards</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}