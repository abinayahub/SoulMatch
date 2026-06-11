import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, User, Mail, Lock, Calendar, ChevronRight, ChevronLeft, Check, Eye, EyeOff, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/api";

// All form data lives in plain state — never in unmounted react-hook-form inputs
interface FormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  password: string;
  phone: string;
}

const STEPS = [
  { title: "Who are you?", sub: "Tell us a bit about yourself" },
  { title: "Your account", sub: "Set up secure login credentials" },
  { title: "Almost there!", sub: "Review and create your profile" },
];

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Explicit state — survives step transitions
  const [data, setData] = useState<FormData>({
    firstName: "", lastName: "", dateOfBirth: "", gender: "",
    email: "", password: "", phone: "",
  });

  function set(field: keyof FormData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function validateStep0(): string | null {
    if (!data.firstName.trim()) return "First name is required";
    if (!data.lastName.trim()) return "Last name is required";
    if (!data.gender) return "Please select your gender";
    return null;
  }

  function validateStep1(): string | null {
    if (!data.email.trim()) return "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Enter a valid email address";
    if (!data.password) return "Password is required";
    if (data.password.length < 8) return "Password must be at least 8 characters";
    return null;
  }

  function goNext() {
    if (step === 0) {
      const err = validateStep0();
      if (err) { toast({ title: err, variant: "destructive" }); return; }
    }
    if (step === 1) {
      const err = validateStep1();
      if (err) { toast({ title: err, variant: "destructive" }); return; }
    }
    if (step < 2) setStep((s) => s + 1);
    else submit();
  }

  async function submit() {
    // Final guard — always validate before sending
    const e0 = validateStep0();
    const e1 = validateStep1();
    if (e0 || e1) {
      toast({ title: e0 || e1 || "Please fill all required fields", variant: "destructive" });
      setStep(e0 ? 0 : 1);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth || undefined,
        phone: data.phone.trim() || undefined,
      };

      const res = await apiRequest<{ accessToken: string; refreshToken: string; user: any }>(
        "/auth/register",
        { method: "POST", body: JSON.stringify(payload) },
      );
      login(res.accessToken, res.refreshToken, res.user);
      toast({ title: "Welcome to SoulMatch AI!", description: "Your journey to finding love begins now." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const progress = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative" style={{ background: "hsl(222 47% 5%)" }}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, hsl(340 82% 65% / 0.15) 0%, transparent 70%)", top: -100, right: -100, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, hsl(280 70% 65% / 0.12) 0%, transparent 70%)", bottom: -80, left: -80, filter: "blur(70px)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative"
        style={{ zIndex: 1 }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/">
            <span className="inline-flex items-center gap-2 cursor-pointer justify-center mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(340 82% 60%), hsl(280 70% 65%))", boxShadow: "0 0 20px hsl(340 82% 65% / 0.3)" }}>
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ background: "linear-gradient(135deg, hsl(340 82% 70%), hsl(280 70% 72%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                SoulMatch AI
              </span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">{STEPS[step].title}</h1>
          <p className="text-sm mt-1" style={{ color: "hsl(215 20% 50%)" }}>{STEPS[step].sub}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    background: i < step ? "linear-gradient(135deg, hsl(340 82% 60%), hsl(280 70% 65%))" : i === step ? "rgba(219,68,120,0.15)" : "rgba(255,255,255,0.06)",
                    border: i === step ? "2px solid hsl(340 82% 65%)" : "2px solid transparent",
                    color: i <= step ? (i < step ? "white" : "hsl(340 82% 70%)") : "hsl(215 20% 40%)",
                    boxShadow: i < step ? "0 0 12px hsl(340 82% 65% / 0.3)" : "none",
                  }}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs hidden sm:block" style={{ color: i === step ? "hsl(340 82% 68%)" : "hsl(215 20% 38%)" }}>
                  {s.title.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
          <div className="relative h-1 rounded-full mt-1" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
              style={{ background: "linear-gradient(90deg, hsl(340 82% 60%), hsl(280 70% 65%))", boxShadow: "0 0 8px hsl(340 82% 65% / 0.4)" }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <AnimatePresence mode="wait">

            {/* ─── Step 0: Personal Info ─── */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-sm">First Name <span style={{ color: "hsl(340 82% 65%)" }}>*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 42%)" }} />
                      <Input
                        placeholder="First"
                        value={data.firstName}
                        onChange={(e) => set("firstName", e.target.value)}
                        className="auth-input pl-10 h-11 rounded-xl text-sm"
                        autoComplete="given-name"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-sm">Last Name <span style={{ color: "hsl(340 82% 65%)" }}>*</span></Label>
                    <Input
                      placeholder="Last"
                      value={data.lastName}
                      onChange={(e) => set("lastName", e.target.value)}
                      className="auth-input h-11 rounded-xl text-sm"
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">I am a <span style={{ color: "hsl(340 82% 65%)" }}>*</span></Label>
                  <Select value={data.gender} onValueChange={(v) => set("gender", v)}>
                    <SelectTrigger className="auth-input h-11 rounded-xl text-sm">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent style={{ background: "hsl(222 47% 9%)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <SelectItem value="male">Man</SelectItem>
                      <SelectItem value="female">Woman</SelectItem>
                      <SelectItem value="other">Other / Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 42%)" }} />
                    <Input
                      type="date"
                      value={data.dateOfBirth}
                      onChange={(e) => set("dateOfBirth", e.target.value)}
                      className="auth-input pl-10 h-11 rounded-xl text-sm"
                      max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Step 1: Account Setup ─── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Email address <span style={{ color: "hsl(340 82% 65%)" }}>*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 42%)" }} />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={data.email}
                      onChange={(e) => set("email", e.target.value)}
                      className="auth-input pl-10 h-11 rounded-xl text-sm"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">
                    Password <span style={{ color: "hsl(340 82% 65%)" }}>*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 42%)" }} />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={data.password}
                      onChange={(e) => set("password", e.target.value)}
                      className="auth-input pl-10 pr-11 h-11 rounded-xl text-sm"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "hsl(215 20% 45%)" }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength hint */}
                  {data.password.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{
                            background: data.password.length >= n * 3
                              ? n <= 1 ? "hsl(0 72% 51%)" : n === 2 ? "hsl(45 90% 60%)" : "hsl(120 50% 50%)"
                              : "rgba(255,255,255,0.08)",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Phone <span style={{ color: "hsl(215 20% 40%)" }}>(optional)</span></Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 42%)" }} />
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={data.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      className="auth-input pl-10 h-11 rounded-xl text-sm"
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Step 2: Confirm ─── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-4">
                {/* Summary card */}
                <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(219,68,120,0.07)", border: "1px solid hsl(340 82% 65% / 0.2)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(340 82% 68%)" }}>Account Summary</p>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: "Name", value: `${data.firstName} ${data.lastName}` },
                      { label: "Email", value: data.email },
                      { label: "Gender", value: data.gender ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1) : "—" },
                      ...(data.dateOfBirth ? [{ label: "Date of Birth", value: data.dateOfBirth }] : []),
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span style={{ color: "hsl(215 20% 50%)" }}>{label}</span>
                        <span className="text-white font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-xs underline underline-offset-2 transition-colors"
                    style={{ color: "hsl(340 82% 65%)" }}
                  >
                    Edit info
                  </button>
                </div>

                {/* Feature list */}
                <div className="space-y-2">
                  {[
                    "AI-powered compatibility matching",
                    "30-day personality discovery journey",
                    "Send & receive interests",
                    "Secure, verified profiles",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "hsl(215 20% 60%)" }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "hsl(340 82% 65% / 0.15)" }}>
                        <Check className="w-3 h-3" style={{ color: "hsl(340 82% 68%)" }} />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-center" style={{ color: "hsl(215 20% 38%)" }}>
                  By creating an account you agree to our{" "}
                  <span className="underline cursor-pointer" style={{ color: "hsl(340 82% 60%)" }}>Terms of Service</span>
                  {" "}and{" "}
                  <span className="underline cursor-pointer" style={{ color: "hsl(340 82% 60%)" }}>Privacy Policy</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <Button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="h-11 px-4 rounded-xl font-medium"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "hsl(215 20% 65%)" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}

            <Button
              type="button"
              onClick={goNext}
              disabled={loading}
              className="flex-1 h-11 rounded-xl font-semibold text-white border-0"
              style={{
                background: "linear-gradient(135deg, hsl(340 82% 60%) 0%, hsl(280 70% 65%) 100%)",
                boxShadow: "0 4px 20px rgba(219,68,120,0.35)",
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : step < 2 ? (
                <span className="flex items-center gap-1.5">Continue <ChevronRight className="w-4 h-4" /></span>
              ) : (
                <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" /> Create My Account</span>
              )}
            </Button>
          </div>

          <p className="text-center text-sm mt-4" style={{ color: "hsl(215 20% 45%)" }}>
            Already have an account?{" "}
            <Link href="/login">
              <span className="font-semibold cursor-pointer hover:underline" style={{ color: "hsl(340 82% 68%)" }}>
                Sign in
              </span>
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
