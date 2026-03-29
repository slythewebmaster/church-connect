
-- Allow Sunday school teachers to update students in their own class
CREATE POLICY "Teachers can update own ss students"
ON public.sunday_school_students
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sunday_school_classes
    WHERE sunday_school_classes.id = sunday_school_students.class_id
    AND sunday_school_classes.teacher_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sunday_school_classes
    WHERE sunday_school_classes.id = sunday_school_students.class_id
    AND sunday_school_classes.teacher_id = auth.uid()
  )
);
