import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/api";

interface LoginForm { email: string; password: string; }

const STATS = [
  { icon: Users, label: "Active members", value: "2.4M+" },
  { icon: Heart, label: "Successful matches", value: "180K+" },
  { icon: Sparkles, label: "AI compatibility score", value: "98%" },
];

const TESTIMONIALS = [
  { name: "Priya S.", text: "Found my soulmate in 3 months. The AI matching is incredible!", avatar: "PS" },
  { name: "Arjun M.", text: "Best matrimony platform — real connections, not just profiles.", avatar: "AM" },
];

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
      toast({ title: "Sign in failed", description: err.message || "Invalid email or password", variant: "destructive" });
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
      toast({ title: "Failed to send code", description: err.message, variant: "destructive" });
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
      toast({ title: "Invalid code", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(222 47% 5%)" }}>
      {/* ── Left Hero Panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, hsl(222 47% 7%) 0%, hsl(280 35% 10%) 50%, hsl(340 35% 10%) 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{
            position: "absolute", width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, hsl(340 82% 65% / 0.18) 0%, transparent 70%)",
            top: -80, left: -80, filter: "blur(60px)",
          }} />
          <div style={{
            position: "absolute", width: 300, height: 300, borderRadius: "50%",
            background: "radial-gradient(circle, hsl(280 70% 65% / 0.15) 0%, transparent 70%)",
            bottom: -60, right: -60, filter: "blur(50px)",
          }} />
        </div>

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Link href="/">
            <span className="inline-flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-sm">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SoulMatch AI</span>
            </span>
          </Link>
        </motion.div>

        {/* Hero copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="relative z-10 space-y-6"
        >
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-3">
              Your perfect match<br />
              <span className="gradient-text">is waiting for you</span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed">
              AI-powered compatibility matching that goes beyond photos — understanding values, life goals, and personality.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {STATS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="glass rounded-xl p-3 text-center">
                <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: "hsl(340 82% 65%)" }} />
                <div className="text-white font-bold text-sm">{value}</div>
                <div className="text-white/40 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="space-y-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass rounded-xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white/70 text-xs leading-relaxed">"{t.text}"</p>
                  <p className="text-white/40 text-xs mt-1 font-medium">— {t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="flex items-center gap-2 text-white/30 text-xs relative z-10"
        >
          <Shield className="w-4 h-4" />
          <span>256-bit encrypted · Privacy-first · Verified profiles</span>
        </motion.div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/">
            <span className="inline-flex items-center gap-2 cursor-pointer">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center glow-sm">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">SoulMatch AI</span>
            </span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-white/50 text-sm">Sign in to continue your journey</p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {(["password", "otp"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: activeTab === tab ? "linear-gradient(135deg, hsl(340 82% 60%), hsl(280 70% 65%))" : "transparent",
                  color: activeTab === tab ? "white" : "hsl(215 20% 55%)",
                  boxShadow: activeTab === tab ? "0 2px 12px rgba(219,68,120,0.3)" : "none",
                }}
              >
                {tab === "password" ? "Password" : "Email Code"}
              </button>
            ))}
          </div>

          {/* Password tab */}
          {activeTab === "password" && (
            <motion.form
              key="pw"
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              onSubmit={form.handleSubmit(onLogin)}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 45%)" }} />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="auth-input pl-10 h-11 rounded-xl text-sm"
                    {...form.register("email", { required: true })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-white/70 text-sm">Password</Label>
                  <Link href="/forgot-password">
                    <span className="text-xs cursor-pointer transition-colors" style={{ color: "hsl(340 82% 65%)" }}>
                      Forgot password?
                    </span>
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 45%)" }} />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    autoComplete="current-password"
                    className="auth-input pl-10 pr-11 h-11 rounded-xl text-sm"
                    {...form.register("password", { required: true })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "hsl(215 20% 45%)" }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl font-semibold text-white border-0 mt-2"
                style={{
                  background: "linear-gradient(135deg, hsl(340 82% 60%) 0%, hsl(280 70% 65%) 100%)",
                  boxShadow: "0 4px 20px rgba(219,68,120,0.35)",
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
                )}
              </Button>
            </motion.form>
          )}

          {/* OTP tab */}
          {activeTab === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">Email address</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 45%)" }} />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="auth-input pl-10 h-11 rounded-xl text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={sendOtp}
                    disabled={sendingOtp || otpSent}
                    className="h-11 px-4 rounded-xl text-sm font-medium shrink-0"
                    style={{
                      background: otpSent ? "rgba(255,255,255,0.06)" : "rgba(219,68,120,0.15)",
                      border: "1px solid rgba(219,68,120,0.3)",
                      color: otpSent ? "hsl(215 20% 55%)" : "hsl(340 82% 70%)",
                    }}
                  >
                    {sendingOtp ? "…" : otpSent ? "Sent ✓" : "Send"}
                  </Button>
                </div>
              </div>

              {otpSent && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
                  <Label className="text-white/70 text-sm">6-digit code</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="auth-input h-14 rounded-xl text-center text-2xl tracking-[0.5em] font-bold"
                  />
                </motion.div>
              )}

              {otpSent && (
                <Button
                  onClick={verifyOtp}
                  disabled={loading || otp.length < 6}
                  className="w-full h-11 rounded-xl font-semibold text-white border-0"
                  style={{
                    background: "linear-gradient(135deg, hsl(340 82% 60%) 0%, hsl(280 70% 65%) 100%)",
                    boxShadow: "0 4px 20px rgba(219,68,120,0.35)",
                  }}
                >
                  {loading ? "Verifying…" : <span className="flex items-center gap-2">Verify & Sign In <ArrowRight className="w-4 h-4" /></span>}
                </Button>
              )}
            </motion.div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span className="text-xs" style={{ color: "hsl(215 20% 40%)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          <p className="text-center text-sm" style={{ color: "hsl(215 20% 50%)" }}>
            New to SoulMatch?{" "}
            <Link href="/register">
              <span className="font-semibold cursor-pointer hover:underline" style={{ color: "hsl(340 82% 68%)" }}>
                Create free account
              </span>
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
