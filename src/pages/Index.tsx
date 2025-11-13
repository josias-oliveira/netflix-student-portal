import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { HeroBanner } from "@/components/course/HeroBanner";
import { CourseShelf } from "@/components/course/CourseShelf";
import { AuthModal } from "@/components/auth/AuthModal";
import { CourseInfoModal } from "@/components/course/CourseInfoModal";
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
  const [courseInfoModalOpen, setCourseInfoModalOpen] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

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

  const handleCourseInfo = (course: Course) => {
    setSelectedCourse(course);
    setCourseInfoModalOpen(true);
  };

  const handleEnrollFromModal = () => {
    if (!isAuthenticated && selectedCourse) {
      setCourseInfoModalOpen(false);
      setPendingCourse(selectedCourse);
      setAuthModalOpen(true);
    } else if (isAuthenticated && selectedCourse) {
      setCourseInfoModalOpen(false);
      navigate(`/curso/${selectedCourse.id}`);
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
          onInfo={() => handleCourseInfo(featuredCourse)}
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

      {/* Course Info Modal */}
      {selectedCourse && (
        <CourseInfoModal
          course={selectedCourse}
          open={courseInfoModalOpen}
          onOpenChange={setCourseInfoModalOpen}
          onEnroll={handleEnrollFromModal}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
};

export default Index;
