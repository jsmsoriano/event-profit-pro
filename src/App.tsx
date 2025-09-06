import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import FinancialSummary from "./pages/FinancialSummary";
import BreakevenAnalysis from "./pages/BreakevenAnalysis";
import Reporting from "./pages/Reporting";
import Team from "./pages/Team";
import Quotes from "./pages/Quotes";
import Contacts from "./pages/Contacts";
import Admin from "./pages/Admin";
import StaffManagement from "./pages/StaffManagement";
import Inventory from "./pages/Inventory";
import Analytics from "./pages/Analytics";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import BookEvent from "./pages/BookEvent";
import MyEvents from "./pages/MyEvents";
import Support from "./pages/Support";
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
                  {/* Client-facing routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/book-event" element={<BookEvent />} />
                  <Route path="/my-events" element={<MyEvents />} />
                  <Route path="/my-events/:id" element={<MyEvents />} />
                  <Route path="/support" element={<Support />} />
                  
                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/events" element={<MyEvents />} />
                  <Route path="/admin/events/new" element={<BookEvent />} />
                  <Route path="/admin/events/:id" element={<MyEvents />} />
                  <Route path="/admin/clients" element={<Contacts />} />
                  <Route path="/admin/menu" element={<Menu />} />
                  <Route path="/admin/billing" element={<FinancialSummary />} />
                  <Route path="/admin/analytics" element={<Analytics />} />
                  <Route path="/admin/settings" element={<RoleTest />} />
                  
                  {/* Legacy routes (keeping for compatibility) */}
                  <Route path="/breakeven-analysis" element={<BreakevenAnalysis />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/financial-summary" element={<FinancialSummary />} />
                  <Route path="/staff-management" element={<StaffManagement />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/reporting" element={<Reporting />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/quotes" element={<Quotes />} />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
