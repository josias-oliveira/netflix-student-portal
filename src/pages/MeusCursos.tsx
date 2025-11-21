import { Header } from "@/components/layout/Header";
import { CourseCard } from "@/components/course/CourseCard";
import { Course } from "@/types/course";
import { useNavigate } from "react-router-dom";
import { useEnrolledCourses } from "@/hooks/useCourses";

const MeusCursos = () => {
  const navigate = useNavigate();
  const { courses, loading } = useEnrolledCourses();

  const handleCourseClick = (course: Course) => {
    navigate(`/curso/${course.id}`);
  };

  // Convert database courses to Course type
  const convertedCourses: Course[] = courses.map(course => ({
    id: course.id.toString(),
    title: course.title,
    description: course.description || '',
    thumbnail: course.thumbnail_url || '/placeholder.svg',
    instructor: 'BTX Academy',
    duration: course.duration || 'Duração não especificada',
    category: 'Meus Cursos',
    totalLessons: course.totalLessons,
    progress: course.progress,
    isPaid: course.is_paid || false,
    price: course.price || 0,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12 container mx-auto px-4 sm:px-8">
          <p className="text-muted-foreground">Carregando seus cursos...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12 container mx-auto px-4 sm:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Meus Cursos
            </h1>
            <p className="text-muted-foreground">
              {convertedCourses.length} curso{convertedCourses.length !== 1 ? "s" : ""} matriculado
              {convertedCourses.length !== 1 ? "s" : ""}
            </p>
          </div>

          {convertedCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {convertedCourses.map((course) => (
                <div key={course.id} className="w-full">
                  <CourseCard course={course} onClick={() => handleCourseClick(course)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Você ainda não está matriculado em nenhum curso.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MeusCursos;
