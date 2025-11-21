import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useAdminCourses } from "@/hooks/useCourses";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Courses() {
  const { courses, loading, deleteCourse } = useAdminCourses();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");

  const handleDeleteClick = (courseId: number) => {
    setCourseToDelete(courseId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    const success = await deleteCourse(courseToDelete);
    
    if (success) {
      toast({
        title: "Curso excluído",
        description: "O curso foi removido com sucesso",
      });
    } else {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o curso",
        variant: "destructive",
      });
    }

    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  const handleCreateCourse = () => {
    const trimmedTitle = newCourseTitle.trim();
    
    if (!trimmedTitle) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, digite um título para o curso",
        variant: "destructive",
      });
      return;
    }

    // Navigate to editor with title as query param
    navigate(`/admin/cursos/novo?title=${encodeURIComponent(trimmedTitle)}`);
    setCreateDialogOpen(false);
    setNewCourseTitle("");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">Carregando cursos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cursos</h1>
          <p className="text-muted-foreground">Gerencie o conteúdo da plataforma</p>
        </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Adicionar Novo Curso
        </Button>
      </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título do Curso</TableHead>
                <TableHead className="text-center">Módulos</TableHead>
                <TableHead className="text-center">Aulas</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={course.thumbnail_url || '/placeholder.svg'}
                        alt={course.title}
                        className="w-16 h-10 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground">BTX Academy</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {course.modules || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    {course.totalLessons || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={course.status === "published" ? "default" : "secondary"}>
                      {course.status === "published" ? "Publicado" : "Rascunho"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => navigate(`/admin/cursos/editor/${course.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteClick(course.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Curso</DialogTitle>
            <DialogDescription>
              Digite o título do curso que você deseja criar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="course-title">Título do Curso</Label>
              <Input
                id="course-title"
                placeholder="Ex: Workshop de Apresentações"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateCourse();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCourse}>
              Criar Curso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir curso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O curso, seus módulos, aulas e materiais serão permanentemente removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
