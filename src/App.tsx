import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider } from "@/hooks/useAuth";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const logPageView = async () => {
      await supabase.from("page_views").insert([
        {
          path: window.location.pathname,
          user_agent: navigator.userAgent,
          referrer: document.referrer,
        },
      ]);
    };
    logPageView();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
