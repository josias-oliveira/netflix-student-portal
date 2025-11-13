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
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<Course | null>(null);
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const handleCreateAdmin = async () => {
    setCreatingAdmin(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-admin', {
        body: {}
      });

      if (error) throw error;

      toast.success('Administrador criado com sucesso!', {
        description: 'Email: josiasoliveiraux@gmail.com'
      });
      
      console.log('Admin criado:', data);
    } catch (error: any) {
      toast.error('Erro ao criar administrador', {
        description: error.message
      });
      console.error('Erro:', error);
    } finally {
      setCreatingAdmin(false);
    }
  };

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
      
      {/* Botão temporário para criar admin */}
      <Button
        onClick={handleCreateAdmin}
        disabled={creatingAdmin}
        className="fixed bottom-4 right-4 z-50"
        size="lg"
      >
        {creatingAdmin ? 'Criando Admin...' : '🔧 Criar Admin'}
      </Button>
      
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
