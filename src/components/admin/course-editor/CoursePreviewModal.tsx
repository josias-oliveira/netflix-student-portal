import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VideoPlayer } from "@/components/course/VideoPlayer";
import { CourseStructure } from "@/types/courseEditor";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CoursePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: CourseStructure;
}

export function CoursePreviewModal({ open, onOpenChange, course }: CoursePreviewModalProps) {
  // Pega a primeira aula do primeiro módulo para visualização
  const firstModule = course.modules[0];
  const firstLesson = firstModule?.lessons[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl">
            Visualização: {course.title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Visualização como aluno - Primeira aula
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {/* Video Player */}
              {firstLesson && (
                <div className="space-y-4">
                  <div className="bg-black rounded-lg overflow-hidden">
                    <VideoPlayer
                      videoUrl={firstLesson.videoUrl}
                      streamingUrl={firstLesson.streamingUrl}
                      className="w-full aspect-video"
                    />
                  </div>

                  {/* Lesson Info */}
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {firstModule.title} - {firstLesson.title}
                    </h2>
                    
                    {firstLesson.description && (
                      <div className="prose prose-sm max-w-none">
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {firstLesson.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Materials */}
                  {firstLesson.materials && firstLesson.materials.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        Materiais de Apoio
                      </h3>
                      <div className="space-y-2">
                        {firstLesson.materials.map((material) => (
                          <div
                            key={material.id}
                            className="flex items-center gap-3 p-3 border border-border rounded-md bg-muted/20 hover:bg-muted/40 transition-colors"
                          >
                            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{material.name}</p>
                              <p className="text-xs text-muted-foreground">{material.size}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="flex-shrink-0">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Course Structure Preview */}
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="text-lg font-semibold text-foreground">
                      Estrutura do Curso
                    </h3>
                    <div className="space-y-3">
                      {course.modules.map((module, idx) => (
                        <div key={module.id} className="space-y-2">
                          <h4 className="text-sm font-semibold text-foreground">
                            Módulo {idx + 1}: {module.title}
                          </h4>
                          <ul className="space-y-1 pl-4">
                            {module.lessons.map((lesson, lessonIdx) => (
                              <li key={lesson.id} className="text-sm text-muted-foreground">
                                Aula {idx + 1}.{lessonIdx + 1}: {lesson.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!firstLesson && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nenhuma aula disponível para visualização
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
