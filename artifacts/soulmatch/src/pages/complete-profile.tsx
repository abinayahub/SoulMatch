import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Phone, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center px-4 py-4 relative soulmatch-mesh-bg">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative mt-4 z-10"
      >
        {/* Header */}
        <div className="text-center mb-5 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-[#222222] tracking-tight">Complete Profile</h1>
          <p className="text-xs mt-1 text-[#6F6F6F]">Just a few more details to get started</p>
        </div>

        {/* Card */}
        <div className="premium-glass-card p-7 sm:p-8">
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[#222222] font-semibold ml-1">I am a <span className="text-[#FF8F8F]">*</span></Label>
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
                  required
                />
              </div>
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
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-[clamp(48px,14.25vw,64px)] rounded-full font-bold text-base text-white border-0 mt-4 active:scale-[0.98] transition-all gradient-coral-button hover:opacity-95 shadow-md glow-coral-button"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving profile…
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Complete Profile <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
