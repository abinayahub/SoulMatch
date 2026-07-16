import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { 
  User, CalendarDays, Flame, Gift, ChevronRight, 
  Target, PenTool, Image as ImageIcon, 
  MessageCircle, TrendingUp, 
  Eye, Heart, ShieldCheck, CheckCircle2, Check, Bell, BarChart3, Edit3, Star, Search
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth, getAccessToken } from "@/lib/auth-context";
import { useGetJourneyProgress, useGetPersonalityProfile, useGetMatches, useGetConversations, useGetNotifications } from "@workspace/api-client-react";
import { DailyReflection, WeeklyMoodPanel } from "@/components/dashboard/DailyReflection";
import { timeAgo } from "@/lib/utils";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { 
    Authorization: `Bearer ${token}`,
    "x-timezone-offset": String(new Date().getTimezoneOffset())
  } as Record<string, string>;
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { motivationQuotes, motivationImages } from "@/lib/dailyMotivationData";

export default function DashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
  };

  const today = new Date();
  const startOfEpoch = new Date('2024-01-01').getTime();
  const daysSinceEpoch = Math.floor((today.getTime() - today.getTimezoneOffset() * 60000 - startOfEpoch) / (1000 * 60 * 60 * 24));
  const dailyQuote = motivationQuotes[Math.abs(daysSinceEpoch) % motivationQuotes.length];
  const dailyImage = motivationImages[Math.abs(daysSinceEpoch) % motivationImages.length];

  const { data: matchesData } = useGetMatches(
    { page: 1, limit: 10 },
    { query: { enabled: true }, request: { headers: authHeaders() } } as any,
  );

  const { data: journeyProgress } = useGetJourneyProgress({ query: { enabled: true }, request: { headers: authHeaders() } } as any);
  
  const { data: weeklySummary, isLoading: loadingSummary } = useQuery({
    queryKey: ["weekly-summary"],
    queryFn: async () => {
      const res = await apiRequest("/metrics/weekly-summary");
      return res as any;
    }
  });

  const { data: personalityProfile } = useGetPersonalityProfile({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const { data: conversations = [] } = useGetConversations({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const { data: notificationsData } = useGetNotifications(
    { page: 1 },
    { query: { enabled: true }, request: { headers: authHeaders() } } as any,
  );
  
  const recentActivities = (notificationsData as any)?.notifications?.slice(0, 3) || [];

  const { data: history = [] } = useQuery<any[]>({
    queryKey: ["/api/reflections/history"],
    queryFn: () => apiRequest("/reflections/history", { headers: authHeaders() }),
  });

  const { data: reflectionToday } = useQuery<any>({
    queryKey: ["/api/reflections/today"],
    queryFn: () => apiRequest("/reflections/today", { headers: authHeaders() }),
  });

  const unreadChatCount = conversations.reduce((acc: number, conv: any) => acc + (conv.unreadCount || 0), 0);
  
  const currentDay = (journeyProgress as any)?.currentDay || 1;
  const answeredQuestions = (journeyProgress as any)?.answeredQuestions || 0;
  const displayDay = Math.max(1, Math.ceil(answeredQuestions / 5));
  const streak = Math.min((journeyProgress as any)?.streak || 0, displayDay);
  const progressPercent = (journeyProgress as any)?.completionPercentage || 0;
  const questionsRemainingToday = (journeyProgress as any)?.questionsRemainingToday ?? 5;
  const answeredToday = Math.max(0, 5 - questionsRemainingToday);

  const rawTraits = (personalityProfile as any)?.traits;
  const snapshotTraits = Array.isArray(rawTraits) ? rawTraits : [];
  let connectionScore = snapshotTraits.find((t: any) => t?.trait === "Connection")?.score || 0;
  let stabilityScore = snapshotTraits.find((t: any) => t?.trait === "Stability")?.score || 0;
  let growthScore = snapshotTraits.find((t: any) => t?.trait === "Growth")?.score || 0;
  let explorationScore = snapshotTraits.find((t: any) => t?.trait === "Exploration")?.score || 0;

  const overallAlignment = Math.round((connectionScore + stabilityScore + growthScore + explorationScore) / 4);

  const topStats = [
    { label: "Profile Completeness", value: `${user?.profileCompleteness || 0}%`, sub: "Complete your profile to attract better matches.", icon: User, bg: "border-[#9B4DFF]/30", text: "text-[#9B4DFF]" },
    { label: "Question Journey", value: `${Math.min(Math.max(1, Math.ceil(((journeyProgress as any)?.answeredQuestions || 0) / 5)), 30)} / 30`, sub: "Answer daily questions to understand yourself better.", icon: CalendarDays, bg: "border-blue-500/30", text: "text-blue-500" },
    { label: "Current Streak", value: `${streak} Days`, sub: "Keep your streak alive! Consistency matters.", icon: Flame, bg: "border-orange-500/30", text: "text-orange-500" },
    { label: "Reward Progress", value: "40%", sub: "Complete your journey to unlock rewards.", icon: Gift, bg: "border-pink-500/30", text: "text-pink-500" },
  ];

  return (
    <AppLayout>
      <div className="w-full max-w-md mx-auto px-4 py-3 space-y-3 flex flex-col">
        
        {/* 1. Top Header Premium Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full rounded-2xl overflow-hidden mb-2
                     bg-gradient-to-r from-[#FFF5F8] via-[#FCE4EC] to-[#F9BBD0] 
                     dark:from-[#0B0815] dark:via-[#1A0822] dark:to-[#360A2E] 
                     shadow-[0_4px_20px_rgb(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] 
                     border border-white/80 dark:border-white/5 flex items-center px-4 py-3"
        >
          {/* Decorative glowing backgrounds */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF429A]/10 dark:bg-[#FF429A]/20 blur-[20px] rounded-full pointer-events-none -mr-10 -mt-10" />
          <div className="absolute bottom-0 right-10 w-20 h-20 bg-[#9B4DFF]/10 dark:bg-[#9B4DFF]/20 blur-[15px] rounded-full pointer-events-none -mb-5" />
          
          {/* Bottom Wave decoration */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0 opacity-40 dark:opacity-20 pointer-events-none">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[25px] text-[#FF429A]/30 dark:text-[#FF429A]/40 fill-current">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.11,130.83,121.22,200.7,109.14Z"></path>
            </svg>
          </div>
          
          {/* Text Content (Left) */}
          <div className="relative z-10 flex-1 pr-2">
            <h1 className="text-lg font-extrabold flex flex-wrap items-center gap-1 tracking-tight">
              <span className="text-[#1A1A1A] dark:text-[#F3F4F6]">{getGreeting()},</span>
              <span className="text-[#FF2D88] dark:text-[#FF429A]">{user?.firstName || "Karthi"}! 👋</span>
            </h1>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] text-[11px] leading-[1.2] mt-1 max-w-[220px] font-medium">
              You're building meaningful connections every day. Keep going, your perfect match is on the way! 💜
            </p>
          </div>

          {/* Mascot (Right) */}
          <div className="relative h-[80px] w-[100px] shrink-0 z-10 flex items-center justify-center -my-2 -mr-2">
            {/* Mascot Image (Separate Images for Dark/Light Themes) */}
            <motion.div 
              animate={{ y: [0, -3, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative z-10 w-full h-full drop-shadow-[0_6px_12px_rgba(236,72,153,0.3)]"
              style={{
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 72%)',
                maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 72%)'
              }}
            >
              {/* Light Theme Image */}
              <img 
                src="/mascot_light.png" 
                alt="Mascot Light" 
                className="w-full h-full object-cover dark:hidden"
                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
              />
              {/* Dark Theme Image */}
              <img 
                src="/mascot_dark.png" 
                alt="Mascot Dark" 
                className="w-full h-full object-cover hidden dark:block"
                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
              />
            </motion.div>

            {/* Floating Hearts overlapping mascot */}
            <motion.div animate={{ y: [0, -8, 0], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }} className="absolute -top-2 right-2 text-pink-500 w-4 h-4 z-20">
              <Heart className="w-full h-full fill-current drop-shadow-md" />
            </motion.div>
            <motion.div animate={{ y: [0, -6, 0], opacity: [0.5, 0.9, 0.5] }} transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", delay: 1 }} className="absolute bottom-2 -left-3 text-purple-400 w-3 h-3 z-20">
              <Heart className="w-full h-full fill-current drop-shadow-md" />
            </motion.div>
            <motion.div animate={{ y: [0, -10, 0], opacity: [0.4, 0.8, 0.4] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }} className="absolute top-1/2 -right-4 text-pink-300 w-2.5 h-2.5 z-20">
              <Heart className="w-full h-full fill-current drop-shadow-md" />
            </motion.div>
          </div>
        </motion.div>

        {/* 2. 30-Day Journey */}
        <div className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm relative overflow-hidden">
           <div className="flex justify-between items-center mb-0.5">
             <h3 className="text-sm font-bold text-foreground">
               Your 30-Day Journey
             </h3>
             <Link href="/journey">
               <span className="text-[11px] text-pink-500 font-semibold hover:underline cursor-pointer">View Journey &gt;</span>
             </Link>
           </div>
           <p className="text-[10px] text-foreground/60 mb-3">
             Answer daily, discover yourself, find your perfect match.
           </p>
           
           <div className="flex items-center gap-3 mb-3">
              <div className="relative w-[64px] h-[64px] flex items-center justify-center shrink-0">
                 <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                   <circle cx="32" cy="32" r="28" className="stroke-muted/30 fill-none" strokeWidth="4" />
                   <circle cx="32" cy="32" r="28" className="stroke-pink-500 fill-none" strokeWidth="4" strokeDasharray="176" strokeDashoffset={176 - (progressPercent/100)*176} strokeLinecap="round" />
                 </svg>
                 <div className="flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-foreground leading-none tracking-tight">
                       {Math.floor(((journeyProgress as any)?.answeredQuestions || 0) / 5)}
                    </span>
                    <span className="text-[8px] font-medium text-foreground/80 leading-tight">Days</span>
                 </div>
              </div>

              <div className="flex-1 overflow-x-auto pb-1 scrollbar-hide">
                 <div className="flex items-start gap-2 min-w-max">
                    {Array.from({ length: 6 }).map((_, i) => {
                       const answeredQuestions = (journeyProgress as any)?.answeredQuestions || 0;
                       const completedDays = Math.floor(answeredQuestions / 5);
                       // displayDay is the day they are actively working on or just finished
                       const displayDay = Math.max(1, Math.ceil(answeredQuestions / 5));
                       
                       const startDay = Math.max(1, Math.min(completedDays - 1, 24));
                       const day = startDay + i;
                       const isCompleted = day <= completedDays;
                       return (
                         <div key={day} className="flex flex-col items-center gap-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${isCompleted ? 'bg-pink-500 text-white' : 'bg-foreground/10 text-foreground/60'}`}>
                              {day}
                            </div>
                            {isCompleted && <Check className="w-3 h-3 text-pink-400" />}
                         </div>
                       )
                    })}
                    
                    <div className="flex items-center justify-center h-7">
                       <span className="text-foreground/30 font-bold tracking-widest text-xs mx-1">...</span>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1">
                       <div className="w-7 h-7 rounded-full border border-pink-500/40 flex items-center justify-center bg-transparent">
                          <Gift className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                       </div>
                       <span className="text-[8px] text-foreground/60 font-medium">30</span>
                    </div>
                 </div>
              </div>
           </div>

           <Link href="/journey" className="block w-full">
             <div className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold h-10 text-xs flex items-center justify-center transition-colors">
               Answer Today's 5 Questions &gt;
             </div>
           </Link>
        </div>

        {/* 3. Today's Reflection Preview Card */}
        <div className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm">
           <div className="flex justify-between items-center mb-3">
             <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
               <Heart className="w-3 h-3 text-pink-500 fill-pink-500" /> TODAY'S REFLECTION
             </h3>
           </div>
           
           {(() => {
              const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
              const dToday = new Date();
              const last7: { label: string; dateStr: string }[] = Array.from({ length: 7 }, (_, i) => {
                const d = new Date(dToday);
                d.setDate(dToday.getDate() - (6 - i));
                const dateStr = d.toISOString().split("T")[0];
                const label = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
                return { label, dateStr };
              });

              const historyMap = new Map<string, string>();
              history.forEach((h: any) => historyMap.set(h.date, h.answer));
              
              const completedThisWeek = last7.filter((d) => historyMap.has(d.dateStr)).length;
              
              const isAnswered = reflectionToday?.answered === true;
              const hasQuestion = reflectionToday?.answered === false && !!reflectionToday?.question;
              const isLoading = !reflectionToday;

              return (
                 <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                       <div className="flex-1 bg-background/50 border border-border/40 rounded-xl p-2.5">
                          <p className="text-[9px] font-semibold text-foreground/70 mb-1.5">Reflection This Week</p>
                          <div className="flex justify-between">
                             {last7.map(({ label, dateStr }, i) => {
                                const answer = historyMap.get(dateStr);
                                const isToday = dateStr === dToday.toISOString().split("T")[0];
                                const match = answer?.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u);
                                const emoji = match ? match[0] : null;

                                return (
                                   <div key={i} className="flex flex-col items-center gap-1">
                                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px]
                                         ${answer ? 'bg-pink-500/15 border-pink-500/30' : (isToday ? 'bg-purple-500/15 border-purple-500/30 border-dashed text-purple-500' : 'bg-foreground/5 border-border')}`}>
                                         {emoji ?? (isToday ? "·" : "")}
                                      </div>
                                      <span className={`text-[7px] font-semibold ${isToday ? 'text-purple-500' : 'text-foreground/50'}`}>{label}</span>
                                   </div>
                                );
                             })}
                          </div>
                       </div>
                       <div className="w-[30%] bg-background/50 border border-border/40 rounded-xl p-2.5 flex flex-col justify-center">
                          <p className="text-[9px] font-semibold text-foreground/70 mb-1">Weekly</p>
                          <div className="flex items-end justify-between mb-1.5">
                             <span className="text-sm font-bold text-pink-500">{completedThisWeek} <span className="text-[8px] text-foreground/50">/ 7</span></span>
                             <div className="w-5 h-5 rounded-md bg-[#9B4DFF]/10 flex items-center justify-center">
                                <Target className="w-2.5 h-2.5 text-[#9B4DFF]" />
                             </div>
                          </div>
                          <div className="w-full h-1 bg-foreground/10 rounded-full mb-1">
                             <div className="h-full bg-pink-500 rounded-full transition-all" style={{ width: `${(completedThisWeek / 7) * 100}%` }}></div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-[11px] font-medium text-foreground/80">
                          {isAnswered 
                            ? "You've completed today's reflection." 
                            : hasQuestion || isLoading
                              ? "Today's Reflection is ready." 
                              : "No reflection available right now."}
                        </p>
                        
                        {isAnswered ? (
                          <Link href="/reflection" className="block w-full">
                            <div className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white rounded-xl font-bold h-10 text-xs shadow-[0_2px_8px_rgba(236,72,153,0.3)] flex items-center justify-center">
                              View Reflection
                            </div>
                          </Link>
                        ) : hasQuestion || isLoading ? (
                          <Link href="/reflection" className="block w-full">
                            <div className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white rounded-xl font-bold h-10 text-xs shadow-[0_2px_8px_rgba(236,72,153,0.3)] flex items-center justify-center">
                              Answer Reflection
                            </div>
                          </Link>
                        ) : null}
                    </div>
                 </div>
              );
           })()}
        </div>

        {/* 5. Personality Analysis */}
        <div className="bg-card border border-border/40 shadow-sm rounded-[1.5rem] p-5">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
               <BarChart3 className="w-3 h-3 text-[#9B4DFF]" /> PERSONALITY ANALYSIS
             </h3>
             <Link href="/my-story#personality-snapshot">
               <span className="text-[10px] font-bold text-[#9B4DFF] cursor-pointer hover:underline">View Full Analysis &gt;</span>
             </Link>
           </div>
           
           <div className="flex items-center gap-5 mb-4">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                 <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                   <circle cx="40" cy="40" r="36" className="stroke-muted/30 fill-none" strokeWidth="5" />
                   <circle cx="40" cy="40" r="36" className="stroke-[#9B4DFF] fill-none" strokeWidth="5" strokeDasharray="226" strokeDashoffset={226 - (overallAlignment / 100) * 226} strokeLinecap="round" />
                 </svg>
                 <div className="flex flex-col items-center">
                    <span className="text-xl font-black text-foreground leading-none">{overallAlignment}<span className="text-xs text-foreground/60">%</span></span>
                    <span className="text-[7px] font-bold text-foreground/50 mt-1 text-center">OVERALL</span>
                 </div>
              </div>

              <div className="flex flex-col gap-2 flex-1 min-w-0">
                 {[
                   { icon: Heart, label: "Connection", val: `${connectionScore}%`, color: "text-[#9B4DFF]", bg: "bg-[#9B4DFF]/20" },
                   { icon: ShieldCheck, label: "Stability", val: `${stabilityScore}%`, color: "text-blue-500", bg: "bg-blue-500/20" },
                   { icon: TrendingUp, label: "Growth", val: `${growthScore}%`, color: "text-orange-500", bg: "bg-orange-500/20" },
                   { icon: Target, label: "Exploration", val: `${explorationScore}%`, color: "text-pink-500", bg: "bg-pink-500/20" },
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-md ${item.bg} flex items-center justify-center shrink-0`}>
                           <item.icon className={`w-2.5 h-2.5 ${item.color}`} />
                        </div>
                        <span className="text-[10px] font-medium text-foreground/80">{item.label}</span>
                      </div>
                      <span className="text-[11px] font-bold">{item.val}</span>
                   </div>
                 ))}
              </div>
           </div>


        </div>

        {/* 6. Quick Actions */}
        <div className="space-y-3">
           <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest">QUICK ACTIONS</h3>
           <div className="flex justify-between items-center w-full gap-1">
              {[
                { icon: Search, label: "Discover", color: "text-pink-500", bg: "bg-pink-500/10", path: "/discover" },
                { icon: Heart, label: "Matches", color: "text-rose-500", bg: "bg-rose-500/10", path: "/matches" },
                { icon: MessageCircle, label: "Chat", color: "text-green-500", bg: "bg-green-500/10", badge: unreadChatCount > 0 ? unreadChatCount.toString() : undefined, path: "/chat" },
                { icon: BarChart3, label: "Story", color: "text-orange-500", bg: "bg-orange-500/10", path: "/my-story#personality-snapshot" },
                { icon: Eye, label: "Profile", color: "text-blue-500", bg: "bg-blue-500/10", path: "/profile" },
              ].map((act, i) => (
                <div key={i} onClick={() => navigate(act.path)} className="flex items-center justify-center gap-1 p-1.5 px-2 rounded-full bg-card border border-border/40 hover:border-border transition-all cursor-pointer shadow-sm flex-1 min-w-0 relative">
                   <div className={`w-4 h-4 shrink-0 rounded-full ${act.bg} flex items-center justify-center`}>
                      <act.icon className={`w-2.5 h-2.5 ${act.color}`} />
                   </div>
                   <span className="text-[8px] font-bold text-foreground/80 truncate">{act.label}</span>
                   {act.badge && <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full flex items-center justify-center text-[7px] font-bold text-white shadow-sm">{act.badge}</span>}
                </div>
              ))}
           </div>
        </div>

        {/* 7. Top Matches */}
        <div className="space-y-3">
           <div className="flex items-center justify-between">
             <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest">TOP MATCHES</h3>
             <Link href="/matches">
               <span className="text-[10px] font-bold text-pink-500 uppercase tracking-wider hover:underline cursor-pointer">View All</span>
             </Link>
           </div>
           
           {(() => {
              const answeredQuestions = (journeyProgress as any)?.answeredQuestions || 0;
              
              if (answeredQuestions < 5) {
                 return (
                    <div className="bg-card border border-border/40 rounded-[1.5rem] p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col items-center justify-center">
                       <div className="w-14 h-14 bg-pink-500/10 rounded-full flex items-center justify-center mb-4">
                          <Heart className="w-7 h-7 text-pink-500" />
                       </div>
                       <h4 className="text-sm font-bold text-foreground mb-2">Unlock Your Matches</h4>
                       <p className="text-xs text-muted-foreground mb-5 max-w-[200px] mx-auto leading-relaxed">
                          Complete your first 5 questions (Day 1) to reveal your top compatible matches.
                       </p>
                       <Link href="/journey">
                         <Button className="h-10 text-xs bg-gradient-to-r from-pink-500 to-[#9B4DFF] hover:opacity-90 rounded-full px-8 font-bold text-white shadow-lg">
                            Start Journey
                         </Button>
                       </Link>
                    </div>
                 );
              }

              const getScore = (m: any) => Number(m.compatibilityScore || m.profile?.valueMatchScore || m.profile?.compatibilityScore || 0);
              const validMatches = (matchesData?.matches || [])
                  .filter((m: any) => getScore(m) > 10)
                  .sort((a: any, b: any) => getScore(b) - getScore(a))
                  .slice(0, 3);

              if (validMatches.length === 0) {
                 return (
                    <div className="bg-card border border-border/40 rounded-[1.5rem] p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col items-center justify-center">
                       <div className="w-14 h-14 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                          <Search className="w-6 h-6 text-muted-foreground" />
                       </div>
                       <h4 className="text-sm font-bold text-foreground mb-2">Finding Matches...</h4>
                       <p className="text-xs text-muted-foreground mb-0 max-w-[200px] mx-auto leading-relaxed">
                          Check back later or answer more questions to improve your profile accuracy.
                       </p>
                    </div>
                 );
              }

              return (
                 <div className="grid grid-cols-3 gap-2 w-full">
                    {validMatches.map((matchItem: any, i: number) => {
                       const match = matchItem.profile;
                       const photo = match.photos?.find((p: any) => p.isPrimary) ?? match.photos?.[0];
                       const displayName = match.displayName ?? match.firstName;
                       
                       return (
                         <div key={i} className="w-full aspect-[4/5] rounded-xl bg-card border border-border/40 relative overflow-hidden active:scale-[0.98] transition-transform shadow-[0_4px_12px_rgb(0,0,0,0.05)] cursor-pointer group" onClick={() => navigate(`/profile/${match.id}`)}>
                            {photo ? (
                              <img src={photo.url} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" alt={displayName} />
                            ) : (
                              <div className="absolute inset-0 w-full h-full bg-slate-200 dark:bg-primary/20" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                            
                            {matchItem.isNew && (
                              <div className="absolute top-1.5 left-1.5 bg-pink-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-md">NEW</div>
                            )}
                            
                            <div className="absolute bottom-1.5 left-1.5 right-1.5 flex flex-col pointer-events-none">
                               <h4 className="text-[10px] font-bold text-white mb-0.5 leading-tight truncate drop-shadow-sm">
                                 {displayName}{match.age ? `, ${match.age}` : ""}
                               </h4>
                               {(match.city || match.country) && (
                                 <span className="text-[7px] text-white/80 font-medium mb-1 line-clamp-1 drop-shadow-sm">
                                   {[match.city, match.country].filter(Boolean).join(", ")}
                                 </span>
                               )}
                               <div className="flex items-center gap-1 text-white text-[7px] font-black bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/20 w-fit shadow-sm">
                                  {getScore(matchItem)}%
                               </div>
                            </div>
                         </div>
                       );
                    })}
                 </div>
              );
           })()}
        </div>


      </div>
    </AppLayout>
  );
}
