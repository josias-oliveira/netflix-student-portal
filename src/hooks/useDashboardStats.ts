import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  newEnrollments: number;
  totalCourses: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    newEnrollments: 0,
    totalCourses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Total de alunos
        const { count: totalStudents, error: totalError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        if (totalError) throw totalError;

        // Novos alunos este mês
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: newEnrollments, error: newError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startOfMonth.toISOString());

        if (newError) throw newError;

        // Alunos ativos (últimos 30 dias)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: activeUsers, error: activeError } = await supabase
          .from("lesson_progress")
          .select("user_id")
          .gte("completed_at", thirtyDaysAgo.toISOString());

        if (activeError) throw activeError;

        const uniqueActiveUsers = new Set(activeUsers?.map((u) => u.user_id) || []).size;

        // Total de cursos publicados
        const { count: totalCourses, error: coursesError } = await supabase
          .from("courses")
          .select("*", { count: "exact", head: true })
          .eq("is_published", true);

        if (coursesError) throw coursesError;

        setStats({
          totalStudents: totalStudents || 0,
          activeStudents: uniqueActiveUsers,
          newEnrollments: newEnrollments || 0,
          totalCourses: totalCourses || 0,
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Erro ao carregar estatísticas");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};
