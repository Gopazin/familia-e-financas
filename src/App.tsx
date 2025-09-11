import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Transacoes from "./pages/Transacoes";
import Relatorios from "./pages/Relatorios";
import Familia from "./pages/Familia";
import Educacao from "./pages/Educacao";
import Configuracoes from "./pages/Configuracoes";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import Landing from "./pages/Landing";
import Admin from "./pages/Admin";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/transacoes" element={
              <ProtectedRoute>
                <Transacoes />
              </ProtectedRoute>
            } />
            <Route path="/relatorios" element={
              <ProtectedRoute requireSubscription>
                <Relatorios />
              </ProtectedRoute>
            } />
            <Route path="/familia" element={
              <ProtectedRoute requireSubscription>
                <Familia />
              </ProtectedRoute>
            } />
            <Route path="/educacao" element={
              <ProtectedRoute>
                <Educacao />
              </ProtectedRoute>
            } />
            <Route path="/configuracoes" element={
              <ProtectedRoute>
                <Configuracoes />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
