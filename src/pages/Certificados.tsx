import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Certificate {
  id: string;
  courseTitle: string;
  completionDate: string;
  instructor: string;
  thumbnail: string;
}

const mockCertificates: Certificate[] = [
  {
    id: "1",
    courseTitle: "UI/UX Design: Do Zero ao Profissional",
    completionDate: "15 de Dezembro, 2024",
    instructor: "Maria Santos",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
  },
];

const Certificados = () => {
  const { toast } = useToast();
  const hasCertificates = mockCertificates.length > 0;

  const handleDownload = (certificate: Certificate) => {
    toast({
      title: "Baixando certificado",
      description: `Preparando o certificado de ${certificate.courseTitle}...`,
    });
  };

  const handleShare = (certificate: Certificate) => {
    toast({
      title: "Compartilhar certificado",
      description: "Copiado para a área de transferência!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12 container mx-auto px-4 sm:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Meus Certificados
            </h1>
            <p className="text-muted-foreground">
              {hasCertificates
                ? `${mockCertificates.length} certificado${mockCertificates.length !== 1 ? "s" : ""} conquistado${mockCertificates.length !== 1 ? "s" : ""}`
                : "Você ainda não possui certificados"}
            </p>
          </div>

          {hasCertificates ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCertificates.map((certificate) => (
                <Card key={certificate.id} className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Award className="w-24 h-24 text-primary/40" />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <Award className="w-16 h-16 text-primary mb-4" />
                      <h3 className="font-bold text-foreground text-lg mb-2">
                        Certificado de Conclusão
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {certificate.courseTitle}
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Concluído em {certificate.completionDate}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Instrutor: {certificate.instructor}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        variant="default"
                        onClick={() => handleDownload(certificate)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => handleShare(certificate)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <Award className="w-24 h-24 text-muted-foreground/50 mb-6" />
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Sua sala de troféus está vazia
                </h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  Você ainda não concluiu nenhum curso. Continue estudando para ganhar seu
                  primeiro certificado!
                </p>
                <Button onClick={() => window.location.href = "/"}>
                  Explorar Cursos
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Certificados;
