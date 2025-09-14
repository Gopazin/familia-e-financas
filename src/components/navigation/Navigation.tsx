import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Home, 
  PlusCircle, 
  BarChart3, 
  Users, 
  GraduationCap, 
  Settings,
  Menu,
  X,
  DollarSign,
  LogOut,
  Crown,
  Clock,
  CreditCard,
  Shield,
  TrendingUp
} from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const { user, signOut, isSubscribed, subscriptionPlan } = useAuth();

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (data && !error) {
        setIsAdmin(true);
      }
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const navigationItems = [
    { href: "/", icon: Home, label: "Dashboard", color: "text-primary" },
    { href: "/transacoes", icon: PlusCircle, label: "Transações", color: "text-secondary" },
    { href: "/patrimonio", icon: TrendingUp, label: "Patrimônio", color: "text-accent" },
    { href: "/relatorios", icon: BarChart3, label: "Relatórios", color: "text-primary" },
    { href: "/familia", icon: Users, label: "Família", color: "text-secondary" },
    { href: "/educacao", icon: GraduationCap, label: "Educação", color: "text-primary" },
    { href: "/configuracoes", icon: Settings, label: "Configurações", color: "text-muted-foreground" },
  ];

  // Admin access now has its own layout - no need for navigation item

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header */}
      <Card className="lg:hidden fixed top-0 left-0 right-0 z-50 rounded-none border-b shadow-card bg-card/95 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-prosperity flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-prosperity bg-clip-text text-transparent">
              Família Financeira
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="lg:hidden"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </Card>

      {/* Desktop Sidebar */}
      <Card className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col rounded-none border-r shadow-card bg-card">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-prosperity flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-prosperity bg-clip-text text-transparent">
                Família Financeira
              </h1>
              <p className="text-sm text-muted-foreground">Gestão inteligente</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-12 transition-smooth",
                    isActive && "bg-gradient-primary text-white shadow-primary"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-white" : item.color)} />
                  <span className={cn("font-medium", isActive ? "text-white" : "text-foreground")}>
                    {item.label}
                  </span>
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-3">
          {/* Subscription Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {isSubscribed ? (
                <Badge className="bg-gradient-secondary text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  {subscriptionPlan === 'premium' ? 'Premium' : 'Família'}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-primary border-primary">
                  <Clock className="w-3 h-3 mr-1" />
                  Teste Grátis
                </Badge>
              )}
            </div>
            
            {!isSubscribed && (
              <Link to="/pricing">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <CreditCard className="w-4 h-4" />
                  Fazer Upgrade
                </Button>
              </Link>
            )}
          </div>

          <Separator />

          {/* User Info & Logout */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground truncate">
              {user?.user_metadata?.full_name || user?.email}
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </Card>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
          <Card className="fixed top-16 left-4 right-4 max-h-[calc(100vh-5rem)] overflow-y-auto shadow-card">
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.href} to={item.href} onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-12 transition-smooth",
                        isActive && "bg-gradient-primary text-white shadow-primary"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", isActive ? "text-white" : item.color)} />
                      <span className={cn("font-medium", isActive ? "text-white" : "text-foreground")}>
                        {item.label}
                      </span>
                    </Button>
                  </Link>
                );
              })}
              
              <Separator className="my-3" />
              
              {/* Mobile Subscription Status */}
              <div className="space-y-2">
                {isSubscribed ? (
                  <div className="flex items-center gap-2 p-2">
                    <Badge className="bg-gradient-secondary text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      {subscriptionPlan === 'premium' ? 'Premium' : 'Família'}
                    </Badge>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 p-2">
                      <Badge variant="outline" className="text-primary border-primary">
                        <Clock className="w-3 h-3 mr-1" />
                        Teste Grátis
                      </Badge>
                    </div>
                    <Link to="/pricing" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <CreditCard className="w-4 h-4" />
                        Fazer Upgrade
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <Separator className="my-3" />

              {/* Mobile Logout */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { signOut(); setIsOpen(false); }}
                className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </nav>
          </Card>
        </div>
      )}
    </>
  );
};

export default Navigation;