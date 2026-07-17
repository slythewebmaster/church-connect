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
import { motion, AnimatePresence } from "framer-motion";
import churchLogo from "@/assets/church-logo.gif";

const allNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["admin", "pastor", "class_leader", "sunday_school_teacher"] },
  { label: "Members", path: "/members", icon: Users, roles: ["admin", "class_leader"] },
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Top bar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-lg shadow-sm"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-primary/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mobileMenuOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.div>
              </AnimatePresence>
            </Button>
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse" />
                <img src={churchLogo} alt="Church Logo" className="h-9 w-9 rounded-full relative ring-2 ring-primary/10" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-foreground leading-tight">Community Four</h1>
                <p className="text-xs text-muted-foreground">Methodist Church</p>
              </div>
            </motion.div>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-right hidden sm:block"
            >
              <p className="text-sm font-medium text-foreground">{profile?.full_name}</p>
              <p className="text-xs text-muted-foreground capitalize">{role?.replace("_", " ")}</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-destructive/10 hover:text-destructive transition-colors">
                <LogOut className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Desktop sidebar */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 lg:top-[57px] border-r bg-card/50 backdrop-blur-sm"
        >
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item, index) => {
              const active = location.pathname === item.path;
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    className="block"
                  >
                    <motion.div
                      whileHover={{ x: 4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </motion.aside>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 lg:hidden bg-foreground/20 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed left-0 top-[57px] bottom-0 w-64 bg-card border-r shadow-2xl z-40"
              >
                <nav className="px-3 py-4 space-y-1">
                  {navItems.map((item, index) => {
                    const active = location.pathname === item.path;
                    return (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block"
                        >
                          <motion.div
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                              active
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                          >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                          </motion.div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Bottom navigation for mobile */}
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-lg lg:hidden shadow-lg"
        >
          <div className="flex justify-around py-2">
            {navItems.slice(0, 5).map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                >
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
                      active ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    <motion.div
                      animate={active ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <item.icon className="h-5 w-5" />
                    </motion.div>
                    <span className="truncate max-w-[60px]">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.nav>

        {/* Main content */}
        <main className="flex-1 lg:ml-60 pb-20 lg:pb-6">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
