import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Student {
  id: string;
  name: string;
  email: string;
  plan: string;
  registrationDate: string;
}

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch profiles
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, user_id, full_name, email, created_at")
          .order("created_at", { ascending: false });

        if (profilesError) throw profilesError;

        // Fetch subscriptions separately
        const { data: subscriptions, error: subsError } = await supabase
          .from("subscriptions")
          .select("user_id, plan_id, status");

        if (subsError) throw subsError;

        // Create a map of user_id to subscription
        const subsMap = new Map(
          (subscriptions || []).map((s) => [s.user_id, s])
        );

        // Transform data to Student format
        const studentsData: Student[] = (profiles || []).map((profile) => {
          const subscription = subsMap.get(profile.user_id);
          return {
            id: profile.id,
            name: profile.full_name || "Sem nome",
            email: profile.email || "Email não disponível",
            plan: subscription?.plan_id || "free",
            registrationDate: profile.created_at,
          };
        });

        setStudents(studentsData);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Erro ao carregar alunos");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return { students, loading, error };
};
