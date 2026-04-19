import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, FileText, UserX } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ClassAttendance {
  className: string;
  present: number;
  absent: number;
  total: number;
  absentees: string[];
}

interface SSClassAbsentees {
  className: string;
  absentees: string[];
}

export default function Reports() {
  const { role } = useAuth();
  const [reportType, setReportType] = useState<"weekly" | "monthly">("weekly");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [classData, setClassData] = useState<ClassAttendance[]>([]);
  const [totalPresent, setTotalPresent] = useState(0);
  const [totalAbsent, setTotalAbsent] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [ssPresent, setSsPresent] = useState(0);
  const [ssTotal, setSsTotal] = useState(0);
  const [ssAbsentees, setSsAbsentees] = useState<SSClassAbsentees[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [reportType, selectedDate]);

  const fetchReport = async () => {
    setLoading(true);

    let startDate: string, endDate: string;
    const date = new Date(selectedDate);

    if (reportType === "weekly") {
      const day = date.getDay();
      const start = new Date(date);
      start.setDate(date.getDate() - day);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      startDate = start.toISOString().split("T")[0];
      endDate = end.toISOString().split("T")[0];
    } else {
      startDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      endDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${lastDay}`;
    }

    const [attendanceRes, classesRes, membersRes, ssAttRes, ssStudentsRes, ssClassesRes] = await Promise.all([
      supabase.from("attendance").select("member_id, status, date").gte("date", startDate).lte("date", endDate),
      supabase.from("classes").select("id, class_name"),
      supabase.from("members").select("id, class_id, full_name", { count: "exact" }),
      supabase.from("sunday_school_attendance").select("student_id, status, date").gte("date", startDate).lte("date", endDate),
      supabase.from("sunday_school_students").select("id, full_name, class_id", { count: "exact" }),
      supabase.from("sunday_school_classes").select("id, class_name"),
    ]);

    const classes = classesRes.data || [];
    const members = membersRes.data || [];
    const records = attendanceRes.data || [];

    const classStats: ClassAttendance[] = classes.map((c) => {
      const classMembers = members.filter((m) => m.class_id === c.id);
      const classRecords = records.filter((r) => classMembers.some((m) => m.id === r.member_id));
      const present = classRecords.filter((r) => r.status === "present").length;
      const absent = classRecords.filter((r) => r.status === "absent").length;
      const absentMemberIds = new Set(
        classRecords.filter((r) => r.status === "absent").map((r) => r.member_id)
      );
      const absentees = classMembers
        .filter((m) => absentMemberIds.has(m.id))
        .map((m) => m.full_name)
        .sort();
      return { className: c.class_name, present, absent, total: classMembers.length, absentees };
    });

    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;

    setClassData(classStats);
    setTotalPresent(present);
    setTotalAbsent(absent);
    setTotalMembers(membersRes.count || 0);
    setSsPresent((ssAttRes.data || []).filter((r) => r.status === "present").length);
    setSsTotal(ssStudentsRes.count || 0);

    const ssStudents = ssStudentsRes.data || [];
    const ssClasses = ssClassesRes.data || [];
    const ssRecords = ssAttRes.data || [];
    const ssAbsentIds = new Set(
      ssRecords.filter((r: any) => r.status === "absent").map((r: any) => r.student_id)
    );
    const ssAbsenteesByClass: SSClassAbsentees[] = ssClasses.map((c: any) => {
      const classStudents = ssStudents.filter((s: any) => s.class_id === c.id);
      const absentees = classStudents
        .filter((s: any) => ssAbsentIds.has(s.id))
        .map((s: any) => s.full_name)
        .sort();
      return { className: c.class_name, absentees };
    });
    const unassignedAbsentees = ssStudents
      .filter((s: any) => !s.class_id && ssAbsentIds.has(s.id))
      .map((s: any) => s.full_name)
      .sort();
    if (unassignedAbsentees.length > 0) {
      ssAbsenteesByClass.push({ className: "Unassigned", absentees: unassignedAbsentees });
    }
    setSsAbsentees(ssAbsenteesByClass);

    setLoading(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Community Four Methodist Church", 14, 20);
    doc.setFontSize(12);
    doc.text(`${reportType === "weekly" ? "Weekly" : "Monthly"} Attendance Report`, 14, 30);
    doc.text(`Date: ${selectedDate}`, 14, 38);

    doc.text(`Total Members: ${totalMembers}`, 14, 50);
    doc.text(`Total Present: ${totalPresent}`, 14, 58);
    doc.text(`Total Absent: ${totalAbsent}`, 14, 66);
    doc.text(`Sunday School Present: ${ssPresent}`, 14, 74);

    autoTable(doc, {
      startY: 85,
      head: [["Class", "Present", "Absent", "Members"]],
      body: classData.map((c) => [c.className, c.present, c.absent, c.total]),
    });

    doc.save(`attendance-report-${selectedDate}.pdf`);
    toast("PDF downloaded");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      classData.map((c) => ({
        Class: c.className,
        Present: c.present,
        Absent: c.absent,
        "Total Members": c.total,
        "Attendance %": c.total > 0 ? Math.round((c.present / c.total) * 100) : 0,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `attendance-report-${selectedDate}.xlsx`);
    toast("Excel downloaded");
  };

  const COLORS = ["hsl(160, 84%, 29%)", "hsl(0, 84%, 47%)"];

  const pieData = [
    { name: "Present", value: totalPresent },
    { name: "Absent", value: totalAbsent },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">View and export attendance reports</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Report Type</label>
          <Select value={reportType} onValueChange={(v) => setReportType(v as "weekly" | "monthly")}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">{totalMembers}</p>
            <p className="text-xs text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-success">{totalPresent}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-destructive">{totalAbsent}</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">
              {totalMembers > 0 ? Math.round((totalPresent / Math.max(totalPresent + totalAbsent, 1)) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Attendance Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Sunday school summary */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-foreground mb-1">Sunday School</p>
          <div className="flex gap-4 text-sm">
            <span className="text-success font-semibold">{ssPresent} present</span>
            <span className="text-muted-foreground">of {ssTotal} students</span>
          </div>
        </CardContent>
      </Card>

      {classData.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Attendance by Class</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={classData}>
                <XAxis dataKey="className" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="present" fill="hsl(160, 84%, 29%)" name="Present" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="hsl(0, 84%, 47%)" name="Absent" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {(totalPresent > 0 || totalAbsent > 0) && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {role === "admin" && classData.some((c) => c.absentees.length > 0) && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <UserX className="h-4 w-4 text-destructive" /> Absent Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {classData
              .filter((c) => c.absentees.length > 0)
              .map((c) => (
                <div key={c.className} className="border-l-2 border-destructive pl-3">
                  <p className="text-sm font-semibold text-foreground">
                    {c.className}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({c.absentees.length})
                    </span>
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {c.absentees.map((name) => (
                      <li key={name} className="text-sm text-muted-foreground">
                        • {name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button onClick={exportPDF} variant="outline" className="h-12 gap-2">
          <FileText className="h-4 w-4" /> Export PDF
        </Button>
        <Button onClick={exportExcel} variant="outline" className="h-12 gap-2">
          <Download className="h-4 w-4" /> Export Excel
        </Button>
      </div>
    </div>
  );
}

