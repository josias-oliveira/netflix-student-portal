import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Eye, CheckCircle } from "lucide-react";
import { CourseStructure } from "@/components/admin/course-editor/CourseStructure";
import { ContentEditor } from "@/components/admin/course-editor/ContentEditor";
import { CourseStructure as CourseStructureType, Module, Lesson, SelectedItem, Material } from "@/types/courseEditor";
import { useToast } from "@/hooks/use-toast";

export default function CourseEditor() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<CourseStructureType>({
    id: "new",
    title: "Novo Curso",
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

  const [selectedItem, setSelectedItem] = useState<SelectedItem>({ type: 'none' });

  const handleCourseEdit = (title: string) => {
    setCourse(prev => ({ ...prev, title }));
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
  };

  const handleModuleUpdate = (moduleId: string, updates: Partial<Module>) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId ? { ...m, ...updates } : m
      ),
    }));
  };

  const handleModuleDelete = (moduleId: string) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.filter(m => m.id !== moduleId),
    }));
    setSelectedItem({ type: 'none' });
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
  };

  const handleSaveDraft = () => {
    toast({
      title: "Rascunho salvo",
      description: "Suas alterações foram salvas automaticamente",
    });
  };

  const handlePreview = () => {
    toast({
      title: "Visualizar curso",
      description: "Abrindo visualização como aluno...",
    });
  };

  const handlePublish = () => {
    toast({
      title: "Curso publicado!",
      description: "O curso está disponível para os alunos",
    });
  };

  return (
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

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </Button>
          <Button size="sm" onClick={handlePublish}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Publicar Curso
          </Button>
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
  );
}
