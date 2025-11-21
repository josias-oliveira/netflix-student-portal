import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { CourseStructure } from "@/components/admin/course-editor/CourseStructure";
import { ContentEditor } from "@/components/admin/course-editor/ContentEditor";
import { CoursePreviewModal } from "@/components/admin/course-editor/CoursePreviewModal";
import { CourseStructure as CourseStructureType, Module, Lesson, SelectedItem, Material } from "@/types/courseEditor";
import { useToast } from "@/hooks/use-toast";
import { saveCourse, loadCourse, loadCourseBySlug, updateCourseStatus } from "@/services/courseService";

export default function CourseEditor() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Inicializar isLoading como true se estiver editando um curso existente
  const isEditingExisting = courseId && courseId !== 'novo';
  const [isLoading, setIsLoading] = useState(isEditingExisting);

  // Inicializar o estado do curso condicionalmente
  const [course, setCourse] = useState<CourseStructureType | null>(() => {
    // Se estiver editando um curso existente, começar com null (será carregado)
    if (isEditingExisting) {
      return null;
    }
    
    // Se for um curso novo, usar valores padrão
    return {
      id: "new",
      title: searchParams.get('title') || "Novo Curso",
      description: undefined,
      thumbnail_url: undefined,
      cover_image_url: undefined,
      featured: false,
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
    };
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [selectedItem, setSelectedItem] = useState<SelectedItem>({ type: 'none' });
  const [showPreview, setShowPreview] = useState(false);

  // Load course if editing existing one (by ID or slug)
  useEffect(() => {
    if (courseId && courseId !== 'novo') {
      setIsLoading(true);
      
      // Check if courseId is a number (ID) or string (slug)
      const isNumericId = /^\d+$/.test(courseId);
      
      const loadPromise = isNumericId 
        ? loadCourse(parseInt(courseId))
        : loadCourseBySlug(courseId);
      
      loadPromise
        .then((loadedCourse) => {
          console.log('Curso carregado:', loadedCourse);
          setCourse(loadedCourse);
        })
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
  }, [courseId, toast]);

  const handleCourseEdit = (title: string) => {
    setCourse(prev => prev ? ({ ...prev, title }) : null);
    setHasUnsavedChanges(true);
  };

  const handleCourseUpdate = (updates: Partial<CourseStructureType>) => {
    setCourse(prev => prev ? ({ ...prev, ...updates }) : null);
    setHasUnsavedChanges(true);
  };

  const handleModuleAdd = () => {
    if (!course) return;
    
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: `Módulo ${course.modules.length + 1}`,
      description: "",
      lessons: [],
    };
    setCourse(prev => prev ? ({
      ...prev,
      modules: [...prev.modules, newModule],
    }) : null);
    setHasUnsavedChanges(true);
  };

  const handleModuleUpdate = (moduleId: string, updates: Partial<Module>) => {
    setCourse(prev => prev ? ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId ? { ...m, ...updates } : m
      ),
    }) : null);
    setHasUnsavedChanges(true);
  };

  const handleModuleDelete = (moduleId: string) => {
    setCourse(prev => prev ? ({
      ...prev,
      modules: prev.modules.filter(m => m.id !== moduleId),
    }) : null);
    setSelectedItem({ type: 'none' });
    setHasUnsavedChanges(true);
  };

  const handleLessonAdd = (moduleId: string) => {
    setCourse(prev => prev ? ({
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
                  duration: 0,
                },
              ],
            }
          : m
      ),
    }) : null);
    setHasUnsavedChanges(true);
  };

  const handleLessonUpdate = (
    moduleId: string,
    lessonId: string,
    updates: Partial<Lesson>
  ) => {
    setCourse(prev => prev ? ({
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
    }) : null);
    setHasUnsavedChanges(true);
  };

  const handleLessonDelete = (moduleId: string, lessonId: string) => {
    setCourse(prev => prev ? ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.filter(l => l.id !== lessonId),
            }
          : m
      ),
    }) : null);
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

    setCourse(prev => prev ? ({
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
    }) : null);

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
    setCourse(prev => prev ? ({
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
    }) : null);
    setHasUnsavedChanges(true);
  };

  const handleSaveDraft = async () => {
    if (!course) return;
    
    // Validação do título
    const trimmedTitle = course.title.trim();
    if (!trimmedTitle || trimmedTitle === "Novo Curso") {
      toast({
        title: "Título inválido",
        description: "Por favor, defina um título válido para o curso antes de salvar",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const savedCourseId = await saveCourse(course, course.status);
      
      // Update course ID if it was new, and get the saved course to get the slug
      if (course.id === 'new') {
        const savedCourse = await loadCourse(savedCourseId);
        setCourse(savedCourse);
        
        // Navigate to the slug-based URL if slug exists
        if (savedCourse.slug) {
          navigate(`/admin/cursos/editor/${savedCourse.slug}`, { replace: true });
        }
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
    if (!course) return;
    
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

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground">Carregando curso...</p>
        </div>
      </div>
    );
  }

  // Se não está carregando mas o curso é null, houve erro
  if (!course) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">Erro ao carregar o curso</p>
          <Button onClick={() => navigate("/admin/cursos")}>
            Voltar para Cursos
          </Button>
        </div>
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
            course={course}
            modules={course.modules}
            onCourseUpdate={handleCourseUpdate}
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
