import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_url: string | null;
  issued_at: string;
  course_title?: string;
  course_thumbnail?: string;
}

export const useCertificates = () => {
  const { user, loading: authLoading } = useAuth();

  const {
    data: certificates = [],
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["certificates", user?.id],
    enabled: !authLoading && !!user,
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("certificates")
        .select(
          `
          id,
          user_id,
          course_id,
          certificate_url,
          issued_at,
          courses (
            title,
            thumbnail_url
          )
        `
        )
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((cert: any) => ({
        id: cert.id,
        user_id: cert.user_id,
        course_id: cert.course_id,
        certificate_url: cert.certificate_url,
        issued_at: cert.issued_at,
        course_title: cert.courses?.title,
        course_thumbnail: cert.courses?.thumbnail_url,
      })) as Certificate[];
    },
  });

  // Surface query errors (helps diagnose RLS/auth issues)
  if (error) {
    console.error("Certificates query error:", error);
  }

  const downloadCertificate = async (certificate: Certificate) => {
    try {
      const { data, error } = await supabase.storage
        .from("certificates")
        .download(`${certificate.user_id}/${certificate.course_id}.pdf`);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Certificado-${certificate.course_title || "Curso"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Certificado baixado com sucesso!");
    } catch (error: any) {
      console.error("Download error:", error);
      toast.error("Erro ao baixar certificado: " + error.message);
    }
  };

  const shareCertificate = (certificate: Certificate) => {
    if (!certificate.certificate_url) {
      toast.error("Certificado ainda não está disponível para compartilhamento.");
      return;
    }

    navigator.clipboard.writeText(certificate.certificate_url);
    toast.success("Link do certificado copiado!");
  };

  const generateCertificate = async (courseId: string) => {
    try {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase.functions.invoke("generate-certificate", {
        body: { course_id: courseId, user_id: user.id },
      });

      if (error) throw error;

      toast.success("Certificado gerado com sucesso!");
      refetch();

      return data;
    } catch (error: any) {
      console.error("Generate certificate error:", error);
      toast.error("Erro ao gerar certificado: " + error.message);
      throw error;
    }
  };

  return {
    certificates,
    isLoading: authLoading || isLoading,
    downloadCertificate,
    shareCertificate,
    generateCertificate,
    refetch,
  };
};
