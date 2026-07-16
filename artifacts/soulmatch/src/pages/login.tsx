import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/api";

interface LoginForm { email: string; password: string; }

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const form = useForm<LoginForm>();

  async function onLogin(data: LoginForm) {
    setLoading(true);
    try {
      const res = await apiRequest<{ accessToken: string; refreshToken: string; user: any }>("/auth/login", {
        method: "POST", body: JSON.stringify(data),
      });
      login(res.accessToken, res.refreshToken, res.user);
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.message === "Failed to fetch" ? "Unable to connect to server. Please try again." : (err.message || "Invalid email or password");
      toast({ title: "Sign in failed", description: msg, variant: "destructive" });
    } finally { setLoading(false); }
  }

  async function sendOtp() {
    if (!email) { toast({ title: "Enter your email first", variant: "destructive" }); return; }
    setSendingOtp(true);
    try {
      await apiRequest("/auth/send-otp", { method: "POST", body: JSON.stringify({ type: "email", value: email }) });
      setOtpSent(true);
      toast({ title: "Code sent!", description: "Check your inbox for the 6-digit code." });
    } catch (err: any) {
      const msg = err.message === "Failed to fetch" ? "Unable to connect to server. Please try again." : err.message;
      toast({ title: "Failed to send code", description: msg, variant: "destructive" });
    } finally { setSendingOtp(false); }
  }

  async function verifyOtp() {
    if (!otp || otp.length !== 6) { toast({ title: "Enter the 6-digit code", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const res = await apiRequest<{ accessToken: string; refreshToken: string; user: any }>("/auth/verify-otp", {
        method: "POST", body: JSON.stringify({ type: "email", value: email, otp }),
      });
      login(res.accessToken, res.refreshToken, res.user);
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.message === "Failed to fetch" ? "Unable to connect to server. Please try again." : err.message;
      toast({ title: "Invalid code", description: msg, variant: "destructive" });
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[400px] h-[400px] rounded-full bg-primary/10 blur-[80px] -top-20 -left-20" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-[#9B4DFF]/10 blur-[60px] top-1/2 -right-20" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        
        {/* Animated Logo */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <Link href="/">
            <div className="flex flex-col items-center gap-4 cursor-pointer">
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary to-[#9B4DFF] text-white shadow-lg shadow-primary/20 flex items-center justify-center transform hover:scale-105 transition-transform">
                <Heart className="w-8 h-8 fill-white" />
              </div>
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-[#9B4DFF]">
                SoulMatch
              </span>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-foreground mb-2">Welcome back</h2>
            <p className="text-muted-foreground text-sm font-medium">Sign in to continue your journey</p>
          </div>

          {/* Premium Segmented Control Tab Switcher */}
          <div className="flex bg-foreground/5 p-1 rounded-2xl mb-8 relative">
            <motion.div 
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background shadow-md rounded-[14px]"
              animate={{ left: activeTab === "password" ? "4px" : "calc(50%)" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            {(["password", "otp"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold z-10 transition-colors duration-200 ${
                  activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "password" ? "Password" : "Email Code"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Password Tab */}
            {activeTab === "password" && (
              <motion.form
                key="pw"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={form.handleSubmit(onLogin)}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold ml-1">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="pl-12 h-14 rounded-2xl text-base bg-foreground/[0.03] border-foreground/10 focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                      {...form.register("email", { required: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <Label className="text-foreground font-semibold">Password</Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      autoComplete="current-password"
                      className="pl-12 pr-12 h-14 rounded-2xl text-base bg-foreground/[0.03] border-foreground/10 focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                      {...form.register("password", { required: true })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end pr-1">
                  <Link href="/forgot-password">
                    <span className="text-sm font-bold text-primary cursor-pointer hover:text-primary/80 transition-colors">
                      Forgot password?
                    </span>
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl font-bold text-lg text-white mt-4 active:scale-[0.98] transition-all bg-gradient-to-r from-primary to-[#9B4DFF] hover:opacity-90 shadow-lg shadow-primary/20"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </motion.form>
            )}

            {/* OTP Tab */}
            {activeTab === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold ml-1">Email Address</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-14 rounded-2xl text-base bg-foreground/[0.03] border-foreground/10 focus:bg-background focus:border-primary shadow-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={sendOtp}
                      disabled={sendingOtp || otpSent}
                      variant="outline"
                      className={`h-14 px-6 rounded-2xl font-bold transition-all ${
                        otpSent 
                          ? "bg-muted border-border text-muted-foreground" 
                          : "border-primary text-primary hover:bg-primary/5 active:scale-95"
                      }`}
                    >
                      {sendingOtp ? "..." : otpSent ? "Sent ✓" : "Send"}
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {otpSent && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: "auto" }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden pt-2"
                    >
                      <Label className="text-foreground font-semibold ml-1">6-digit code</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        className="h-16 rounded-2xl text-center text-3xl tracking-[0.5em] font-black bg-foreground/[0.03] border-foreground/10 focus:bg-background focus:border-primary shadow-sm"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {otpSent && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <Button
                      onClick={verifyOtp}
                      disabled={loading || otp.length < 6}
                      className="w-full h-14 rounded-2xl font-bold text-lg text-white mt-4 active:scale-[0.98] transition-all bg-gradient-to-r from-primary to-[#9B4DFF] hover:opacity-90 shadow-lg shadow-primary/20"
                    >
                      {loading ? "Verifying..." : "Verify & Sign In"}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-sm font-medium text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          <p className="text-center text-base font-medium text-muted-foreground">
            New to SoulMatch?{" "}
            <Link href="/register">
              <span className="font-bold text-primary cursor-pointer hover:underline underline-offset-4">
                Create free account
              </span>
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
