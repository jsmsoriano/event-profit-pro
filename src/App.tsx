import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import FinancialSummary from "./pages/FinancialSummary";
import BreakevenAnalysis from "./pages/BreakevenAnalysis";
import Billing from "./pages/Billing";
import Reporting from "./pages/Reporting";
import Team from "./pages/Team";
import Contacts from "./pages/Contacts";
import Admin from "./pages/Admin";
import StaffManagement from "./pages/StaffManagement";
import Analytics from "./pages/Analytics";
import MyEvents from './pages/MyEvents';
import CreateEvent from './pages/CreateEvent';
import MenuBuilder from './pages/MenuBuilder';
import MenuManagement from './pages/MenuManagement';
import Wiki from './pages/Wiki';
import Messages from './pages/Messages';
import Auth from './pages/Auth';

import AdminDashboard from "./pages/AdminDashboard";
import RoleTest from "./pages/RoleTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <SidebarProvider>
                <div className="min-h-screen flex w-full overflow-hidden">
                  <AppSidebar />
                  <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                      <SidebarTrigger className="ml-2" />
                      <h1 className="ml-4 text-lg font-semibold">Event Management System</h1>
                    </header>
                    <main className="flex-1 overflow-auto">
                      <Routes>
                        {/* Default route */}
                        <Route path="/" element={<AdminDashboard />} />
                        
                        {/* Admin routes */}
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/events" element={<MyEvents />} />
                        <Route path="/admin/events/new" element={<CreateEvent />} />
                        <Route path="/admin/events/:id" element={<MyEvents />} />
                        <Route path="/admin/clients" element={<Contacts />} />
                        <Route path="/admin/menu" element={<MenuManagement />} />
                        <Route path="/admin/billing" element={<Billing />} />
                        <Route path="/admin/wiki" element={<Wiki />} />
                        <Route path="/admin/messages" element={<Messages />} />
                        <Route path="/admin/analytics" element={<Analytics />} />
                        <Route path="/admin/settings" element={<RoleTest />} />
                        
                        {/* Legacy routes (keeping for compatibility) */}
                        <Route path="/breakeven-analysis" element={<BreakevenAnalysis />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/financial-summary" element={<FinancialSummary />} />
                        <Route path="/staff-management" element={<StaffManagement />} />
                        <Route path="/reporting" element={<Reporting />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/contacts" element={<Contacts />} />
                        <Route path="/role-test" element={<RoleTest />} />
                        <Route path="/admin-old" element={<Admin />} />
                        
                        {/* Catch all */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </SidebarProvider>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
