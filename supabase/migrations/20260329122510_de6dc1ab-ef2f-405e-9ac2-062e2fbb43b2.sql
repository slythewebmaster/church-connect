
-- Allow class leaders to update members in their own class
CREATE POLICY "Class leaders can update own class members"
ON public.members
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = members.class_id
    AND classes.leader_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = members.class_id
    AND classes.leader_id = auth.uid()
  )
);
