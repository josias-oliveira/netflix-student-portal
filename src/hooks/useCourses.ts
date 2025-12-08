import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CourseData {
  id: string;
  title: string;
  slug?: string | null;
  description: string | null;
  thumbnail_url: string | null;
  trailer_url?: string | null;
  instructor_name?: string | null;
  instructor_avatar?: string | null;
  duration_hours?: number | null;
  is_published?: boolean;
  is_featured?: boolean;
  category?: string | null;
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

  useEffect(() => {
    async function fetchCourses() {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('is_published', true)
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
              return { 
                ...course, 
                duration: course.duration_hours ? `${course.duration_hours}h` : 'Duração não especificada',
                totalLessons: 0
              };
            }

            // Get all lessons and sum their durations
            const { data: lessons } = await supabase
              .from('lessons')
              .select('duration_minutes')
              .in('module_id', modules.map(m => m.id));

            const totalMinutes = lessons?.reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0) || 0;

            return {
              ...course,
              duration: formatDuration(totalMinutes),
              totalLessons: lessons?.length || 0,
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
  }, []);

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
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Enrich courses with module and lesson counts
        const enrichedCourses = await Promise.all(
          (data || []).map(async (course) => {
            // Get modules for this course
            const { data: modules } = await supabase
              .from('modules')
              .select('id')
              .eq('course_id', course.id);
            
            const moduleCount = modules?.length || 0;
            
            let lessonCount = 0;
            if (modules && modules.length > 0) {
              const { count } = await supabase
                .from('lessons')
                .select('id', { count: 'exact', head: true })
                .in('module_id', modules.map(m => m.id));
              lessonCount = count || 0;
            }

            return {
              ...course,
              modules: moduleCount,
              totalLessons: lessonCount,
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

  const deleteCourse = async (courseId: string) => {
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
          .eq('is_published', true)
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
              return { 
                ...course, 
                progress: 0, 
                totalLessons: 0, 
                duration: course.duration_hours ? `${course.duration_hours}h` : 'Duração não especificada' 
              };
            }

            const { data: lessons, count: totalLessons } = await supabase
              .from('lessons')
              .select('id, duration_minutes', { count: 'exact' })
              .in('module_id', modules.map(m => m.id));

            // Calculate total duration
            const totalMinutes = lessons?.reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0) || 0;

            // For now, return 0 progress since we don't have lesson_progress table yet
            return {
              ...course,
              progress: 0,
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
