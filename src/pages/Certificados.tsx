import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Award } from "lucide-react";
import { useCertificates } from "@/hooks/useCertificates";

const Certificados = () => {
  const { certificates, isLoading, downloadCertificate, shareCertificate } = useCertificates();
  const hasCertificates = certificates.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12 container mx-auto px-4 sm:px-8">
          <p className="text-center">Carregando certificados...</p>
        </main>
      </div>
    );
  }

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
                ? `${certificates.length} certificado${certificates.length !== 1 ? "s" : ""} conquistado${certificates.length !== 1 ? "s" : ""}`
                : "Você ainda não possui certificados"}
            </p>
          </div>

          {hasCertificates ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <Card key={certificate.id} className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {certificate.course_thumbnail ? (
                      <img
                        src={certificate.course_thumbnail}
                        alt={certificate.course_title || "Certificado"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Award className="w-24 h-24 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/50">
                      <Award className="w-16 h-16 text-white mb-4" />
                      <h3 className="font-bold text-white text-lg mb-2">
                        Certificado de Conclusão
                      </h3>
                      <p className="text-sm text-white/90">
                        {certificate.course_title}
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Concluído em {new Date(certificate.issued_at).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Código: {certificate.validation_code?.substring(0, 8)}...
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        variant="default"
                        onClick={() => downloadCertificate(certificate)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => shareCertificate(certificate)}
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
