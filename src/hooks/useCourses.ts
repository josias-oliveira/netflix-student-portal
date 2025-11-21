import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CourseData {
  id: number;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  status: string | null;
  created_at: string | null;
  modules?: any[];
  totalLessons?: number;
  duration?: string;
  progress?: number;
}

export function useCourses() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    async function fetchCourses() {
      if (!isAuthenticated) {
        setCourses([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCourses(data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [isAuthenticated]);

  return { courses, loading, error };
}

export function useAdminCourses() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select(`
            *,
            modules:modules(count)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Enrich courses with module and lesson counts
        const enrichedCourses = await Promise.all(
          (data || []).map(async (course) => {
            const { count: lessonCount } = await supabase
              .from('lessons')
              .select('id', { count: 'exact', head: true })
              .in('module_id', 
                (await supabase
                  .from('modules')
                  .select('id')
                  .eq('course_id', course.id)).data?.map(m => m.id) || []
              );

            return {
              ...course,
              totalLessons: lessonCount || 0,
            };
          })
        );

        setCourses(enrichedCourses);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching admin courses:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  const deleteCourse = async (courseId: number) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      setCourses(courses.filter(c => c.id !== courseId));
      return true;
    } catch (err) {
      console.error('Error deleting course:', err);
      return false;
    }
  };

  return { courses, loading, error, deleteCourse, refetch: () => window.location.reload() };
}

export function useEnrolledCourses() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchEnrolledCourses() {
      if (!user) {
        setCourses([]);
        setLoading(false);
        return;
      }

      try {
        // Get all published courses (in the future, this would filter by enrollment)
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get progress for each course
        const coursesWithProgress = await Promise.all(
          (data || []).map(async (course) => {
            // Get total lessons count
            const { data: modules } = await supabase
              .from('modules')
              .select('id')
              .eq('course_id', course.id);

            if (!modules || modules.length === 0) {
              return { ...course, progress: 0, totalLessons: 0 };
            }

            const { count: totalLessons } = await supabase
              .from('lessons')
              .select('id', { count: 'exact', head: true })
              .in('module_id', modules.map(m => m.id));

            // Get completed lessons count
            const { data: lessons } = await supabase
              .from('lessons')
              .select('id')
              .in('module_id', modules.map(m => m.id));

            const lessonIds = lessons?.map(l => l.id) || [];
            
            const { count: completedLessons } = await supabase
              .from('lesson_progress')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .in('lesson_id', lessonIds);

            const progress = totalLessons && totalLessons > 0
              ? Math.round((completedLessons || 0) / totalLessons * 100)
              : 0;

            return {
              ...course,
              progress,
              totalLessons: totalLessons || 0,
            };
          })
        );

        setCourses(coursesWithProgress);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching enrolled courses:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEnrolledCourses();
  }, [user]);

  return { courses, loading, error };
}
