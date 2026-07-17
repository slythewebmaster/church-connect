
-- Allow Sunday school teachers to add students to their own class
CREATE POLICY "Teachers can add students to own ss class"
ON public.sunday_school_students
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sunday_school_classes
    WHERE sunday_school_classes.id = sunday_school_students.class_id
    AND sunday_school_classes.teacher_id = auth.uid()
  )
);

-- Allow Sunday school teachers to delete students from their own class
CREATE POLICY "Teachers can delete own ss class students"
ON public.sunday_school_students
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sunday_school_classes
    WHERE sunday_school_classes.id = sunday_school_students.class_id
    AND sunday_school_classes.teacher_id = auth.uid()
  )
);
