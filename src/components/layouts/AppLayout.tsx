
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Kanban, 
  ClipboardList, 
  UserPlus, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Box,
  Car,
  Archive,
  Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import mavLogo from '@/assets/mav-emplacamento-logo.svg';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, userProfile, logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = React.useState(false);

  const initials = userProfile?.name
    ? userProfile.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  // Menu items based on user role
  const getMenuItems = () => {
    const items = [];

    // Admin menu items
    if (userProfile?.role === 'admin') {
      items.push(
        {
          icon: LayoutDashboard,
          name: 'Dashboard',
          href: '/admin/dashboard',
          roles: ['admin'],
        },
        {
          icon: Wrench,
          name: 'Serviços',
          href: '/admin/services',
          roles: ['admin'],
        },
        {
          icon: ClipboardList,
          name: 'Pedidos',
          href: '/admin/orders',
          roles: ['admin'],
        },
        {
          icon: Users,
          name: 'Clientes',
          href: '/admin/clients',
          roles: ['admin'],
        },
        {
          icon: Car,
          name: 'Veículos',
          href: '/admin/vehicles',
          roles: ['admin'],
        },
        {
          icon: UserPlus,
          name: 'Vendedores',
          href: '/admin/sellers',
          roles: ['admin'],
        },
        {
          icon: Box,
          name: 'Estoque',
          href: '/admin/inventory',
          roles: ['admin'],
        },
        {
          icon: Settings,
          name: 'Configurações',
          href: '/admin/settings',
          roles: ['admin'],
        }
      );
    }

    // Seller menu items
    else if (userProfile?.role === 'seller') {
      items.push(
        {
          icon: LayoutDashboard,
          name: 'Dashboard',
          href: '/seller/dashboard',
          roles: ['seller'],
        },
        {
          icon: Wrench,
          name: 'Serviços',
          href: '/seller/services',
          roles: ['seller'],
        },
        {
          icon: ClipboardList,
          name: 'Pedidos',
          href: '/seller/orders',
          roles: ['seller'],
        },
        {
          icon: Users,
          name: 'Clientes',
          href: '/seller/clients',
          roles: ['seller'],
        },
        {
          icon: Car,
          name: 'Veículos',
          href: '/seller/vehicles',
          roles: ['seller'],
        },
        {
          icon: Box,
          name: 'Estoque',
          href: '/seller/inventory',
          roles: ['seller'],
        },
        {
          icon: Settings,
          name: 'Configurações',
          href: '/seller/settings',
          roles: ['seller'],
        }
      );
    }

    // Client menu items (physical or juridical)
    else if (userProfile?.role === 'physical' || userProfile?.role === 'juridical') {
      items.push(
        {
          icon: LayoutDashboard,
          name: 'Dashboard',
          href: '/client/dashboard',
          roles: ['physical', 'juridical'],
        },
        {
          icon: Wrench,
          name: 'Serviços',
          href: '/client/services',
          roles: ['physical', 'juridical'],
        },
        {
          icon: ClipboardList,
          name: 'Pedidos',
          href: '/client/orders',
          roles: ['physical', 'juridical'],
        },
        {
          icon: Car,
          name: 'Veículos',
          href: '/client/vehicles',
          roles: ['physical', 'juridical'],
        }
      );
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar toggle button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border transition-all",
          collapsed ? 'w-16' : 'w-64',
          isMobile && (collapsed ? '-translate-x-full' : 'translate-x-0 fixed inset-y-0 z-40')
        )}
      >
        {/* Logo and collapse button */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img src={mavLogo} alt="MAV EMPACAMENTO" className="h-10 w-auto rounded" />
              <span className="font-bold text-sm leading-tight">MAV EMPACAMENTO</span>
            </div>
          )}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              if (!userProfile?.role || !item.roles.includes(userProfile.role)) return null;
              
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                      location.pathname === item.href
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* User profile section */}
        <div className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full flex items-center text-left px-0",
                  collapsed ? "justify-center" : "justify-start gap-3"
                )}
              >
                <Avatar className="h-8 w-8 border border-sidebar-border">
                  <AvatarImage src={userProfile?.photo_url || "/placeholder.svg"} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">{userProfile?.name}</span>
                    <span className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile?.photo_url || "/placeholder.svg"} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5">
                  <span className="text-sm font-medium">{userProfile?.name}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={userProfile?.role === 'admin' ? '/admin/settings' : 
                          userProfile?.role === 'seller' ? '/seller/settings' : 
                          '/client/settings'} className="cursor-pointer">
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={logout}
                className="text-destructive focus:bg-destructive/10 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      
      {/* Main content */}
      <div className={cn("flex-1", isMobile && "pt-16")}>
        {/* Overlay for mobile when sidebar is open */}
        {isMobile && !collapsed && (
          <div 
            className="fixed inset-0 bg-background/80 z-30 backdrop-blur-sm"
            onClick={() => setCollapsed(true)}
          />
        )}
        
        {/* Content */}
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
