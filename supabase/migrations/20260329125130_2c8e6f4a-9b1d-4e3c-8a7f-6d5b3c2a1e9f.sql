
-- Defense in depth: ownership of a class (leader_id / teacher_id) is assigned
-- solely by admins, but these policies should also require the matching app
-- role, so class assignment alone never grants record-management access.

-- sunday_school_students: existing teacher UPDATE policy
ALTER POLICY "Teachers can update own ss students"
ON public.sunday_school_students
USING (
  public.has_role(auth.uid(), 'sunday_school_teacher') AND
  EXISTS (
    SELECT 1 FROM public.sunday_school_classes
    WHERE sunday_school_classes.id = sunday_school_students.class_id
    AND sunday_school_classes.teacher_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'sunday_school_teacher') AND
  EXISTS (
    SELECT 1 FROM public.sunday_school_classes
    WHERE sunday_school_classes.id = sunday_school_students.class_id
    AND sunday_school_classes.teacher_id = auth.uid()
  )
);

-- members: existing class_leader policies
ALTER POLICY "Class leaders can add members to own class"
ON public.members
WITH CHECK (
  public.has_role(auth.uid(), 'class_leader') AND
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = members.class_id
    AND classes.leader_id = auth.uid()
  )
);

ALTER POLICY "Class leaders can update own class members"
ON public.members
USING (
  public.has_role(auth.uid(), 'class_leader') AND
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = members.class_id
    AND classes.leader_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'class_leader') AND
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = members.class_id
    AND classes.leader_id = auth.uid()
  )
);

ALTER POLICY "Class leaders can delete own class members"
ON public.members
USING (
  public.has_role(auth.uid(), 'class_leader') AND
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = members.class_id
    AND classes.leader_id = auth.uid()
  )
);
