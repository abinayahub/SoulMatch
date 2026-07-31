import { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Lock, Filter, Search, SlidersHorizontal, Flame, Sparkles, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { MatchCard } from "@/components/MatchCard";
import { useToast } from "@/hooks/use-toast";
import { useGetMatches, useSendInterest, useGetMe, useGetJourneyProgress } from "@workspace/api-client-react";
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
  const [showLockedModal, setShowLockedModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: profile } = useGetMe({ query: { enabled: true }, request: { headers: authHeaders() } } as any);
  const p = (profile as any) ?? user;
  const mandatoryCompletion = useMemo(() => getMandatoryCompletion(p), [p]);

  const { data: journeyProgress } = useGetJourneyProgress({ query: { enabled: true }, request: { headers: authHeaders() } } as any);
  const answeredQuestions = (journeyProgress as any)?.answeredQuestions || 0;

  const { data: matchesData, isLoading } = useGetMatches(
    { page: 1, limit: 100 },
    { query: { enabled: true }, request: { headers: authHeaders() } } as any,
  );

  const displayMatches = useMemo(() => {
    const arr = Array.isArray(matchesData)
      ? matchesData
      : ((matchesData as any)?.matches ?? (matchesData as any)?.data ?? []);
    
    return arr.filter((m: any) => {
      const profileObj = m?.profile || (m?.id ? m : null);
      if (!profileObj) return false;
      const score = Number(m.compatibilityScore || profileObj?.valueMatchScore || profileObj?.compatibilityScore || 0);
      return score >= 90; // Show ONLY 90%+ matches (e.g. Priya at 94%)
    }).sort((a: any, b: any) => {
      const getScore = (m: any) => {
        const p = m?.profile || m;
        return Number(m.compatibilityScore || p?.valueMatchScore || p?.compatibilityScore || 0);
      };
      return getScore(b) - getScore(a);
    });
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
            <div className="flex flex-col gap-5 pb-12">
              {displayMatches.map((matchItem: any, i: number) => {
                const profile = matchItem.profile || (matchItem.id ? matchItem : null);
                if (!profile) return null;
                const isLocked = matchItem?.isLocked === true || (matchItem?.isUnlocked !== true && answeredQuestions < 30);
                const updatedProfile = {
                  ...profile,
                  interestSentByViewer: profile.interestSentByViewer || localSentInterests.includes(profile.id)
                };
                return (
                  <div key={profile.id || matchItem.userId || i} className="w-full">
                    <MatchCard
                      profile={updatedProfile}
                      compatibilityScore={matchItem.compatibilityScore || profile.compatibilityScore}
                      commonTraits={matchItem.commonTraits}
                      aiInsight={matchItem.aiInsight}
                      isNew={matchItem.isNew}
                      isLocked={isLocked}
                      onSendInterest={handleSendInterest}
                      onClick={(id, locked) => {
                        if (locked || isLocked) {
                          setShowLockedModal(true);
                        } else {
                          navigate(`/profile/${id}`);
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Locked Profile Modal */}
      <AnimatePresence>
        {showLockedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-white/95 backdrop-blur-2xl rounded-[32px] p-6 text-center border border-[#F8D6DD] shadow-[0_20px_60px_rgba(255,71,126,0.25)] relative overflow-hidden"
            >
              {/* Top Glow */}
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#FF7E95]/20 rounded-full blur-2xl pointer-events-none" />

              {/* Lock Header Icon */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF7E95] to-[#FF477E] flex items-center justify-center text-white shadow-[0_8px_25px_rgba(255,71,126,0.35)] mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" strokeWidth={2.2} />
              </div>

              {/* Modal Title & Subtitle */}
              <h3 className="text-2xl font-black text-[#1F1F1F] tracking-tight mb-1">
                🔒 Profile Locked
              </h3>
              <p className="text-sm font-semibold text-[#FF477E] mb-2">
                This profile is waiting for you.
              </p>
              <p className="text-xs text-[#6F6F6F] leading-relaxed mb-4">
                Complete your daily journey to unlock compatible matches.
              </p>

              {/* Checklist */}
              <div className="bg-[#FFF8F8] border border-[#F8D6DD] rounded-2xl p-3.5 space-y-2 text-left text-xs font-semibold text-[#252525] mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF477E] shrink-0" strokeWidth={2.5} />
                  <span>Answer today's questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF477E] shrink-0" strokeWidth={2.5} />
                  <span>Maintain your streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF477E] shrink-0" strokeWidth={2.5} />
                  <span>Share your daily story</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF477E] shrink-0" strokeWidth={2.5} />
                  <span>Build your personality profile</span>
                </div>
              </div>

              {/* Progress & Streak Badges */}
              <div className="flex items-center justify-center gap-3 mb-5">
                <span className="text-xs font-extrabold text-[#FF477E] bg-[#FFF0F3] border border-[#FFD6E0] px-3 py-1 rounded-full shadow-xs">
                  Day {Math.min(30, Math.floor(answeredQuestions / 5) + 1)} / 30
                </span>
                <span className="text-xs font-extrabold text-[#FF477E] bg-[#FFF0F3] border border-[#FFD6E0] px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                  Streak {Math.floor(answeredQuestions / 5)} 🔥
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5">
                <Button
                  onClick={() => {
                    setShowLockedModal(false);
                    navigate('/journey');
                  }}
                  className="w-full h-12 text-sm font-bold bg-gradient-to-r from-[#FF7E95] to-[#FF477E] text-white rounded-full shadow-[0_6px_20px_rgba(255,71,126,0.3)] hover:opacity-95"
                >
                  Go To Journey
                </Button>
                <button
                  onClick={() => setShowLockedModal(false)}
                  className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Not Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
