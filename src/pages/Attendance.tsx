import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Check, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Member {
  id: string;
  full_name: string;
  class_id: string | null;
}

interface ClassItem {
  id: string;
  class_name: string;
  leader_id: string | null;
}

export default function Attendance() {
  const { user, role } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [attendance, setAttendance] = useState<Record<string, "present" | "absent">>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchMembers(selectedClass);
      fetchExistingAttendance(selectedClass, selectedDate);
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    let query = supabase.from("classes").select("*").order("class_name");
    if (role === "class_leader") {
      query = query.eq("leader_id", user?.id);
    }
    const { data } = await query;
    if (data) {
      setClasses(data);
      if (data.length === 1) setSelectedClass(data[0].id);
    }
  };

  const fetchMembers = async (classId: string) => {
    const { data } = await supabase
      .from("members")
      .select("id, full_name, class_id")
      .eq("class_id", classId)
      .order("full_name");
    if (data) setMembers(data);
  };

  const fetchExistingAttendance = async (classId: string, date: string) => {
    const { data } = await supabase
      .from("attendance")
      .select("member_id, status")
      .eq("date", date);

    if (data) {
      const existing: Record<string, "present" | "absent"> = {};
      data.forEach((r) => {
        existing[r.member_id] = r.status as "present" | "absent";
      });
      setAttendance(existing);
      setSubmitted(data.length > 0);
    } else {
      setAttendance({});
      setSubmitted(false);
    }
  };

  const toggleAttendance = (memberId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [memberId]: prev[memberId] === "present" ? "absent" : "present",
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    const unmarked = members.filter((m) => !attendance[m.id]);
    if (unmarked.length > 0) {
      toast.error(`Please mark attendance for all ${unmarked.length} remaining members`);
      return;
    }

    setSubmitting(true);
    const records = members.map((m) => ({
      member_id: m.id,
      date: selectedDate,
      status: attendance[m.id],
      recorded_by: user.id,
    }));

    const { error } = await supabase.from("attendance").upsert(records, {
      onConflict: "member_id,date",
    });

    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit attendance");
    } else {
      toast.success("Attendance submitted successfully!");
      setSubmitted(true);
    }
  };

  const presentCount = Object.values(attendance).filter((s) => s === "present").length;
  const absentCount = Object.values(attendance).filter((s) => s === "absent").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Record Attendance</h1>
        <p className="text-sm text-muted-foreground">Mark members present or absent</p>
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

      {selectedClass && members.length > 0 && (
        <>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-2 py-1 rounded bg-success/10 text-success font-medium">
              Present: {presentCount}
            </span>
            <span className="px-2 py-1 rounded bg-destructive/10 text-destructive font-medium">
              Absent: {absentCount}
            </span>
            <span className="text-muted-foreground">
              / {members.length}
            </span>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {members.map((member) => {
                const status = attendance[member.id];
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg border p-3 flex items-center justify-between transition-colors ${
                      status === "present"
                        ? "bg-success/5 border-success/30"
                        : status === "absent"
                        ? "bg-destructive/5 border-destructive/30"
                        : "bg-card"
                    }`}
                  >
                    <span className="font-medium text-foreground text-sm">{member.full_name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setAttendance((prev) => ({ ...prev, [member.id]: "present" }))
                        }
                        className={`h-11 w-11 rounded-lg flex items-center justify-center transition-all ${
                          status === "present"
                            ? "bg-success text-success-foreground shadow-md animate-pulse-success"
                            : "bg-muted text-muted-foreground hover:bg-success/20"
                        }`}
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() =>
                          setAttendance((prev) => ({ ...prev, [member.id]: "absent" }))
                        }
                        className={`h-11 w-11 rounded-lg flex items-center justify-center transition-all ${
                          status === "absent"
                            ? "bg-destructive text-destructive-foreground shadow-md"
                            : "bg-muted text-muted-foreground hover:bg-destructive/20"
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

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-14 text-base font-semibold gap-2"
          >
            <Send className="h-5 w-5" />
            {submitting ? "Submitting..." : submitted ? "Update Attendance" : "Submit Attendance"}
          </Button>
        </>
      )}

      {selectedClass && members.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No members in this class</p>
      )}
    </div>
  );
}
