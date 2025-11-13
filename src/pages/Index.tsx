import { Header } from "@/components/layout/Header";
import { HeroBanner } from "@/components/course/HeroBanner";
import { CourseShelf } from "@/components/course/CourseShelf";
import {
  continuingCourses,
  enrolledCourses,
  newCourses,
  recommendedCourses,
  categories,
} from "@/data/mockCourses";
import { Course } from "@/types/course";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  
  const featuredCourse = continuingCourses[0];

  const handleCourseClick = (course: Course) => {
    toast({
      title: "Abrindo curso",
      description: `Carregando ${course.title}...`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner */}
      <div className="pt-16">
        <HeroBanner
          course={featuredCourse}
          onPlay={() => handleCourseClick(featuredCourse)}
          onInfo={() => toast({ title: "Informações do curso" })}
        />
      </div>

      {/* Course Shelves */}
      <div className="space-y-8 sm:space-y-12 py-8 sm:py-12">
        {/* Continue Watching */}
        <CourseShelf
          title="Continuar Assistindo"
          courses={continuingCourses}
          onCourseClick={handleCourseClick}
        />

        {/* My Enrolled Courses */}
        <CourseShelf
          title="Meus Cursos Matriculados"
          courses={enrolledCourses}
          onCourseClick={handleCourseClick}
        />

        {/* New Courses */}
        <CourseShelf
          title="Novos Cursos"
          courses={newCourses}
          onCourseClick={handleCourseClick}
        />

        {/* Recommended */}
        <CourseShelf
          title="Recomendados para Você"
          courses={recommendedCourses}
          onCourseClick={handleCourseClick}
        />

        {/* Categories */}
        {categories.map((category) => (
          <CourseShelf
            key={category.id}
            title={category.name}
            courses={category.courses}
            onCourseClick={handleCourseClick}
          />
        ))}
      </div>

      {/* Footer spacing */}
      <div className="h-20" />
    </div>
  );
};

export default Index;
