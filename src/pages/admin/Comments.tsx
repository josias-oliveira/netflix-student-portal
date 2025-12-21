import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Trash2, Clock, CheckCircle, XCircle, MessageSquare, User } from "lucide-react";
import { useAdminComments } from "@/hooks/useAdminComments";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Comments() {
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const { comments, loading, updateStatus, deleteComment } = useAdminComments(activeTab);

  const handleApprove = async (id: string) => {
    const success = await updateStatus(id, "approved");
    if (success) {
      toast.success("Comentário aprovado!");
    } else {
      toast.error("Erro ao aprovar comentário");
    }
  };

  const handleReject = async (id: string) => {
    const success = await updateStatus(id, "rejected");
    if (success) {
      toast.success("Comentário reprovado!");
    } else {
      toast.error("Erro ao reprovar comentário");
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteComment(id);
    if (success) {
      toast.success("Comentário excluído!");
    } else {
      toast.error("Erro ao excluir comentário");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Aguardando</Badge>;
      case "approved":
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Reprovado</Badge>;
      default:
        return null;
    }
  };

  const CommentCard = ({ comment }: { comment: typeof comments[0] }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={comment.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.profile?.email}`} />
              <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">
                {comment.profile?.full_name || comment.profile?.email || "Usuário"}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(comment.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
          {getStatusBadge(comment.status)}
        </div>
        {comment.lesson && (
          <div className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium">{comment.lesson.module?.course?.title}</span>
            {" › "}
            <span>{comment.lesson.module?.title}</span>
            {" › "}
            <span>{comment.lesson.title}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-foreground mb-4 whitespace-pre-wrap">{comment.content}</p>
        <div className="flex gap-2 justify-end">
          {comment.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleApprove(comment.id)}
              >
                <Check className="w-4 h-4 mr-1" />
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleReject(comment.id)}
              >
                <X className="w-4 h-4 mr-1" />
                Reprovar
              </Button>
            </>
          )}
          {comment.status === "rejected" && (
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => handleApprove(comment.id)}
            >
              <Check className="w-4 h-4 mr-1" />
              Aprovar
            </Button>
          )}
          {comment.status === "approved" && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleReject(comment.id)}
            >
              <X className="w-4 h-4 mr-1" />
              Reprovar
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir comentário?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O comentário será permanentemente excluído.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => handleDelete(comment.id)}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <>
      {[1, 2, 3].map((i) => (
        <Card key={i} className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full mb-4" />
            <div className="flex gap-2 justify-end">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12">
      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Comentários</h1>
        <p className="text-muted-foreground">Gerencie os comentários das aulas</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Aguardando
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Aprovados
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Reprovados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {loading ? (
            <LoadingSkeleton />
          ) : comments.length === 0 ? (
            <EmptyState message="Nenhum comentário aguardando aprovação" />
          ) : (
            comments.map((comment) => <CommentCard key={comment.id} comment={comment} />)
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {loading ? (
            <LoadingSkeleton />
          ) : comments.length === 0 ? (
            <EmptyState message="Nenhum comentário aprovado" />
          ) : (
            comments.map((comment) => <CommentCard key={comment.id} comment={comment} />)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {loading ? (
            <LoadingSkeleton />
          ) : comments.length === 0 ? (
            <EmptyState message="Nenhum comentário reprovado" />
          ) : (
            comments.map((comment) => <CommentCard key={comment.id} comment={comment} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
