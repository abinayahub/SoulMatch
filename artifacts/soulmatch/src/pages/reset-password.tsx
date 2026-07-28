import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Heart, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useResetPassword } from "@workspace/api-client-react";

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const reset = useResetPassword();
  
  // Extract token from URL
  const [token, setToken] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getPasswordStrength(pw: string): number {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  function validate() {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one special character";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    
    if (!token) {
      toast({ title: "Error", description: "Reset token is missing from URL.", variant: "destructive" });
      return;
    }

    reset.mutate(
      { data: { token, newPassword: password } },
      {
        onSuccess: () => { 
          toast({ title: "Success!", description: "Your password has been reset. You can now log in." }); 
          setLocation("/login");
        },
        onError: (err: any) => toast({ title: "Error", description: err.message || "Failed to reset password", variant: "destructive" }),
      },
    );
  }

  return (
    <div className="w-full min-h-screen relative flex flex-col font-sans flex items-center justify-center px-4 relative" style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 100%)' }}>
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, #F4F1FF 0%, transparent 50%), radial-gradient(circle at 100% 100%, #FFFDFC 0%, transparent 50%)' }} />
      <div className="orb orb-1" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center shadow-lg shadow-primary/20 mx-auto mb-4">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Set New Password</h1>
          <p className="text-[#707070] mt-1 text-sm">Create a strong new password for your account</p>
        </div>
        <div className="bg-card border border-border shadow-md rounded-2xl rounded-2xl p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <div className="relative">
                <Lock className="absolute z-10 left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707070]" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Strong password" 
                  className={`pl-9 pr-10 bg-card/5 border-white/10 ${error ? "border-red-500" : ""}`} 
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707070] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength hint */}
              {password.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {[1, 2, 3, 4].map((n) => {
                    const score = getPasswordStrength(password);
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
              <Label>Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute z-10 left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707070]" />
                <Input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Confirm password" 
                  className={`pl-9 pr-10 bg-card/5 border-white/10 ${error ? "border-red-500" : ""}`} 
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError(null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707070] hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <Button type="submit" className="w-full bg-primary text-primary-foreground shadow-md border-0 text-white mt-4" disabled={reset.isPending}>
              {reset.isPending ? "Updating..." : "Reset Password"}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Link href="/login"><span className="text-sm text-primary hover:underline cursor-pointer flex items-center justify-center gap-1"><ArrowLeft className="w-3.5 h-3.5" />Back to Login</span></Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
