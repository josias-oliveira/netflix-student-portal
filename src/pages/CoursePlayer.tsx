import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, List, X, ChevronRight, ChevronLeft, Sun, Check, Sparkles } from "lucide-react";
import { VideoPlayer } from "@/components/course/VideoPlayer";
import { CoursePlayerSkeleton } from "@/components/course/CoursePlayerSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLessonProgress, getLessonProgressForCourse } from "@/hooks/useLessonProgress";
import { useLessonRating } from "@/hooks/useLessonRating";
import { useLessonComments } from "@/hooks/useLessonComments";
import { AuthModal } from "@/components/auth/AuthModal";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  order_index: number;
  duration_minutes: number | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
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
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  const { isCompleted, loading: progressLoading, toggleComplete } = useLessonProgress(currentLesson?.id || null);
  const { rating, loading: ratingLoading, setLessonRating } = useLessonRating(currentLesson?.id || null);
  const { comments, loading: commentsLoading, submitting: commentSubmitting, addComment } = useLessonComments(currentLesson?.id || null);
  const [newComment, setNewComment] = useState("");

  // Check authentication FIRST
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthChecked(true);
      
      if (!user) {
        setShowAuthModal(true);
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setAuthChecked(true);
      if (session?.user) {
        setShowAuthModal(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ONLY load course AFTER authentication is confirmed
  useEffect(() => {
    // Don't load anything until auth is checked AND user is authenticated
    if (!authChecked || !user) return;

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

        // Check access: if course is paid, user needs active subscription
        if (courseData.is_paid) {
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();

          if (!subscription) {
            // No active subscription - redirect to subscription page
            navigate('/assinatura');
            return;
          }
        } else {
          // Free course - auto-enroll user
          await supabase
            .from('enrollments')
            .upsert(
              { user_id: user.id, course_id: courseId },
              { onConflict: 'user_id,course_id' }
            );
        }

        setCourse(courseData);

        // Load modules
        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index');

        if (modulesError) throw modulesError;

        // Load lessons for each module
        if (modulesData && modulesData.length > 0) {
          const modulesWithLessons = await Promise.all(
            modulesData.map(async (module) => {
              const { data: lessons, error: lessonsError } = await supabase
                .from('lessons')
                .select('*')
                .eq('module_id', module.id)
                .order('order_index');

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

        // Load completed lessons
        if (courseId) {
          const completedIds = await getLessonProgressForCourse(courseId);
          setCompletedLessons(completedIds);
        }
      } catch (error) {
        console.error('Error loading course from Supabase:', error);
      }
      
      setLoading(false);
    }

    loadCourse();
  }, [courseId, authChecked, user, navigate]);

  const handleLessonClick = (lesson: Lesson) => {
    setCurrentLesson(lesson);
  };

  const handleToggleComplete = async () => {
    await toggleComplete();
    
    // Refresh completed lessons list
    if (courseId && currentLesson) {
      const completedIds = await getLessonProgressForCourse(courseId);
      setCompletedLessons(completedIds);
      
      // Check if course is now 100% complete
      const allLessonIds = modules.flatMap(m => m.lessons.map(l => l.id));
      const allCompleted = allLessonIds.length > 0 && allLessonIds.every(id => completedIds.includes(id));
      
      if (allCompleted && course?.certificate_enabled && user) {
        // Generate certificate automatically (force regeneration to apply latest positioning/profile fixes)
        try {
          const { data, error } = await supabase.functions.invoke("generate-certificate", {
            body: { course_id: courseId, user_id: user.id, force: true },
          });

          if (error) {
            console.error("Certificate generation error:", error);
          } else if (data?.success) {
            toast.success("Parabéns! Seu certificado foi gerado. Acesse a página de Certificados para baixá-lo!");
          }
        } catch (err) {
          console.error("Error generating certificate:", err);
        }
      }
    }
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

  // SECURITY: Block all rendering until auth is verified
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
        </div>
        <p className="text-muted-foreground">Verificando autenticação...</p>
      </div>
    );
  }

  // SECURITY: If not authenticated, show ONLY the auth modal - no course content
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AuthModal
          open={showAuthModal}
          onOpenChange={(open) => {
            setShowAuthModal(open);
            if (!open) navigate("/");
          }}
          onSuccess={() => {
            setShowAuthModal(false);
          }}
        />
      </div>
    );
  }

  if (loading) {
    return <CoursePlayerSkeleton />;
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
              {currentLesson && currentLesson.video_url ? (
                <VideoPlayer
                  streamingUrl={currentLesson.video_url}
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

              {/* Rating and Complete Section */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Avaliação</h3>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setLessonRating(star)}
                        disabled={ratingLoading}
                        className={`text-2xl transition-colors ${
                          rating && star <= rating 
                            ? "text-yellow-400" 
                            : "text-gray-300 hover:text-yellow-400"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <Button 
                  variant={isCompleted ? "default" : "outline"}
                  className={isCompleted 
                    ? "bg-green-500 hover:bg-green-600 text-white font-medium"
                    : "border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 font-medium"
                  }
                  onClick={handleToggleComplete}
                  disabled={progressLoading}
                >
                  {isCompleted ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Aula concluída
                    </>
                  ) : (
                    "Marcar aula como concluída"
                  )}
                </Button>
              </div>

              {/* Comments Section */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Comentários</h3>
                
                {/* New Comment Form */}
                <div className="flex gap-4 mb-6">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                    <AvatarFallback className="bg-muted" />
                  </Avatar>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escreva sua pergunta ou comentário..."
                      className="w-full min-h-[100px] p-4 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex justify-end mt-3">
                      <Button 
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={async () => {
                          const success = await addComment(newComment);
                          if (success) {
                            setNewComment("");
                            toast.success("Comentário enviado! Aguardando aprovação.");
                          } else {
                            toast.error("Erro ao enviar comentário");
                          }
                        }}
                        disabled={commentSubmitting || !newComment.trim()}
                      >
                        {commentSubmitting ? "Enviando..." : "Publicar"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                {commentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-32" />
                          <div className="h-16 bg-muted rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : comments.filter(c => c.status === "approved").length > 0 ? (
                  <div className="space-y-6">
                    {comments
                      .filter(c => c.status === "approved")
                      .map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={comment.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`} />
                            <AvatarFallback className="bg-muted" />
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-foreground">
                                {comment.profile?.full_name || "Usuário"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comment.created_at), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                              </span>
                            </div>
                            <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                )}
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
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium line-clamp-2 ${
                                currentLesson?.id === lesson.id ? 'text-primary' : 'text-foreground'
                              }`}>
                                {lesson.title}
                              </p>
                            </div>
                            {completedLessons.includes(lesson.id) && (
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            )}
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
