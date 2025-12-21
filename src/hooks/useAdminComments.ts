import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminComment {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  lesson?: {
    title: string;
    module?: {
      title: string;
      course?: {
        title: string;
      };
    };
  };
}

export function useAdminComments(statusFilter: "pending" | "approved" | "rejected" | "all" = "all") {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("lesson_comments")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (!error && data) {
        // Fetch profiles
        const userIds = [...new Set(data.map((c) => c.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email, avatar_url")
          .in("user_id", userIds);

        // Fetch lessons with modules and courses
        const lessonIds = [...new Set(data.map((c) => c.lesson_id))];
        const { data: lessons } = await supabase
          .from("lessons")
          .select("id, title, module_id")
          .in("id", lessonIds);

        const moduleIds = [...new Set(lessons?.map((l) => l.module_id) || [])];
        const { data: modules } = await supabase
          .from("modules")
          .select("id, title, course_id")
          .in("id", moduleIds);

        const courseIds = [...new Set(modules?.map((m) => m.course_id) || [])];
        const { data: courses } = await supabase
          .from("courses")
          .select("id, title")
          .in("id", courseIds);

        const commentsWithDetails = data.map((comment) => {
          const lesson = lessons?.find((l) => l.id === comment.lesson_id);
          const module = modules?.find((m) => m.id === lesson?.module_id);
          const course = courses?.find((c) => c.id === module?.course_id);

          return {
            ...comment,
            status: comment.status as "pending" | "approved" | "rejected",
            profile: profiles?.find((p) => p.user_id === comment.user_id) || null,
            lesson: lesson
              ? {
                  title: lesson.title,
                  module: module
                    ? {
                        title: module.title,
                        course: course ? { title: course.title } : undefined,
                      }
                    : undefined,
                }
              : undefined,
          };
        });

        setComments(commentsWithDetails);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [statusFilter]);

  const updateStatus = async (commentId: string, newStatus: "approved" | "rejected") => {
    const { error } = await supabase
      .from("lesson_comments")
      .update({ status: newStatus })
      .eq("id", commentId);

    if (!error) {
      await fetchComments();
      return true;
    }
    return false;
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from("lesson_comments")
      .delete()
      .eq("id", commentId);

    if (!error) {
      await fetchComments();
      return true;
    }
    return false;
  };

  return { comments, loading, updateStatus, deleteComment, refetch: fetchComments };
}
