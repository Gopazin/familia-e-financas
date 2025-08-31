import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Home, 
  PlusCircle, 
  BarChart3, 
  Users, 
  GraduationCap, 
  Settings,
  Menu,
  X,
  DollarSign
} from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { href: "/", icon: Home, label: "Dashboard", color: "text-primary" },
    { href: "/transacoes", icon: PlusCircle, label: "Transações", color: "text-secondary" },
    { href: "/relatorios", icon: BarChart3, label: "Relatórios", color: "text-primary" },
    { href: "/familia", icon: Users, label: "Família", color: "text-secondary" },
    { href: "/educacao", icon: GraduationCap, label: "Educação", color: "text-primary" },
    { href: "/configuracoes", icon: Settings, label: "Configurações", color: "text-muted-foreground" },
  ];

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
            </nav>
          </Card>
        </div>
      )}
    </>
  );
};

export default Navigation;