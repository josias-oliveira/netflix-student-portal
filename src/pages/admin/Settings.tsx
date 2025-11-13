import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Configure as opções da plataforma</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Plataforma</CardTitle>
          <CardDescription>Configure os dados básicos da sua plataforma</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform-name">Nome da Plataforma</Label>
            <Input id="platform-name" defaultValue="EduStream" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platform-description">Descrição</Label>
            <Textarea
              id="platform-description"
              defaultValue="Plataforma de cursos em vídeo"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-email">E-mail de Suporte</Label>
            <Input id="support-email" type="email" defaultValue="suporte@edustream.com" />
          </div>
          <Button>Salvar Alterações</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integração de Pagamentos</CardTitle>
          <CardDescription>Configure suas chaves de API para pagamentos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stripe-key">Chave API Stripe</Label>
            <Input id="stripe-key" type="password" placeholder="sk_live_..." />
          </div>
          <Button>Salvar Configurações</Button>
        </CardContent>
      </Card>
    </div>
  );
}
