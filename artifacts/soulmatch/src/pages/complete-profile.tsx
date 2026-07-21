import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Heart, Calendar, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/api";

export default function CompleteProfilePage() {
  const [, navigate] = useLocation();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    gender: (user as any)?.gender || "",
    dateOfBirth: "",
    phone: "",
  });

  function set(field: keyof typeof data, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.gender) {
      toast({ title: "Please select your gender", variant: "destructive" });
      return;
    }
    if (!data.dateOfBirth) {
      toast({ title: "Please enter your date of birth", variant: "destructive" });
      return;
    }

    if (!data.phone || !data.phone.trim()) {
      toast({ title: "Please enter your phone number", variant: "destructive" });
      return;
    }
    const phoneDigits = data.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      toast({ title: "Phone number must be exactly 10 digits", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...data,
        gender: data.gender === "prefer_not_to_say" ? "other" : data.gender,
      };
      const updatedUser = await apiRequest("/users/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      updateUser(updatedUser as any);
      toast({ title: "Profile Completed", description: "Welcome to SoulMatch!" });
      window.location.href = "/dashboard";
    } catch (err: any) {
      toast({ title: "Failed to update profile", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

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
          <div className="inline-flex items-center gap-2 justify-center mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--primary))", boxShadow: "0 0 20px hsl(340 82% 65% / 0.3)" }}>
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ background: "linear-gradient(135deg, hsl(340 82% 70%), hsl(280 70% 72%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              SoulMatch
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Complete Profile</h1>
          <p className="text-sm mt-1" style={{ color: "hsl(215 20% 50%)" }}>Just a few more details to get started</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6" style={{ background: "hsl(var(--card))", backdropFilter: "blur(20px)", border: "1px solid hsl(var(--card))" }}>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-white/70 text-sm">I am a <span style={{ color: "hsl(340 82% 65%)" }}>*</span></Label>
              <Select value={data.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger className="auth-input h-11 rounded-xl text-sm">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent style={{ background: "hsl(222 47% 9%)", border: "1px solid hsl(var(--border))" }}>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/70 text-sm">Date of Birth <span style={{ color: "hsl(340 82% 65%)" }}>*</span></Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "hsl(215 20% 42%)" }} />
                <Input
                  type="date"
                  value={data.dateOfBirth}
                  onChange={(e) => set("dateOfBirth", e.target.value)}
                  className="auth-input pl-10 h-11 rounded-xl text-sm [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                  max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/70 text-sm">Phone number <span style={{ color: "hsl(340 82% 65%)" }}>*</span></Label>
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
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl font-semibold text-white border-0 mt-6"
              style={{
                background: "hsl(var(--primary))",
                boxShadow: "0 4px 20px rgba(219,68,120,0.35)",
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : (
                <span className="flex items-center gap-2">Finish Setup <ArrowRight className="w-4 h-4" /></span>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
