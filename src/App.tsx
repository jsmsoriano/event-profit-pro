import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { AuthProvider } from "@/hooks/useAuth";
import FinancialSummary from "./pages/FinancialSummary";
import BreakevenAnalysis from "./pages/BreakevenAnalysis";
import Reporting from "./pages/Reporting";
import Auth from "./pages/Auth";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full overflow-hidden">
              <AppSidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/book" element={<BookEvent />} />
                    <Route path="/my-events" element={<MyEvents />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/auth" element={<Auth />} />
                    {/* Legacy routes */}
                    <Route path="/calculator" element={<BreakevenAnalysis />} />
                    <Route path="/financial-summary" element={<FinancialSummary />} />
                    <Route path="/staff" element={<StaffManagement />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/reporting" element={<Reporting />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/quotes" element={<Quotes />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/admin-old" element={<Admin />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
