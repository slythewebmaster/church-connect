import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search, Phone, User } from "lucide-react";

interface Member {
  id: string;
  full_name: string;
  phone: string | null;
  class_id: string | null;
  classes?: { class_name: string } | null;
}

interface ClassItem {
  id: string;
  class_name: string;
}

export default function Members() {
  const { role } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newClassId, setNewClassId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [membersRes, classesRes] = await Promise.all([
      supabase.from("members").select("*, classes(class_name)").order("full_name"),
      supabase.from("classes").select("id, class_name").order("class_name"),
    ]);
    if (membersRes.data) setMembers(membersRes.data as Member[]);
    if (classesRes.data) setClasses(classesRes.data);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase.from("members").insert({
      full_name: newName.trim(),
      phone: newPhone.trim() || null,
      class_id: newClassId || null,
    });
    if (error) {
      toast.error("Failed to add member");
    } else {
      toast.success("Member added");
      setNewName("");
      setNewPhone("");
      setNewClassId("");
      setDialogOpen(false);
      fetchData();
    }
  };

  const filtered = members.filter((m) =>
    m.full_name.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <p className="text-sm text-muted-foreground">{members.length} total members</p>
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
                <DialogTitle>Add Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter name" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Phone number" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select value={newClassId} onValueChange={setNewClassId}>
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
                <Button onClick={handleAdd} className="w-full h-12">Add Member</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-12"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((member) => (
          <Card key={member.id} className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{member.full_name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {member.classes?.class_name && <span>{member.classes.class_name}</span>}
                  {member.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {member.phone}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No members found</p>
        )}
      </div>
    </div>
  );
}
