import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, ClipboardCheck, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface Stats {
  totalMembers: number;
  totalClasses: number;
  latestAttendance: number;
  latestSSAttendance: number;
  weeklyTrend: { date: string; count: number }[];
}

export default function Dashboard() {
  const { role } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    totalClasses: 0,
    latestAttendance: 0,
    latestSSAttendance: 0,
    weeklyTrend: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [membersRes, classesRes, attendanceRes, ssAttendanceRes] = await Promise.all([
      supabase.from("members").select("id", { count: "exact", head: true }),
      supabase.from("classes").select("id", { count: "exact", head: true }),
      supabase.from("attendance").select("date, status").eq("status", "present"),
      supabase.from("sunday_school_attendance").select("date, status").eq("status", "present"),
    ]);

    // Get weekly trend (last 8 weeks)
    const weeklyData: Record<string, number> = {};
    attendanceRes.data?.forEach((r) => {
      const week = r.date;
      weeklyData[week] = (weeklyData[week] || 0) + 1;
    });

    const sortedDates = Object.keys(weeklyData).sort().slice(-8);
    const weeklyTrend = sortedDates.map((date) => ({
      date: new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      count: weeklyData[date],
    }));

    // Latest Sunday attendance
    const latestDate = sortedDates[sortedDates.length - 1];
    const latestAttendance = latestDate ? weeklyData[latestDate] : 0;

    // Latest SS attendance
    const ssWeekly: Record<string, number> = {};
    ssAttendanceRes.data?.forEach((r) => {
      ssWeekly[r.date] = (ssWeekly[r.date] || 0) + 1;
    });
    const ssDates = Object.keys(ssWeekly).sort();
    const latestSSDate = ssDates[ssDates.length - 1];
    const latestSSAttendance = latestSSDate ? ssWeekly[latestSSDate] : 0;

    setStats({
      totalMembers: membersRes.count || 0,
      totalClasses: classesRes.count || 0,
      latestAttendance,
      latestSSAttendance,
      weeklyTrend,
    });
    setLoading(false);
  };

  const cards = [
    { title: "Total Members", value: stats.totalMembers, icon: Users, color: "text-primary" },
    { title: "Classes", value: stats.totalClasses, icon: BookOpen, color: "text-secondary" },
    { title: "Last Sunday", value: stats.latestAttendance, icon: ClipboardCheck, color: "text-success" },
    { title: "Sunday School", value: stats.latestSSAttendance, icon: TrendingUp, color: "text-primary" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of church attendance and statistics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(role === "admin" || role === "pastor") && stats.weeklyTrend.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.weeklyTrend}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(224, 66%, 33%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
