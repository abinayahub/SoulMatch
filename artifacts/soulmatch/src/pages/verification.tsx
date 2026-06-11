import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { useSubmitVerification } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

export default function VerificationPage() {
  const { toast } = useToast();
  const [docType, setDocType] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submitVerif = useSubmitVerification({ request: { headers: authHeaders() } });

  function handleSubmit() {
    if (!docType) { toast({ title: "Select document type", variant: "destructive" }); return; }
    submitVerif.mutate(
      { data: { documentType: docType as any, documentUrl: "https://placeholder.example.com/doc.jpg", selfieUrl: undefined } },
      {
        onSuccess: () => { setSubmitted(true); toast({ title: "Verification submitted!", description: "We'll review your documents within 24-48 hours." }); },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  }

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
            <Shield className="w-7 h-7 text-green-400" />Identity Verification
          </h1>
          <p className="text-muted-foreground">Verify your identity to build trust with potential matches.</p>
        </motion.div>

        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-10 text-center">
            <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Verification Submitted!</h2>
            <p className="text-muted-foreground text-sm">Our team will review your documents within 24-48 hours. You'll be notified of the result.</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 space-y-5">
            <div className="space-y-1.5">
              <Label>Document Type</Label>
              <Select onValueChange={setDocType}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent className="glass border-white/10">
                  <SelectItem value="national_id">National ID</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="driving_license">Driving License</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Document Photo</Label>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload or drag & drop</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Selfie with Document</Label>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Hold your document next to your face</p>
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full gradient-primary border-0 text-white glow-primary" disabled={submitVerif.isPending}>
              {submitVerif.isPending ? "Submitting..." : "Submit for Verification"}
            </Button>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
