import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CourseData {
  id: number;
  title: string;
  slug?: string;
  description: string | null;
  thumbnail_url: string | null;
  cover_image_url?: string | null;
  featured?: boolean;
  status: string | null;
  created_at: string | null;
  is_paid?: boolean;
  price?: number;
  modules?: number;
  totalLessons?: number;
  duration?: string;
  progress?: number;
}

// Helper function to format duration
function formatDuration(minutes: number): string {
  if (minutes === 0) return 'Duração não especificada';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}min`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}min`;
  }
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

        // Calculate duration for each course
        const coursesWithDuration = await Promise.all(
          (data || []).map(async (course) => {
            // Get all modules for this course
            const { data: modules } = await supabase
              .from('modules')
              .select('id')
              .eq('course_id', course.id);

            if (!modules || modules.length === 0) {
              return { ...course, duration: 'Duração não especificada' };
            }

            // Get all lessons and sum their durations
            const { data: lessons } = await supabase
              .from('lessons')
              .select('duration')
              .in('module_id', modules.map(m => m.id));

            const totalMinutes = lessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0;

            return {
              ...course,
              duration: formatDuration(totalMinutes),
            };
          })
        );

        setCourses(coursesWithDuration);
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
          (data || []).map(async (course: any) => {
            // Extract module count from the nested structure
            const moduleCount = course.modules?.[0]?.count || 0;
            
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
              modules: moduleCount,
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

        // Get progress and duration for each course
        const coursesWithProgress = await Promise.all(
          (data || []).map(async (course) => {
            // Get total lessons count
            const { data: modules } = await supabase
              .from('modules')
              .select('id')
              .eq('course_id', course.id);

            if (!modules || modules.length === 0) {
              return { ...course, progress: 0, totalLessons: 0, duration: 'Duração não especificada' };
            }

            const { count: totalLessons } = await supabase
              .from('lessons')
              .select('id', { count: 'exact', head: true })
              .in('module_id', modules.map(m => m.id));

            // Get completed lessons count and durations
            const { data: lessons } = await supabase
              .from('lessons')
              .select('id, duration')
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

            // Calculate total duration
            const totalMinutes = lessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0;

            return {
              ...course,
              progress,
              totalLessons: totalLessons || 0,
              duration: formatDuration(totalMinutes),
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
