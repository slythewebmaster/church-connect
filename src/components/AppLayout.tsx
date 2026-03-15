import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import churchLogo from "@/assets/church-logo.gif";

const allNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["admin", "pastor", "class_leader", "sunday_school_teacher"] },
  { label: "Members", path: "/members", icon: Users, roles: ["admin"] },
  { label: "Classes", path: "/classes", icon: BookOpen, roles: ["admin"] },
  { label: "Attendance", path: "/attendance", icon: ClipboardCheck, roles: ["admin", "class_leader"] },
  { label: "Sunday School", path: "/sunday-school", icon: GraduationCap, roles: ["admin", "sunday_school_teacher"] },
  { label: "Reports", path: "/reports", icon: BarChart3, roles: ["admin", "pastor"] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { role, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = allNavItems.filter((item) => role && item.roles.includes(role));

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <img src={churchLogo} alt="Church Logo" className="h-9 w-9 rounded-full" />
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-foreground leading-tight">Community Four</h1>
              <p className="text-xs text-muted-foreground">Methodist Church</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{profile?.full_name}</p>
              <p className="text-xs text-muted-foreground capitalize">{role?.replace("_", " ")}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 lg:top-[57px] border-r bg-card">
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-foreground/20" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed left-0 top-[57px] bottom-0 w-64 bg-card border-r shadow-lg">
              <nav className="px-3 py-4 space-y-1">
                {navItems.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Bottom navigation for mobile */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card lg:hidden">
          <div className="flex justify-around py-2">
            {navItems.slice(0, 5).map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs ${
                    active ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="truncate max-w-[60px]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 lg:ml-60 pb-20 lg:pb-6">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
