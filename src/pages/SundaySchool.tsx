import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, X, Send, Plus, GraduationCap, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Student {
  id: string;
  full_name: string;
  phone: string | null;
  class_id: string | null;
}

interface SSClass {
  id: string;
  class_name: string;
  teacher_id: string | null;
}

export default function SundaySchool() {
  const { user, role } = useAuth();
  const [classes, setClasses] = useState<SSClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, "present" | "absent">>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Add class dialog
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  // Add student dialog
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("");

  // Edit student dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Remove student confirmation
  const [removeTarget, setRemoveTarget] = useState<Student | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
      fetchExisting(selectedClass, selectedDate);
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    let query = supabase.from("sunday_school_classes").select("*").order("class_name");
    if (role === "sunday_school_teacher") {
      query = query.eq("teacher_id", user?.id);
    }
    const { data } = await query;
    if (data) {
      setClasses(data);
      if (data.length === 1) setSelectedClass(data[0].id);
    }
  };

  const fetchStudents = async (classId: string) => {
    const { data } = await supabase
      .from("sunday_school_students")
      .select("id, full_name, phone, class_id")
      .eq("class_id", classId)
      .order("full_name");
    if (data) setStudents(data);
  };

  const fetchExisting = async (classId: string, date: string) => {
    const { data } = await supabase
      .from("sunday_school_attendance")
      .select("student_id, status")
      .eq("date", date);
    if (data) {
      const existing: Record<string, "present" | "absent"> = {};
      data.forEach((r) => { existing[r.student_id] = r.status as "present" | "absent"; });
      setAttendance(existing);
      setSubmitted(data.length > 0);
    } else {
      setAttendance({});
      setSubmitted(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    const unmarked = students.filter((s) => !attendance[s.id]);
    if (unmarked.length > 0) {
      toast.error(`Please mark all ${unmarked.length} remaining students`);
      return;
    }
    setSubmitting(true);
    const records = students.map((s) => ({
      student_id: s.id,
      date: selectedDate,
      status: attendance[s.id],
      teacher_id: user.id,
    }));
    const { error } = await supabase.from("sunday_school_attendance").upsert(records, {
      onConflict: "student_id,date",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit");
    } else {
      toast.success("Attendance submitted!");
      setSubmitted(true);
    }
  };

  const handleAddClass = async () => {
    if (!newClassName.trim()) return;
    const { error } = await supabase.from("sunday_school_classes").insert({
      class_name: newClassName.trim(),
      teacher_id: role === "sunday_school_teacher" ? user?.id : null,
    });
    if (error) toast.error("Failed to create class");
    else {
      toast.success("Class created");
      setNewClassName("");
      setClassDialogOpen(false);
      fetchClasses();
    }
  };

  const handleAddStudent = async () => {
    if (!newStudentName.trim() || !selectedClass) return;
    const { error } = await supabase.from("sunday_school_students").insert({
      full_name: newStudentName.trim(),
      phone: newStudentPhone.trim() || null,
      class_id: selectedClass,
    });
    if (error) toast.error("Failed to add student");
    else {
      toast.success("Student added");
      setNewStudentName("");
      setNewStudentPhone("");
      setStudentDialogOpen(false);
      fetchStudents(selectedClass);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setEditName(student.full_name);
    setEditPhone(student.phone || "");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingStudent || !editName.trim()) return;
    const { error } = await supabase
      .from("sunday_school_students")
      .update({ full_name: editName.trim(), phone: editPhone.trim() || null })
      .eq("id", editingStudent.id);
    if (error) {
      toast.error("Failed to update student");
    } else {
      toast.success("Student updated");
      setEditDialogOpen(false);
      setEditingStudent(null);
      fetchStudents(selectedClass);
    }
  };

  const handleRemoveStudent = async () => {
    if (!removeTarget) return;
    const { error } = await supabase
      .from("sunday_school_students")
      .delete()
      .eq("id", removeTarget.id);
    if (error) {
      toast.error("Failed to remove student");
    } else {
      toast.success("Student removed");
      const removedId = removeTarget.id;
      setRemoveTarget(null);
      setAttendance((prev) => {
        const next = { ...prev };
        delete next[removedId];
        return next;
      });
      fetchStudents(selectedClass);
    }
  };

  const presentCount = Object.values(attendance).filter((s) => s === "present").length;
  const absentCount = Object.values(attendance).filter((s) => s === "absent").length;
  const canEdit = role === "admin" || role === "sunday_school_teacher";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sunday School</h1>
          <p className="text-sm text-muted-foreground">Record Sunday school attendance</p>
        </div>
        {role === "admin" && (
          <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="h-4 w-4" /> Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Sunday School Class</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Class Name</Label>
                  <Input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} className="h-12" />
                </div>
                <Button onClick={handleAddClass} className="w-full h-12">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Class</label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.class_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {selectedClass && (
        <div className="flex justify-end">
          {canEdit && (
            <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1">
                  <Plus className="h-4 w-4" /> Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Student</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={newStudentPhone} onChange={(e) => setNewStudentPhone(e.target.value)} placeholder="Phone number" className="h-12" />
                  </div>
                  <Button onClick={handleAddStudent} className="w-full h-12">Add Student</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}

      {/* Edit Student Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone number" className="h-12" />
            </div>
            <Button onClick={handleSaveEdit} className="w-full h-12">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedClass && students.length > 0 && (
        <>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-2 py-1 rounded bg-success/10 text-success font-medium">Present: {presentCount}</span>
            <span className="px-2 py-1 rounded bg-destructive/10 text-destructive font-medium">Absent: {absentCount}</span>
            <span className="text-muted-foreground">/ {students.length}</span>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {students.map((student) => {
                const status = attendance[student.id];
                return (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg border p-3 flex items-center justify-between transition-colors ${
                      status === "present" ? "bg-success/5 border-success/30"
                        : status === "absent" ? "bg-destructive/5 border-destructive/30"
                        : "bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-medium text-foreground text-sm truncate">{student.full_name}</span>
                      {canEdit && (
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() =>
                          setAttendance((prev) => {
                            const next = { ...prev };
                            if (next[student.id] === "present") delete next[student.id];
                            else next[student.id] = "present";
                            return next;
                          })
                        }
                        className={`h-11 w-11 rounded-lg flex items-center justify-center transition-all ${
                          status === "present" ? "bg-success text-success-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-success/20"
                        }`}
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() =>
                          setAttendance((prev) => {
                            const next = { ...prev };
                            if (next[student.id] === "absent") delete next[student.id];
                            else next[student.id] = "absent";
                            return next;
                          })
                        }
                        className={`h-11 w-11 rounded-lg flex items-center justify-center transition-all ${
                          status === "absent" ? "bg-destructive text-destructive-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-destructive/20"
                        }`}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <Button onClick={handleSubmit} disabled={submitting} className="w-full h-14 text-base font-semibold gap-2">
            <Send className="h-5 w-5" />
            {submitting ? "Submitting..." : submitted ? "Update Attendance" : "Submit Attendance"}
          </Button>
        </>
      )}

      {selectedClass && students.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No students in this class yet</p>
        </div>
      )}
    </div>
  );
}
