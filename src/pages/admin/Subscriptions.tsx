import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { subscriptions } from "@/data/mockAdminData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Subscriptions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Assinaturas</h1>
        <p className="text-muted-foreground">Gerencie planos e assinantes</p>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="subscribers">Assinantes</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Plano Gratuito</CardTitle>
                <CardDescription>Acesso limitado para experimentar a plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">R$ 0</div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Acesso ao Módulo 1 de cada curso</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Sem emissão de certificados</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Suporte por e-mail</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Editar Plano
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Plano Premium
                  <Badge>Popular</Badge>
                </CardTitle>
                <CardDescription>Acesso completo a toda a plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">R$ 97 <span className="text-base font-normal text-muted-foreground">/mês</span></div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Acesso ilimitado a todos os cursos</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Emissão de certificados</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Suporte prioritário</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Acesso offline aos vídeos</span>
                  </li>
                </ul>
                <Button className="w-full">
                  Editar Plano
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead className="text-center">Plano</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Próxima Cobrança</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.studentName}</TableCell>
                      <TableCell className="text-muted-foreground">{sub.studentEmail}</TableCell>
                      <TableCell className="text-center">
                        <Badge>{sub.plan}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={sub.status === "Ativo" ? "default" : "destructive"}>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {new Date(sub.nextBilling).toLocaleDateString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
