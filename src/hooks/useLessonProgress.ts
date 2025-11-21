import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useLessonProgress(lessonId: number | null) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!lessonId) return;

    async function checkProgress() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setIsCompleted(true);
      } else {
        setIsCompleted(false);
      }
    }

    checkProgress();
  }, [lessonId]);

  const toggleComplete = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para marcar o progresso.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!lessonId) {
      setLoading(false);
      return;
    }

    try {
      if (isCompleted) {
        // Remove progress
        const { error } = await supabase
          .from('lesson_progress')
          .delete()
          .eq('lesson_id', lessonId)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsCompleted(false);
        toast({
          title: "Progresso removido",
          description: "Aula desmarcada como concluída.",
        });
      } else {
        // Add progress
        const { error } = await supabase
          .from('lesson_progress')
          .insert({
            lesson_id: lessonId,
            user_id: user.id,
          });

        if (error) throw error;

        setIsCompleted(true);
        toast({
          title: "Parabéns!",
          description: "Aula marcada como concluída.",
        });
      }
    } catch (error) {
      console.error('Error toggling lesson progress:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o progresso.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isCompleted,
    loading,
    toggleComplete,
  };
}

export async function getLessonProgressForCourse(courseId: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: modules } = await supabase
    .from('modules')
    .select('id')
    .eq('course_id', courseId);

  if (!modules || modules.length === 0) return [];

  const moduleIds = modules.map(m => m.id);

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id')
    .in('module_id', moduleIds);

  if (!lessons || lessons.length === 0) return [];

  const lessonIds = lessons.map(l => l.id);

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id)
    .in('lesson_id', lessonIds);

  return progress?.map(p => p.lesson_id) || [];
}
