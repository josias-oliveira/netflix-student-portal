import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import btxLogo from "@/assets/btx-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleProtectedNavigation = (path: string) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    navigate(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso!");
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background via-background/95 to-transparent">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <img src={btxLogo} alt="BTX Logo" className="h-12 w-12 object-contain" />
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Button
              variant="ghost"
              className="text-foreground hover:text-black"
              onClick={() => navigate("/")}
            >
              Início
            </Button>
            <Button
              variant="ghost"
              className="text-foreground hover:text-black"
              onClick={() => handleProtectedNavigation("/meus-cursos")}
            >
              Meus Cursos
            </Button>
            <Button
              variant="ghost"
              className="text-foreground hover:text-black"
              onClick={() => handleProtectedNavigation("/certificados")}
            >
              Certificados
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden sm:flex"
            disabled={!isAuthenticated}
          >
            <Bell className="h-5 w-5" />
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/perfil")}>
                  Minha Conta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/assinatura")}>
                  Pagamento / Assinatura
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              className="font-semibold text-sm sm:text-base whitespace-nowrap"
              onClick={() => setAuthModalOpen(true)}
            >
              CRIE SUA CONTA GRATUITAMENTE
            </Button>
          )}
        </div>
      </div>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </header>
  );
};
