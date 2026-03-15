import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, BookOpen, Users } from "lucide-react";

interface ClassItem {
  id: string;
  class_name: string;
  leader_id: string | null;
  leader_name?: string;
  member_count?: number;
}

interface Profile {
  user_id: string;
  full_name: string;
}

export default function Classes() {
  const { role } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [leaders, setLeaders] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLeader, setNewLeader] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [classesRes, profilesRes, membersRes] = await Promise.all([
      supabase.from("classes").select("*").order("class_name"),
      supabase.from("profiles").select("user_id, full_name"),
      supabase.from("members").select("class_id"),
    ]);

    const profiles = profilesRes.data || [];
    const members = membersRes.data || [];

    const enriched = (classesRes.data || []).map((c) => ({
      ...c,
      leader_name: profiles.find((p) => p.user_id === c.leader_id)?.full_name || "Unassigned",
      member_count: members.filter((m) => m.class_id === c.id).length,
    }));

    setClasses(enriched);
    setLeaders(profiles);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase.from("classes").insert({
      class_name: newName.trim(),
      leader_id: newLeader || null,
    });
    if (error) {
      toast.error("Failed to create class");
    } else {
      toast.success("Class created");
      setNewName("");
      setNewLeader("");
      setDialogOpen(false);
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Classes</h1>
          <p className="text-sm text-muted-foreground">{classes.length} classes</p>
        </div>
        {role === "admin" && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Class</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Class Name</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter class name" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label>Class Leader</Label>
                  <Select value={newLeader} onValueChange={setNewLeader}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select leader" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaders.map((l) => (
                        <SelectItem key={l.user_id} value={l.user_id}>{l.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAdd} className="w-full h-12">Create Class</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {classes.map((cls) => (
          <Card key={cls.id} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{cls.class_name}</p>
                  <p className="text-xs text-muted-foreground">Leader: {cls.leader_name}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" /> {cls.member_count} members
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
