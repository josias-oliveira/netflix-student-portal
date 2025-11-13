import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Assinatura = () => {
  const { toast } = useToast();
  const currentPlan = "free" as "free" | "premium";

  const handleUpgrade = () => {
    toast({
      title: "Upgrade de plano",
      description: "Redirecionando para o checkout...",
    });
  };

  const freeBenefits = [
    "Acesso a cursos gratuitos selecionados",
    "Visualização de conteúdo básico",
    "Comunidade de alunos",
  ];

  const premiumBenefits = [
    "Acesso ilimitado a TODOS os cursos",
    "Download de aulas para assistir offline",
    "Certificados de conclusão",
    "Suporte prioritário",
    "Acesso antecipado a novos cursos",
    "Sem anúncios",
    "Projetos práticos exclusivos",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12 container mx-auto px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Current Plan */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Planos e Assinatura
            </h1>
            <div className="flex items-center gap-2 mt-4">
              <p className="text-muted-foreground">Seu plano atual:</p>
              <Badge variant={currentPlan === "premium" ? "default" : "secondary"} className="text-sm">
                {currentPlan === "premium" ? (
                  <>
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </>
                ) : (
                  "Gratuito"
                )}
              </Badge>
            </div>
          </div>

          {/* Plans Comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <Card className="bg-card border-border relative">
              <CardHeader>
                <CardTitle className="text-2xl">Plano Gratuito</CardTitle>
                <CardDescription>Para começar sua jornada de aprendizado</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold text-foreground">R$ 0</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {freeBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
                {currentPlan === "free" && (
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    Plano Atual
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="bg-gradient-to-br from-card to-primary/5 border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold rounded-bl-lg">
                Recomendado
              </div>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Crown className="w-6 h-6 text-primary" />
                  Plano Premium
                </CardTitle>
                <CardDescription>Acesso completo à plataforma</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold text-foreground">R$ 49</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {premiumBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
                {currentPlan === "free" ? (
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    size="lg"
                    onClick={handleUpgrade}
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Fazer Upgrade para Premium
                  </Button>
                ) : (
                  <Badge variant="default" className="w-full justify-center py-2">
                    Plano Atual
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Why Premium Section */}
          {currentPlan === "free" && (
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Por que escolher o Premium?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Desbloqueie todo o potencial da plataforma e acelere sua carreira com acesso
                  ilimitado a mais de 100 cursos atualizados, certificados reconhecidos pelo
                  mercado e uma experiência de aprendizado sem interrupções.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-3xl font-bold text-primary mb-2">100+</div>
                    <div className="text-sm text-muted-foreground">Cursos Disponíveis</div>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-3xl font-bold text-primary mb-2">500+</div>
                    <div className="text-sm text-muted-foreground">Horas de Conteúdo</div>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                    <div className="text-sm text-muted-foreground">Acesso Ilimitado</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Assinatura;
