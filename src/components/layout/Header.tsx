import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import btxLogo from "@/assets/btx-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useState, useEffect } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  return <header className={`fixed top-0 left-0 right-0 z-50 bg-background border-b border-border/30 transition-shadow duration-300 ${isScrolled ? "shadow-lg shadow-black/20" : ""}`}>
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <img src={btxLogo} alt="BTX Logo" className="h-10 sm:h-14 w-10 sm:w-14 object-contain" />
          </button>
          
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <Button variant="ghost" onClick={() => navigate("/")}>
              Início
            </Button>
            <Button variant="ghost" onClick={() => handleProtectedNavigation("/meus-cursos")}>
              Meus Cursos
            </Button>
            <Button variant="ghost" onClick={() => handleProtectedNavigation("/certificados")}>
              Certificados
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          

          {isAuthenticated ? <DropdownMenu>
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
                {isAdmin && <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      Admin
                    </DropdownMenuItem>
                  </>}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> : <Button className="text-xs sm:text-sm whitespace-nowrap px-3 sm:px-6" onClick={() => setAuthModalOpen(true)}>
              Crie Sua Conta Gratuita
            </Button>}
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} onSuccess={() => setAuthModalOpen(false)} />
    </header>;
};