import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock } from "lucide-react";
import churchLogo from "@/assets/church-logo.gif";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error("Login failed", { description: error.message });
    } else {
      toast.success("Welcome back!", { description: "Redirecting to dashboard..." });
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        className="relative z-10"
      >
        <Card className="w-full max-w-md shadow-2xl border-primary/10 backdrop-blur-sm bg-card/95">
          <CardHeader className="items-center pb-4 space-y-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <img 
                  src={churchLogo} 
                  alt="Church Logo" 
                  className="h-24 w-24 rounded-full mb-3 relative shadow-lg ring-4 ring-primary/10" 
                />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center space-y-2"
            >
              <h1 className="text-2xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Community Four Methodist Church
              </h1>
              <p className="text-sm text-muted-foreground">Attendance Management System</p>
            </motion.div>
          </CardHeader>

          <CardContent className="pb-6">
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <motion.div
                className="space-y-2"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </motion.div>

              <motion.div
                className="space-y-2"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in...
                    </motion.div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </motion.div>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
