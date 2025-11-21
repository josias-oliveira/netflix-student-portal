import { Module, Lesson, SelectedItem, CourseStructure } from "@/types/courseEditor";
import { LessonEditor } from "./LessonEditor";
import { ModuleEditor } from "./ModuleEditor";
import { CourseInfoEditor } from "./CourseInfoEditor";
import { CertificateEditor } from "./CertificateEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface ContentEditorProps {
  selectedItem: SelectedItem;
  course: CourseStructure;
  modules: Module[];
  onCourseUpdate: (updates: Partial<CourseStructure>) => void;
  onModuleUpdate: (moduleId: string, updates: Partial<Module>) => void;
  onLessonUpdate: (moduleId: string, lessonId: string, updates: Partial<Lesson>) => void;
  onMaterialAdd: (moduleId: string, lessonId: string) => void;
  onMaterialRemove: (moduleId: string, lessonId: string, materialId: string) => void;
}

export function ContentEditor({
  selectedItem,
  course,
  modules,
  onCourseUpdate,
  onModuleUpdate,
  onLessonUpdate,
  onMaterialAdd,
  onMaterialRemove,
}: ContentEditorProps) {
  if (selectedItem.type === 'none') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-muted-foreground">
            Clique no título do curso, em um módulo ou aula para editar
          </p>
          <p className="text-sm text-muted-foreground">
            Use a estrutura à esquerda para navegar
          </p>
        </div>
      </div>
    );
  }

  if (selectedItem.type === 'course') {
    const [activeTab, setActiveTab] = useState("info");
    
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="certificate">Certificado</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <CourseInfoEditor
                courseTitle={course.title}
                courseDescription={course.description}
                thumbnailUrl={course.thumbnail_url}
                coverImageUrl={course.cover_image_url}
                featured={course.featured}
                isPaid={course.is_paid}
                price={course.price}
                onTitleUpdate={(title) => onCourseUpdate({ title })}
                onDescriptionUpdate={(description) => onCourseUpdate({ description })}
                onThumbnailUpdate={(thumbnail_url) => onCourseUpdate({ thumbnail_url })}
                onCoverImageUpdate={(cover_image_url) => onCourseUpdate({ cover_image_url })}
                onFeaturedUpdate={(featured) => onCourseUpdate({ featured })}
                onIsPaidUpdate={(is_paid) => onCourseUpdate({ is_paid })}
                onPriceUpdate={(price) => onCourseUpdate({ price })}
              />
            </TabsContent>
            
            <TabsContent value="certificate">
              <CertificateEditor
                course={course}
                onUpdate={onCourseUpdate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  if (selectedItem.type === 'module') {
    const module = modules.find(m => m.id === selectedItem.moduleId);
    if (!module) return null;

    const moduleIndex = modules.indexOf(module);

    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6">
          <ModuleEditor
            module={module}
            moduleIndex={moduleIndex}
            onUpdate={(updates) => onModuleUpdate(module.id, updates)}
          />
        </div>
      </div>
    );
  }

  if (selectedItem.type === 'lesson') {
    const module = modules.find(m => m.id === selectedItem.moduleId);
    const lesson = module?.lessons.find(l => l.id === selectedItem.lessonId);
    if (!module || !lesson) return null;

    const moduleIndex = modules.indexOf(module);
    const lessonIndex = module.lessons.indexOf(lesson);

    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6">
          <LessonEditor
            lesson={lesson}
            moduleIndex={moduleIndex}
            lessonIndex={lessonIndex}
            onUpdate={(updates) => onLessonUpdate(module.id, lesson.id, updates)}
            onMaterialAdd={() => onMaterialAdd(module.id, lesson.id)}
            onMaterialRemove={(materialId) => onMaterialRemove(module.id, lesson.id, materialId)}
          />
        </div>
      </div>
    );
  }

  return null;
}
