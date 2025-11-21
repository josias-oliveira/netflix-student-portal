import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, GripVertical, ChevronDown, ChevronRight, Trash2, AlertCircle } from "lucide-react";
import { Module, Lesson, SelectedItem } from "@/types/courseEditor";
import { cn } from "@/lib/utils";

interface CourseStructureProps {
  courseTitle: string;
  modules: Module[];
  selectedItem: SelectedItem;
  onCourseEdit: (title: string) => void;
  onModuleAdd: () => void;
  onModuleEdit: (moduleId: string, updates: Partial<Module>) => void;
  onModuleDelete: (moduleId: string) => void;
  onLessonAdd: (moduleId: string) => void;
  onLessonDelete: (moduleId: string, lessonId: string) => void;
  onSelect: (item: SelectedItem) => void;
}

export function CourseStructure({
  courseTitle,
  modules,
  selectedItem,
  onCourseEdit,
  onModuleAdd,
  onModuleEdit,
  onModuleDelete,
  onLessonAdd,
  onLessonDelete,
  onSelect,
}: CourseStructureProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map(m => m.id))
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const isSelected = (type: 'module' | 'lesson', moduleId: string, lessonId?: string) => {
    if (selectedItem.type === 'none') return false;
    if (type === 'module') {
      return selectedItem.type === 'module' && selectedItem.moduleId === moduleId;
    }
    return selectedItem.type === 'lesson' && 
           selectedItem.moduleId === moduleId && 
           selectedItem.lessonId === lessonId;
  };

  const isDefaultTitle = courseTitle === "Novo Curso" || !courseTitle.trim();

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Course Title */}
      <div className="p-4 border-b border-border space-y-2">
        <div className="relative">
          <Input
            value={courseTitle}
            onChange={(e) => onCourseEdit(e.target.value)}
            className={cn(
              "text-lg font-bold pr-10",
              isDefaultTitle && "border-destructive focus-visible:ring-destructive"
            )}
            placeholder="Digite o título do curso..."
          />
          {isDefaultTitle && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
          )}
        </div>
        {isDefaultTitle && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Defina um título para o curso antes de salvar
          </p>
        )}
      </div>

      {/* Structure List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {modules.map((module, moduleIndex) => (
          <div key={module.id} className="space-y-1">
            {/* Module Item */}
            <div
              className={cn(
                "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors group",
                isSelected('module', module.id) ? "bg-primary/10 text-primary" : "hover:bg-muted"
              )}
              onClick={() => onSelect({ type: 'module', moduleId: module.id })}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleModule(module.id);
                }}
              >
                {expandedModules.has(module.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              <span className="flex-1 font-semibold text-sm">
                MÓDULO {moduleIndex + 1}: {module.title || "Sem título"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onModuleDelete(module.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            {/* Lessons List */}
            {expandedModules.has(module.id) && (
              <div className="ml-6 space-y-1">
                {module.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={lesson.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors group",
                      isSelected('lesson', module.id, lesson.id) 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted"
                    )}
                    onClick={() => onSelect({ type: 'lesson', moduleId: module.id, lessonId: lesson.id })}
                  >
                    <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab" />
                    <span className="flex-1 text-sm">
                      Aula {moduleIndex + 1}.{lessonIndex + 1}: {lesson.title || "Sem título"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLessonDelete(module.id, lesson.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs text-muted-foreground"
                  onClick={() => onLessonAdd(module.id)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar Aula
                </Button>
              </div>
            )}
          </div>
        ))}

        <Button
          variant="outline"
          className="w-full"
          onClick={onModuleAdd}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Módulo
        </Button>
      </div>
    </div>
  );
}
