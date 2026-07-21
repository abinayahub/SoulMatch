import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, Lock, ShieldCheck, Shield, HeartHandshake, CheckCircle2, TrendingUp, CalendarDays, Award, AlertCircle, Crown, Info, MessageCircle, SlidersHorizontal, MapPin, UserPlus, Clock, Target, RefreshCw, Brain, Gift, Flame, User, BadgeCheck, CheckSquare, Compass, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { MatchCard } from "@/components/MatchCard";
import { useToast } from "@/hooks/use-toast";
import { useGetMatches, useSendInterest, useGetJourneyProgress, useGetMe, useGetPersonalityProfile } from "@workspace/api-client-react";
import { getAccessToken, useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MoreVertical } from "lucide-react";
import { getMandatoryCompletion } from "@/lib/profile-utils";
import { apiRequest } from "@/lib/api";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

export default function DiscoverPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [localSentInterests, setLocalSentInterests] = useState<number[]>([]);

  const handleInviteClick = () => {
    const shareData = {
      title: 'Join Soul Match AI',
      text: 'Find your perfect match on Soul Match AI! Join me today.',
      url: window.location.origin,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => {
        console.error('Error sharing:', err);
      });
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`).then(() => {
        toast({
          title: "Link Copied!",
          description: "Invite link copied to clipboard. Share it with your friends!",
        });
      }).catch((err) => {
        toast({
          title: "Error",
          description: "Failed to copy link.",
          variant: "destructive",
        });
      });
    } else {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = `${shareData.text} ${shareData.url}`;
        textArea.style.position = "fixed"; 
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast({
          title: "Link Copied!",
          description: "Invite link copied to clipboard. Share it with your friends!",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to copy link on this device.",
          variant: "destructive",
        });
      }
    }
  };

  const { data: profile } = useGetMe({ query: { enabled: true }, request: { headers: authHeaders() } } as any);
  const p = (profile as any) ?? user;
  const mandatoryCompletion = useMemo(() => getMandatoryCompletion(p), [p]);

  const { data: matchesData, isLoading } = useGetMatches(
    { limit: 10 },
    { query: { enabled: true }, request: { headers: authHeaders() } } as any,
  );

  const { data: networkStats } = useQuery({
    queryKey: ["/api/matches/network-stats"],
    queryFn: async () => {
      return apiRequest<any>("/matches/network-stats", {
        headers: authHeaders(),
      });
    },
  });

  const stats = networkStats || { totalMatches: 0, newThisWeek: 0, averageCompatibility: 0 };
  const hasMatches = stats.totalMatches > 0;

  const { data: journeyProgress } = useGetJourneyProgress(
    { query: { enabled: true }, request: { headers: authHeaders() } } as any
  );
  
  const answeredQuestions = (journeyProgress as any)?.answeredQuestions || 0;
  const confidenceScore = Math.min(100, Math.round((answeredQuestions / 150) * 100));
  const qDaysCompleted = Math.floor(answeredQuestions / 5);
  const storiesAnalyzed = p.journalCount || 0;

  let confidenceLevel = "Building Profile";
  
  const { data: activeUsersData } = useQuery({
    queryKey: ["/api/users/active"],
    queryFn: async () => {
      return apiRequest<any>("/users/active", {
        headers: authHeaders(),
      });
    },
    refetchInterval: 30000,
  });
  
  const rawActiveUsers = activeUsersData?.users || [];
  const activeUsers = rawActiveUsers.filter((u: any) => {
    // Never show the current user in their own active list
    if (user?.id && u.id === user.id) return false;
    
    if (!(user as any)?.gender || !u.gender) return true;
    const userGender = (user as any).gender.toLowerCase();
    const uGender = u.gender.toLowerCase();
    if (userGender === 'male') return uGender === 'female';
    if (userGender === 'female') return uGender === 'male';
    return true;
  });
  
  // Since we filtered out ~50% of users locally, let's adjust the total or rely on the filtered length if it's small.
  // Actually, if activeUsersData.total is small (e.g. 2), totalActive should just be the filtered length to be accurate.
  const totalActive = (activeUsersData?.total || 0) <= rawActiveUsers.length 
    ? activeUsers.length 
    : Math.max(activeUsers.length, Math.floor((activeUsersData?.total || 0) / 2));
    
  const remainingActive = Math.max(0, totalActive - activeUsers.length);
  let confidenceColor = "from-yellow-400 to-orange-500";
  if (qDaysCompleted >= 10 && storiesAnalyzed >= 10) {
     confidenceLevel = "Moderate Confidence";
     confidenceColor = "from-blue-400 to-indigo-500";
  }
  if (qDaysCompleted >= 20 && storiesAnalyzed >= 20) {
     confidenceLevel = "High Confidence";
     confidenceColor = "from-green-400 to-emerald-500";
  }

  const { data: personalityProfile } = useGetPersonalityProfile(
    { query: { enabled: true }, request: { headers: authHeaders() } } as any
  );
  const unifiedScores = (personalityProfile as any)?.finalUnifiedCategoryScores || {};

  const subMetrics = [
    { label: "Personal Growth", color: "bg-purple-500", progress: unifiedScores["Personal Growth"] || 0 },
    { label: "Health & Lifestyle", color: "bg-pink-500", progress: unifiedScores["Health & Lifestyle"] || 0 },
    { label: "Family Values", color: "bg-orange-500", progress: unifiedScores["Family Values"] || 0 },
    { label: "Communication Style", color: "bg-blue-500", progress: unifiedScores["Communication Style"] || 0 },
    { label: "Relationship Needs", color: "bg-green-500", progress: unifiedScores["Relationship Commitment"] || 0 },
  ].sort((a, b) => b.progress - a.progress);

  const factors = [
    "Personality traits & behavioral patterns",
    "Life goals & future aspirations",
    "Family background & core values",
    "Communication style & preferences",
    "Relationship needs & expectations",
    "Lifestyle choices & compatibility",
    "Emotional intelligence & empathy",
    "Conflict resolution approach",
  ];

  const matches = [...((matchesData as any)?.matches ?? [])].sort((a: any, b: any) => {
    const getScore = (m: any) => Number(m.compatibilityScore || m.profile?.valueMatchScore || m.profile?.compatibilityScore || 0);
    return getScore(b) - getScore(a);
  });
  const totalMatches = (matchesData as any)?.total ?? matches.length;
  const totalPages = Math.ceil(totalMatches / 5);
  const isLocked = false;

  const sendInterest = useSendInterest({ request: { headers: authHeaders() } });

  function handleSendInterest(userId: number) {
    setLocalSentInterests(prev => [...prev, userId]);
    sendInterest.mutate(
      { data: { toUserId: userId, message: undefined } },
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

  if (mandatoryCompletion.percentage < 100) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-20 text-center mt-12">
          <div className="bg-card border border-border shadow-md rounded-2xl rounded-[2rem] p-12 border border-white/10 relative overflow-hidden shadow-[0_10px_50px_rgba(236,72,153,0.1)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500" />
            <Lock className="w-16 h-16 text-pink-400 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl font-bold text-white mb-4">Complete your profile to unlock matching.</h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
              You need to complete all mandatory fields in your profile before you can access the Discover section, view matches, and get compatibility insights.
            </p>
            <Button className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-600 border-0 text-white rounded-xl shadow-lg hover:shadow-pink-500/25 transition-all" onClick={() => navigate('/profile')}>
              Complete Profile Now
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <div className="w-full max-w-md mx-auto pb-24 pt-4">
        {/* Top App Bar area */}
        <div className="px-4 mb-4">
          <h1 className="text-3xl font-bold text-foreground">Discover</h1>
        </div>

        <div className="flex flex-col gap-5">
          


          {/* 1. Match Discovery Header */}
          <div className="px-4">
            <div className="p-4 rounded-3xl bg-card border border-border relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
              <div className="flex flex-row items-center gap-3">
                <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="36" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                    <circle cx="40" cy="40" r="36" fill="transparent" stroke="url(#gradient)" strokeWidth="4" strokeDasharray="226.2" strokeDashoffset={226.2 - (226.2 * confidenceScore) / 100} className="transition-all duration-1000 ease-out" />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="w-14 h-14 rounded-full bg-foreground/5 border border-border flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(236,72,153,0.2)]">
                    {isLocked ? <Lock className="w-5 h-5 text-pink-400" /> : <Heart className="w-5 h-5 text-pink-400" />}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-pink-400 text-[13px] font-semibold mb-0.5">
                    Match Discovery
                  </div>
                  <h2 className="text-lg font-bold text-foreground mb-1 leading-tight truncate">
                    Your discovery is ready!
                  </h2>
                  <p className="text-muted-foreground text-[11px] leading-tight">
                    Our Hybrid Engine refines matches as you post stories & answer questions.
                  </p>
                </div>
              </div>
            </div>
          </div>



          {/* 2. Potential Matches */}
          <div className="px-4">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="w-5 h-5 text-yellow-400" />
              <h3 className="text-xl font-bold text-foreground">Unique Matches</h3>
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl bg-foreground/5" />)}
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-foreground/5 rounded-2xl border border-border">
                <p className="font-medium">No matches found yet. Try answering more questions!</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                {matches.slice((page - 1) * 5, page * 5).map((matchItem: any, localIdx: number) => {
                  const i = (page - 1) * 5 + localIdx;
                  const profile = matchItem.profile;
                  if (!profile) return null;
                  
                  const isBestPick = i === 0;
                  const tags = matchItem.commonTraits && matchItem.commonTraits.length > 0 ? matchItem.commonTraits : ["Mysterious"];

                  return (
                    <motion.div key={profile.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex flex-col gap-4 p-3 sm:p-4 rounded-2xl bg-card border border-border hover:border-foreground/20 transition-all shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2 sm:gap-3">
                        {/* LEFT: Avatar and Info */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0 bg-foreground/5 border border-border/50">
                            {isBestPick && (
                              <div className="absolute top-0 left-0 w-full bg-pink-500 text-[8px] sm:text-[9px] font-bold text-center py-0.5 z-10 text-white shadow-sm">
                                Best Pick
                              </div>
                            )}
                            {profile.photos?.[0] ? (
                              <img src={profile.photos[0].url} alt={profile.displayName || profile.firstName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 bg-pink-500/20 blur-[10px]" />
                            )}
                            {matchItem.isLocked && <Lock className="absolute inset-0 m-auto w-5 h-5 sm:w-6 sm:h-6 text-foreground/50" />}
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-card" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-foreground text-sm sm:text-lg mb-0.5 truncate pr-1 ${matchItem.isLocked ? 'filter blur-[4px] select-none' : ''}`}>
                              {profile.displayName || profile.firstName || "Hidden"}, {profile.age || 25}
                            </h4>
                            <p className={`text-[10px] sm:text-xs text-muted-foreground truncate ${matchItem.isLocked ? 'filter blur-[2px] select-none' : ''}`}>
                              {profile.city || 'Unknown City'}
                            </p>
                          </div>
                        </div>

                        {/* CENTER: Match Score */}
                        <div className="flex flex-col items-center justify-center shrink-0 px-1 w-[55px] sm:w-[60px]">
                          <span className="text-sm sm:text-base font-black text-pink-500 leading-none flex items-center gap-1 justify-center">
                            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-pink-500" />
                            {matchItem.compatibilityScore}%
                          </span>
                          <span className="text-[9px] text-muted-foreground font-bold uppercase mt-1 text-center">Match</span>
                        </div>

                        {/* RIGHT: Actions */}
                        <div className="flex flex-col gap-1.5 w-[80px] sm:w-[90px] shrink-0">
                          {matchItem.isLocked ? (
                            <Button variant="outline" size="sm" className="w-full text-[10px] h-7 border-pink-500/30 text-pink-400 hover:bg-pink-500/10 px-1" onClick={() => navigate('/pricing')}>
                              <Lock className="w-3 h-3 mr-1" /> Unlock
                            </Button>
                          ) : matchItem.isMutualInterest || profile.isMutualMatch ? (
                            <Button variant="outline" size="sm" className="w-full text-[10px] h-7 border-green-500/30 text-green-400 hover:bg-green-500/10 px-1" onClick={() => navigate(`/chat?userId=${profile.id}`)}>
                              <MessageCircle className="w-3 h-3 mr-1" /> Chat
                            </Button>
                          ) : (profile.interestSentByViewer || localSentInterests.includes(profile.id)) ? (
                            <Button variant="outline" disabled size="sm" className="w-full text-[10px] h-7 border-border text-muted-foreground bg-foreground/5 px-1">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Sent
                            </Button>
                          ) : profile.hasPendingInterest ? (
                            <Button variant="outline" size="sm" className="w-full text-[10px] h-7 border-green-500/30 text-green-400 hover:bg-green-500/10 px-1" onClick={() => navigate(`/profile/${profile.id}`)}>
                              <HeartHandshake className="w-3 h-3 mr-1" /> Respond
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" className="w-full text-[10px] h-7 border-pink-500/30 text-pink-400 hover:bg-pink-500/10 bg-transparent px-1" onClick={() => handleSendInterest(profile.id)}>
                              <Heart className="w-3 h-3 mr-1" /> Connect
                            </Button>
                          )}
                          <Button size="sm" className="w-full text-[10px] h-7 bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 px-1" onClick={() => navigate(`/profile/${profile.id}`)}>
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4 bg-card p-2 rounded-xl border border-border">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="text-xs text-foreground"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                    </Button>
                    <span className="text-xs text-muted-foreground font-medium">
                      Page {page} of {totalPages}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="text-xs text-foreground"
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </div>          {/* Premium Upsell */}
          {!user?.isPremium && (
            <div className="px-4">
              <div className="p-6 rounded-2xl bg-pink-500/5 border border-pink-500/20 text-center relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-[30px]" />
                <Crown className="w-8 h-8 text-pink-400 mx-auto mb-3" />
                <h3 className="font-bold text-foreground text-lg mb-1">Preview Matches</h3>
                <p className="text-xs text-muted-foreground mb-5">
                  You have {totalMatches} potential matches waiting! Upgrade to Premium to preview match insights early.
                </p>
                <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 border-0 text-white font-bold h-12 rounded-xl" onClick={() => navigate('/pricing')}>
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}

          {/* Invite Your Friends */}
          <div className="px-4">
            <div className="p-6 rounded-[2rem] bg-purple-500/5 border border-purple-500/20 flex flex-col gap-4 overflow-hidden relative text-center">

              <div className="relative z-10">
                <h3 className="font-bold text-foreground text-xl mb-1">Invite Your Friends</h3>
                <p className="text-muted-foreground text-xs">More friends, more matches!</p>
              </div>
              <Button 
                variant="outline" 
                className="relative z-10 w-full border-purple-500/50 text-purple-500 bg-purple-500/10 hover:bg-purple-500/20 h-12 rounded-xl font-bold"
                onClick={handleInviteClick}
              >
                Invite Now
              </Button>
            </div>
          </div>

        </div>

        {/* Pagination below everything if unlocked */}
        {!isLocked && !isLoading && matches?.length > 12 && (
          <div className="flex justify-center gap-2 mt-8 px-4">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="border-border bg-foreground/5 flex-1 h-12 rounded-xl">Previous</Button>
            <Button variant="outline" disabled={true} onClick={() => setPage(p => p + 1)} className="border-border bg-foreground/5 flex-1 h-12 rounded-xl">Next</Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

