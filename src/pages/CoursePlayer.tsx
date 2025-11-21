import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, List, X, ChevronRight, ChevronLeft, Sun } from "lucide-react";
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
      <header className={`fixed top-0 left-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-all duration-300 ${sidebarOpen ? 'right-96' : 'right-0'}`}>
        <div className="px-6 py-3 flex items-center justify-between max-w-screen-2xl mx-auto">
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
      <div className={`flex-1 flex pt-16 transition-all duration-300 ${sidebarOpen ? 'pr-96' : 'pr-0'}`}>
        {/* Video and Content Area */}
        <div className="flex-1 flex justify-center px-4">
          <div className="w-full max-w-[990px] mx-auto">
            {/* Video Player */}
            <div className="bg-black">
              {currentLesson && (currentLesson.video_url || currentLesson.streaming_url) ? (
                <VideoPlayer
                  videoUrl={currentLesson.video_url}
                  streamingUrl={currentLesson.streaming_url}
                />
              ) : (
                <div className="w-full aspect-video flex items-center justify-center">
                  <p className="text-muted-foreground">Vídeo não disponível</p>
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="px-8 py-6 bg-background">
              {/* Title and Navigation Row */}
              <div className="flex items-start justify-between mb-8">
                {/* Left: Course and Lesson Title */}
                <div className="flex-1">
                  <p className="text-sm text-blue-600 font-medium mb-2">{course.title}</p>
                  {currentLesson && (
                    <h2 className="text-2xl font-bold text-foreground">
                      {currentLesson.title}
                    </h2>
                  )}
                </div>

                {/* Right: Theme Icon and Navigation */}
                <div className="flex items-center gap-3 ml-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                  >
                    <Sun className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePreviousLesson}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-1"
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Anterior</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextLesson}
                    disabled={currentIndex === allLessons.length - 1}
                    className="flex items-center gap-1"
                    size="sm"
                  >
                    <span>Próxima</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-8">
                {/* Comments Section */}
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Comentários</h3>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                    <div className="flex-1">
                      <textarea
                        placeholder="Escreva sua pergunta ou comentário..."
                        className="w-full min-h-[100px] p-4 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <div className="flex justify-end mt-3">
                        <Button className="bg-green-500 hover:bg-green-600 text-white">
                          Publicar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating Section */}
                <div className="flex items-center justify-between pt-8 border-t border-border">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Avaliação</h3>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className="text-2xl text-gray-300 hover:text-yellow-400 transition-colors"
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 font-medium"
                  >
                    Marcar aula como concluída
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`fixed top-16 right-0 bottom-0 w-96 bg-card border-l border-border transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} z-40`}>
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
              <div className="p-4 space-y-6">
                {modules.map((module, moduleIndex) => (
                  <div key={module.id} className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground uppercase tracking-wide mb-3">
                      {module.title}
                    </h4>
                    <div className="space-y-2">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson)}
                          className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 ${
                            currentLesson?.id === lesson.id
                              ? 'bg-primary/10 border border-primary/20'
                              : 'hover:bg-muted border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className={`text-sm font-semibold flex-shrink-0 ${
                              currentLesson?.id === lesson.id ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                              {lessonIndex + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium line-clamp-2 ${
                                currentLesson?.id === lesson.id ? 'text-primary' : 'text-foreground'
                              }`}>
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
