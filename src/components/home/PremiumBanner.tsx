import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, BookOpen, Award, Zap } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";

export const PremiumBanner = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, loading } = useSubscription();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleButtonClick = () => {
    if (user) {
      navigate("/assinatura");
    } else {
      setAuthModalOpen(true);
    }
  };

  // Don't show banner for premium users or while loading
  if (loading || isPremium) return null;

  const benefits = [
    { icon: BookOpen, text: "100+ cursos" },
    { icon: Award, text: "Certificados" },
    { icon: Sparkles, text: "Conteúdo exclusivo" },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 border-y border-primary/20">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8">
          {/* Left content */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <Crown className="w-7 h-7 text-primary-foreground" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Desbloqueie o acesso completo
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Assine o Premium por apenas <span className="font-semibold text-primary">R$ 49,90/mês</span> e tenha acesso ilimitado
              </p>
            </div>
          </div>

          {/* Benefits pills - hidden on very small screens */}
          <div className="hidden md:flex items-center gap-3">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-border/50"
              >
                <benefit.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleButtonClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            size="lg"
          >
            <Zap className="w-4 h-4 mr-2" />
            {user ? "Assinar Premium" : "Começar Agora"}
          </Button>
        </div>

        {/* Mobile benefits */}
        <div className="flex md:hidden items-center justify-center gap-4 mt-4 flex-wrap">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 text-sm text-muted-foreground"
            >
              <benefit.icon className="w-3.5 h-3.5 text-primary" />
              <span>{benefit.text}</span>
            </div>
          ))}
        </div>
      </div>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        onSuccess={() => navigate("/assinatura")}
      />
    </div>
  );
};
