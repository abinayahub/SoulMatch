import { useState, useEffect, useRef } from "react";
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
  const { user, isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  const submittingRef = useRef(false); // Prevents duplicate submissions
  const [step, setStep] = useState(() => {
    const saved = sessionStorage.getItem("register_step");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auto-redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated || user) {
      window.location.href = "/dashboard";
    }
  }, [isAuthenticated, user]);

  // Explicit state — survives step transitions and navigations
  const [data, setData] = useState<FormData>(() => {
    const saved = sessionStorage.getItem("register_formData");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Use fallback if malformed
      }
    }
    return {
      firstName: "", lastName: "", dateOfBirth: "", gender: "",
      email: "", password: "", phone: "",
    };
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    sessionStorage.setItem("register_step", String(step));
  }, [step]);

  useEffect(() => {
    sessionStorage.setItem("register_formData", JSON.stringify(data));
  }, [data]);

  function set(field: keyof FormData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function validateStep0(): string | null {
    if (!data.firstName.trim()) return "First name is required";
    if (!data.lastName.trim()) return "Last name is required";
    if (!data.gender) return "Please select your gender";
    if (!data.dateOfBirth) return "Please enter your date of birth";
    return null;
  }

  function validateStep1(): string | null {
    setErrors({});
    if (!data.email.trim()) { setErrors(e => ({...e, email: "Email address is required"})); return "Email address is required"; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { setErrors(e => ({...e, email: "Enter a valid email address"})); return "Enter a valid email address"; }
    
    if (!data.password) { setErrors(e => ({...e, password: "Password is required"})); return "Password is required"; }
    if (data.password.length < 8) { setErrors(e => ({...e, password: "Password must be at least 8 characters"})); return "Password must be at least 8 characters"; }
    if (!/[A-Z]/.test(data.password)) { setErrors(e => ({...e, password: "Password must contain at least one uppercase letter"})); return "Password must contain at least one uppercase letter"; }
    if (!/[a-z]/.test(data.password)) { setErrors(e => ({...e, password: "Password must contain at least one lowercase letter"})); return "Password must contain at least one lowercase letter"; }
    if (!/[0-9]/.test(data.password)) { setErrors(e => ({...e, password: "Password must contain at least one number"})); return "Password must contain at least one number"; }
    if (!/[^A-Za-z0-9]/.test(data.password)) { setErrors(e => ({...e, password: "Password must contain at least one special character"})); return "Password must contain at least one special character"; }

    if (!data.phone || !data.phone.trim()) {
      setErrors(e => ({...e, phone: "Phone number is required"}));
      return "Phone number is required";
    }
    const phoneDigits = data.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setErrors(e => ({...e, phone: "Phone number must be exactly 10 digits"}));
      return "Phone number must be exactly 10 digits";
    }

    return null;
  }

  function getPasswordStrength(pw: string): number {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
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
    // Prevent duplicate submissions (double-tap guard)
    if (submittingRef.current) return;

    // Final guard — always validate before sending
    const e0 = validateStep0();
    const e1 = validateStep1();
    if (e0 || e1) {
      toast({ title: e0 || e1 || "Please fill all required fields", variant: "destructive" });
      setStep(e0 ? 0 : 1);
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    try {
      const payload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        gender: data.gender === "prefer_not_to_say" ? "other" : data.gender,
        dateOfBirth: data.dateOfBirth || undefined,
        phone: data.phone.trim() || undefined,
      };

      const res = await apiRequest<{ message?: string; phone?: string; mockOtp?: string; userId?: number; accessToken?: string; refreshToken?: string; user?: any; requirePhoneVerification: boolean }>(
        "/auth/register",
        { method: "POST", body: JSON.stringify(payload) },
      );
      
      let accessToken = res.accessToken;
      let refreshToken = res.refreshToken;
      let userObj = res.user;

      // Fallback: If registration API succeeded but didn't return tokens (e.g. live Render backend), automatically log in
      if (!accessToken || !refreshToken) {
        try {
          const loginRes = await apiRequest<{ accessToken: string; refreshToken: string; user: any }>(
            "/auth/login",
            { method: "POST", body: JSON.stringify({ email: payload.email, password: payload.password }) }
          );
          accessToken = loginRes.accessToken;
          refreshToken = loginRes.refreshToken;
          userObj = loginRes.user;
        } catch (loginErr) {
          console.error("Auto-login after registration failed:", loginErr);
        }
      }

      if (accessToken && refreshToken) {
        // Clear registration state
        sessionStorage.removeItem("register_step");
        sessionStorage.removeItem("register_formData");
        // Log in the user (stores tokens in localStorage)
        login(accessToken, refreshToken, userObj);
        // Toast notification
        toast({ title: "Welcome to SoulMatch! 🎉", description: "Your account has been created successfully." });
        // Hard navigation guarantees redirect and clean app load
        window.location.href = "/dashboard";
        return;
      }
    } catch (err: any) {
      const msg = err.message === "Email already registered"
        ? "This email is already registered. Please sign in instead."
        : err.message === "Failed to fetch"
        ? "Unable to connect to server. Please try again."
        : (err.message || "Something went wrong");
      toast({ title: "Registration failed", description: msg, variant: "destructive" });
      submittingRef.current = false; // Release lock on error so user can retry
    } finally {
      setLoading(false);
    }
  }

  const progress = ((step) / (STEPS.length - 1)) * 100;

  // Step 3 is no longer used — redirect happens automatically in submit()

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative" style={{ background: "hsl(var(--background))" }}>
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
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--primary))", boxShadow: "0 0 20px hsl(340 82% 65% / 0.3)" }}>
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ background: "linear-gradient(135deg, hsl(340 82% 70%), hsl(280 70% 72%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                SoulMatch
              </span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{STEPS[step].title}</h1>
          <p className="text-sm mt-1 text-muted-foreground">{STEPS[step].sub}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    background: i < step ? "hsl(var(--primary))" : i === step ? "rgba(219,68,120,0.15)" : "hsl(var(--card))",
                    border: i === step ? "2px solid hsl(340 82% 65%)" : "2px solid hsl(var(--border))",
                    color: i <= step ? (i < step ? "white" : "hsl(var(--primary))") : "hsl(var(--muted-foreground))",
                    boxShadow: i < step ? "0 0 12px hsl(340 82% 65% / 0.3)" : "none",
                  }}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs hidden sm:block" style={{ color: i === step ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>
                  {s.title.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
          <div className="relative h-1.5 rounded-full mt-2" style={{ background: "hsl(var(--border))" }}>
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
              style={{ background: "linear-gradient(90deg, hsl(340 82% 60%), hsl(280 70% 65%))", boxShadow: "0 0 8px hsl(340 82% 65% / 0.4)" }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6" style={{ background: "hsl(var(--card))", backdropFilter: "blur(20px)", border: "1px solid hsl(var(--card))" }}>
          <AnimatePresence mode="wait">

            {/* ─── Step 0: Personal Info ─── */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-foreground/90 text-sm">First Name <span style={{ color: "hsl(340 82% 65%)" }}>*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                    <Label className="text-foreground/90 text-sm">Last Name <span style={{ color: "hsl(340 82% 65%)" }}>*</span></Label>
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
                  <Label className="text-foreground/90 text-sm">Gender <span style={{ color: "hsl(340 82% 65%)" }}>*</span></Label>
                  <Select value={data.gender} onValueChange={(v) => set("gender", v)}>
                    <SelectTrigger className="auth-input h-11 rounded-xl text-sm">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-foreground/90 text-sm">Date of Birth <span style={{ color: "hsl(340 82% 65%)" }}>*</span></Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "hsl(215 20% 42%)" }} />
                    <Input
                      type="date"
                      value={data.dateOfBirth}
                      onChange={(e) => set("dateOfBirth", e.target.value)}
                      className="auth-input pl-10 h-11 rounded-xl text-sm [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
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
                  <Label className="text-foreground/90 text-sm">Email address <span style={{ color: "hsl(340 82% 65%)" }}>*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 42%)" }} />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={data.email}
                      onChange={(e) => { set("email", e.target.value); setErrors(err => ({...err, email: undefined})); }}
                      className={`auth-input pl-10 h-11 rounded-xl text-sm ${errors.email ? "border-red-500" : ""}`}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-foreground/90 text-sm">
                    Password <span style={{ color: "hsl(340 82% 65%)" }}>*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 42%)" }} />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 chars, 1 upper, 1 lower, 1 num, 1 special"
                      value={data.password}
                      onChange={(e) => { set("password", e.target.value); setErrors(err => ({...err, password: undefined})); }}
                      className={`auth-input pl-10 pr-11 h-11 rounded-xl text-sm ${errors.password ? "border-red-500" : ""}`}
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
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  {/* Password strength hint */}
                  {data.password.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3, 4].map((n) => {
                        const score = getPasswordStrength(data.password);
                        return (
                          <div
                            key={n}
                            className="flex-1 h-1 rounded-full transition-all duration-300"
                            style={{
                              background: score >= n
                                ? score <= 2 ? "hsl(0 72% 51%)" : score === 3 ? "hsl(45 90% 60%)" : "hsl(120 50% 50%)"
                                : "hsl(var(--card))",
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-foreground/90 text-sm">Phone number <span style={{ color: "hsl(340 82% 65%)" }}>*</span></Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 42%)" }} />
                    <Input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={data.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        set("phone", val);
                      }}
                      className="auth-input pl-10 h-11 rounded-xl text-sm"
                      autoComplete="tel"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
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
                        <span className="text-muted-foreground">{label}</span>
                        <span className="text-foreground font-medium">{value}</span>
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
                    "Compatibility-based matching",
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
                  <Link href="/terms">
                    <span className="underline cursor-pointer" style={{ color: "hsl(340 82% 60%)" }}>Terms of Service</span>
                  </Link>
                  {" "}and{" "}
                  <Link href="/privacy">
                    <span className="underline cursor-pointer" style={{ color: "hsl(340 82% 60%)" }}>Privacy Policy</span>
                  </Link>
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
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(215 20% 65%)" }}
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
                background: "hsl(var(--primary))",
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
              <span 
                onClick={() => {
                  sessionStorage.removeItem("register_step");
                  sessionStorage.removeItem("register_formData");
                }}
                className="font-semibold cursor-pointer hover:underline" 
                style={{ color: "hsl(340 82% 68%)" }}
              >
                Sign in
              </span>
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
