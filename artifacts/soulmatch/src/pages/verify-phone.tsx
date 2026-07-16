import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Phone, CheckCircle2, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/api";

export default function VerifyPhonePage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [phone, setPhone] = useState("");
  const [mockOtp, setMockOtp] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("phone");
    const m = params.get("mockOtp");
    if (p) setPhone(decodeURIComponent(p));
    if (m) setMockOtp(m);
  }, []);

  async function handleVerify(otpCode: string) {
    if (otpCode.length !== 6) return;
    
    setLoading(true);
    try {
      const res = await apiRequest<{ accessToken: string; refreshToken: string; user: any }>(
        "/auth/verify-phone",
        { 
          method: "POST", 
          body: JSON.stringify({ phone, otp: otpCode }) 
        }
      );
      
      toast({ title: "Phone Verified!", description: "Your account is fully set up." });
      
      // Log the user in
      login(res.accessToken, res.refreshToken, res.user);
      
      // Redirect to dashboard
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: "Verification Failed", description: err.message || "Invalid OTP", variant: "destructive" });
      setOtpValue("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, hsl(340 82% 65% / 0.15) 0%, transparent 70%)", top: -100, right: -100, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, hsl(280 70% 65% / 0.12) 0%, transparent 70%)", bottom: -80, left: -80, filter: "blur(70px)" }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative" style={{ background: "hsl(var(--primary))", boxShadow: "0 0 30px hsl(340 82% 65% / 0.3)" }}>
            <MessageSquare className="w-8 h-8 text-white absolute" />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute w-full h-full rounded-full border-2 border-white/30"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Verify your phone</h1>
          <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
            We've sent a 6-digit verification code to <span className="font-semibold text-white">{phone}</span>
          </p>
        </div>

        <div className="bg-card border border-border shadow-xl rounded-2xl p-8 flex flex-col items-center">
          
          <div className="mb-8">
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={(v) => {
                setOtpValue(v);
                if (v.length === 6) handleVerify(v);
              }}
              disabled={loading}
            >
              <InputOTPGroup className="gap-2 sm:gap-3">
                <InputOTPSlot index={0} className="w-10 h-12 sm:w-12 sm:h-14 text-xl sm:text-2xl rounded-lg" />
                <InputOTPSlot index={1} className="w-10 h-12 sm:w-12 sm:h-14 text-xl sm:text-2xl rounded-lg" />
                <InputOTPSlot index={2} className="w-10 h-12 sm:w-12 sm:h-14 text-xl sm:text-2xl rounded-lg" />
                <InputOTPSlot index={3} className="w-10 h-12 sm:w-12 sm:h-14 text-xl sm:text-2xl rounded-lg" />
                <InputOTPSlot index={4} className="w-10 h-12 sm:w-12 sm:h-14 text-xl sm:text-2xl rounded-lg" />
                <InputOTPSlot index={5} className="w-10 h-12 sm:w-12 sm:h-14 text-xl sm:text-2xl rounded-lg" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button 
            className="w-full bg-primary text-primary-foreground shadow-lg border-0 h-12 rounded-xl font-semibold transition-all mb-6"
            onClick={() => handleVerify(otpValue)}
            disabled={otpValue.length !== 6 || loading}
          >
            {loading ? "Verifying..." : (
              <span className="flex items-center gap-2">
                Verify & Continue <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>

          {mockOtp && (
            <div className="w-full mt-2 p-4 rounded-xl border" style={{ background: "hsl(280 70% 65% / 0.1)", borderColor: "hsl(280 70% 65% / 0.3)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 bg-background/40 px-2 py-0.5 rounded-full">Developer Mock</span>
              </div>
              <p className="text-xs text-white/70 mb-3 leading-relaxed">
                Since you do not have an SMS provider configured, here is the OTP that would have been texted to you:
              </p>
              <div className="flex items-center justify-between bg-background/30 rounded-lg p-3">
                <span className="font-mono text-xl tracking-[0.2em] font-bold" style={{ color: "hsl(280 70% 75%)" }}>{mockOtp}</span>
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="h-8 px-3 text-xs"
                  onClick={() => setOtpValue(mockOtp)}
                >
                  Auto-fill
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
