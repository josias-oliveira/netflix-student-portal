import { Header } from "@/components/layout/Header";
import { CourseCard } from "@/components/course/CourseCard";
import { enrolledCourses } from "@/data/mockCourses";
import { Course } from "@/types/course";
import { useToast } from "@/hooks/use-toast";

const MeusCursos = () => {
  const { toast } = useToast();

  const handleCourseClick = (course: Course) => {
    toast({
      title: "Abrindo curso",
      description: `Carregando ${course.title}...`,
    });
  };

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
              {enrolledCourses.length} curso{enrolledCourses.length !== 1 ? "s" : ""} matriculado
              {enrolledCourses.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="w-full">
                <CourseCard course={course} onClick={() => handleCourseClick(course)} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MeusCursos;
