import { useState, useEffect } from "react";
import { FileText, Plus, Trash2, Calendar, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SavedReport {
  id: string;
  report_name: string;
  report_data: any;
  created_at: string;
}

interface Client {
  id: string;
  name: string;
}

export default function Reporting() {
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Add report dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [reportName, setReportName] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();


  useEffect(() => {
    if (user) {
      loadSavedReports();
      loadClients();
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

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      });
    }
  };

  const addReport = async () => {
    if (!reportName.trim() || !selectedClientId || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create reports",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const selectedClient = clients.find(c => c.id === selectedClientId);
      const reportData = {
        client_id: selectedClientId,
        client_name: selectedClient?.name,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        generated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('saved_reports')
        .insert({
          user_id: user.id,
          report_name: reportName.trim(),
          report_type: 'event_calculator',
          report_data: reportData
        });

      if (error) throw error;
      
      // Reset form and close dialog
      setReportName("");
      setSelectedClientId("");
      setStartDate(undefined);
      setEndDate(undefined);
      setIsAddDialogOpen(false);
      
      // Reload reports
      await loadSavedReports();
      
      toast({
        title: "Success",
        description: "Report created successfully",
      });
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: "Error",
        description: "Failed to create report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Manage your customer reports</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
              <DialogDescription>
                Select a customer and date range for your report
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reportName">Report Name</Label>
                <Input
                  id="reportName"
                  placeholder="Enter report name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={addReport} 
                disabled={loading || !reportName.trim() || !selectedClientId || !startDate || !endDate}
              >
                {loading ? "Creating..." : "Create Report"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Saved Reports
          </CardTitle>
          <CardDescription>
            Your previously created reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {savedReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-2">No reports created yet</p>
              <p className="text-sm text-muted-foreground">Click "Add Report" to create your first report</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{report.report_name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created: {format(new Date(report.created_at), 'MMM dd, yyyy')}
                      </span>
                      {report.report_data?.client_name && (
                        <span>Customer: {report.report_data.client_name}</span>
                      )}
                      {report.report_data?.start_date && report.report_data?.end_date && (
                        <span>
                          Period: {format(new Date(report.report_data.start_date), 'MMM dd')} - {format(new Date(report.report_data.end_date), 'MMM dd, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteReport(report.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}