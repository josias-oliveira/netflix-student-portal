import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, List } from "lucide-react";
import { VideoPlayer } from "@/components/course/VideoPlayer";
import { supabase } from "@/integrations/supabase/client";
import { continuingCourses, enrolledCourses, newCourses, recommendedCourses, categories } from "@/data/mockCourses";

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourse() {
      if (!courseId) return;

      // Try to load from Supabase first (numeric IDs)
      if (!isNaN(Number(courseId))) {
        try {
          const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single();

          if (courseError) throw courseError;

          // Load modules and lessons
          const { data: modules, error: modulesError } = await supabase
            .from('modules')
            .select('*')
            .eq('course_id', courseId)
            .order('order');

          if (modulesError) throw modulesError;

          if (modules && modules.length > 0) {
            // Load first lesson
            const { data: lessons, error: lessonsError } = await supabase
              .from('lessons')
              .select('*')
              .eq('module_id', modules[0].id)
              .order('order')
              .limit(1);

            if (!lessonsError && lessons && lessons.length > 0) {
              setCurrentLesson(lessons[0]);
            }
          }

          setCourse(courseData);
          setLoading(false);
          return;
        } catch (error) {
          console.error('Error loading course from Supabase:', error);
        }
      }

      // Fallback to mock data
      const allCourses = [
        ...continuingCourses,
        ...enrolledCourses,
        ...newCourses,
        ...recommendedCourses,
        ...categories.flatMap(cat => cat.courses),
      ];

      const mockCourse = allCourses.find(c => c.id === courseId);
      
      if (mockCourse) {
        setCourse({
          title: mockCourse.title,
          description: mockCourse.description,
          instructor: mockCourse.instructor,
          duration: mockCourse.duration,
          totalLessons: mockCourse.totalLessons,
          progress: mockCourse.progress,
        });
        
        // For mock course with ID "1", set a lesson with video URL
        if (courseId === "1") {
          setCurrentLesson({
            title: "Aula 1: Introdução",
            video_url: "https://player-vz-24a43ece-cb0.tv.pandavideo.com.br/embed/?v=70b7c486-a50f-46a8-bbbf-8689dbaa4608",
          });
        }
      }
      
      setLoading(false);
    }

    loadCourse();
  }, [courseId]);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
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
              {course.instructor && (
                <p className="text-sm text-muted-foreground">{course.instructor}</p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm">
            <List className="mr-2 h-4 w-4" />
            Conteúdo do Curso
          </Button>
        </div>
      </header>

      {/* Video Player */}
      <div className="pt-16">
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
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl">
            {currentLesson && (
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {currentLesson.title}
              </h2>
            )}
            
            {currentLesson?.description && (
              <p className="text-muted-foreground mb-6">
                {currentLesson.description}
              </p>
            )}
            
            {course.description && !currentLesson?.description && (
              <p className="text-muted-foreground mb-6">
                {course.description}
              </p>
            )}
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              {course.duration && <span>{course.duration}</span>}
              {course.totalLessons && (
                <>
                  {course.duration && <span>•</span>}
                  <span>{course.totalLessons} aulas</span>
                </>
              )}
              {course.progress !== undefined && (
                <>
                  <span>•</span>
                  <span>{course.progress}% concluído</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
