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
  let confidenceColor = "from-yellow-400 to-[#F6A8B7]";
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
    { label: "Personal Growth", color: "bg-[#F6A8B7]", progress: unifiedScores["Personal Growth"] || 0 },
    { label: "Health & Lifestyle", color: "bg-[#F6A8B7]", progress: unifiedScores["Health & Lifestyle"] || 0 },
    { label: "Family Values", color: "bg-[#F6A8B7]", progress: unifiedScores["Family Values"] || 0 },
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

  const matches = [...((matchesData as any)?.matches ?? [])]
    .filter((m: any) => {
      const score = Number(m.compatibilityScore || m.profile?.valueMatchScore || m.profile?.compatibilityScore || 0);
      return score > 0;
    })
    .sort((a: any, b: any) => {
      const getScore = (m: any) => Number(m.compatibilityScore || m.profile?.valueMatchScore || m.profile?.compatibilityScore || 0);
      return getScore(b) - getScore(a);
    });
  const totalMatches = matches.length;
  const totalPages = Math.max(1, Math.ceil(totalMatches / 5));
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
        <div 
          className="w-full min-h-screen flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 40%, #F4F1FF 75%, #FFFDFC 100%)' }}
        >
          <div className="w-full max-w-md mx-auto px-4">
             <style>{`
               .premium-glass-card {
                 background: rgba(255, 255, 255, 0.48) !important;
                 backdrop-filter: blur(28px) !important;
                 -webkit-backdrop-filter: blur(28px) !important;
                 border: 1px solid rgba(255, 255, 255, 0.35) !important;
                 box-shadow: 0 12px 35px rgba(80, 80, 80, 0.08) !important;
               }
               .premium-pastel-button {
                 background: linear-gradient(135deg, #F8C7C8, #F8D9D2, #F7E8EE) !important;
                 color: #2A2A2A !important;
                 box-shadow: 0 4px 12px rgba(246, 168, 183, 0.15) !important;
                 border: 1px solid rgba(255, 255, 255, 0.40) !important;
               }
             `}</style>
             <div className="premium-glass-card rounded-[28px] p-6 text-center border border-white/20">
               <div className="w-16 h-16 bg-[#F6A8B7]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Lock className="w-7 h-7 text-[#F6A8B7]" strokeWidth={1.5} />
               </div>
               <h2 className="text-[20px] font-bold text-[#252525] mb-2">Complete Profile</h2>
               <p className="text-[#6F6F6F] text-[14px] mb-6 max-w-xs mx-auto leading-relaxed">
                 Complete all mandatory fields in your profile before you can access the Discover section and view compatible matches.
               </p>
               <Button className="w-full h-[52px] text-[16px] font-bold premium-pastel-button rounded-full" onClick={() => navigate('/profile')}>
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
        className="w-full min-h-screen"
        style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 40%, #F4F1FF 75%, #FFFDFC 100%)' }}
      >
        <div className="w-full max-w-md mx-auto px-4 pt-12 pb-6 space-y-[20px] flex flex-col">
          <style>{`
            .premium-glass-card {
              background: rgba(255, 255, 255, 0.48) !important;
              backdrop-filter: blur(28px) !important;
              -webkit-backdrop-filter: blur(28px) !important;
              border: 1px solid rgba(255, 255, 255, 0.35) !important;
              box-shadow: 0 12px 35px rgba(80, 80, 80, 0.08) !important;
            }
            .premium-pastel-button {
              background: linear-gradient(135deg, #F8C7C8, #F8D9D2, #F7E8EE) !important;
              color: #2A2A2A !important;
              box-shadow: 0 4px 12px rgba(246, 168, 183, 0.15) !important;
              border: 1px solid rgba(255, 255, 255, 0.40) !important;
            }
            .premium-pastel-button:hover {
              opacity: 0.95;
            }
            .no-scrollbar::-webkit-scrollbar {
               display: none;
            }
            .no-scrollbar {
               -ms-overflow-style: none;
               scrollbar-width: none;
            }
          `}</style>

          {/* Page Header */}
          <div className="flex flex-col">
            <h1 className="text-[28px] font-bold text-[#252525] leading-none">Discover</h1>
          </div>

          {/* 1. Match Discovery Header Card */}
          <div className="premium-glass-card p-4 rounded-[28px] relative overflow-hidden shrink-0">
             <div className="absolute inset-0 bg-gradient-to-r from-[#FAF1ED]/30 via-[#F4F1FF]/20 to-[#FFFDFC]/15 pointer-events-none" />
             <div className="flex items-center gap-3 relative z-10">
                <div className="relative w-[76px] h-[76px] flex-shrink-0 flex items-center justify-center">
                   <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <defs>
                         <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#F6A8B7" />
                            <stop offset="100%" stopColor="#F8C3C6" />
                         </linearGradient>
                      </defs>
                      <circle cx="38" cy="38" r="32" fill="transparent" stroke="rgba(246,168,183,0.15)" strokeWidth="5.5" />
                      <circle cx="38" cy="38" r="32" fill="transparent" stroke="url(#gradient)" strokeWidth="5.5" strokeDasharray="201" strokeDashoffset={201 - (201 * confidenceScore) / 100} className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                   </svg>
                   <div className="w-12 h-12 rounded-full bg-[#F6A8B7]/10 flex items-center justify-center backdrop-blur-md shadow-sm">
                      {isLocked ? <Lock className="w-5 h-5 text-[#F6A8B7]" strokeWidth={1.5} /> : <Heart className="w-5 h-5 text-[#F6A8B7]" strokeWidth={1.5} />}
                   </div>
                </div>
                
                <div className="flex-1 min-w-0">
                   <div className="text-[#F6A8B7] text-[13px] font-bold mb-0.5 uppercase tracking-wide">
                      Match Discovery
                   </div>
                   <h2 className="text-[18px] font-bold text-[#252525] leading-tight truncate">
                      Your discovery is ready!
                   </h2>
                   <p className="text-[#6F6F6F] text-[13px] leading-snug mt-1">
                      Our Hybrid Engine refines matches as you post stories & answer questions.
                   </p>
                </div>
             </div>
          </div>

          {/* 2. Unique Matches Section */}
          <div className="space-y-3">
             <div className="flex items-center gap-2 mb-1">
                <Compass className="w-5 h-5 text-[#F6A8B7]" strokeWidth={1.5} />
                <h3 className="text-[20px] font-bold text-[#252525]">Unique Matches</h3>
             </div>

             {isLoading ? (
                <div className="flex flex-col gap-4">
                   {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-[28px] bg-white/20 border border-white/10" />)}
                </div>
             ) : matches.length === 0 ? (
                <div className="premium-glass-card p-6 text-center flex flex-col items-center justify-center min-h-[200px] rounded-[28px]">
                   <div className="w-14 h-14 bg-[#F6A8B7]/10 rounded-full flex items-center justify-center mb-3">
                      <Compass className="w-7 h-7 text-[#F6A8B7]" strokeWidth={1.5} />
                   </div>
                   <h4 className="text-[16px] font-bold text-[#252525] mb-1">No matches found</h4>
                   <p className="text-[13px] text-[#6F6F6F] max-w-[260px] mx-auto leading-normal">
                      Try answering more questions!
                   </p>
                </div>
             ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                   {matches.slice((page - 1) * 5, page * 5).map((matchItem: any, localIdx: number) => {
                      const i = (page - 1) * 5 + localIdx;
                      const profile = matchItem.profile;
                      if (!profile) return null;
                      
                      const isBestPick = i === 0;
                      return (
                        <motion.div 
                          key={profile.id} 
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          transition={{ delay: localIdx * 0.05 }}
                          className="premium-glass-card p-4 rounded-[28px] relative overflow-hidden flex flex-col gap-3.5"
                        >
                           <div className="flex items-center justify-between gap-3">
                              {/* Left avatar and info */}
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                 <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-white/30 border border-white/40">
                                    {isBestPick && (
                                      <div className="absolute top-0 left-0 w-full w-full text-[#252525] rounded-full border border-white/40 transition-all text-[8px] font-bold text-center py-0.5 z-10  shadow-sm uppercase tracking-wider" style={{ background: 'linear-gradient(135deg, #F8C7C8, #F8D9D2, #F7E8EE)', boxShadow: '0 4px 12px rgba(246, 168, 183, 0.15)' }}>
                                         Best Pick
                                      </div>
                                    )}
                                    {profile.photos?.[0] ? (
                                      <img src={profile.photos[0].url} alt={profile.displayName || profile.firstName} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="absolute inset-0 bg-[#F6A8B7]/10" />
                                    )}
                                    {matchItem.isLocked && <Lock className="absolute inset-0 m-auto w-5 h-5 text-[#252525]/60" strokeWidth={1.5} />}
                                    <div className="absolute bottom-0 right-0 w-3 bg-green-400 rounded-full border-2 border-white/60" />
                                 </div>
                                 
                                 <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold text-[#252525] text-[16px] mb-0.5 truncate pr-1 ${matchItem.isLocked ? 'filter blur-[4px] select-none' : ''}`}>
                                       {profile.displayName || profile.firstName || "Hidden"}, {profile.age || 25}
                                    </h4>
                                    <p className={`text-[13px] text-[#6F6F6F] truncate ${matchItem.isLocked ? 'filter blur-[2px] select-none' : ''}`}>
                                       {profile.city || 'Unknown City'}
                                    </p>
                                 </div>
                              </div>

                              {/* Center score */}
                              <div className="flex flex-col items-center justify-center shrink-0 w-[55px]">
                                 <span className="text-[15px] font-black text-[#F6A8B7] leading-none flex items-center gap-0.5 justify-center">
                                    <Heart className="w-3.5 h-3.5 fill-[#F6A8B7] stroke-[#F6A8B7]" strokeWidth={1.5} />
                                    {matchItem.compatibilityScore}%
                                 </span>
                                 <span className="text-[9px] text-[#777777] font-bold uppercase mt-1 text-center select-none">Match</span>
                              </div>

                              {/* Right Actions */}
                              <div className="flex flex-col gap-1.5 w-[92px] shrink-0">
                                 {matchItem.isLocked ? (
                                   <Button size="sm" className="w-full text-[10px] h-[25px] premium-pastel-button border-0 rounded-[8px] px-2 flex justify-center items-center shadow-[0_2px_8px_rgba(246,168,183,0.15)]" onClick={() => navigate('/pricing')}>
                                      <Lock className="w-3 h-3 mr-1" strokeWidth={2} /> Unlock
                                   </Button>
                                 ) : matchItem.isMutualInterest || profile.isMutualMatch ? (
                                   <Button size="sm" className="w-full text-[10px] h-[25px] premium-pastel-button border-0 rounded-[8px] px-2 flex justify-center items-center shadow-[0_2px_8px_rgba(246,168,183,0.15)]" onClick={() => navigate(`/chat?userId=${profile.id}`)}>
                                      <MessageCircle className="w-3 h-3 mr-1" strokeWidth={2} /> Chat
                                   </Button>
                                 ) : (profile.interestSentByViewer || localSentInterests.includes(profile.id)) ? (
                                   <div className="w-full text-[10px] h-[25px] bg-green-500/15 text-green-700 border border-green-500/30 rounded-[8px] px-2 flex justify-center items-center shadow-none font-bold select-none cursor-default">
                                      <CheckCircle2 className="w-3 h-3 mr-1" strokeWidth={2.5} /> Sent
                                   </div>
                                 ) : profile.hasPendingInterest ? (
                                   <Button size="sm" className="w-full text-[10px] h-[25px] premium-pastel-button border-0 rounded-[8px] px-2 flex justify-center items-center shadow-[0_2px_8px_rgba(246,168,183,0.15)]" onClick={() => navigate(`/profile/${profile.id}`)}>
                                      <HeartHandshake className="w-3 h-3 mr-1" strokeWidth={2} /> Respond
                                   </Button>
                                 ) : (
                                   <Button size="sm" className="w-full text-[10px] h-[25px] premium-pastel-button border-0 rounded-[8px] px-2 flex justify-center items-center shadow-[0_2px_8px_rgba(246,168,183,0.15)]" onClick={() => handleSendInterest(profile.id)}>
                                      <Heart className="w-3 h-3 mr-1" strokeWidth={2} /> Connect
                                   </Button>
                                 )}
                                 <Button size="sm" className="w-full text-[10px] h-[25px] bg-white/80 border border-[#F6A8B7]/40 text-[#252525] hover:bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-[8px] px-2 flex justify-center items-center font-semibold" onClick={() => navigate(`/profile/${profile.id}`)}>
                                    View Profile
                                 </Button>
                              </div>
                           </div>
                        </motion.div>
                      );
                   })}

                   {/* Pagination Controls */}
                   {totalPages > 1 && (
                      <div className="flex justify-between items-center mt-2 premium-glass-card p-2 rounded-2xl border border-white/20">
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           onClick={() => setPage(p => Math.max(1, p - 1))}
                           disabled={page === 1}
                           className="text-xs text-[#252525] rounded-full hover:bg-white/20"
                         >
                            <ChevronLeft className="w-4 h-4 mr-1" strokeWidth={1.5} /> Prev
                         </Button>
                         <span className="text-xs text-[#6F6F6F] font-bold">
                            Page {page} of {totalPages}
                         </span>
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                           disabled={page === totalPages}
                           className="text-xs text-[#252525] rounded-full hover:bg-white/20"
                         >
                            Next <ChevronRight className="w-4 h-4 ml-1" strokeWidth={1.5} />
                         </Button>
                      </div>
                   )}
                </motion.div>
             )}
          </div>

          {/* Premium Upsell Card */}
          {!user?.isPremium && (
            <div className="premium-glass-card p-6 rounded-[28px] text-center relative overflow-hidden shrink-0">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#F6A8B7]/10 rounded-full blur-[30px]" />
               <Crown className="w-8 h-8 text-[#F6A8B7] mx-auto mb-3" strokeWidth={1.5} />
               <h3 className="font-bold text-[#252525] text-[18px] mb-1">Preview Matches</h3>
               <p className="text-[14px] text-[#6F6F6F] mb-5 leading-normal">
                  You have {totalMatches} potential matches waiting! Upgrade to Premium to preview match insights early.
               </p>
               <Button className="w-full premium-pastel-button font-bold h-[52px] rounded-full" onClick={() => navigate('/pricing')}>
                  Upgrade Now
               </Button>
            </div>
          )}

          {/* Invite Your Friends Card */}
          <div className="premium-glass-card p-6 rounded-[28px] text-center relative overflow-hidden shrink-0">
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#EADCF8]/10 rounded-full blur-[30px]" />
             <UserPlus className="w-8 h-8 text-[#F6A8B7] mx-auto mb-3" strokeWidth={1.5} />
             <h3 className="font-bold text-[#252525] text-[18px] mb-1">Invite Your Friends</h3>
             <p className="text-[14px] text-[#6F6F6F] mb-5 leading-normal">
                More friends, more matches!
             </p>
             <Button 
                className="w-full premium-pastel-button font-bold h-[52px] rounded-full"
                onClick={handleInviteClick}
             >
                Invite Now
             </Button>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}

