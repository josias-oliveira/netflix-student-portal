import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { HeroBanner } from "@/components/course/HeroBanner";
import { HeroBannerSkeleton } from "@/components/course/HeroBannerSkeleton";
import { CourseShelf } from "@/components/course/CourseShelf";
import { CourseShelfSkeleton } from "@/components/course/CourseShelfSkeleton";
import { AuthModal } from "@/components/auth/AuthModal";
import { CourseInfoModal } from "@/components/course/CourseInfoModal";
import { Course } from "@/types/course";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/useCourses";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { courses, loading } = useCourses();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [courseInfoModalOpen, setCourseInfoModalOpen] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Convert database courses to Course type
  const convertedCourses: Course[] = courses.map(course => ({
    id: course.id,
    title: course.title,
    description: course.description || '',
    thumbnail: course.thumbnail_url || '/placeholder.svg',
    instructor: course.instructor_name || 'BTX Academy',
    duration: course.duration || 'Duração não especificada',
    category: course.category || 'Cursos',
    totalLessons: course.totalLessons || 0,
    progress: course.progress || 0,
    isPaid: course.is_paid || false,
    price: course.price || 0,
  }));

  // Find featured course from the database
  const featuredCourse = courses.find(c => c.is_featured) 
    ? convertedCourses.find(c => courses.find(db => db.id === c.id)?.is_featured)
    : convertedCourses[0] || null;

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
        {loading ? (
          <HeroBannerSkeleton />
        ) : featuredCourse ? (
          <HeroBanner
            course={featuredCourse}
            onPlay={() => handleCourseClick(featuredCourse)}
            onInfo={() => handleCourseInfo(featuredCourse)}
          />
        ) : (
          <div className="h-[70vh] flex items-center justify-center">
            <p className="text-muted-foreground">Nenhum curso disponível</p>
          </div>
        )}
      </div>

      {/* Course Shelves */}
      <div className="space-y-8 sm:space-y-12 py-8 sm:py-12">
        {loading ? (
          <CourseShelfSkeleton count={5} />
        ) : convertedCourses.length > 0 ? (
          <CourseShelf
            title="Todos os Cursos"
            courses={convertedCourses}
            onCourseClick={handleCourseClick}
          />
        ) : null}
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
