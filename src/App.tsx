import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";
import AdminLayout from "@/layouts/AdminLayout";
import GlobalVoiceAssistant from "@/components/voice/GlobalVoiceAssistant";
import Index from "./pages/Index";
import GestaoFinanceira from "./pages/GestaoFinanceira";
import Relatorios from "./pages/Relatorios";
import Familia from "./pages/Familia";
import Educacao from "./pages/Educacao";
import Configuracoes from "./pages/Configuracoes";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import Landing from "./pages/Landing";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminFinancial from "./pages/admin/Financial";
import AdminAudit from "./pages/admin/Audit";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GlobalVoiceAssistant />
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
            <Route path="/gestao-financeira" element={
              <ProtectedRoute requireSubscription>
                <GestaoFinanceira />
              </ProtectedRoute>
            } />
            {/* Redirect old routes to new unified page */}
            <Route path="/transacoes" element={
              <ProtectedRoute>
                <GestaoFinanceira />
              </ProtectedRoute>
            } />
            <Route path="/transacoes-ai" element={
              <ProtectedRoute>
                <GestaoFinanceira />
              </ProtectedRoute>
            } />
            <Route path="/patrimonio" element={
              <ProtectedRoute>
                <GestaoFinanceira />
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
            {/* Admin Routes with dedicated layout */}
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="financial" element={<AdminFinancial />} />
              <Route path="audit" element={<AdminAudit />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
