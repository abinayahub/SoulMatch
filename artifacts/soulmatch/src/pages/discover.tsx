import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { 
  Heart, Lock, RotateCcw, X, Star, Zap, Info, Bell, User, SlidersHorizontal, 
  ChevronRight, ShieldCheck, MessageCircle, Compass, Sparkles, CheckCircle2,
  RefreshCw, Crown, UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { useGetMatches, useSendInterest, useGetJourneyProgress, useGetMe } from "@workspace/api-client-react";
import { getAccessToken, useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { getMandatoryCompletion } from "@/lib/profile-utils";
import { apiRequest } from "@/lib/api";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

// Single Tinder/Bumble style Swipe Card component
function SwipeCard({ matchItem, isTop, onSwipe, answeredQuestions, onCardClick, onNavigateProfile }: any) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const opacity = useTransform(x, [-220, -120, 0, 120, 220], [0.4, 1, 1, 1, 0.4]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 90) {
      onSwipe("right");
    } else if (info.offset.x < -90) {
      onSwipe("left");
    }
  };

  const profile = matchItem?.profile;
  const score = Number(matchItem?.compatibilityScore || profile?.valueMatchScore || profile?.compatibilityScore || 94);
  
  // Privacy rule: Profile is locked until user completes 30-Day Journey (30 days completed or explicitly unlocked)
  const isLocked = matchItem?.isLocked === true || (matchItem?.isUnlocked !== true && answeredQuestions < 30);

  const photoUrl = profile?.photos?.find((p: any) => p.isPrimary)?.url || 
    profile?.photos?.[0]?.url || 
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";

  const handleTap = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLocked) {
      onCardClick(); // Opens Locked Modal, NEVER opens profile page
    } else if (profile?.id) {
      onNavigateProfile(profile.id);
    }
  };

  return (
    <motion.div
      style={{ x: isTop ? x : 0, rotate: isTop ? rotate : 0, opacity: isTop ? opacity : 1 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.65}
      onDragEnd={handleDragEnd}
      onClick={handleTap}
      className={`absolute inset-0 rounded-[30px] overflow-hidden bg-[#FFF8F8] border border-white/80 shadow-[0_16px_40px_rgba(255,143,168,0.18)] select-none ${
        isTop ? 'cursor-grab active:cursor-grabbing z-20' : 'z-10'
      }`}
    >
      <div className="relative w-full h-full overflow-hidden bg-[#FFF8F8]">
        {/* Profile Image with heavy blur overlay if locked */}
        <img 
          src={photoUrl} 
          alt="Profile Preview" 
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLocked ? 'blur-2xl scale-125 opacity-70' : 'opacity-95'
          }`}
        />
        
        {/* Pastel White Frosted Glass Overlay (75-85% opacity) - NO BLACK OVERLAY */}
        {isLocked ? (
          <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8F8]/75 via-[#FDF2F5]/80 to-[#FFF3EF]/85 backdrop-blur-2xl pointer-events-none" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
        )}

        {/* Card Header Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30 pointer-events-auto">
          {/* Match % Badge */}
          <div className="bg-white/95 backdrop-blur-xl px-4 py-1.5 rounded-full shadow-[0_4px_16px_rgba(255,71,126,0.15)] border border-[#F8D6DD] flex items-center justify-center gap-1.5">
            <span className="text-sm sm:text-base font-black text-[#FF477E] leading-none">{score}%</span>
            <span className="text-[10px] font-extrabold text-[#FF6B8B] tracking-widest uppercase leading-none">MATCH</span>
          </div>
        </div>

        {/* Locked Silhouette / Privacy Content */}
        {isLocked ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
            {/* Glowing Soft Pink Lock Icon */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF7E95] to-[#FF477E] flex items-center justify-center text-white shadow-[0_8px_25px_rgba(255,71,126,0.35)] mb-4 animate-pulse">
              <Lock className="w-7 h-7 text-white" strokeWidth={2.2} />
            </div>

            <h3 className="text-2xl font-black text-[#252525] mb-2 tracking-tight flex items-center justify-center">
              Great Match!
            </h3>
            
            <p className="text-[#6F6F6F] font-semibold text-sm max-w-xs leading-relaxed">
              Complete your 30-Day Journey to unlock this profile.
            </p>
          </div>
        ) : (
          /* Unlocked Revealed Content */
          <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col text-white">
            <h3 className="text-2xl font-black text-white drop-shadow-md leading-tight mb-1">
              {profile?.displayName || profile?.firstName}, {profile?.age || 25}
            </h3>
            {profile?.city && (
              <p className="text-white/90 text-sm font-medium drop-shadow-sm mb-2">
                📍 {profile.city}
              </p>
            )}
            {profile?.bio && (
              <p className="text-white/80 text-xs line-clamp-2 leading-relaxed drop-shadow-sm">
                {profile.bio}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function DiscoverPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [localSentInterests, setLocalSentInterests] = useState<number[]>([]);
  const [showLockedModal, setShowLockedModal] = useState(false);

  const { data: profile } = useGetMe({ query: { enabled: true }, request: { headers: authHeaders() } } as any);
  const p = (profile as any) ?? user;
  const mandatoryCompletion = useMemo(() => getMandatoryCompletion(p), [p]);

  const { data: matchesData, isLoading } = useGetMatches(
    { limit: 50 },
    { query: { enabled: true }, request: { headers: authHeaders() } } as any,
  );

  const { data: journeyProgress } = useGetJourneyProgress(
    { query: { enabled: true }, request: { headers: authHeaders() } } as any
  );
  
  const answeredQuestions = (journeyProgress as any)?.answeredQuestions || 0;

  const matches = useMemo(() => {
    return [...((matchesData as any)?.matches ?? [])]
      .filter((m: any) => {
        const score = Number(m.compatibilityScore || m.profile?.valueMatchScore || m.profile?.compatibilityScore || 0);
        return score > 0;
      })
      .sort((a: any, b: any) => {
        const getScore = (m: any) => Number(m.compatibilityScore || m.profile?.valueMatchScore || m.profile?.compatibilityScore || 0);
        return getScore(b) - getScore(a);
      });
  }, [matchesData]);

  const currentMatch = matches[currentIndex];
  const nextMatch = matches[currentIndex + 1];

  const sendInterest = useSendInterest({ request: { headers: authHeaders() } });

  const handleSwipe = (direction: "left" | "right") => {
    if (!currentMatch) return;
    if (direction === "right" && currentMatch.profile?.id) {
      handleSendInterest(currentMatch.profile.id);
    }
    setCurrentIndex(prev => prev + 1);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  function handleSendInterest(userId: number) {
    if (localSentInterests.includes(userId)) return;
    setLocalSentInterests(prev => [...prev, userId]);
    sendInterest.mutate(
      { data: { toUserId: userId, message: undefined } },
      {
        onSuccess: () => {
          toast({ title: "Interest sent! ❤️", description: "Your like has been recorded." });
          queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
          queryClient.invalidateQueries({ queryKey: ["/api/interests"] });
        },
        onError: (err: any) => {
          setLocalSentInterests(prev => prev.filter(id => id !== userId));
          toast({ title: "Error", description: err.message, variant: "destructive" });
        },
      },
    );
  }

  // Profile incomplete guard
  if (mandatoryCompletion.percentage < 100) {
    return (
      <AppLayout>
        <div 
          className="w-full min-h-screen flex items-center justify-center"
          style={{ background: 'linear-gradient(180deg, #FFF8F8 0%, #FFE6EC 100%)' }}
        >
          <div className="w-full max-w-md mx-auto px-4">
             <div className="bg-white/80 backdrop-blur-xl rounded-[30px] p-6 text-center border border-[#F8D6DD] shadow-[0_12px_35px_rgba(255,143,168,0.12)]">
                <div className="w-16 h-16 bg-[#FF7E95]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Lock className="w-7 h-7 text-[#FF477E]" strokeWidth={2} />
                </div>
                <h2 className="text-xl font-bold text-[#252525] mb-2">Complete Profile</h2>
                <p className="text-[#6F6F6F] text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                  Complete all mandatory profile fields to access the Discover swipe deck and unlock compatible matches.
                </p>
                <Button 
                  className="w-full h-13 text-base font-bold bg-gradient-to-r from-[#FF7E95] to-[#FF477E] text-white rounded-full shadow-[0_6px_20px_rgba(255,71,126,0.3)] hover:opacity-95" 
                  onClick={() => navigate('/profile')}
                >
                  Complete Profile Now
                </Button>
             </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div 
        className="w-full min-h-screen pb-12 flex flex-col"
        style={{ background: 'linear-gradient(180deg, #FFF8F8 0%, #FFE6EC 100%)' }}
      >
        <div className="w-full max-w-md mx-auto px-4 pt-3 space-y-4 flex flex-col flex-1">
          
          {/* Discover Title */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-black text-[#1F1F1F] tracking-tight">Discover</h1>
          </div>

          {/* Main Swipe Card Stack Container */}
          <div className="relative w-full h-[clamp(410px,63vh,510px)] max-w-sm mx-auto flex items-center justify-center my-1">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-[30px] bg-white/50 border border-[#F8D6DD]" />
            ) : !currentMatch ? (
              /* No More Matches State */
              <div className="w-full h-full rounded-[30px] bg-white/80 backdrop-blur-xl border border-[#F8D6DD] shadow-[0_16px_40px_rgba(255,143,168,0.12)] p-6 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-[#FF7E95]/10 rounded-full flex items-center justify-center mb-3">
                  <Compass className="w-8 h-8 text-[#FF477E]" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-[#252525] mb-1">That's everyone for now!</h3>
                <p className="text-xs text-[#6F6F6F] mb-5 max-w-xs leading-normal">
                  Check back later or answer more questions to unlock new compatible profiles.
                </p>
                <Button 
                  onClick={() => setCurrentIndex(0)}
                  className="h-11 px-6 rounded-full bg-gradient-to-r from-[#FF7E95] to-[#FF477E] text-white font-bold shadow-md hover:opacity-95"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Start Over
                </Button>
              </div>
            ) : (
              <AnimatePresence>
                {/* Background Next Card Stack */}
                {nextMatch && (
                  <div 
                    key={nextMatch.profile?.id || currentIndex + 1}
                    className="absolute inset-0 rounded-[30px] overflow-hidden bg-white border border-[#F8D6DD] shadow-sm scale-[0.95] translate-y-3 opacity-60 z-0 pointer-events-none"
                  >
                    <img 
                      src={nextMatch.profile?.photos?.[0]?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"} 
                      alt="Next"
                      className="w-full h-full object-cover blur-xl opacity-60"
                    />
                  </div>
                )}

                {/* Top Active Swipe Card */}
                <SwipeCard
                  key={currentMatch.profile?.id || currentIndex}
                  matchItem={currentMatch}
                  isTop={true}
                  onSwipe={handleSwipe}
                  answeredQuestions={answeredQuestions}
                  onCardClick={() => setShowLockedModal(true)}
                  onNavigateProfile={(id: number) => navigate(`/profile/${id}`)}
                />
              </AnimatePresence>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-center gap-3 sm:gap-3.5 my-3 select-none">
            {/* 1. Undo Button (Soft Grey) */}
            <button 
              onClick={handleUndo}
              disabled={currentIndex === 0}
              title="Undo"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-xl border border-white/80 shadow-[0_6px_18px_rgba(255,143,168,0.12)] text-[#94A3B8] flex items-center justify-center active:scale-90 transition-all hover:bg-white disabled:opacity-40 disabled:pointer-events-none"
            >
              <RotateCcw className="w-5 h-5 text-[#94A3B8]" strokeWidth={2.2} />
            </button>

            {/* 2. Pass Button (Soft Rose) */}
            <button 
              onClick={() => handleSwipe("left")}
              title="Pass"
              className="w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] rounded-full bg-white/95 backdrop-blur-xl border border-[#F8D6DD] shadow-[0_6px_20px_rgba(255,143,168,0.14)] text-[#FF8FA3] flex items-center justify-center active:scale-90 transition-all hover:bg-white hover:shadow-[0_8px_24px_rgba(255,143,168,0.2)]"
            >
              <X className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF8FA3]" strokeWidth={2.5} />
            </button>

            {/* 3. Like Button (SoulMatch Pink Gradient - Primary Action) */}
            <button 
              onClick={() => handleSwipe("right")}
              title="Like"
              className="w-16 h-16 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#FF7E95] to-[#FF477E] shadow-[0_10px_28px_rgba(255,71,126,0.35)] text-white flex items-center justify-center active:scale-90 transition-all hover:opacity-95 hover:shadow-[0_12px_32px_rgba(255,71,126,0.45)]"
            >
              <Heart className="w-8 h-8 fill-white stroke-white" strokeWidth={1.5} />
            </button>

            {/* 4. Super Like / Star Button (Muted Gold) */}
            <button 
              onClick={() => {
                toast({ title: "Super Like! ⭐", description: "Saved to your favourites." });
                handleSwipe("right");
              }}
              title="Super Like"
              className="w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] rounded-full bg-white/95 backdrop-blur-xl border border-[#FDF0D5] shadow-[0_6px_20px_rgba(245,196,99,0.15)] text-[#F5C463] flex items-center justify-center active:scale-90 transition-all hover:bg-white hover:shadow-[0_8px_24px_rgba(245,196,99,0.22)]"
            >
              <Star className="w-6 h-6 sm:w-6 sm:h-6 fill-[#F5C463] stroke-[#F5C463]" strokeWidth={1.5} />
            </button>

            {/* 5. Boost Button (Soft Lavender) */}
            <button 
              onClick={() => {
                toast({ title: "Profile Boosted! ⚡", description: "Your profile is highlighted to top matches." });
              }}
              title="Boost"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-xl border border-[#E9D8FD] shadow-[0_6px_18px_rgba(177,151,252,0.14)] text-[#B197FC] flex items-center justify-center active:scale-90 transition-all hover:bg-white hover:shadow-[0_8px_22px_rgba(177,151,252,0.22)]"
            >
              <Zap className="w-5 h-5 fill-[#B197FC] stroke-[#B197FC]" strokeWidth={1.5} />
            </button>
          </div>

          {/* Swipe Hint */}
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium select-none">
              Swipe <span className="text-[#FF477E] font-bold">right</span> to like, <span className="font-bold text-[#252525]">left</span> to pass
            </p>
          </div>

          {/* Locked State Banner (If journey progress incomplete) */}
          {answeredQuestions < 5 && (
            <div className="w-full bg-white/80 backdrop-blur-xl border border-[#F8D6DD] rounded-[24px] p-4 shadow-xs mt-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#FF7E95]/10 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-[#FF477E]" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#252525] truncate">🔒 Unlock more matches</h4>
                  <p className="text-[11px] text-[#6F6F6F] truncate">Complete 30-Day Journey questions to reveal profiles.</p>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/journey')}
                className="h-9 px-3.5 text-xs font-bold bg-gradient-to-r from-[#FF7E95] to-[#FF477E] text-white rounded-full shrink-0 shadow-xs"
              >
                Go to Journey
              </Button>
            </div>
          )}

          {/* Premium Upsell Card */}
          {!user?.isPremium && (
            <div className="w-full bg-white/80 backdrop-blur-xl border border-[#F8D6DD] rounded-[28px] p-6 text-center relative overflow-hidden shadow-xs shrink-0 mt-4">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF7E95]/10 rounded-full blur-[30px]" />
               <Crown className="w-8 h-8 text-[#FF477E] mx-auto mb-3" strokeWidth={1.5} />
               <h3 className="font-bold text-[#252525] text-base sm:text-lg mb-1">Preview Matches</h3>
               <p className="text-xs sm:text-sm text-[#6F6F6F] mb-5 leading-relaxed">
                  You have {matches.length} potential matches waiting! Upgrade to Premium to preview match insights early.
               </p>
               <Button className="w-full h-12 bg-gradient-to-r from-[#FF7E95] to-[#FF477E] text-white font-bold rounded-full shadow-[0_6px_20px_rgba(255,71,126,0.3)] hover:opacity-95" onClick={() => navigate('/pricing')}>
                  Upgrade Now
               </Button>
            </div>
          )}

          {/* Invite Your Friends Card */}
          <div className="w-full bg-white/80 backdrop-blur-xl border border-[#F8D6DD] rounded-[28px] p-6 text-center relative overflow-hidden shadow-xs shrink-0 my-4">
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#EADCF8]/20 rounded-full blur-[30px]" />
             <UserPlus className="w-8 h-8 text-[#FF477E] mx-auto mb-3" strokeWidth={1.5} />
             <h3 className="font-bold text-[#252525] text-base sm:text-lg mb-1">Invite Your Friends</h3>
             <p className="text-xs sm:text-sm text-[#6F6F6F] mb-5 leading-relaxed">
                More friends, more matches! Share SoulMatch with your circle.
             </p>
             <Button 
                className="w-full h-12 bg-gradient-to-r from-[#FF7E95] to-[#FF477E] text-white font-bold rounded-full shadow-[0_6px_20px_rgba(255,71,126,0.3)] hover:opacity-95"
                onClick={() => {
                  const shareData = {
                    title: 'Join SoulMatch',
                    text: 'Find your perfect match on SoulMatch! Join me today.',
                    url: window.location.origin,
                  };
                  if (navigator.share) {
                    navigator.share(shareData).catch(() => {});
                  } else if (navigator.clipboard?.writeText) {
                    navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`).then(() => {
                      toast({ title: "Link Copied!", description: "Invite link copied to clipboard." });
                    });
                  }
                }}
             >
                Invite Now
             </Button>
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

      </div>
    </AppLayout>
  );
}



