import { motion } from "framer-motion";
import { MapPin, Briefcase, GraduationCap, Heart, CheckCircle2, Star, Flag, Sparkles, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  useGetUserProfile, useSendInterest, useCreateReport, useBlockUser,
} from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useState } from "react";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

interface Props { userId: string }

export default function UserProfilePage({ userId }: Props) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [interestSent, setInterestSent] = useState(false);

  const { data: profile, isLoading } = useGetUserProfile(
    parseInt(userId),
    { query: { enabled: !!userId }, request: { headers: authHeaders() } } as any,
  );

  const sendInterest = useSendInterest({ request: { headers: authHeaders() } });
  const report = useCreateReport({ request: { headers: authHeaders() } });
  const block = useBlockUser({ request: { headers: authHeaders() } });

  const p = profile as any;
  const photo = p?.photos?.find((ph: any) => ph.isPrimary) ?? p?.photos?.[0];

  function handleSendInterest() {
    sendInterest.mutate(
      { data: { toUserId: parseInt(userId) } },
      {
        onSuccess: () => { setInterestSent(true); toast({ title: "Interest sent!" }); },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  }

  function handleReport() {
    report.mutate(
      { data: { reportedUserId: parseInt(userId), reason: "other", description: "Reported from profile page" } },
      {
        onSuccess: () => toast({ title: "Report submitted. Thank you." }),
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  }

  function handleBlock() {
    block.mutate(
      { data: { userId: parseInt(userId) } },
      {
        onSuccess: () => { toast({ title: "User blocked" }); navigate("/discover"); },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1 as any)} className="mb-4 text-muted-foreground">
          <ChevronLeft className="w-4 h-4 mr-1" />Back
        </Button>

        {isLoading ? (
          <Skeleton className="h-96 rounded-2xl bg-white/5" />
        ) : !p ? (
          <div className="text-center py-20 text-muted-foreground">Profile not found</div>
        ) : (
          <div className="space-y-5">
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl overflow-hidden">
              <div className="relative h-56 bg-gradient-to-br from-primary/20 to-secondary/20">
                {photo ? (
                  <img src={photo.url} alt={p.firstName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl font-bold text-white/20">{getInitials(p.firstName)}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                {p.compatibilityScore && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 glass rounded-full px-3 py-1.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-bold text-primary">{p.compatibilityScore}% match</span>
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <h1 className="text-2xl font-bold text-white">{p.firstName}{p.age ? `, ${p.age}` : ""}</h1>
                  {(p.city || p.country) && (
                    <div className="flex items-center gap-1 text-white/70 text-sm mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />{[p.city, p.country].filter(Boolean).join(", ")}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2 mb-4">
                  {p.verificationStatus === "verified" && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />Verified
                    </Badge>
                  )}
                  {p.isPremium && <Badge className="bg-accent/20 text-accent border-accent/30 text-xs"><Star className="w-3 h-3 mr-1" />Premium</Badge>}
                </div>
                {p.bio && <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{p.bio}</p>}
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  {p.occupation && <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-muted-foreground" /><span>{p.occupation}</span></div>}
                  {p.education && <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-muted-foreground" /><span className="truncate">{p.education}</span></div>}
                  {p.religion && <div className="flex items-center gap-2"><span className="text-muted-foreground text-xs">Religion</span><span>{p.religion}</span></div>}
                </div>
                <div className="flex gap-3">
                  <Button
                    className={`flex-1 ${interestSent ? "bg-green-500/20 text-green-400 border-green-500/30" : "gradient-primary border-0 text-white glow-primary"}`}
                    onClick={handleSendInterest}
                    disabled={interestSent || sendInterest.isPending}
                    variant={interestSent ? "outline" : "default"}
                  >
                    <Heart className="w-4 h-4 mr-2" />{interestSent ? "Interest Sent!" : "Send Interest"}
                  </Button>
                  <Button variant="outline" size="icon" className="border-white/20 bg-white/5" onClick={handleReport}>
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Photo gallery */}
            {p.photos?.length > 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5">
                <h2 className="font-semibold mb-3">Photos</h2>
                <div className="grid grid-cols-3 gap-2">
                  {p.photos.map((ph: any, i: number) => (
                    <div key={ph.id ?? i} className="aspect-square rounded-xl overflow-hidden bg-white/5">
                      <img src={ph.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
