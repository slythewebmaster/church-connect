import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search, Phone, User, Trash2, Pencil } from "lucide-react";

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
  const { role, user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newClassId, setNewClassId] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [leaderClassId, setLeaderClassId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    let classId: string | null = null;
    if (role === "class_leader" && user) {
      const { data: classData } = await supabase
        .from("classes")
        .select("id")
        .eq("leader_id", user.id)
        .maybeSingle();
      classId = classData?.id ?? null;
      setLeaderClassId(classId);
    }

    let membersQuery = supabase.from("members").select("*, classes(class_name)").order("full_name");
    if (role === "class_leader" && classId) {
      membersQuery = membersQuery.eq("class_id", classId);
    }

    const [membersRes, classesRes] = await Promise.all([
      membersQuery,
      supabase.from("classes").select("id, class_name").order("class_name"),
    ]);
    if (membersRes.data) setMembers(membersRes.data as Member[]);
    if (classesRes.data) setClasses(classesRes.data);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const classToAssign = role === "class_leader" ? leaderClassId : (newClassId || null);
    const { error } = await supabase.from("members").insert({
      full_name: newName.trim(),
      phone: newPhone.trim() || null,
      class_id: classToAssign,
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

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setEditName(member.full_name);
    setEditPhone(member.phone || "");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMember || !editName.trim()) return;
    const { error } = await supabase
      .from("members")
      .update({
        full_name: editName.trim(),
        phone: editPhone.trim() || null,
      })
      .eq("id", editingMember.id);
    if (error) {
      toast.error("Failed to update member");
    } else {
      toast.success("Member updated");
      setEditDialogOpen(false);
      setEditingMember(null);
      fetchData();
    }
  };

  const handleRemove = async (memberId: string, memberName: string) => {
    const { error } = await supabase.from("members").delete().eq("id", memberId);
    if (error) {
      toast.error("Failed to remove member");
    } else {
      toast.success(`${memberName} removed`);
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

  const canManage = role === "admin" || role === "class_leader";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {role === "class_leader" ? "My Class Members" : "Members"}
          </h1>
          <p className="text-sm text-muted-foreground">{members.length} {role === "class_leader" ? "class" : "total"} members</p>
        </div>
        {canManage && (
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
                {role === "admin" && (
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
                )}
                <Button onClick={handleAdd} className="w-full h-12">Add Member</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Enter name" className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone number" className="h-12" />
            </div>
            <Button onClick={handleSaveEdit} className="w-full h-12">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

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
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
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
              {canManage && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(member)} className="text-muted-foreground hover:text-foreground">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Member</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove <strong>{member.full_name}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemove(member.id, member.full_name)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
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
