import { ReactNode } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Crown, 
  Users, 
  BarChart3, 
  Settings, 
  Home,
  FileText,
  Shield,
  LogOut,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar 
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
    description: "Visão geral do sistema"
  },
  {
    title: "Usuários",
    href: "/admin/users",
    icon: Users,
    description: "Gestão de usuários e permissões"
  },
  {
    title: "Financeiro",
    href: "/admin/financial",
    icon: BarChart3,
    description: "Métricas e relatórios financeiros"
  },
  {
    title: "Auditoria",
    href: "/admin/audit",
    icon: FileText,
    description: "Logs e auditoria do sistema"
  },
  {
    title: "Configurações",
    href: "/admin/settings",
    icon: Settings,
    description: "Configurações do sistema"
  }
];

function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <Sidebar className={cn("border-r border-sidebar-border", state === "collapsed" ? "w-14" : "w-64")}>
      <SidebarContent className="bg-sidebar-background">
        {/* Admin Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            {state !== "collapsed" && (
              <div>
                <h2 className="font-semibold text-sidebar-foreground">Admin Panel</h2>
                <p className="text-xs text-sidebar-foreground/60">Sistema de Gestão</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    className={cn(
                      "h-12 text-sidebar-foreground hover:bg-sidebar-accent",
                      isActive(item.href) && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    )}
                  >
                    <Link to={item.href} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {state !== "collapsed" && (
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-sidebar-foreground/60">{item.description}</div>
                        </div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Section */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Shield className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            {state !== "collapsed" && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-xs text-sidebar-foreground/60">Administrador</p>
              </div>
            )}
          </div>
          
          {state !== "collapsed" && (
            <>
              <Separator className="mb-3" />
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start h-8 text-sidebar-foreground hover:bg-sidebar-accent"
                  asChild
                >
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Área do Usuário
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start h-8 text-sidebar-foreground hover:bg-sidebar-accent"
                  onClick={signOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

interface AdminLayoutProps {
  children?: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 border-b bg-card/50 flex items-center px-4 gap-4">
            <SidebarTrigger className="p-2" />
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Painel Administrativo</span>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-background">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}