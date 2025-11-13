import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, List } from "lucide-react";
import { continuingCourses, enrolledCourses, newCourses, recommendedCourses, categories } from "@/data/mockCourses";

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Find the course from all available courses
  const allCourses = [
    ...continuingCourses,
    ...enrolledCourses,
    ...newCourses,
    ...recommendedCourses,
    ...categories.flatMap(cat => cat.courses),
  ];

  const course = allCourses.find(c => c.id === courseId);

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

  // Video URL - using the PandaVideo link for course ID "1" (Apresentações)
  const videoUrl = courseId === "1" 
    ? "https://player-vz-24a43ece-cb0.tv.pandavideo.com.br/embed/?v=70b7c486-a50f-46a8-bbbf-8689dbaa4608"
    : "";

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
              <p className="text-sm text-muted-foreground">{course.instructor}</p>
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
        <div className="w-full bg-black">
          {videoUrl ? (
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={videoUrl}
                className="absolute top-0 left-0 w-full h-full"
                style={{ border: 'none' }}
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video flex items-center justify-center">
              <p className="text-muted-foreground">Vídeo não disponível</p>
            </div>
          )}
        </div>

        {/* Course Info */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Aula 1: Introdução
            </h2>
            <p className="text-muted-foreground mb-6">
              {course.description}
            </p>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>{course.duration}</span>
              {course.totalLessons && (
                <span>{course.totalLessons} aulas</span>
              )}
              {course.progress !== undefined && (
                <span>{course.progress}% concluído</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
