import { API_URL } from "../config/api";
import { motion } from "framer-motion";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Star,
  Flag,
  ChevronLeft,
  MessageCircle,
  MessageSquare,
  Check,
  X,
  Book,
  Activity,
  Flame,
  Users,
  Shield,
  TrendingUp,
  Compass,
  Home,
  Target,
  HeartPulse,
  Globe,
  Map,
  Brain,
  BookOpen,
  User,
  Lock,
  Hash,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AppLayout } from "@/components/layout/AppLayout";
import { getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  useGetUserProfile,
  useSendInterest,
  useCreateReport,
  useBlockUser,
  useRespondToInterest,
  useGetCompatibility,
} from "@workspace/api-client-react";
import { getAccessToken, useAuth } from "@/lib/auth-context";
import { useState } from "react";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

interface Props {
  userId: string;
}

export default function UserProfilePage({ userId }: Props) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [interestSent, setInterestSent] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const { data: profile, isLoading } = useGetUserProfile(parseInt(userId), {
    query: { enabled: !!userId },
    request: { headers: authHeaders() },
  } as any);

  const { data: compatibilityData, isLoading: compLoading } = useGetCompatibility(parseInt(userId), {
    query: { enabled: !!userId },
    request: { headers: authHeaders() },
  } as any);

  const sendInterest = useSendInterest({ request: { headers: authHeaders() } });
  const respondInterest = useRespondToInterest({ request: { headers: authHeaders() } });
  const report = useCreateReport({ request: { headers: authHeaders() } });
  const block = useBlockUser({ request: { headers: authHeaders() } });

  const p = (profile as any) ?? null;
  const photo = p?.photos?.find((ph: any) => ph.isPrimary) ?? p?.photos?.[0] ?? null;
  const isInterestSent = interestSent || !!p?.interestSentByViewer;
  const { user } = useAuth();

  // Safe data extraction with fallbacks
  const cd = (compatibilityData as any) ?? {};
  const compatScore = typeof cd.compatibilityScore === 'number' ? cd.compatibilityScore : 0;
  const personalityMatch = typeof cd.personalityMatch === 'number' ? cd.personalityMatch : 0;
  const aiStoryMatch = typeof cd.aiStoryMatch === 'number' ? cd.aiStoryMatch : 0;
  const hasStories = !!cd.hasStories;
  const pConfidence = cd.pConfidence ?? null;
  const sConfidence = cd.sConfidenceData ?? null;
  const focusAreas: any[] = Array.isArray(cd.focusAreas) ? cd.focusAreas : [];
  const traitBreakdowns: any[] = Array.isArray(cd.traitBreakdowns) ? cd.traitBreakdowns : [];
  const storyBreakdowns: any[] = Array.isArray(cd.storyBreakdowns) ? cd.storyBreakdowns : [];

  const isPremium = user?.role === 'premium' || user?.role === 'admin';

  const getMatchQuality = (score: number) =>
    score >= 80 ? 'Excellent Match' : score >= 60 ? 'Good Match' : 'Fair Match';
  const getMatchColor = (score: number) =>
    score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-[#F6A8B7]';

  const getStoryIcon = (name: string) => {
    const map: Record<string, React.ReactNode> = {
      "Family Values": <Home className="w-4 h-4 text-[#707070]" />,
      "Career Focus": <Briefcase className="w-4 h-4 text-[#707070]" />,
      "Personal Growth": <Target className="w-4 h-4 text-[#707070]" />,
      "Health & Lifestyle": <HeartPulse className="w-4 h-4 text-[#707070]" />,
      "Social Engagement": <Globe className="w-4 h-4 text-[#707070]" />,
      "Adventure & Travel": <Map className="w-4 h-4 text-[#707070]" />,
      "Emotional Wellbeing": <Lightbulb className="w-4 h-4 text-[#707070]" />,
      "Relationship Commitment": <Heart className="w-4 h-4 text-[#707070]" />,
      "Communication Style": <MessageCircle className="w-4 h-4 text-[#707070]" />,
      "Kindness & Empathy": <Star className="w-4 h-4 text-[#707070]" />,
    };
    return map[name] ?? <BookOpen className="w-4 h-4 text-[#707070]" />;
  };

  const getInterestIcon = (name: string) => {
    const n = (name ?? '').toLowerCase();
    if (n.includes('read') || n.includes('book')) return Book;
    if (n.includes('travel') || n.includes('trip') || n.includes('adventure')) return Globe;
    if (n.includes('fit') || n.includes('gym') || n.includes('sport') || n.includes('workout')) return Activity;
    if (n.includes('music') || n.includes('song') || n.includes('concert')) return HeartPulse;
    if (n.includes('photo') || n.includes('camera')) return Target;
    if (n.includes('coffee') || n.includes('food') || n.includes('cook')) return Flame;
    if (n.includes('film') || n.includes('movie')) return Star;
    if (n.includes('hik') || n.includes('outdoor') || n.includes('nature')) return Compass;
    if (n.includes('family') || n.includes('relation')) return Home;
    if (n.includes('career') || n.includes('ambition')) return TrendingUp;
    if (n.includes('social') || n.includes('community')) return Users;
    if (n.includes('growth') || n.includes('mindful') || n.includes('wellness')) return Brain;
    if (n.includes('communication')) return MessageSquare;
    return Hash;
  };

  function handleSendInterest() {
    sendInterest.mutate(
      { data: { toUserId: parseInt(userId) } },
      {
        onSuccess: () => { setInterestSent(true); toast({ title: "Interest sent!" }); },
        onError: (err: any) => toast({ title: "Error", description: err?.message, variant: "destructive" }),
      },
    );
  }

  function handleRespond(status: "accepted" | "rejected") {
    const action = status === "accepted" ? "accept" : "decline";
    respondInterest.mutate(
      { interestId: parseInt(userId), data: { action } },
      {
        onSuccess: () => { toast({ title: `Interest ${status}` }); },
        onError: (err: any) => toast({ title: "Error", description: err?.message, variant: "destructive" }),
      },
    );
  }

  function handleReport() {
    report.mutate(
      { data: { reportedUserId: parseInt(userId), reason: "other", description: "Reported from profile page" } },
      {
        onSuccess: () => toast({ title: "Report submitted. Thank you." }),
        onError: (err: any) => toast({ title: "Error", description: err?.message, variant: "destructive" }),
      },
    );
  }

  function handleBlock() {
    block.mutate(
      { data: { userId: parseInt(userId) } },
      {
        onSuccess: () => { toast({ title: "User blocked" }); navigate("/discover"); },
        onError: (err: any) => toast({ title: "Error", description: err?.message, variant: "destructive" }),
      },
    );
  }

  async function handleChat() {
    setChatLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/chat/direct`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ toUserId: parseInt(userId) }),
      });
      if (!res.ok) throw new Error("Failed to start chat");
      const d = await res.json();
      navigate(`/chat/${d.id}`);
    } catch (err: any) {
      toast({ title: "Error", description: err?.message, variant: "destructive" });
    } finally {
      setChatLoading(false);
    }
  }

  // Interests data (premium)
  const sharedInts: string[] = Array.isArray(cd?.sharedInterests) ? cd.sharedInterests : [];
  const myUnique: string[] = Array.isArray(cd?.myUniqueInterests) ? cd.myUniqueInterests : [];
  const theirUnique: string[] = Array.isArray(cd?.theirUniqueInterests) ? cd.theirUniqueInterests : [];
  const interestPct: number = typeof cd?.interestMatchPct === 'number' ? cd.interestMatchPct : 0;
  const myTotal: number = Array.isArray(cd?.myInterests) ? cd.myInterests.length : 0;
  const theirTotal: number = Array.isArray(cd?.theirInterests) ? cd.theirInterests.length : 0;
  const hasInterestData = myTotal > 0 || theirTotal > 0;

  const activityMap: Record<string, { label: string; emoji: string }> = {
    reading: { label: "Book café visits", emoji: "📚" },
    travel: { label: "Weekend getaways", emoji: "✈️" },
    fitness: { label: "Morning workouts", emoji: "🏋️" },
    gym: { label: "Gym sessions", emoji: "🧘" },
    coffee: { label: "Café dates", emoji: "☕" },
    photography: { label: "Photography outings", emoji: "📸" },
    music: { label: "Live music events", emoji: "🎵" },
    hiking: { label: "Nature hikes", emoji: "🏔️" },
    cooking: { label: "Cook together", emoji: "🍳" },
    movies: { label: "Movie nights", emoji: "🎬" },
  };
  const suggestedActivities = sharedInts
    .map(i => {
      const key = Object.keys(activityMap).find(k => (i ?? '').toLowerCase().includes(k));
      return key ? activityMap[key] : null;
    })
    .filter(Boolean)
    .slice(0, 3) as { label: string; emoji: string }[];

  const interestBarColor = interestPct >= 60 ? "bg-green-500" : interestPct >= 30 ? "bg-yellow-500" : "bg-[#F6A8B7]";
  const interestMatchColor = interestPct >= 60 ? "text-green-400" : interestPct >= 30 ? "text-yellow-400" : "text-[#F6A8B7]";

  // Confidence progress
  const confAnalyzed = sConfidence?.categoriesAnalyzed ?? 0;
  const confTotal = sConfidence?.totalCategories ?? 1;
  const confPct = Math.round((confAnalyzed / confTotal) * 100);
  const valuesComplete = hasStories && confAnalyzed === confTotal;

  return (
    <AppLayout>
      <div className="max-w-md mx-auto px-4 py-6 pb-28">

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-56 rounded-3xl bg-card" />
            <Skeleton className="h-32 rounded-3xl bg-card" />
            <Skeleton className="h-20 rounded-3xl bg-card" />
          </div>
        ) : !p ? (
          <div className="text-center py-20 text-[#707070]">Profile not found</div>
        ) : (
          <div className="space-y-4">

            {/* ── Hero Card ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-3xl overflow-hidden"
            >
              {/* Photo Banner */}
              <div className="relative h-52 bg-gradient-to-br from-[#F6A8B7]/20 via-[#F6A8B7]/10 to-blue-500/20">
                {photo?.url ? (
                  <img src={photo.url} alt={p.firstName ?? ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl font-extrabold text-[#707070]/30">
                      {getInitials(p.firstName ?? '?')}
                    </span>
                  </div>
                )}
                {!!p.compatibilityScore && (
                  <div className="absolute top-3 right-3">
                    <div className="w-full text-[#252525] rounded-full border border-white/40 transition-all  text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg" style={{ background: 'linear-gradient(135deg, #F8C7C8, #F8D9D2, #F7E8EE)', boxShadow: '0 4px 12px rgba(246, 168, 183, 0.15)' }}>
                      {p.compatibilityScore}% match
                    </div>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />
              </div>

              {/* Info */}
              <div className="px-4 pb-4 pt-2">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h1 className="text-xl font-extrabold text-[#252525] leading-tight">
                      {p.firstName ?? ''}{p.age ? `, ${p.age}` : ''}
                    </h1>
                    {(p.city || p.country) && (
                      <div className="flex items-center gap-1 text-[#707070] text-xs mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {[p.city, p.country].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border border-border bg-transparent hover:bg-muted text-[#707070] w-9 h-9 p-0 rounded-xl shrink-0"
                    onClick={handleReport}
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Pills */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-transparent border border-border rounded-full px-2.5 py-1 text-[11px] font-medium text-[#707070]">
                    <Flame className="w-3 h-3 text-[#F6A8B7]" /> {p.journeyProgress ?? 0} Steps
                  </div>
                  <div className="flex items-center gap-1.5 bg-transparent border border-border rounded-full px-2.5 py-1 text-[11px] font-medium text-[#707070]">
                    <BookOpen className="w-3 h-3 text-[#F6A8B7]" /> {p.storyCount ?? 0} Stories
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-1 text-[11px] font-medium text-green-400">
                    <Shield className="w-3 h-3" /> Verified
                  </div>
                  {personalityMatch > 80 && (
                    <div className="flex items-center gap-1.5 bg-[#F6A8B7]/10 border border-[#F6A8B7]/20 rounded-full px-2.5 py-1 text-[11px] font-medium text-[#F6A8B7]">
                      <Heart className="w-3 h-3" /> High Match
                    </div>
                  )}
                </div>

                {!!p.bio && (
                  <p className="text-sm text-[#707070] leading-relaxed mb-4">{p.bio}</p>
                )}

                {(p.occupation || p.education) && (
                  <div className="flex flex-wrap gap-3 mb-4 text-xs text-[#707070]">
                    {p.occupation && <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{p.occupation}</span>}
                    {p.education && <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" />{p.education}</span>}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {!p.isMutualMatch && p.hasPendingInterest && !p.interestSentByViewer ? (
                    <>
                      <Button
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white border-0 font-bold rounded-xl h-11"
                        onClick={() => handleRespond('accepted')}
                        disabled={respondInterest.isPending}
                      >
                        <Check className="w-4 h-4 mr-1.5" /> Accept
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-border hover:bg-red-500/10 hover:text-red-400 rounded-xl h-11"
                        onClick={() => handleRespond('rejected')}
                        disabled={respondInterest.isPending}
                      >
                        <X className="w-4 h-4 mr-1.5" /> Decline
                      </Button>
                    </>
                  ) : p.isMutualMatch ? (
                    <Button
                      className="flex-1 gradient-coral-pill text-white border-0 font-bold rounded-xl h-11 transition-transform active:scale-[0.98]"
                      onClick={handleChat}
                      disabled={chatLoading}
                    >
                      <MessageCircle className="w-4 h-4 mr-1.5" /> Chat Now
                    </Button>
                  ) : (
                    <Button
                      className={`flex-1 h-11 font-bold rounded-xl ${isInterestSent ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-gradient-to-r from-[#F8C7C8] via-[#F8D9D2] to-[#F7E8EE] text-white border-0'}`}
                      onClick={handleSendInterest}
                      disabled={isInterestSent || sendInterest.isPending}
                    >
                      <Heart className="w-4 h-4 mr-1.5" />
                      {isInterestSent ? 'Interest Sent' : 'Send Interest'}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* ── Shared Interests (Premium only) ── */}
            {isPremium && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#F6A8B7]/10 flex items-center justify-center">
                      <Star className="w-3.5 h-3.5 text-[#F6A8B7]" />
                    </div>
                    <h2 className="font-bold text-[#252525] text-sm">Shared Interests</h2>
                  </div>
                  {hasInterestData && (
                    <span className={`text-base font-extrabold ${interestMatchColor}`}>{interestPct}%</span>
                  )}
                </div>

                {!hasInterestData ? (
                  <p className="text-center py-4 text-xs text-[#707070] italic">
                    Keep sharing stories to uncover common interests.
                  </p>
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="h-1.5 bg-border/50 rounded-full overflow-hidden">
                        <div className={`h-full ${interestBarColor} rounded-full`} style={{ width: `${interestPct}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#707070] mt-1">
                        <span>{sharedInts.length} shared</span>
                        <span>Mine: {myTotal} · Theirs: {theirTotal}</span>
                      </div>
                    </div>

                    {sharedInts.length > 0 && (
                      <div className="mb-4">
                        <div className="text-[10px] text-[#707070] font-bold uppercase mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> In Common
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {sharedInts.map((interest, i) => {
                            const Icon = getInterestIcon(interest);
                            return (
                              <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[11px] text-green-400 font-medium">
                                <Icon className="w-2.5 h-2.5" />{interest}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {(myUnique.length > 0 || theirUnique.length > 0) && (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <div className="text-[10px] text-[#707070] font-bold mb-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F6A8B7] inline-block" /> Yours only
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {myUnique.slice(0, 3).map((item, i) => {
                              const Icon = getInterestIcon(item);
                              return (
                                <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F6A8B7]/10 border border-[#F6A8B7]/20 text-[10px] text-[#F6A8B7] font-medium">
                                  <Icon className="w-2.5 h-2.5" />{item}
                                </span>
                              );
                            })}
                            {myUnique.length > 3 && <span className="text-[9px] text-[#707070] self-center">+{myUnique.length - 3}</span>}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#707070] font-bold mb-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /> Theirs only
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {theirUnique.slice(0, 3).map((item, i) => {
                              const Icon = getInterestIcon(item);
                              return (
                                <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 font-medium">
                                  <Icon className="w-2.5 h-2.5" />{item}
                                </span>
                              );
                            })}
                            {theirUnique.length > 3 && <span className="text-[9px] text-[#707070] self-center">+{theirUnique.length - 3}</span>}
                          </div>
                        </div>
                      </div>
                    )}

                    {suggestedActivities.length > 0 && (
                      <div className="pt-3 border-t border-border">
                        <div className="text-[10px] text-[#707070] font-bold uppercase mb-2">Suggested Together</div>
                        <div className="flex flex-wrap gap-2">
                          {suggestedActivities.map((act, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-full bg-transparent border border-border text-[11px] text-[#707070] font-medium">
                              {act.emoji} {act.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* ── Strengthen Match (Premium only) ── */}
            {isPremium && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="bg-card border border-border rounded-3xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
                  </div>
                  <h3 className="font-bold text-[#252525] text-sm">Strengthen This Match</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: <Users className="w-3.5 h-3.5 text-[#F6A8B7]" />, title: "Discuss family values", desc: "Shared expectations build a deeper foundation." },
                    { icon: <Briefcase className="w-3.5 h-3.5 text-[#F6A8B7]" />, title: "Share career goals", desc: "Knowing your ambitions helps you support each other." },
                    { icon: <Home className="w-3.5 h-3.5 text-blue-500" />, title: "Talk about your routine", desc: "Similar lifestyles lead to better harmony." },
                    { icon: <MessageCircle className="w-3.5 h-3.5 text-[#F6A8B7]" />, title: "Keep the conversation going", desc: "The more you talk, the stronger the bond." },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-transparent border border-border flex items-center justify-center shrink-0 mt-0.5">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#252525]">{item.title}</div>
                        <div className="text-[11px] text-[#707070]">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Profile Comparison Header ── */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-extrabold text-[#252525]">Profile Comparison</h2>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] border-border text-[#707070] rounded-full shrink-0">
                    How it works? <HelpCircle className="w-3 h-3 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-4 bg-card border-border shadow-xl">
                  <h4 className="font-bold text-sm mb-2">How Match Works</h4>
                  <ul className="text-xs text-[#707070] space-y-1 list-disc pl-4">
                    <li>Stories & Daily Reflections</li>
                    <li>Personality Journey answers</li>
                    <li>Lifestyle & Relationship Preferences</li>
                  </ul>
                </PopoverContent>
              </Popover>
            </div>

            {/* ── Compatibility Circle ── */}
            {compLoading ? (
              <div className="h-48 bg-card rounded-3xl animate-pulse border border-border" />
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-3xl p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2 sm:gap-4 mb-5 flex-nowrap w-full overflow-hidden">
                  {/* You */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 border-[#F6A8B7] bg-[#F6A8B7]/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-[#F6A8B7]">You</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-[#252525] mt-1">You</span>
                  </div>

                  {/* Connecting line left */}
                  <div className="flex-1 h-[2px] bg-gradient-to-r from-[#F8C7C8] via-[#F8D9D2] to-[#F7E8EE] min-w-[8px] opacity-40 shrink" />

                  {/* Score Ring */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3px] border-l-[#F6A8B7] border-t-[#F6A8B7] border-r-blue-500 border-b-blue-500 flex flex-col items-center justify-center bg-card shadow-sm">
                      <Heart className="w-3 h-3 text-[#F6A8B7]/80 mb-0.5" />
                      <div className="text-xl sm:text-2xl font-extrabold text-[#252525] leading-none">
                        {compatScore}%
                      </div>
                      <div className="text-[7px] sm:text-[8px] uppercase tracking-wider text-[#707070]">Match</div>
                    </div>
                    <span className="mt-1.5 bg-transparent border border-border text-yellow-500 text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0">
                      {!hasStories ? 'Pending' : getMatchQuality(compatScore)}
                    </span>
                  </div>

                  {/* Connecting line right */}
                  <div className="flex-1 h-[2px] bg-gradient-to-r from-[#F6A8B7] to-blue-500 min-w-[8px] opacity-40 shrink" />

                  {/* Them */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 border-blue-500 overflow-hidden bg-blue-500/10">
                      {p.photos?.[0]?.url ? (
                        <img src={p.photos[0].url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-500">{getInitials(p.firstName ?? '?')}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-[#252525] truncate max-w-[50px] sm:max-w-[60px] mt-1">{p.firstName ?? ''}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-transparent border border-border rounded-xl p-3">
                  <div className="text-[10px] text-[#707070] uppercase font-bold mb-2">Analysis Status</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 text-[#707070]">
                        <span className="text-green-500">✔</span> Personality
                      </span>
                      <span className="text-[10px] text-green-500 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full">Done</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 text-[#707070]">
                        <span className={valuesComplete ? 'text-green-500' : 'text-yellow-500'}>
                          {valuesComplete ? '✔' : '⏳'}
                        </span> Story & Values
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${valuesComplete ? 'text-green-500 bg-green-500/10' : 'text-yellow-500 bg-yellow-500/10'}`}>
                        {confAnalyzed > 0 ? (valuesComplete ? 'Complete' : 'In Progress') : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Score Cards (Row-wise horizontal layout) ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-3xl p-4 space-y-3.5">
              {/* Personality Match */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F6A8B7]/10 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 text-[#F6A8B7]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#252525]">Personality Match</div>
                    <div className="text-[10px] text-[#707070]">{getMatchQuality(personalityMatch)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-border/40 h-1 rounded-full overflow-hidden hidden xs:block">
                    <div className="h-full bg-[#F6A8B7] rounded-full" style={{ width: `${personalityMatch}%` }} />
                  </div>
                  <span className="text-sm font-extrabold text-[#F6A8B7]">{personalityMatch}%</span>
                </div>
              </div>

              <div className="border-t border-border/50" />

              {/* Values Match */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F6A8B7]/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-[#F6A8B7]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#252525]">Values Match</div>
                    <div className="text-[10px] text-[#707070]">
                      {!hasStories ? 'Needs more stories' : getMatchQuality(aiStoryMatch)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasStories && (
                    <div className="w-16 bg-border/40 h-1 rounded-full overflow-hidden hidden xs:block">
                      <div className="h-full bg-[#F6A8B7] rounded-full" style={{ width: `${aiStoryMatch}%` }} />
                    </div>
                  )}
                  <span className="text-sm font-extrabold text-[#F6A8B7]">
                    {!hasStories
                      ? <span className="text-xs text-yellow-500 font-semibold">{confAnalyzed > 0 ? 'Limited' : 'Pending'}</span>
                      : `${aiStoryMatch}%`}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* ── Premium Breakdowns OR Lock Screen ── */}
            {isPremium ? (
              <>
                {/* Personality Breakdown */}
                {traitBreakdowns.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-card border border-border rounded-3xl p-5">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                      <div className="w-7 h-7 rounded-full bg-[#F6A8B7]/10 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-[#F6A8B7]" />
                      </div>
                      <h3 className="font-bold text-[#252525] text-sm">Personality Comparison</h3>
                      <span className="ml-auto text-base font-extrabold text-[#F6A8B7]">{personalityMatch}%</span>
                    </div>
                    <div className="grid grid-cols-12 gap-2 text-[9px] font-bold text-[#707070] uppercase mb-3 px-1">
                      <div className="col-span-5">Trait</div>
                      <div className="col-span-2 text-[#F6A8B7]">You</div>
                      <div className="col-span-2 text-blue-500">{p.firstName ?? ''}</div>
                      <div className="col-span-3 text-right">Match</div>
                    </div>
                    <div className="space-y-3.5">
                      {traitBreakdowns.map((trait: any, i: number) => (
                        <div key={i} className="grid grid-cols-12 gap-2 items-center px-1">
                          <div className="col-span-5 flex items-center gap-2">
                            <Heart className="w-3.5 h-3.5 text-[#707070] shrink-0" />
                            <span className="text-[11px] font-semibold text-[#252525] truncate">{trait.name ?? ''}</span>
                          </div>
                          <div className="col-span-2">
                            <div className="text-[11px] font-bold text-[#252525]">{trait.myScore ?? 0}%</div>
                            <div className="h-1 bg-border rounded-full mt-0.5">
                              <div className="h-full bg-[#F6A8B7] rounded-full" style={{ width: `${trait.myScore ?? 0}%` }} />
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-[11px] font-bold text-[#252525]">{trait.theirScore ?? 0}%</div>
                            <div className="h-1 bg-border rounded-full mt-0.5">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${trait.theirScore ?? 0}%` }} />
                            </div>
                          </div>
                          <div className="col-span-3 text-right">
                            <span className={`text-xs font-bold ${getMatchColor(trait.similarity ?? 0)}`}>
                              {trait.similarity ?? 0}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Life & Values */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className="bg-card border border-border rounded-3xl p-5">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                    <div className="w-7 h-7 rounded-full bg-[#F6A8B7]/10 flex items-center justify-center">
                      <BookOpen className="w-3.5 h-3.5 text-[#F6A8B7]" />
                    </div>
                    <h3 className="font-bold text-[#252525] text-sm">Life & Values</h3>
                    {sConfidence && (
                      <Badge variant="outline" className={`ml-auto text-[9px] ${
                        sConfidence.level === 'High' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        sConfidence.level === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>{sConfidence.level} Confidence</Badge>
                    )}
                  </div>

                  {sConfidence && (
                    <div className="mb-4 bg-transparent p-3 rounded-xl border border-border">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] text-[#707070] font-bold uppercase">Progress</span>
                        <span className="text-[11px] text-[#F6A8B7] font-bold">{confPct}%</span>
                      </div>
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-[#F6A8B7] rounded-full" style={{ width: `${confPct}%` }} />
                      </div>
                      <div className="text-[9px] text-[#707070] mt-1">{confAnalyzed} of {confTotal} categories</div>
                    </div>
                  )}

                  <div className="grid grid-cols-12 gap-2 text-[9px] font-bold text-[#707070] uppercase mb-3 px-1">
                    <div className="col-span-4">Category</div>
                    <div className="col-span-2 text-[#F6A8B7]">You</div>
                    <div className="col-span-2 text-blue-500">{p.firstName ?? ''}</div>
                    <div className="col-span-4 text-right">Similarity</div>
                  </div>

                  <div className="space-y-0.5">
                    {storyBreakdowns.map((cat: any, i: number) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center px-1 py-2.5 border-b border-border/50 last:border-0">
                        <div className="col-span-4 flex items-center gap-2">
                          {getStoryIcon(cat.name ?? '')}
                          <span className="text-[11px] font-semibold text-[#252525] leading-tight">{cat.name ?? ''}</span>
                        </div>
                        <div className="col-span-2 text-[#F6A8B7] font-bold text-xs text-center">
                          {cat.insufficientData ? '–' : `${cat.myScore ?? 0}%`}
                        </div>
                        <div className="col-span-2 text-blue-500 font-bold text-xs text-center">
                          {cat.insufficientData ? '–' : `${cat.theirScore ?? 0}%`}
                        </div>
                        <div className="col-span-4 flex justify-end">
                          {cat.insufficientData
                            ? <span className="text-[10px] text-yellow-500/80 italic">Pending</span>
                            : <span className={`text-xs font-bold ${getMatchColor(cat.similarity ?? 0)}`}>{cat.similarity ?? 0}%</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                    <div>
                      <div className="text-xs text-[#707070]">Values Match</div>
                      <div className="text-[10px] mt-0.5">
                        {!hasStories
                          ? <span className="text-yellow-500/80">Pending</span>
                          : !valuesComplete
                            ? <span className="text-yellow-500/80">In Progress</span>
                            : <span className="text-green-500/80">Complete</span>}
                      </div>
                    </div>
                    <span className="text-lg font-extrabold text-[#F6A8B7]">
                      {hasStories ? `${aiStoryMatch}%` : '–'}
                    </span>
                  </div>
                </motion.div>

                {/* Focus Areas */}
                {focusAreas.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-card border border-border rounded-3xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <Star className="w-3.5 h-3.5 text-yellow-500" />
                      </div>
                      <h3 className="font-bold text-[#252525] text-sm">Focus Areas</h3>
                    </div>
                    <div className="space-y-3">
                      {focusAreas.map((area: any, i: number) => {
                        const icon = (area.name ?? '').includes('Family')
                          ? <Users className="w-3.5 h-3.5 text-[#F6A8B7]" />
                          : (area.name ?? '').includes('Career')
                            ? <Briefcase className="w-3.5 h-3.5 text-yellow-500" />
                            : <Target className="w-3.5 h-3.5 text-blue-500" />;
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-transparent border border-border flex items-center justify-center shrink-0">{icon}</div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold text-[#252525]">{area.name ?? ''}</span>
                                <span className="text-xs text-[#707070]">{area.similarity ?? 0}%</span>
                              </div>
                              <div className="h-1 bg-border rounded-full overflow-hidden">
                                <div className="h-full bg-[#F6A8B7] rounded-full" style={{ width: `${area.similarity ?? 0}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 bg-[#F6A8B7]/5 border border-[#F6A8B7]/20 rounded-xl p-3 flex gap-2">
                      <Heart className="w-4 h-4 text-[#F6A8B7] shrink-0 mt-0.5" />
                      <p className="text-[11px] text-[#707070] leading-relaxed">
                        <span className="text-[#F6A8B7] font-bold">Tip: </span>
                        Complete more stories and daily questions to unlock deeper insights.
                      </p>
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              /* Lock Screen */
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-3xl p-6">
                <div className="flex items-center gap-2 text-[#F6A8B7] font-bold mb-3">
                  <Lock className="w-5 h-5" /> Unlock Full Compatibility
                </div>
                <p className="text-sm text-[#252525] font-semibold mb-4">Get complete access to detailed insights</p>
                <ul className="space-y-2.5 mb-6">
                  {[
                    'Detailed personality & values comparison',
                    'Strengths & differences analysis',
                    'Communication style insights',
                    'Match improvement roadmap',
                    'Conversation starters & topic suggestions',
                    'Deeper compatibility breakdown',
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-[#707070] font-medium">
                      <div className="w-4 h-4 rounded-full bg-[#F6A8B7] shrink-0 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full h-12 w-full text-[#252525] rounded-full border border-white/40 transition-all hover:bg-[#F6A8B7]  rounded-xl font-bold" style={{ background: 'linear-gradient(135deg, #F8C7C8, #F8D9D2, #F7E8EE)', boxShadow: '0 4px 12px rgba(246, 168, 183, 0.15)' }}
                  onClick={() => navigate('/checkout/compatibility')}
                >
                  Unlock Now <span className="ml-2 bg-white text-[#F6A8B7] px-2 py-0.5 rounded text-[10px]">₹99</span>
                </Button>
                <div className="text-[10px] text-center text-[#707070] mt-3">One-time payment • Secure & Private</div>
              </motion.div>
            )}

          </div>
        )}
      </div>
    </AppLayout>
  );
}
