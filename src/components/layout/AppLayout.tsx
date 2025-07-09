import React, { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserData } from "@/contexts/UserDataContext";
import { Button } from "@/components/ui/button";
import { BackupStatusIndicator } from "./BackupStatusIndicator";
import { SupabaseStatus } from "./SupabaseStatus";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Calculator,
  LayoutDashboard,
  Tags,
  BarChart3,
  Settings,
  FileDown,
  LogOut,
  Menu,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface AppLayoutProps {
  children: ReactNode;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Categorias",
    href: "/categories",
    icon: Tags,
  },
  {
    name: "Relatórios",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Colaboração",
    href: "/collaboration",
    icon: Users,
  },
  {
    name: "Configurações",
    href: "/settings",
    icon: Settings,
  },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const { currentUser, clearUser } = useUserData();
  const { toast } = useToast();

  // Update user info when currentUser changes or storage changes
  useEffect(() => {
    const updateUserInfo = () => {
      const authUser = JSON.parse(
        localStorage.getItem("plannerfinUser") || "{}",
      );
      setUserInfo({
        name: currentUser?.name || authUser.name || "Usuário",
        email: currentUser?.email || authUser.email || "user@example.com",
        avatar: authUser.avatar,
      });
    };

    updateUserInfo();

    // Listen for storage changes (when profile is updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "plannerfinUser") {
        updateUserInfo();
      }
    };

    // Listen for custom storage events from profile updates
    const handleCustomStorageEvent = () => {
      updateUserInfo();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("storage", handleCustomStorageEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("storage", handleCustomStorageEvent);
    };
  }, [currentUser]);

  const user = userInfo || {
    name: "Usuário",
    email: "user@example.com",
    avatar: null,
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error);
        toast({
          title: "Erro ao sair",
          description: "Houve um problema ao fazer logout",
          variant: "destructive",
        });
        return;
      }

      // Clear local storage and user data
      localStorage.removeItem("plannerfinUser");
      clearUser();

      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });

      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if Supabase fails
      localStorage.removeItem("plannerfinUser");
      clearUser();
      navigate("/");
    }
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 p-6 border-b">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Calculator className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-lg">PlannerFin</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Button
              key={item.name}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                isActive && "bg-primary/10 text-primary border-primary/20",
              )}
              onClick={() => {
                navigate(item.href);
                if (mobile) setMobileMenuOpen(false);
              }}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 p-3">
              <Avatar className="w-6 h-6">
                {user.avatar && <AvatarImage src={user.avatar} />}
                <AvatarFallback className="text-xs">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col bg-sidebar border-r border-border">
          <Sidebar />
        </div>
      </div>

      {/* Mobile menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <div className="bg-sidebar h-full">
            <Sidebar mobile />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b border-border">
          <div className="flex h-14 items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <SupabaseStatus />
              <BackupStatusIndicator />
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
      </div>
    </div>
  );
}
