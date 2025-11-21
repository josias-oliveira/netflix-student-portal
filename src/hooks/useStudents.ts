import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Student {
  id: string;
  name: string;
  email: string;
  plan: string;
  registrationDate: string;
}

interface ProfileData {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  subscriptions: Array<{
    plan_id: string;
    status: string;
  }>;
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

        // Fetch profiles with subscriptions and email
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            email,
            created_at,
            subscriptions (
              plan_id,
              status
            )
          `)
          .order("created_at", { ascending: false });

        if (profilesError) throw profilesError;

        // Transform data to Student format
        const studentsData: Student[] = (profiles as ProfileData[] || []).map((profile) => ({
          id: profile.id,
          name: profile.full_name || "Sem nome",
          email: profile.email || "Email não disponível",
          plan: profile.subscriptions?.[0]?.plan_id || "free",
          registrationDate: profile.created_at,
        }));

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
