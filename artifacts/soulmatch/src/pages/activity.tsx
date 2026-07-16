import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, UserCircle, Activity, ChevronRight, ChevronDown, Info, Heart, Award, MessageCircle, Shield, Brain, Target, CheckSquare, ShieldCheck, CalendarDays, AlertCircle, Crown, BookOpen, Flame, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { subMonths, addMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, subDays, differenceInDays } from "date-fns";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { useGetMatches } from "@workspace/api-client-react";
import { API_URL } from "../config/api";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

export default function ActivityPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [expandedBuildingProfile, setExpandedBuildingProfile] = useState(false);
  const [expandedMatchNetwork, setExpandedMatchNetwork] = useState(false);
  const [expandedMatchInsights, setExpandedMatchInsights] = useState(false);
  const [expandedWhyMatches, setExpandedWhyMatches] = useState(false);
  const [expandedTips, setExpandedTips] = useState(false);
  const [showJourney, setShowJourney] = useState(false);
  const [expandedStoryCalendar, setExpandedStoryCalendar] = useState(false);
  const [expandedWeeklyReflection, setExpandedWeeklyReflection] = useState(false);
  const [expandedMemoryCapsule, setExpandedMemoryCapsule] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: matchesData } = useGetMatches(
    { page: 1, limit: 100 },
    { query: { enabled: true }, request: { headers: authHeaders() } } as any,
  );
  const matches = [...((matchesData as any)?.matches ?? [])].sort((a: any, b: any) => {
    const getScore = (m: any) => Number(m.compatibilityScore || m.profile?.valueMatchScore || m.profile?.compatibilityScore || 0);
    return getScore(b) - getScore(a);
  });
  const totalMatches = (matchesData as any)?.total ?? matches.length;

  // Same calculation as my-story.tsx — fetch journals and count them
  const { data: myJournals = [] } = useQuery({
    queryKey: ["myJournals"],
    queryFn: async () => {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/journal/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch journals");
      return res.json();
    },
  });
  const journeyProgress = Math.min(100, Math.round(((myJournals as any[]).length / 30) * 100));

  // Streak calc
  const currentStreak = useMemo(() => {
    const journals = myJournals as any[];
    if (!journals.length) return 0;
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const d = subDays(now, i);
      const hasPost = journals.some((j: any) =>
        isSameDay(new Date(j.createdAt), d),
      );
      if (hasPost) streak++;
      else if (i > 0) break; // Missed a day
    }
    return streak;
  }, [myJournals]);

  const completedCount = (myJournals as any[]).length;
  const longestStreak = Math.max(currentStreak, Math.min(completedCount, 12)); // Mock longest

  // Weekly Reflection Calc
  const weeklyStats = useMemo(() => {
    const journals = myJournals as any[];
    const now = new Date();
    const weekAgo = subDays(now, 7);

    // Filter journals for the last 7 days
    const weeklyJournals = journals.filter(
      (j: any) =>
        j.createdAt && new Date(j.createdAt).getTime() > weekAgo.getTime(),
    );
    const storyCount = weeklyJournals.length;

    let familyCount = 0;
    let careerCount = 0;
    let growthCount = 0;
    let healthCount = 0;

    weeklyJournals.forEach((j: any) => {
      const scores = j.aiAnalysis?.storyAnalysis?.storyScores || {};
      familyCount += scores["Family Values"] || 0;
      careerCount += scores["Career Focus"] || 0;
      growthCount += scores["Personal Growth"] || 0;
      healthCount += scores["Health & Lifestyle"] || 0;
    });

    let totalCategorized =
      familyCount + careerCount + growthCount + healthCount;

    const familyPct =
      totalCategorized > 0
        ? Math.round((familyCount / totalCategorized) * 100)
        : 0;
    const careerPct =
      totalCategorized > 0
        ? Math.round((careerCount / totalCategorized) * 100)
        : 0;
    const growthPct =
      totalCategorized > 0
        ? Math.round((growthCount / totalCategorized) * 100)
        : 0;
    const healthPct =
      totalCategorized > 0
        ? Math.round((healthCount / totalCategorized) * 100)
        : 0;

    const C = 289; // Circumference (r=46)

    const familyDash = (familyPct / 100) * C;
    const careerDash = (careerPct / 100) * C;
    const growthDash = (growthPct / 100) * C;
    const healthDash = (healthPct / 100) * C;

    const familyOffset = 0;
    const careerOffset = -familyDash;
    const growthOffset = careerOffset - careerDash;
    const healthOffset = growthOffset - healthDash;

    return {
      storyCount,
      familyPct,
      careerPct,
      growthPct,
      healthPct,
      familyDash,
      careerDash,
      growthDash,
      healthDash,
      familyOffset,
      careerOffset,
      growthOffset,
      healthOffset,
      dateRange: `${format(weekAgo, "MMM d")} - ${format(now, "MMM d")}`,
      hasData: totalCategorized > 0,
    };
  }, [myJournals]);

  // Memory Capsule Logic
  const memoryCapsule = useMemo(() => {
    const journals = myJournals as any[];
    if (journals.length === 0) return null;

    // Pick the oldest journal to serve as the memory
    const journal = journals[journals.length - 1];

    const scores = journal.aiAnalysis?.storyAnalysis?.storyScores || {};
    const categories = Object.keys(scores);
    const topCat =
      categories.length > 0
        ? categories.reduce((a, b) => (scores[a] > scores[b] ? a : b))
        : "Personal Growth";

    const daysSince = differenceInDays(new Date(), new Date(journal.createdAt));
    const storiesSince = journals.length - 1;

    // Calculate themes SINCE that memory
    const recentJournals = journals.slice(0, -1);
    const recentScores: Record<string, number> = {};
    recentJournals.forEach((j: any) => {
      const jScores = j.aiAnalysis?.storyAnalysis?.storyScores || {};
      Object.entries(jScores).forEach(([cat, val]) => {
        recentScores[cat] = (recentScores[cat] || 0) + (val as number);
      });
    });

    const topRecentCats = Object.entries(recentScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map((e) => e[0]);

    const topCurrentCat = topRecentCats[0] || "Growth";

    let aiSummary = "";
    if (storiesSince === 0) {
      aiSummary = `This is your very first memory! Keep writing to see how your thoughts and themes evolve over time.`;
    } else if (topCat === topCurrentCat) {
      aiSummary = `Since this memory, you have stayed remarkably consistent in your focus on ${topCat}. Through ${storiesSince} new stories, this value has remained a core pillar of your identity.`;
    } else {
      aiSummary = `Since this memory, your focus has beautifully evolved from ${topCat} towards ${topCurrentCat}. Over ${storiesSince} new stories, you've shown a natural shift in your recurring themes.`;
    }

    return {
      journal,
      topCat,
      daysSince,
      storiesSince,
      topCurrentCat,
      recurringThemes: topRecentCats,
      aiSummary,
    };
  }, [myJournals]);

  const { data: networkStats } = useQuery({
    queryKey: ["/api/matches/network-stats"],
    queryFn: async () => {
      return apiRequest<any>("/matches/network-stats", {
        headers: authHeaders(),
      });
    },
  });

  // Compute real match stats from actual matches data (only mutual matches)
  const mutualMatches = useMemo(() => {
    const allMatches = (matchesData as any)?.matches ?? [];
    return allMatches.filter((m: any) => m.isMutualMatch === true);
  }, [matchesData]);

  const realTotalMatches = mutualMatches.length;
  
  const realNewThisWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return mutualMatches.filter((m: any) => {
      const created = m.createdAt ? new Date(m.createdAt).getTime() : 0;
      return created > weekAgo;
    }).length;
  }, [mutualMatches]);
  
  const realAvgCompatibility = useMemo(() => {
    if (!mutualMatches.length) return 0;
    const total = mutualMatches.reduce((sum: number, m: any) => {
      return sum + Number(m.compatibilityScore || m.profile?.valueMatchScore || m.profile?.compatibilityScore || 0);
    }, 0);
    return Math.round(total / mutualMatches.length);
  }, [mutualMatches]);

  const stats = {
    totalMatches: realTotalMatches,
    newThisWeek: realNewThisWeek,
    averageCompatibility: realAvgCompatibility || (networkStats?.averageCompatibility ?? 0),
  };
  const hasMatches = stats.totalMatches > 0;

  return (
    <AppLayout>
      <div className="w-full relative bg-background font-sans min-h-screen pt-4 pb-28">
        <div className="max-w-md mx-auto w-full px-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1 text-foreground">
            Account & Activity
          </h1>
          <p className="text-muted-foreground">Manage your profile and view your activity.</p>
        </motion.div>

        <div className="space-y-6">
          {/* Story Journey Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border shadow-sm rounded-[24px] relative"
          >
            {/* Header row — always visible, clickable */}
            <div
              className="flex items-center justify-between p-5 cursor-pointer select-none"
              onClick={() => setShowJourney(!showJourney)}
            >
              <div>
                <h3 className="text-foreground font-extrabold text-[16px]">Story Journey</h3>
                <p className="text-[12px] text-muted-foreground font-medium mt-0.5">Your 30-day progress</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                  showJourney
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {showJourney ? "Hide" : "View"}
              </motion.button>
            </div>

            {/* Expanded: big circle ring */}
            <AnimatePresence>
              {showJourney && (
                <motion.div
                  key="journey-ring"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col items-center pb-6 pt-2 gap-2">
                    {/* Circle ring — large & clearly visible */}
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg viewBox="0 0 128 128" className="absolute inset-0 w-full h-full -rotate-90">
                        {/* Track */}
                        <circle
                          cx="64" cy="64" r="52"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="10"
                          className="text-border opacity-40"
                        />
                        {/* Progress */}
                        <circle
                          cx="64" cy="64" r="52"
                          fill="none"
                          stroke="url(#sj-grad)"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray="326.73"
                          strokeDashoffset={326.73 - (326.73 * journeyProgress) / 100}
                          className="transition-all duration-1000"
                        />
                        <defs>
                          <linearGradient id="sj-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ec4899" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {/* Center text */}
                      <div className="flex flex-col items-center z-10">
                        <span className="text-[28px] font-extrabold text-foreground leading-none">{journeyProgress}%</span>
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Complete</span>
                      </div>
                    </div>
                    <p className="text-[12px] text-muted-foreground">
                      {(myJournals as any[]).length} of 30 stories shared
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Story Calendar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border shadow-sm rounded-[24px]">
            <div 
              className="flex items-center justify-between p-5 cursor-pointer select-none" 
              onClick={() => setExpandedStoryCalendar(!expandedStoryCalendar)}
            >
              <div>
                <h3 className="text-foreground font-extrabold text-[16px]">Story Calendar</h3>
                <p className="text-[12px] text-muted-foreground font-medium mt-0.5">Your monthly story overview</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                  expandedStoryCalendar
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {expandedStoryCalendar ? "Hide" : "View"}
              </motion.button>
            </div>
            
            <AnimatePresence>
              {expandedStoryCalendar && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: "auto", opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <div className="flex items-center justify-between mb-5">
                      <div className="text-[15px] font-extrabold text-foreground">
                        {format(currentMonth, "MMMM yyyy")}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                          className="w-8 h-8 rounded-[10px] bg-background border border-border flex items-center justify-center text-foreground hover:bg-[var(--border)] transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                          className="w-8 h-8 rounded-[10px] bg-background border border-border flex items-center justify-center text-foreground hover:bg-[var(--border)] transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-y-4 text-center mb-6">
                      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                        <div
                          key={i}
                          className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider"
                        >
                          {d}
                        </div>
                      ))}

                      {(() => {
                        const monthStart = startOfMonth(currentMonth);
                        const monthEnd = endOfMonth(currentMonth);
                        const daysInMonth = eachDayOfInterval({
                          start: monthStart,
                          end: monthEnd,
                        });
                        const startDay = getDay(monthStart);
                        const emptyDaysOffset = startDay === 0 ? 6 : startDay - 1;

                        return (
                          <>
                            {Array.from({ length: emptyDaysOffset }).map((_, i) => (
                              <div key={`empty-${i}`}></div>
                            ))}

                            {daysInMonth.map((day, i) => {
                              const hasStory = (myJournals as any[]).some((j: any) =>
                                isSameDay(new Date(j.createdAt), day)
                              );
                              const isCurrentDay = isToday(day);

                              if (hasStory) {
                                return (
                                  <div
                                    key={i}
                                    className="mx-auto w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[13px] font-bold shadow-md shadow-primary/30"
                                  >
                                    {format(day, "d")}
                                  </div>
                                );
                              }

                              if (isCurrentDay) {
                                return (
                                  <div
                                    key={i}
                                    className="mx-auto w-8 h-8 rounded-full bg-primary/10 text-primary border-2 border-primary flex items-center justify-center text-[13px] font-bold"
                                  >
                                    {format(day, "d")}
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={i}
                                  className="text-[13px] text-muted-foreground font-medium flex items-center justify-center h-8"
                                >
                                  {format(day, "d")}
                                </div>
                              );
                            })}
                          </>
                        );
                      })()}
                    </div>

                    <div className="bg-background rounded-[20px] p-4 flex justify-between items-center border border-border">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-[14px] bg-[#6366f1]/10 flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5 text-[#6366f1]" />
                        </div>
                        <div>
                          <div className="text-foreground font-extrabold text-[15px]">
                            {completedCount} Stories
                          </div>
                          <div className="text-[12px] text-muted-foreground font-medium mt-0.5">
                            Longest Streak
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-muted-foreground text-[11px] line-through mb-1 font-bold">
                          24 Days
                        </div>
                        <div className="text-[#ff6b6b] font-extrabold flex items-center gap-1 text-[15px]">
                          <Flame className="w-4 h-4" /> {longestStreak} Days
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Weekly Reflection */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border shadow-sm rounded-[24px]">
            <div 
              className="flex items-center justify-between p-5 cursor-pointer select-none" 
              onClick={() => setExpandedWeeklyReflection(!expandedWeeklyReflection)}
            >
              <div>
                <h3 className="text-foreground font-extrabold text-[16px] flex items-center gap-2">
                  Weekly Reflection
                  <Lightbulb className="w-4 h-4 text-[#f59e0b]" />
                </h3>
                <p className="text-[12px] text-muted-foreground font-medium mt-0.5">Insights from this week's stories</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                  expandedWeeklyReflection
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {expandedWeeklyReflection ? "Hide" : "View"}
              </motion.button>
            </div>
            
            <AnimatePresence>
              {expandedWeeklyReflection && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: "auto", opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-6">
                      {weeklyStats.dateRange}
                    </p>

                    <div className="flex items-center gap-6 mb-6">
                      <div className="relative w-28 h-28 shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="56"
                            cy="56"
                            r="46"
                            fill="transparent"
                            stroke="var(--border)"
                            strokeWidth="20"
                          />
                          {weeklyStats.hasData && (
                            <>
                              <circle
                                cx="56"
                                cy="56"
                                r="46"
                                fill="transparent"
                                stroke="#ec4899"
                                strokeWidth="20"
                                strokeDasharray={`${weeklyStats.familyDash} 289`}
                                strokeDashoffset={weeklyStats.familyOffset}
                              />
                              <circle
                                cx="56"
                                cy="56"
                                r="46"
                                fill="transparent"
                                stroke="#f97316"
                                strokeWidth="20"
                                strokeDasharray={`${weeklyStats.careerDash} 289`}
                                strokeDashoffset={weeklyStats.careerOffset}
                              />
                              <circle
                                cx="56"
                                cy="56"
                                r="46"
                                fill="transparent"
                                stroke="#22c55e"
                                strokeWidth="20"
                                strokeDasharray={`${weeklyStats.growthDash} 289`}
                                strokeDashoffset={weeklyStats.growthOffset}
                              />
                              <circle
                                cx="56"
                                cy="56"
                                r="46"
                                fill="transparent"
                                stroke="#3b82f6"
                                strokeWidth="20"
                                strokeDasharray={`${weeklyStats.healthDash} 289`}
                                strokeDashoffset={weeklyStats.healthOffset}
                              />
                            </>
                          )}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Heart className="w-6 h-6 text-primary fill-primary/20" />
                        </div>
                      </div>
                      <div className="space-y-3 flex-1">
                        <div className="flex justify-between text-[13px] font-bold text-foreground">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899]"></span>{" "}
                            Family
                          </span>
                          <span>{weeklyStats.familyPct}%</span>
                        </div>
                        <div className="flex justify-between text-[13px] font-bold text-foreground">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></span>{" "}
                            Career
                          </span>
                          <span>{weeklyStats.careerPct}%</span>
                        </div>
                        <div className="flex justify-between text-[13px] font-bold text-foreground">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span>{" "}
                            Growth
                          </span>
                          <span>{weeklyStats.growthPct}%</span>
                        </div>
                        <div className="flex justify-between text-[13px] font-bold text-foreground">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>{" "}
                            Health
                          </span>
                          <span>{weeklyStats.healthPct}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-[13px] text-muted-foreground font-medium border-t border-border pt-4">
                      You shared{" "}
                      <strong className="text-foreground">
                        {weeklyStats.storyCount} stories
                      </strong>{" "}
                      this week <Heart className="inline w-3.5 h-3.5 text-primary ml-1" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Memory Capsule */}
          {memoryCapsule && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border shadow-sm rounded-[24px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 z-0" />
              
              <div 
                className="relative z-10 flex items-center justify-between p-5 cursor-pointer select-none" 
                onClick={() => setExpandedMemoryCapsule(!expandedMemoryCapsule)}
              >
                <div>
                  <h3 className="text-foreground font-extrabold text-[16px] flex items-center gap-2">
                    Memory Capsule
                    <Lightbulb className="w-4 h-4 text-primary" />
                  </h3>
                  <p className="text-[12px] text-muted-foreground font-medium mt-0.5">Rediscover past thoughts</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                    expandedMemoryCapsule
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {expandedMemoryCapsule ? "Hide" : "View"}
                </motion.button>
              </div>

              <AnimatePresence>
                {expandedMemoryCapsule && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden relative z-10"
                  >
                    <div className="px-6 pb-6 flex flex-col items-start w-full">
                      <div className="text-primary text-[10px] font-bold uppercase tracking-[0.15em] mb-1 bg-card/50 px-2 py-1 rounded-[6px]">
                        {memoryCapsule.daysSince === 0
                          ? "Earlier Today"
                          : `${memoryCapsule.daysSince} Days Ago`}
                      </div>
                      <div className="text-[13px] font-bold text-muted-foreground mb-4">
                        {format(
                          new Date(memoryCapsule.journal.createdAt),
                          "MMMM d, yyyy"
                        )}
                      </div>

                      <div className="bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm rounded-[20px] p-5 w-full mb-5">
                        <p className="text-foreground text-[14px] leading-relaxed italic line-clamp-3 font-medium">
                          "{memoryCapsule.journal.content}"
                        </p>
                        <div className="mt-4 flex gap-2">
                          <span className="text-[10px] px-2.5 py-1.5 rounded-[8px] bg-primary/10 text-primary font-bold tracking-wide uppercase">
                            {memoryCapsule.topCat}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4 w-full mb-6 mt-2">
                        <p className="text-muted-foreground text-[14px] leading-relaxed font-medium border-l-[3px] border-primary/40 pl-4">
                          {memoryCapsule.aiSummary}
                        </p>

                        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-[16px] p-4 space-y-3 mt-5">
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="text-muted-foreground font-bold">
                              Additional Stories
                            </span>
                            <span className="text-primary font-extrabold text-[15px]">
                              +{memoryCapsule.storiesSince}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="text-muted-foreground font-bold">
                              Recurring Themes
                            </span>
                            <span className="text-foreground font-extrabold text-right max-w-[60%] truncate">
                              {memoryCapsule.recurringThemes.length > 0
                                ? memoryCapsule.recurringThemes.join(", ")
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full pt-1">
                        <Link href="/story-archive">
                          <Button className="w-full bg-primary hover:bg-primary/90 text-white border-0 transition-transform active:scale-[0.98] shadow-xl shadow-primary/20 h-[50px] rounded-[16px] font-bold text-[15px]">
                            Relive Memory
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
          {/* Match Network Stats */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border shadow-md rounded-2xl p-5">
            <div 
              className="flex items-center justify-between cursor-pointer mb-2" 
              onClick={() => setExpandedMatchNetwork(!expandedMatchNetwork)}
            >
              <h2 className="font-semibold text-foreground text-lg">Your Match Network</h2>
              {expandedMatchNetwork ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            
            <AnimatePresence>
              {expandedMatchNetwork && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: "auto", opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 pb-2">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-pink-500/5 rounded-xl p-4 border border-pink-500/20 text-center">
                        <div className="text-2xl font-bold text-pink-400">{stats.totalMatches}</div>
                        <div className="text-xs text-muted-foreground mt-1">Total Matches</div>
                      </div>
                      <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/20 text-center">
                        <div className="text-2xl font-bold text-blue-400">{stats.newThisWeek}</div>
                        <div className="text-xs text-muted-foreground mt-1">New This Week</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-muted-foreground">Average Compatibility</span>
                        <span className="text-foreground font-medium">{hasMatches ? `${stats.averageCompatibility}%` : "--"}</span>
                      </div>
                      {hasMatches ? (
                        <div className="w-full bg-foreground/10 rounded-full h-1.5">
                          <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-1.5 rounded-full" style={{ width: `${stats.averageCompatibility}%` }} />
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Complete more questions and share more stories to improve your matches.
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          {/* Accounts Section */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border shadow-md rounded-2xl p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
              <UserCircle className="w-5 h-5 text-primary" /> Accounts
            </h2>
            <div className="space-y-3 pl-7">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Personal Information</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Update your email and personal details</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Security</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage passwords and active sessions</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Linked Accounts</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Google, Facebook, etc.</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </motion.div>

          {/* Activity Section */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border shadow-md rounded-2xl p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Activity className="w-5 h-5 text-primary" /> Activity
            </h2>
            <div className="space-y-3 pl-7">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Match History</p>
                  <p className="text-xs text-muted-foreground mt-0.5">View your past matches and connections</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
              
              {/* Building Profile Accordion */}
              <div className="pt-1 pb-1">
                <div 
                  className="flex items-center justify-between cursor-pointer" 
                  onClick={() => setExpandedBuildingProfile(!expandedBuildingProfile)}
                >
                  <div>
                    <p className="text-sm font-medium text-yellow-500">Building Profile</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Track your profile completeness journey</p>
                  </div>
                  {expandedBuildingProfile ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                
                <AnimatePresence>
                  {expandedBuildingProfile && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: "auto", opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 p-4 rounded-xl bg-foreground/5 border border-border">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-sm text-foreground font-medium">Questionnaire Days</span>
                            <span className="text-sm font-bold text-foreground">{(user as any)?.qDaysCompleted ?? 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-foreground font-medium">Stories Analyzed</span>
                            <span className="text-sm font-bold text-foreground">{(user as any)?.storiesAnalyzed ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>

          {/* Your Match Insights */}
          {matches.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-5 rounded-2xl bg-card border border-border shadow-md">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => setExpandedMatchInsights(!expandedMatchInsights)}
              >
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-foreground text-lg">Your Match Insights</h2>
                </div>
                {expandedMatchInsights ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              
              <AnimatePresence>
                {expandedMatchInsights && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 pb-2">
                      <p className="text-muted-foreground text-xs mb-6">Understand what makes your connections stronger.</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Overall Compatibility", value: matches[0]?.profile?.compatibilityScore ?? null, icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/30", isMain: true },
                          { label: "Personality Match", value: matches[0]?.profile?.personalityMatch ?? null, icon: Award, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
                          { label: "Story & Values", value: matches[0]?.profile?.aiStoryMatch ?? null, textValue: (!matches[0]?.profile?.hasStories || matches[0]?.profile?.aiStoryMatch === 0) ? "Need More Stories" : null, icon: MessageCircle, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
                          { label: "Analysis Confidence", textValue: matches[0]?.profile?.sConfidenceData ? `${matches[0].profile.sConfidenceData.level}` : "Pending", icon: Shield, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
                        ].map((insight, i) => (
                          <div key={i} className={`flex flex-col items-center text-center p-4 rounded-2xl border ${insight.isMain ? 'bg-pink-500/5 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.1)]' : 'bg-foreground/5 border-border'}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${insight.bg}`}>
                              <insight.icon className={`w-5 h-5 ${insight.color} ${insight.isMain ? 'fill-pink-500' : ''}`} />
                            </div>
                            <div className={`text-lg font-bold text-foreground mb-1 ${insight.textValue ? 'text-xs mt-1 leading-snug h-8 flex items-center text-center justify-center' : ''}`}>
                              {insight.textValue ? insight.textValue : (insight.value !== null && insight.value !== undefined ? `${insight.value}%` : '--')}
                            </div>
                            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{insight.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Why These Matches? */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-5 rounded-2xl bg-card border border-border relative overflow-hidden shadow-md">
            <div 
              className="flex items-center justify-between cursor-pointer relative z-20"
              onClick={() => setExpandedWhyMatches(!expandedWhyMatches)}
            >
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-pink-500" />
                <h2 className="font-semibold text-foreground text-lg">Why These Matches?</h2>
              </div>
              {expandedWhyMatches ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            
            <AnimatePresence>
              {expandedWhyMatches && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden relative z-10"
                >
                  <div className="pt-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <Brain className="w-4 h-4 text-pink-400" />
                      <span className="text-xs text-muted-foreground">Similar personality traits</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Target className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-muted-foreground">Shared values and goals</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-muted-foreground">Similar lifestyle preferences</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Active and verified users</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-pink-500" />
                      <span className="text-xs text-muted-foreground">Completed <strong className="text-foreground">30-Day Journey</strong></span>
                    </div>
                  </div>
                  
                  <div className="absolute -right-8 top-0 opacity-60 pointer-events-none">
                    <div className="w-32 h-32 bg-pink-500/20 blur-[30px] rounded-full absolute" />
                    <Heart className="w-24 h-24 text-pink-500 fill-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] relative z-10" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Tips */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="p-5 rounded-2xl bg-card border border-border shadow-md">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedTips(!expandedTips)}
            >
              <h2 className="font-semibold text-foreground text-lg">Tips for Better Matches</h2>
              {expandedTips ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            
            <AnimatePresence>
              {expandedTips && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-5 space-y-4">
                    {[
                      { title: "Answer honestly", desc: "Be authentic in your responses", icon: ShieldCheck, color: "text-pink-400" },
                      { title: "Be consistent", desc: "Answer daily to improve accuracy", icon: CalendarDays, color: "text-purple-400" },
                      { title: "Share your thoughts", desc: "Detailed answers help build a more complete profile", icon: AlertCircle, color: "text-blue-400" }
                    ].map((tip, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="mt-1">
                          <tip.icon className={`w-4 h-4 ${tip.color}`} />
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-sm mb-0.5">{tip.title}</div>
                          <div className="text-[10px] text-muted-foreground">{tip.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
