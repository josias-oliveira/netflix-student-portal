-- Update courses policy to allow admins to view draft courses
DROP POLICY IF EXISTS "Users with active subscription can view published courses" ON courses;

CREATE POLICY "Users with active subscription can view published courses or admins can view all"
ON courses
FOR SELECT
USING (
  -- Admins can view all courses
  has_role(auth.uid(), 'admin'::app_role)
  OR
  -- Regular users with active subscription can view published courses
  (
    auth.uid() IS NOT NULL 
    AND status = 'published'
    AND EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.user_id = auth.uid()
      AND s.status = 'active'
      AND (s.current_period_end IS NULL OR s.current_period_end > now())
    )
  )
);