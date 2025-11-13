import { Module, Lesson, SelectedItem } from "@/types/courseEditor";
import { LessonEditor } from "./LessonEditor";
import { ModuleEditor } from "./ModuleEditor";

interface ContentEditorProps {
  selectedItem: SelectedItem;
  modules: Module[];
  onModuleUpdate: (moduleId: string, updates: Partial<Module>) => void;
  onLessonUpdate: (moduleId: string, lessonId: string, updates: Partial<Lesson>) => void;
  onMaterialAdd: (moduleId: string, lessonId: string) => void;
  onMaterialRemove: (moduleId: string, lessonId: string, materialId: string) => void;
}

export function ContentEditor({
  selectedItem,
  modules,
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
            Selecione um módulo ou aula para editar
          </p>
          <p className="text-sm text-muted-foreground">
            Clique na estrutura à esquerda para começar
          </p>
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
