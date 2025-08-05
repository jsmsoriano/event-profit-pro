import { useState, useEffect } from "react";
import { FileText, Download, Printer, Save, Trash2, Calendar } from "lucide-react";
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
    revenue: number;
    laborBudget: number;
    taxesSetAside: number;
    profitMargin: number;
    totalCosts: number;
    netProfit: number;
  };
  creditCardScenario: {
    revenue: number;
    laborBudget: number;
    taxesSetAside: number;
    profitMargin: number;
    totalCosts: number;
    netProfit: number;
  };
}

export default function Reporting() {
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Sample report data - in real implementation, this would come from the Event Calculator
  const [reportData, setReportData] = useState<ReportData>({
    eventDetails: {
      guests: 50,
      pricePerPerson: 120,
      gratuityPercentage: 18
    },
    cashOnlyScenario: {
      revenue: 6000,
      laborBudget: 3300,
      taxesSetAside: 0,
      profitMargin: 600,
      totalCosts: 5400,
      netProfit: 600
    },
    creditCardScenario: {
      revenue: 6000,
      laborBudget: 1800,
      taxesSetAside: 1200,
      profitMargin: 900,
      totalCosts: 4200,
      netProfit: 900
    }
  });

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Event Reports</h1>
          <p className="text-muted-foreground">Generate and manage your event scenario reports</p>
        </div>
        <div className="flex gap-2">
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
                {/* Event Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Event Details</h3>
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Guests</p>
                      <p className="text-2xl font-bold">{reportData.eventDetails.guests}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Price per Person</p>
                      <p className="text-2xl font-bold">{formatCurrency(reportData.eventDetails.pricePerPerson)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Gratuity</p>
                      <p className="text-2xl font-bold">{reportData.eventDetails.gratuityPercentage}%</p>
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
                        <tr className="border-b hover:bg-muted/20">
                          <td className="p-3 font-medium">Revenue</td>
                          <td className="text-center p-3">{formatCurrency(reportData.cashOnlyScenario.revenue)}</td>
                          <td className="text-center p-3">{formatCurrency(reportData.creditCardScenario.revenue)}</td>
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
                          <td className="p-3 font-medium">Total Costs</td>
                          <td className="text-center p-3">{formatCurrency(reportData.cashOnlyScenario.totalCosts)}</td>
                          <td className="text-center p-3">{formatCurrency(reportData.creditCardScenario.totalCosts)}</td>
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
                          <td className="p-3 font-bold">Net Profit</td>
                          <td className="text-center p-3 font-bold">{formatCurrency(reportData.cashOnlyScenario.netProfit)}</td>
                          <td className="text-center p-3 font-bold">{formatCurrency(reportData.creditCardScenario.netProfit)}</td>
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