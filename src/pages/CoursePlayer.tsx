import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, List, X, ChevronRight, ChevronLeft } from "lucide-react";
import { VideoPlayer } from "@/components/course/VideoPlayer";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Lesson {
  id: number;
  title: string;
  description: string | null;
  video_url: string | null;
  streaming_url: string | null;
  order: number;
}

interface Module {
  id: number;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    async function loadCourse() {
      if (!courseId) return;

      try {
        // Load course data
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .maybeSingle();

        if (courseError) throw courseError;

        if (!courseData) {
          setLoading(false);
          return;
        }

        setCourse(courseData);

        // Load modules
        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select('*')
          .eq('course_id', courseId)
          .order('order');

        if (modulesError) throw modulesError;

        // Load lessons for each module
        if (modulesData && modulesData.length > 0) {
          const modulesWithLessons = await Promise.all(
            modulesData.map(async (module) => {
              const { data: lessons, error: lessonsError } = await supabase
                .from('lessons')
                .select('*')
                .eq('module_id', module.id)
                .order('order');

              if (lessonsError) {
                console.error('Error loading lessons:', lessonsError);
                return { ...module, lessons: [] };
              }

              return { ...module, lessons: lessons || [] };
            })
          );

          setModules(modulesWithLessons);

          // Set first lesson as current
          if (modulesWithLessons[0]?.lessons[0]) {
            setCurrentLesson(modulesWithLessons[0].lessons[0]);
          }
        }
      } catch (error) {
        console.error('Error loading course from Supabase:', error);
      }
      
      setLoading(false);
    }

    loadCourse();
  }, [courseId]);

  const handleLessonClick = (lesson: Lesson) => {
    setCurrentLesson(lesson);
  };

  const getCurrentLessonIndex = () => {
    let index = 0;
    for (const module of modules) {
      for (const lesson of module.lessons) {
        if (lesson.id === currentLesson?.id) {
          return index;
        }
        index++;
      }
    }
    return -1;
  };

  const getAllLessons = () => {
    return modules.flatMap(module => module.lessons);
  };

  const handlePreviousLesson = () => {
    const allLessons = getAllLessons();
    const currentIndex = getCurrentLessonIndex();
    if (currentIndex > 0) {
      setCurrentLesson(allLessons[currentIndex - 1]);
    }
  };

  const handleNextLesson = () => {
    const allLessons = getAllLessons();
    const currentIndex = getCurrentLessonIndex();
    if (currentIndex < allLessons.length - 1) {
      setCurrentLesson(allLessons[currentIndex + 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando curso...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Curso não encontrado</h1>
          <Button onClick={() => navigate("/")}>Voltar para Início</Button>
        </div>
      </div>
    );
  }

  const allLessons = getAllLessons();
  const currentIndex = getCurrentLessonIndex();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{course.title}</h1>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <List className="mr-2 h-4 w-4" />
            Conteúdo do Curso
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex pt-16">
        {/* Video and Content Area */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'mr-96' : ''}`}>
          {/* Video Player */}
          {currentLesson && (currentLesson.video_url || currentLesson.streaming_url) ? (
            <VideoPlayer
              videoUrl={currentLesson.video_url}
              streamingUrl={currentLesson.streaming_url}
            />
          ) : (
            <div className="w-full bg-black aspect-video flex items-center justify-center">
              <p className="text-muted-foreground">Vídeo não disponível</p>
            </div>
          )}

          {/* Course Info */}
          <div className="px-6 py-6">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">{course.title}</p>
              {currentLesson && (
                <h2 className="text-2xl font-bold text-foreground">
                  {currentLesson.title}
                </h2>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousLesson}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextLesson}
                disabled={currentIndex === allLessons.length - 1}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            {currentLesson?.description && (
              <p className="text-muted-foreground">
                {currentLesson.description}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className={`fixed top-16 right-0 bottom-0 w-96 bg-card border-l border-border transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Conteúdo do Curso</h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {modules.map((module, moduleIndex) => (
                  <div key={module.id} className="space-y-2">
                    <h4 className="font-medium text-sm text-foreground uppercase tracking-wide">
                      {module.title}
                    </h4>
                    <div className="space-y-1">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            currentLesson?.id === lesson.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xs font-medium mt-0.5">
                              {lessonIndex + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {lesson.title}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
