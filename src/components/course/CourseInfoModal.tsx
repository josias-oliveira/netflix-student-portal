import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Course } from "@/types/course";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayCircle } from "lucide-react";

interface Module {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  order_index: number;
}

interface CourseInfoModalProps {
  course: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnroll: () => void;
  isAuthenticated: boolean;
}

export const CourseInfoModal = ({ 
  course, 
  open, 
  onOpenChange, 
  onEnroll,
  isAuthenticated 
}: CourseInfoModalProps) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchCourseContent();
    }
  }, [open, course.id]);

  const fetchCourseContent = async () => {
    setLoading(true);
    try {
      // Fetch modules for this course
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('id, title, order_index')
        .eq('course_id', course.id)
        .order('order_index');

      if (modulesError) throw modulesError;

      if (modulesData && modulesData.length > 0) {
        // Fetch lessons for each module
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('id, title, order_index, module_id')
          .in('module_id', modulesData.map(m => m.id))
          .order('order_index');

        if (lessonsError) throw lessonsError;

        // Combine modules with their lessons
        const modulesWithLessons = modulesData.map(module => ({
          ...module,
          lessons: lessonsData?.filter(lesson => lesson.module_id === module.id) || []
        }));

        setModules(modulesWithLessons);
      }
    } catch (error) {
      console.error('Error fetching course content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] sm:h-auto sm:max-h-[85vh] p-0 bg-background/95 backdrop-blur-sm border-primary/20 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 flex-shrink-0">
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-foreground">
            {course.title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4 min-h-0">
          {/* Course Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Sobre o Curso</h3>
            <p className="text-muted-foreground leading-relaxed">{course.description}</p>
            
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Instrutor:</span>
                <span>{course.instructor}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Duração:</span>
                <span>{course.duration}</span>
              </div>
              {course.totalLessons && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Aulas:</span>
                  <span>{course.totalLessons}</span>
                </div>
              )}
            </div>
          </div>

          {/* Course Content */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Conteúdo do Curso</h3>
            
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : modules.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {modules.map((module, index) => (
                  <AccordionItem key={module.id} value={`module-${module.id}`}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-medium text-foreground">{module.title}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-6 space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="flex items-center gap-3 py-2 text-muted-foreground">
                            <PlayCircle className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-sm">{lesson.title}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-muted-foreground text-sm">Conteúdo do curso será disponibilizado em breve.</p>
            )}
          </div>
        </ScrollArea>

        {/* CTA Section - Always visible at bottom */}
        <div className="px-6 py-4 border-t border-border/50 bg-muted/30 flex-shrink-0">
          <div className="text-center space-y-3">
            {!isAuthenticated && (
              <h3 className="text-xl font-bold text-foreground">
                Gostou? Inscreva-se Agora Gratuitamente!
              </h3>
            )}
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              onClick={onEnroll}
            >
              {isAuthenticated ? "Assistir ao Curso" : "Criar Minha Conta Gratuita e Assistir"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
