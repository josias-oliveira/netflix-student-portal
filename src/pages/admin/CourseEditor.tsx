import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { CourseStructure } from "@/components/admin/course-editor/CourseStructure";
import { ContentEditor } from "@/components/admin/course-editor/ContentEditor";
import { CoursePreviewModal } from "@/components/admin/course-editor/CoursePreviewModal";
import { CourseStructure as CourseStructureType, Module, Lesson, SelectedItem, Material } from "@/types/courseEditor";
import { useToast } from "@/hooks/use-toast";
import { saveCourse, loadCourse, updateCourseStatus } from "@/services/courseService";

export default function CourseEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [course, setCourse] = useState<CourseStructureType>({
    id: "new",
    title: "Novo Curso",
    status: 'draft',
    modules: [
      {
        id: "module-1",
        title: "INTRODUÇÃO",
        description: "Módulo inicial do curso",
        lessons: [
          {
            id: "lesson-1",
            title: "Boas-vindas",
            description: "",
            materials: [],
          },
        ],
      },
    ],
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [selectedItem, setSelectedItem] = useState<SelectedItem>({ type: 'none' });
  const [showPreview, setShowPreview] = useState(false);

  // Load course if editing existing one
  useEffect(() => {
    if (id && id !== 'new') {
      setIsLoading(true);
      loadCourse(parseInt(id))
        .then(setCourse)
        .catch((error) => {
          console.error('Error loading course:', error);
          toast({
            title: "Erro ao carregar curso",
            description: "Não foi possível carregar o curso",
            variant: "destructive",
          });
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, toast]);

  const handleCourseEdit = (title: string) => {
    setCourse(prev => ({ ...prev, title }));
    setHasUnsavedChanges(true);
  };

  const handleModuleAdd = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: `Módulo ${course.modules.length + 1}`,
      description: "",
      lessons: [],
    };
    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, newModule],
    }));
    setHasUnsavedChanges(true);
  };

  const handleModuleUpdate = (moduleId: string, updates: Partial<Module>) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId ? { ...m, ...updates } : m
      ),
    }));
    setHasUnsavedChanges(true);
  };

  const handleModuleDelete = (moduleId: string) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.filter(m => m.id !== moduleId),
    }));
    setSelectedItem({ type: 'none' });
    setHasUnsavedChanges(true);
  };

  const handleLessonAdd = (moduleId: string) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              lessons: [
                ...m.lessons,
                {
                  id: `lesson-${Date.now()}`,
                  title: `Aula ${m.lessons.length + 1}`,
                  description: "",
                  materials: [],
                },
              ],
            }
          : m
      ),
    }));
    setHasUnsavedChanges(true);
  };

  const handleLessonUpdate = (
    moduleId: string,
    lessonId: string,
    updates: Partial<Lesson>
  ) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map(l =>
                l.id === lessonId ? { ...l, ...updates } : l
              ),
            }
          : m
      ),
    }));
    setHasUnsavedChanges(true);
  };

  const handleLessonDelete = (moduleId: string, lessonId: string) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.filter(l => l.id !== lessonId),
            }
          : m
      ),
    }));
    setSelectedItem({ type: 'none' });
    setHasUnsavedChanges(true);
  };

  const handleMaterialAdd = (moduleId: string, lessonId: string) => {
    // Simulate file selection
    const newMaterial: Material = {
      id: `material-${Date.now()}`,
      name: "Material de Apoio.pdf",
      url: "#",
      size: "2.5 MB",
      type: "application/pdf",
    };

    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map(l =>
                l.id === lessonId
                  ? {
                      ...l,
                      materials: [...l.materials, newMaterial],
                    }
                  : l
              ),
            }
          : m
      ),
    }));

    toast({
      title: "Material adicionado",
      description: "O arquivo foi anexado à aula",
    });
    setHasUnsavedChanges(true);
  };

  const handleMaterialRemove = (
    moduleId: string,
    lessonId: string,
    materialId: string
  ) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map(l =>
                l.id === lessonId
                  ? {
                      ...l,
                      materials: l.materials.filter(mat => mat.id !== materialId),
                    }
                  : l
              ),
            }
          : m
      ),
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const savedCourseId = await saveCourse(course, course.status);
      
      // Update course ID if it was new
      if (course.id === 'new') {
        setCourse(prev => ({ ...prev, id: savedCourseId.toString() }));
      }
      
      setHasUnsavedChanges(false);
      toast({
        title: "Alterações salvas",
        description: "Suas alterações foram salvas com sucesso",
      });
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleTogglePublish = async (checked: boolean) => {
    const newStatus = checked ? 'published' : 'draft';
    
    // Se o curso é novo, precisa salvar primeiro
    if (course.id === 'new' || hasUnsavedChanges) {
      toast({
        title: "Salve o curso primeiro",
        description: "Você precisa salvar as alterações antes de publicar",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateCourseStatus(parseInt(course.id), newStatus);
      setCourse(prev => ({ ...prev, status: newStatus }));
      
      toast({
        title: checked ? "Curso publicado!" : "Curso despublicado",
        description: checked 
          ? "O curso agora está visível para os alunos"
          : "O curso foi ocultado dos alunos",
      });
    } catch (error) {
      console.error('Error updating course status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do curso",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando curso...</p>
      </div>
    );
  }

  return (
    <>
      <CoursePreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        course={course}
      />
      
      <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/cursos")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-sm font-semibold">Editor de Curso</h1>
            <p className="text-xs text-muted-foreground">{course.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePreview}
            disabled={isSaving}
          >
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </Button>

          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background">
            <Switch
              id="publish-toggle"
              checked={course.status === 'published'}
              onCheckedChange={handleTogglePublish}
              disabled={isSaving || course.id === 'new' || hasUnsavedChanges}
            />
            <Label 
              htmlFor="publish-toggle" 
              className="text-sm font-medium cursor-pointer"
            >
              {course.status === 'published' ? 'Publicado' : 'Rascunho'}
            </Label>
          </div>
        </div>
      </header>

      {/* Main Content: Master-Detail Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Course Structure */}
        <div className="w-80 flex-shrink-0">
          <CourseStructure
            courseTitle={course.title}
            modules={course.modules}
            selectedItem={selectedItem}
            onCourseEdit={handleCourseEdit}
            onModuleAdd={handleModuleAdd}
            onModuleEdit={handleModuleUpdate}
            onModuleDelete={handleModuleDelete}
            onLessonAdd={handleLessonAdd}
            onLessonDelete={handleLessonDelete}
            onSelect={setSelectedItem}
          />
        </div>

        {/* Right: Content Editor */}
        <div className="flex-1 bg-background">
          <ContentEditor
            selectedItem={selectedItem}
            modules={course.modules}
            onModuleUpdate={handleModuleUpdate}
            onLessonUpdate={handleLessonUpdate}
            onMaterialAdd={handleMaterialAdd}
            onMaterialRemove={handleMaterialRemove}
          />
        </div>
      </div>
    </div>
    </>
  );
}
