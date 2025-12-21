import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useLessonRating(lessonId: string | null) {
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lessonId) {
      setRating(null);
      return;
    }

    const fetchRating = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("lesson_ratings")
        .select("rating")
        .eq("lesson_id", lessonId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setRating(data.rating);
      } else {
        setRating(null);
      }
    };

    fetchRating();
  }, [lessonId]);

  const setLessonRating = async (newRating: number) => {
    if (!lessonId) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("lesson_ratings")
        .upsert(
          {
            user_id: user.id,
            lesson_id: lessonId,
            rating: newRating,
          },
          { onConflict: "user_id,lesson_id" }
        );

      if (!error) {
        setRating(newRating);
      }
    } finally {
      setLoading(false);
    }
  };

  return { rating, loading, setLessonRating };
}
