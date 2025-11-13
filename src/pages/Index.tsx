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
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  // Usar o primeiro curso premium como destaque
  const featuredCourse = recommendedCourses[0] || newCourses[0];

  const handleCourseClick = (course: Course) => {
    navigate(`/curso/${course.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner */}
      {featuredCourse && (
        <div className="pt-16">
          <HeroBanner
            course={featuredCourse}
            onPlay={() => handleCourseClick(featuredCourse)}
            onInfo={() => navigate(`/curso/${featuredCourse.id}`)}
          />
        </div>
      )}

      {/* Course Shelves */}
      <div className="space-y-8 sm:space-y-12 py-8 sm:py-12">
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
