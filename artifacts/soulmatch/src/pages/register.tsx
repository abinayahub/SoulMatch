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
        // Manually set auth tokens to prevent PublicRoute from instantly redirecting us to /dashboard
        localStorage.setItem("soulmatch_access_token", accessToken);
        localStorage.setItem("soulmatch_refresh_token", refreshToken);
        localStorage.setItem("user", JSON.stringify(userObj));
        // Toast notification
        toast({ title: "Welcome to SoulMatch! 🎉", description: "Your account has been created successfully." });
        // Hard navigation guarantees redirect and clean app load to our new success page
        window.location.href = "/registration-success";
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

  const isValidStep0 = Boolean(data.firstName.trim() && data.lastName.trim() && data.gender && data.dateOfBirth);
  const isValidStep1 = Boolean(
    data.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
    data.password && data.password.length >= 8 &&
    /[A-Z]/.test(data.password) && /[a-z]/.test(data.password) &&
    /[0-9]/.test(data.password) && /[^A-Za-z0-9]/.test(data.password) &&
    data.phone.replace(/\D/g, '').length === 10
  );
  const isCurrentStepValid = step === 0 ? isValidStep0 : step === 1 ? isValidStep1 : true;

  return (
    <div className="min-h-[100dvh] flex flex-col soulmatch-mesh-bg relative overflow-y-auto overflow-x-hidden">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10 w-full max-w-md mx-auto min-h-[600px]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative mt-4 z-10"
      >
        {/* Logo */}
        <div className="text-center mb-5 flex flex-col items-center">
          <Link href="/">
            <span className="inline-flex items-center gap-2 cursor-pointer justify-center mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center gradient-coral-button shadow-sm border border-white/45 backdrop-blur-md">
                <Heart className="w-5 h-5 text-white fill-white/20" />
              </div>
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#FF8F8F] to-[#FFB39A]">
                SoulMatch
              </span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-[#222222] tracking-tight">{STEPS[step].title}</h1>
          <p className="text-xs mt-1 text-[#6F6F6F]">{STEPS[step].sub}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-5 px-1">
          <div className="flex justify-between items-center mb-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 z-10">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border backdrop-blur-md shadow-sm"
                  style={{
                    background: i < step 
                      ? "linear-gradient(135deg, #FF8F8F, #FFB39A)" 
                      : i === step 
                        ? "linear-gradient(135deg, #FF8F8F, #FFB39A)" 
                        : "rgba(255, 255, 255, 0.45)",
                    borderColor: i <= step ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)",
                    color: i <= step ? "white" : "#6F6F6F",
                    boxShadow: i <= step ? "0 4px 12px rgba(255, 143, 143, 0.2)" : "none",
                  }}
                >
                  {i < step ? <Check className="w-4 h-4 text-white stroke-[3]" /> : i + 1}
                </div>
                <span className="text-[10px] font-bold hidden sm:block" style={{ color: i === step ? "#FF8F8F" : "#6F6F6F" }}>
                  {s.title.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
          <div className="relative h-1.5 rounded-full mt-2 bg-white/40 border border-white/20 shadow-sm">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
              style={{ background: "linear-gradient(90deg, #FF8F8F, #FFB39A)", boxShadow: "0 0 8px rgba(255, 143, 143, 0.25)" }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="premium-glass-card p-7 sm:p-8">
          <AnimatePresence mode="wait">

            {/* ─── Step 0: Personal Info ─── */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-[#222222] font-semibold ml-1">First Name <span className="text-[#FF8F8F]">*</span></Label>
                    <div className="relative">
                      <User className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070]" />
                      <Input
                        placeholder="First"
                        value={data.firstName}
                        onChange={(e) => set("firstName", e.target.value)}
                        className="glass-input pl-12"
                        autoComplete="given-name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#222222] font-semibold ml-1">Last Name <span className="text-[#FF8F8F]">*</span></Label>
                    <Input
                      placeholder="Last"
                      value={data.lastName}
                      onChange={(e) => set("lastName", e.target.value)}
                      className="glass-input px-5"
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#222222] font-semibold ml-1">Gender <span className="text-[#FF8F8F]">*</span></Label>
                  <Select value={data.gender} onValueChange={(v) => set("gender", v)}>
                    <SelectTrigger className="glass-input px-5 flex items-center justify-between text-[#222222]">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(255,255,255,0.45)", borderRadius: "18px" }}>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#222222] font-semibold ml-1">Date of Birth <span className="text-[#FF8F8F]">*</span></Label>
                  <div className="relative">
                    <Calendar className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070] pointer-events-none" />
                    <Input
                      type="date"
                      value={data.dateOfBirth}
                      onChange={(e) => set("dateOfBirth", e.target.value)}
                      className="glass-input pl-12 pr-5 [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Step 1: Account Setup ─── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#222222] font-semibold ml-1">Email address <span className="text-[#FF8F8F]">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070] pointer-events-none" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={data.email}
                      onChange={(e) => { set("email", e.target.value); setErrors(err => ({...err, email: undefined})); }}
                      className={`glass-input pl-12 ${errors.email ? "border-red-400" : ""}`}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-[#222222] font-semibold ml-1">
                    Password <span className="text-[#FF8F8F]">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070] pointer-events-none" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={data.password}
                      onChange={(e) => { set("password", e.target.value); setErrors(err => ({...err, password: undefined})); }}
                      className={`glass-input pl-12 pr-12 ${errors.password ? "border-red-400" : ""}`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#707070] hover:text-[#222222] transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password}</p>}
                  {/* Password strength hint */}
                  {data.password.length > 0 && (
                    <div className="flex gap-1 mt-1.5 px-1">
                      {[1, 2, 3, 4].map((n) => {
                        const score = getPasswordStrength(data.password);
                        return (
                          <div
                            key={n}
                            className="flex-1 h-1.5 rounded-full transition-all duration-300"
                            style={{
                              background: score >= n
                                ? score <= 2 ? "hsl(0 72% 51%)" : score === 3 ? "hsl(45 90% 60%)" : "hsl(120 50% 50%)"
                                : "rgba(255,255,255,0.3)",
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[#222222] font-semibold ml-1">Phone number <span className="text-[#FF8F8F]">*</span></Label>
                  <div className="relative">
                    <Phone className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070] pointer-events-none" />
                    <Input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={data.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        set("phone", val);
                      }}
                      className="glass-input pl-12"
                      autoComplete="tel"
                    />
                  </div>
                  {errors.phone && <p className="text-red-400 text-xs mt-1 ml-1">{errors.phone}</p>}
                </div>
              </motion.div>
            )}

            {/* ─── Step 2: Confirm ─── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }} className="space-y-4">
                {/* Summary card */}
                <div className="rounded-2xl p-5 space-y-3 bg-white/30 backdrop-blur-sm border border-white/40 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#FF8F8F]">Account Summary</p>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: "Name", value: `${data.firstName} ${data.lastName}` },
                      { label: "Email", value: data.email },
                      { label: "Gender", value: data.gender ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1) : "—" },
                      ...(data.dateOfBirth ? [{ label: "Date of Birth", value: data.dateOfBirth }] : []),
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-[#6F6F6F]">{label}</span>
                        <span className="text-[#222222] font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-xs font-bold underline underline-offset-2 transition-colors text-[#FF8F8F] hover:text-[#FF8F8F]/80"
                  >
                    Edit info
                  </button>
                </div>

                {/* Feature list */}
                <div className="space-y-2.5 py-1">
                  {[
                    "Compatibility-based matching",
                    "30-day personality discovery journey",
                    "Send & receive interests",
                    "Secure, verified profiles",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-[#6F6F6F]">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-[#FF8F8F]/15">
                        <Check className="w-3 h-3 text-[#FF8F8F] stroke-[3]" />
                      </div>
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-center text-[#707070] leading-normal px-2">
                  By creating an account you agree to our{" "}
                  <Link href="/terms">
                    <span className="underline cursor-pointer text-[#FF8F8F] font-bold">Terms of Service</span>
                  </Link>
                  {" "}and{" "}
                  <Link href="/privacy">
                    <span className="underline cursor-pointer text-[#FF8F8F] font-bold">Privacy Policy</span>
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
                className="h-[56px] px-5 rounded-full font-bold border border-white/50 bg-white/40 backdrop-blur-sm hover:bg-white/60 text-[#6F6F6F] active:scale-[0.98] transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}

            <Button
              type="button"
              onClick={goNext}
              disabled={loading || !isCurrentStepValid}
              className="flex-1 h-[56px] rounded-full font-bold text-base border-0 shadow-md transition-all duration-300 gradient-coral-pill"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : step < 2 ? (
                <span className="flex items-center gap-1.5">Continue <ChevronRight className="w-5 h-5" /></span>
              ) : (
                <span className="flex items-center gap-1.5"><Heart className="w-5 h-5" /> Create My Account</span>
              )}
            </Button>
          </div>

          <p className="text-center text-sm mt-5 text-[#6F6F6F]">
            Already have an account?{" "}
            <Link href="/login">
              <span 
                onClick={() => {
                  sessionStorage.removeItem("register_step");
                  sessionStorage.removeItem("register_formData");
                }}
                className="font-bold cursor-pointer hover:underline text-[#FF8F8F]" 
              >
                Sign in
              </span>
            </Link>
          </p>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
