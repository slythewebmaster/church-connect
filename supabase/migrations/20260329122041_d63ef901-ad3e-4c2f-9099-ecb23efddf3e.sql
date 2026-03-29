
-- Allow class leaders to insert members into their own class
CREATE POLICY "Class leaders can add members to own class"
ON public.members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = members.class_id
    AND classes.leader_id = auth.uid()
  )
);
