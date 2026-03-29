
-- Allow class leaders to delete members from their own class
CREATE POLICY "Class leaders can delete own class members"
ON public.members
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = members.class_id
    AND classes.leader_id = auth.uid()
  )
);
