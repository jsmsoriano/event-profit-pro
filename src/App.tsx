import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import FinancialSummary from "./pages/FinancialSummary";
import BreakevenAnalysis from "./pages/BreakevenAnalysis";
import Reporting from "./pages/Reporting";
import Auth from "./pages/Auth";
import Team from "./pages/Team";
import Quotes from "./pages/Quotes";
import Contacts from "./pages/Contacts";
import Admin from "./pages/Admin";
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
                    <Route path="/" element={<Index />} />
                    <Route path="/financial-summary" element={<FinancialSummary />} />
                    <Route path="/breakeven-analysis" element={<BreakevenAnalysis />} />
                    <Route path="/reporting" element={<Reporting />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/quotes" element={<Quotes />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/admin" element={<Admin />} />
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
