import { motion } from "framer-motion";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { Heart, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForgotPassword } from "@workspace/api-client-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const forgot = useForgotPassword();
  const form = useForm<{ email: string }>();

  function onSubmit(data: { email: string }) {
    forgot.mutate(
      { data: { email: data.email } },
      {
        onSuccess: () => { setSent(true); toast({ title: "Reset link sent!", description: "Check your email." }); },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      <div className="orb orb-1" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center glow-primary mx-auto mb-4">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground mt-1 text-sm">Enter your email to receive a reset link</p>
        </div>
        <div className="glass rounded-2xl p-6">
          {sent ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm mb-4">We've sent a password reset link to your email.</p>
              <Link href="/login"><Button variant="outline" className="border-white/20 bg-white/5">Back to Login</Button></Link>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" placeholder="you@example.com" className="pl-9 bg-white/5 border-white/10" {...form.register("email", { required: true })} />
                </div>
              </div>
              <Button type="submit" className="w-full gradient-primary border-0 text-white" disabled={forgot.isPending}>
                {forgot.isPending ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center">
            <Link href="/login"><span className="text-sm text-primary hover:underline cursor-pointer flex items-center justify-center gap-1"><ArrowLeft className="w-3.5 h-3.5" />Back to Login</span></Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
