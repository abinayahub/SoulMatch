import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Lock, Filter, Search, SlidersHorizontal, Flame, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { MatchCard } from "@/components/MatchCard";
import { useToast } from "@/hooks/use-toast";
import { useGetMatches, useSendInterest, useGetMe } from "@workspace/api-client-react";
import { getAccessToken, useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { getMandatoryCompletion } from "@/lib/profile-utils";
import { useQueryClient } from "@tanstack/react-query";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

const FILTERS = ["High Compatibility", "All", "New", "Nearby", "Online", "Recent"];

export default function MatchesPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localSentInterests, setLocalSentInterests] = useState<number[]>([]);
  
  const [activeFilter, setActiveFilter] = useState("High Compatibility");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: profile } = useGetMe({ query: { enabled: true }, request: { headers: authHeaders() } } as any);
  const p = (profile as any) ?? user;
  const mandatoryCompletion = useMemo(() => getMandatoryCompletion(p), [p]);

  const { data: matchesData, isLoading } = useGetMatches(
    { page: 1, limit: 100 },
    { query: { enabled: true }, request: { headers: authHeaders() } } as any,
  );

  const displayMatches = useMemo(() => {
    const arr = (matchesData as any)?.matches || [];
    // The original website ONLY EVER showed matches >= 90% on this page.
    // We enforce this rule strictly for all filters to prevent showing unqualified profiles.
    let filtered = arr.filter((m: any) => (m.profile?.compatibilityScore || 0) >= 90);
    
    // Future filter logic can be applied to `filtered` here
    return filtered;
  }, [matchesData, activeFilter]);

  const sendInterest = useSendInterest({ request: { headers: authHeaders() } });

  function handleSendInterest(userId: number) {
    setLocalSentInterests(prev => [...prev, userId]);
    sendInterest.mutate(
      { data: { toUserId: userId } },
      {
        onSuccess: () => {
          toast({ title: "Interest sent!" });
          queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
          queryClient.invalidateQueries({ queryKey: ["/api/interests"] });
          queryClient.invalidateQueries({ queryKey: ["/api/interests/summary"] });
        },
        onError: (err: any) => {
          setLocalSentInterests(prev => prev.filter(id => id !== userId));
          toast({ title: "Error", description: err.message, variant: "destructive" });
        },
      },
    );
  }

  // Profile not completed state
  if (mandatoryCompletion.percentage < 100) {
    return (
      <AppLayout>
        <div className="w-full min-h-screen relative flex flex-col font-sans relative flex flex-col items-center justify-center p-5" style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 100%)' }}>
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, #F4F1FF 0%, transparent 50%), radial-gradient(circle at 100% 100%, #FFFDFC 0%, transparent 50%)' }} />
          <div className="w-full max-w-md bg-card border border-border shadow-md rounded-[32px] p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-[#F6A8B7]" />
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#252525] mb-4">Complete your profile to unlock matches</h2>
            <p className="text-[clamp(13px,3.82vw,17px)] text-[#707070] mb-8 leading-relaxed">
              You need to complete all mandatory fields in your profile before you can access the Matches section and connect with potential partners.
            </p>
            <Button 
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg shadow-primary/25" 
              onClick={() => navigate('/profile')}
            >
              Complete Profile Now
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full min-h-screen relative flex flex-col font-sans relative" style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 100%)' }}>
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, #F4F1FF 0%, transparent 50%), radial-gradient(circle at 100% 100%, #FFFDFC 0%, transparent 50%)' }} />
        
        {/* Sticky Mobile Header */}
        <nav className="sticky top-[calc(4rem+env(safe-area-inset-top,0px))] z-50 bg-transparent/90 backdrop-blur-md pt-4 pb-3">
          <div className="px-5 max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[clamp(24px,7.12vw,32px)] font-extrabold text-[#252525] tracking-tight flex items-center gap-2">
                  Matches <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold ml-1">{displayMatches.length}</span>
                </h1>
                <p className="text-[clamp(11px,3.31vw,15px)] text-[#707070] font-medium mt-0.5">Find people who align with your soul.</p>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="px-5 max-w-md mx-auto mt-4">
          

          {isLoading ? (
            <div className="space-y-5">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[clamp(340px,101.78vw,460px)] w-full rounded-[24px] bg-foreground/5" />)}
            </div>
          ) : displayMatches.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center mt-16 px-4">
              <div className="w-32 h-32 mb-8 relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                <div className="relative w-full h-full bg-card border border-border shadow-xl rounded-[32px] rotate-12 flex items-center justify-center">
                   <div className="w-16 h-16 bg-gradient-to-tr from-[#F6A8B7] to-primary rounded-full absolute -top-4 -left-4 animate-bounce" style={{ animationDuration: '3s' }} />
                   <Heart className="w-12 h-12 text-primary fill-primary/20 absolute bottom-4 right-4" />
                   <Search className="w-10 h-10 text-foreground/40 absolute top-6 left-6" />
                </div>
              </div>
              
              <h2 className="text-[clamp(20px,6.11vw,28px)] font-extrabold text-[#252525] mb-3">No Matches Yet</h2>
              <p className="text-[clamp(13px,3.82vw,17px)] text-[#707070] mb-10 max-w-[clamp(238px,71.25vw,322px)] mx-auto leading-relaxed">
                Complete more daily questions to receive better matches. The right person is worth the wait.
              </p>
              
              <Button 
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-[clamp(14px,4.07vw,18px)] shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform" 
                onClick={() => navigate('/journey')}
              >
                Continue Journey
              </Button>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-5">
              {displayMatches.map((matchItem: any, i: number) => {
                const profile = matchItem.profile;
                if (!profile) return null;
                const updatedProfile = {
                  ...profile,
                  interestSentByViewer: profile.interestSentByViewer || localSentInterests.includes(profile.id)
                };
                return (
                  <motion.div key={matchItem.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <MatchCard
                      profile={updatedProfile}
                      onSendInterest={handleSendInterest}
                      onClick={(id) => navigate(`/profile/${id}`)}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
