import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { HeroBanner } from "@/components/course/HeroBanner";
import { CourseShelf } from "@/components/course/CourseShelf";
import { AuthModal } from "@/components/auth/AuthModal";
import {
  featuredCourse,
  newCourses,
  recommendedCourses,
  categories,
} from "@/data/mockCourses";
import { Course } from "@/types/course";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<Course | null>(null);

  const handleCourseClick = (course: Course) => {
    if (!isAuthenticated) {
      setPendingCourse(course);
      setAuthModalOpen(true);
      return;
    }
    navigate(`/curso/${course.id}`);
  };

  const handleAuthSuccess = () => {
    if (pendingCourse) {
      navigate(`/curso/${pendingCourse.id}`);
      setPendingCourse(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner */}
      <div className="pt-16">
        <HeroBanner
          course={featuredCourse}
          onPlay={() => handleCourseClick(featuredCourse)}
          onInfo={() => navigate(`/curso/${featuredCourse.id}`)}
        />
      </div>

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

      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Index;
