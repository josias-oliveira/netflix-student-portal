import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Comment {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useLessonComments(lessonId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    if (!lessonId) {
      setComments([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lesson_comments")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Fetch profiles for all unique user_ids
        const userIds = [...new Set(data.map((c) => c.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds);

        const commentsWithProfiles = data.map((comment) => ({
          ...comment,
          status: comment.status as "pending" | "approved" | "rejected",
          profile: profiles?.find((p) => p.user_id === comment.user_id) || null,
        }));

        setComments(commentsWithProfiles);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [lessonId]);

  const addComment = async (content: string) => {
    if (!lessonId || !content.trim()) return false;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.from("lesson_comments").insert({
        user_id: user.id,
        lesson_id: lessonId,
        content: content.trim(),
      });

      if (!error) {
        await fetchComments();
        return true;
      }
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { comments, loading, submitting, addComment, refetch: fetchComments };
}
