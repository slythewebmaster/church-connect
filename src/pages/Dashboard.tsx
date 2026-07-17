import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, ClipboardCheck, TrendingUp, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { motion } from "framer-motion";

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
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of church attendance and statistics</p>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {cards.map((card, index) => (
          <motion.div key={card.title} variants={itemVariants}>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-primary/10 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                <CardContent className="p-5">
                  <motion.div
                    className="flex items-center justify-between mb-3"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                  >
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${
                      card.color === "text-primary" ? "from-primary/20 to-primary/10" :
                      card.color === "text-secondary" ? "from-secondary/20 to-secondary/10" :
                      "from-green-500/20 to-green-500/10"
                    }`}>
                      <card.icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                  </motion.div>
                  <motion.p
                    className="text-3xl font-bold text-foreground mb-1"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                  >
                    {card.value}
                  </motion.p>
                  <p className="text-xs text-muted-foreground font-medium">{card.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {(role === "admin" || role === "pastor") && stats.weeklyTrend.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="shadow-lg border-primary/10 overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Attendance Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={stats.weeklyTrend}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(224, 66%, 33%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(224, 66%, 33%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }} 
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(224, 66%, 33%)" 
                      strokeWidth={3} 
                      dot={{ r: 5, strokeWidth: 2, fill: "hsl(var(--card))" }}
                      activeDot={{ r: 7 }}
                      fill="url(#colorCount)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
