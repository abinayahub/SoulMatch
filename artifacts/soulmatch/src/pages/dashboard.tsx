import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { 
  User, CalendarDays, Flame, Gift, ChevronRight, 
  Target, PenTool, Image as ImageIcon, 
  MessageCircle, TrendingUp, 
  Eye, Heart, ShieldCheck, Check, Bell, BarChart3, Brain, Lightbulb, Search, Sparkles, Pencil
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth, getAccessToken } from "@/lib/auth-context";
import { useGetJourneyProgress, useGetPersonalityProfile, useGetMatches, useGetConversations, useGetNotifications } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressRing } from "@/components/ui/ProgressRing";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { 
    Authorization: `Bearer ${token}`,
    "x-timezone-offset": String(new Date().getTimezoneOffset())
  } as Record<string, string>;
}

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
  };

  const { data: matchesData, isLoading: loadingMatches } = useGetMatches(
    { page: 1, limit: 10 },
    { query: { enabled: true }, request: { headers: authHeaders() } } as any,
  );

  const { data: journeyProgress, isLoading: loadingJourney } = useGetJourneyProgress({ query: { enabled: true }, request: { headers: authHeaders() } } as any);
  
  const { data: personalityProfile, isLoading: loadingPersonality } = useGetPersonalityProfile({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const { data: conversations = [], isLoading: loadingConversations } = useGetConversations({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const { data: notificationsData, isLoading: loadingNotifications } = useGetNotifications(
    { page: 1 },
    { query: { enabled: true }, request: { headers: authHeaders() } } as any,
  );
  
  const { data: history = [], isLoading: loadingHistory } = useQuery<any[]>({
    queryKey: ["/api/reflections/history"],
    queryFn: () => apiRequest("/reflections/history", { headers: authHeaders() }),
  });

  const { data: reflectionToday, isLoading: loadingReflectionToday } = useQuery<any>({
    queryKey: ["/api/reflections/today"],
    queryFn: () => apiRequest("/reflections/today", { headers: authHeaders() }),
  });

  const isLoading = loadingJourney || loadingPersonality || !user;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="w-full min-h-screen soulmatch-dashboard-bg">
          <div className="w-full max-w-md mx-auto px-4 py-6 space-y-5 flex flex-col pt-8">
            {/* Skeleton for Header Premium Hero Card */}
            <div className="relative w-full rounded-[28px] p-5 bg-white/40 border border-white/30 h-28 flex flex-col justify-between">
              <Skeleton className="h-6 w-2/3 rounded-lg" />
              <Skeleton className="h-4 w-5/6 rounded-lg" />
            </div>

            {/* Skeleton for 30-Day Journey Card */}
            <div className="bg-white/40 border border-white/30 rounded-[28px] p-5 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/3 rounded-lg" />
                <Skeleton className="h-3 w-12 rounded-lg" />
              </div>
              <Skeleton className="h-3 w-1/2 rounded-lg" />
              <div className="flex items-center gap-3">
                <Skeleton className="w-14 h-14 rounded-full shrink-0" />
                <div className="flex gap-2 flex-1 overflow-hidden">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="w-7 h-7 rounded-full" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-[clamp(48px,14.25vw,64px)] w-full rounded-full" />
            </div>

            {/* Skeleton for Today's Reflection Card */}
            <div className="bg-white/40 border border-white/30 rounded-[28px] p-5 space-y-3">
              <Skeleton className="h-3 w-1/4 rounded-lg" />
              <div className="flex gap-3">
                <Skeleton className="flex-1 h-12 rounded-xl" />
                <Skeleton className="w-[30%] h-12 rounded-xl" />
              </div>
              <Skeleton className="h-[clamp(48px,14.25vw,64px)] w-full rounded-full" />
            </div>

            {/* Skeleton for Personality Analysis Card */}
            <div className="bg-white/40 border border-white/30 rounded-[28px] p-5 space-y-3">
              <Skeleton className="h-3 w-1/3 rounded-lg" />
              <div className="flex gap-5">
                <Skeleton className="w-20 h-20 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-3 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const unreadChatCount = conversations.reduce((acc: number, conv: any) => acc + (conv.unreadCount || 0), 0);
  const answeredQuestions = (journeyProgress as any)?.answeredQuestions || 0;
  const analysisProgressPercent = Math.min(100, Math.round((answeredQuestions / 150) * 100));
  const displayDay = Math.max(1, Math.ceil(answeredQuestions / 5));
  const streak = Math.min((journeyProgress as any)?.streak || 0, displayDay);
  const progressPercent = (journeyProgress as any)?.completionPercentage || 0;

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

  const questionsRemaining = (journeyProgress as any)?.questionsRemainingToday;
  const journeyCompletedToday = questionsRemaining !== undefined ? questionsRemaining === 0 : false;
  
  let activeStep = 1;
  if (!journeyCompletedToday) {
    activeStep = 1;
  } else if (!isAnswered) {
    activeStep = 2;
  } else {
    activeStep = 3;
  }

  const getCardClass = (step: number) => {
    return activeStep === step 
      ? "premium-glass-card-highlighted px-[clamp(20px,6.11vw,28px)] py-[clamp(19px,5.60vw,25px)] relative flex flex-col gap-3 shrink-0 h-auto" 
      : "premium-glass-card px-[clamp(20px,6.11vw,28px)] py-[clamp(19px,5.60vw,25px)] relative flex flex-col gap-3 shrink-0 h-auto opacity-95";
  };

  const getButtonStyle = (step: number) => {
    if (activeStep === step) {
      return "primary-action-button text-[#242424]";
    } else if (step === 2) {
      return "bg-white/70 hover:bg-white/90 border border-white/60 text-[#444444] shadow-sm";
    } else if (step === 3) {
      return "bg-transparent hover:bg-white/40 border border-white/60 text-[#777777]";
    } else {
      return "bg-white/60 hover:bg-white/80 border border-white/50 text-[#555555]";
    }
  };

  return (
    <AppLayout>
      <div 
        className="w-full min-h-screen"
        style={{ background: 'linear-gradient(135deg, #FAF2EF 0%, #F5F0FB 50%, #FFFDFB 75%, #F7F7FA 100%)' }}
      >
        <div className="w-full max-w-md mx-auto px-[clamp(12px,3.56vw,16px)] pt-[clamp(12px,3.56vw,16px)] pb-[clamp(14px,4.07vw,18px)] space-y-4 flex flex-col">
          <style>{`
            .premium-glass-card {
              background: rgba(255, 255, 255, 0.48) !important;
              backdrop-filter: blur(26px) !important;
              -webkit-backdrop-filter: blur(26px) !important;
              border: 1px solid rgba(255, 255, 255, 0.35) !important;
              box-shadow: 0 12px 35px rgba(80, 80, 80, 0.08) !important;
              border-radius: 24px !important;
            }
            .hero-journey-card {
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 240, 245, 0.4)) !important;
              backdrop-filter: blur(26px) !important;
              -webkit-backdrop-filter: blur(26px) !important;
              border: 1.5px solid rgba(246, 168, 183, 0.85) !important;
              box-shadow: 0 10px 30px rgba(246, 168, 183, 0.1) !important;
              border-radius: 28px !important;
            }
            .hero-journey-button {
              background: linear-gradient(135deg, #FFB8B0, #FFC9BF, #F8C3C6) !important;
              color: #242424 !important;
              box-shadow: 0 4px 12px rgba(246, 168, 183, 0.15) !important;
              border: 1px solid rgba(255, 255, 255, 0.6) !important;
              transition: all 0.3s ease;
            }
            .hero-journey-button:hover {
              box-shadow: 0 6px 16px rgba(246, 168, 183, 0.25) !important;
              transform: translateY(-1px);
            }
            .hero-journey-button:active {
              transform: translateY(1px);
              box-shadow: 0 2px 8px rgba(246, 168, 183, 0.1) !important;
            }
            .premium-glass-card-highlighted {
              background: rgba(255, 255, 255, 0.65) !important;
              backdrop-filter: blur(26px) !important;
              -webkit-backdrop-filter: blur(26px) !important;
              border: 1px solid rgba(255, 255, 255, 0.65) !important;
              box-shadow: 0 16px 40px rgba(246, 168, 183, 0.15) !important;
              border-radius: 24px !important;
            }
            .premium-pastel-button {
              background: linear-gradient(135deg, #F9C7C7, #F8D8D0, #F6E3EA) !important;
              color: #2A2A2A !important;
              box-shadow: 0 4px 12px rgba(246, 168, 183, 0.15) !important;
              border: 1px solid rgba(255, 255, 255, 0.4) !important;
            }
            .primary-action-button {
              background: linear-gradient(135deg, #FFB8B0, #FFC9BF, #F8C3C6) !important;
              color: #242424 !important;
              box-shadow: 0 6px 16px rgba(246, 168, 183, 0.25) !important;
              border: 1px solid rgba(255, 255, 255, 0.6) !important;
              transition: all 0.3s ease;
            }
            .primary-action-button:hover {
              box-shadow: 0 8px 20px rgba(246, 168, 183, 0.35) !important;
              transform: translateY(-1px);
            }
            .primary-action-button:active {
              transform: translateY(1px);
              box-shadow: 0 2px 8px rgba(246, 168, 183, 0.2) !important;
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
          
          {/* 1. Top Header Premium Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-full h-auto overflow-hidden premium-glass-card rounded-[28px] flex items-center pl-[clamp(17px,5.09vw,23px)] pr-[clamp(12px,3.56vw,16px)] py-[clamp(18px,5.2vw,22px)] shrink-0"
          >
            {/* Soft misty gradient backdrop waves to merge mascot seamlessly */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FAF2EF]/30 via-[#F5F0FB]/20 to-[#FFFDFB]/15 pointer-events-none" />
            <div className="absolute right-0 top-0 w-[42%] h-full pointer-events-none overflow-hidden rounded-r-[28px]">
              {/* Soft Peach Wave Glow */}
              <div className="absolute right-[-15px] bottom-[-25px] w-[clamp(111px,33.08vw,150px)] h-[clamp(77px,22.90vw,103px)] rounded-full bg-gradient-to-tr from-[#F8D8D0] to-[#F6A8B7] opacity-70 blur-xl pointer-events-none" />
              {/* Soft Lavender Wave Glow */}
              <div className="absolute right-[-25px] top-[-15px] w-[clamp(94px,27.99vw,126px)] h-[clamp(77px,22.90vw,103px)] rounded-full bg-gradient-to-br from-[#EADCF8] to-[#F6A8B7] opacity-60 blur-xl pointer-events-none" />
              {/* White spotlight blend directly behind the mascot */}
              <div className="absolute right-6 top-[clamp(13px,3.82vw,17px)] w-[clamp(60px,17.81vw,81px)] h-[clamp(60px,17.81vw,81px)] rounded-full bg-white/80 blur-lg pointer-events-none" />
            </div>
            
            {/* Text Content — full width with right padding reserved for mascot */}
            <div className="relative z-10 w-full flex flex-col justify-center pr-[clamp(95px,29vw,135px)] sm:pr-[135px]">
              <h1 className="text-[clamp(14px,5vw,19px)] font-black text-[#252525] leading-tight mb-1 line-clamp-1 break-words">
                {getGreeting()}, <span className="text-[#F6A8B7] font-black">{user?.firstName || "Mani"} !</span>
              </h1>
              <p className="text-[#777777] text-[clamp(10.5px,3.2vw,13px)] font-medium tracking-tight mt-0.5 leading-snug flex items-center">
                Every answer brings you closer to someone who truly understands you.
              </p>
            </div>

            {/* Mascot — absolutely anchored to the right, not in text flex flow */}
            <div className="absolute right-0 top-0 bottom-0 w-[clamp(89px,26.72vw,121px)] z-10 flex items-center justify-end pr-2">
              {/* Pink radial aura matching mascot's own soft pink background */}
              <div className="absolute inset-0 rounded-full bg-[#FADADD] opacity-90 blur-md pointer-events-none scale-[0.85]" />
              <div className="absolute inset-0 rounded-full bg-[#FAD0D8]/70 opacity-80 blur-2xl pointer-events-none scale-[1.1]" />
              <motion.div 
                animate={{ y: [0, -2.5, 0] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative z-10 w-full h-[clamp(68px,20.36vw,92px)] flex items-center justify-end"
              >
                <img 
                  src="/mascot_light.png" 
                  alt="Mascot Light" 
                  className="h-full w-auto object-contain scale-[1.35] origin-center"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* 2. 30-Day Journey */}
          <div className="hero-journey-card px-[clamp(20px,6.11vw,28px)] pt-[clamp(17px,5.09vw,23px)] pb-[clamp(17px,5.09vw,23px)] relative overflow-hidden flex flex-col shrink-0 h-auto">
             <div className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-[clamp(16px,5vw,20px)] font-extrabold text-[#1F1F1F] tracking-tight pr-1 truncate">
                    Your 30-Day Journey
                  </h3>
                </div>
                <p className="text-[clamp(12px,3.5vw,14px)] font-semibold text-[#444444] mb-0 line-clamp-2">
                  Answer today's questions to unlock better matches.
                </p>
             </div>
             
             <div className="flex items-center justify-between gap-3 h-[clamp(58px,17.30vw,78px)] mb-5">
                {/* Left big 0 Days indicator */}
                <div className="relative w-[clamp(50px,15vw,68px)] h-[clamp(50px,15vw,68px)] flex items-center justify-center shrink-0">
                   <ProgressRing 
                     progress={progressPercent} 
                     strokeWidth={5} 
                     gradientColors={["#FF8DA1", "#FF8DA1"]} 
                     trackColor="#FFF0F5" 
                   />
                   <div className="absolute inset-0 flex flex-col items-center justify-center mt-[1px]">
                     <span className="text-[clamp(18px,5vw,22px)] font-black text-[#FF6B8B] leading-none tracking-tighter">{Math.floor(((journeyProgress as any)?.answeredQuestions || 0) / 5)}</span>
                     <span className="text-[clamp(7px,2vw,9px)] font-extrabold text-[#FF8DA1] uppercase tracking-widest leading-none mt-[2px]">Day</span>
                   </div>
                </div>

                <div className="flex-1 flex items-center justify-start gap-[clamp(5px,1.53vw,7px)] min-w-0 pl-1 pr-1 overflow-x-auto no-scrollbar">
                   {Array.from({ length: 5 }).map((_, i) => {
                      const completedDays = Math.floor(answeredQuestions / 5);
                      const startDay = Math.max(1, Math.min(completedDays - 1, 25));
                      const day = startDay + i;
                      const isCompleted = day <= completedDays;

                      return (
                        <div 
                          key={day} 
                          className={`w-[clamp(22px,6.62vw,30px)] h-[clamp(22px,6.62vw,30px)] sm:w-[28px] sm:h-[28px] rounded-full flex items-center justify-center text-[clamp(9px,2.54vw,12px)] sm:text-[11px] font-black transition-all shrink-0 ${
                            isCompleted 
                              ? 'bg-[#FBD9D3] text-[#222222] shadow-[0_2px_8px_rgba(251,217,211,0.5)]' 
                              : 'bg-white text-[#222222] shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#222222] stroke-[2.5]" strokeWidth={2.5} /> : day}
                        </div>
                      );
                   })}
                   
                   <div className="w-3 sm:w-4 h-8 flex items-center justify-center shrink-0">
                      <span className="text-[#FF8DA1] opacity-70 font-black tracking-widest text-[clamp(10px,3.05vw,14px)] sm:text-[14px] -mt-1">...</span>
                   </div>
                   
                   {/* Day 30 Gift Round */}
                   <div className="relative w-[clamp(22px,6.62vw,30px)] h-[clamp(22px,6.62vw,30px)] sm:w-8 sm:h-8 rounded-full border-[1.5px] border-[#FFD6E0] bg-[#FFF0F5] flex items-center justify-center shadow-sm shrink-0">
                      <Gift className="w-[clamp(12px,3.56vw,16px)] h-[clamp(12px,3.56vw,16px)] sm:w-[18px] sm:h-[18px] text-[#FF8DA1]" strokeWidth={1.5} />
                      <span className="absolute -bottom-1 -right-1 sm:-right-1 bg-[#FF8DA1] text-white text-[clamp(6px,1.78vw,8px)] sm:text-[8px] font-black px-1.5 rounded-full leading-none py-[2px] border-[1.5px] border-white shadow-sm">
                        30
                      </span>
                   </div>
                </div>
             </div>

             <div className="w-full">
                <Link href="/journey" className="block w-full">
                  <Button className="w-full h-[clamp(44px,13.23vw,60px)] text-[clamp(13px,3.8vw,15px)] font-extrabold rounded-full flex items-center justify-between px-3 sm:px-5 hero-journey-button tracking-wide">
                    <MessageCircle className="w-[clamp(15px,4.58vw,21px)] h-[clamp(15px,4.58vw,21px)] sm:w-[20px] sm:h-[20px] text-[#242424] shrink-0" strokeWidth={2.5} />
                    <span className="flex-1 text-center text-[#242424] truncate px-1">Answer Today's 5 Questions</span>
                    <ChevronRight className="w-5 h-5 text-[#242424] shrink-0" strokeWidth={2.5} />
                  </Button>
                </Link>
             </div>
          </div>

          {/* 3. Today's Reflection Preview Card */}
          <div className={getCardClass(2)}>
             {/* Upper row: Icon + Text on left, circular progress on right */}
             <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                   <div className="w-[clamp(39px,11.70vw,53px)] h-[clamp(39px,11.70vw,53px)] sm:w-[52px] sm:h-[52px] rounded-full bg-[#F6A8B7]/10 flex items-center justify-center shrink-0">
                      <Heart className="w-[clamp(17px,5.09vw,23px)] h-[clamp(17px,5.09vw,23px)] sm:w-[24px] sm:h-[24px] text-[#F6A8B7]" strokeWidth={1.5} />
                   </div>
                   <div className="min-w-0 flex-1">
                      <h3 className="text-[clamp(15px,4.5vw,17px)] font-extrabold text-[#252525] leading-tight pr-1 truncate tracking-tight">Today's Reflection</h3>
                      <p className="text-[clamp(11px,3vw,12px)] text-[#444444] font-semibold mt-0.5 leading-[1.3] line-clamp-2">
                         {isAnswered ? "You've completed today's reflection." : "Complete today's reflection to maintain your weekly streak."}
                      </p>
                   </div>
                </div>
                
                {/* Circular Progress */}
                <div className="relative w-[clamp(50px,15vw,68px)] h-[clamp(50px,15vw,68px)] sm:w-[68px] sm:h-[68px] flex items-center justify-center shrink-0">
                   <ProgressRing 
                     progress={(completedThisWeek / 7) * 100} 
                     strokeWidth={5} 
                     gradientColors={["#F6A8B7", "#F8C3C6"]} 
                   />
                   <div className="absolute inset-0 flex flex-col items-center justify-center mt-0.5">
                      <span className="text-[clamp(14px,4vw,18px)] sm:text-[18px] font-extrabold text-[#252525] leading-none">{completedThisWeek}/7</span>
                      <span className="text-[clamp(7.5px,2vw,9.5px)] sm:text-[9.5px] font-bold text-[#777777] mt-[3px] text-center leading-none">This Week</span>
                   </div>
                </div>
             </div>

             {/* Lower row: Full-width button */}
             <div className="w-full mt-6">
               <Link href="/reflection" className="block w-full">
                  <Button className="h-[clamp(44px,13.23vw,60px)] sm:h-[56px] w-full rounded-full bg-white border border-[#F6A8B7]/40 hover:bg-[#F6A8B7]/5 shadow-[0_2px_12px_rgba(246,168,183,0.1)] flex items-center justify-between px-6 transition-all relative">
                     <Pencil className="w-[clamp(15px,4.58vw,21px)] h-[clamp(15px,4.58vw,21px)] text-[#F6A8B7]" strokeWidth={2.5} />
                     <span className="text-[clamp(12px,3.56vw,16px)] sm:text-[16px] font-extrabold text-[#252525] absolute left-1/2 -translate-x-1/2">{isAnswered ? "View Reflection" : "Complete Reflection"}</span>
                     <ChevronRight className="w-[clamp(17px,5.09vw,23px)] h-[clamp(17px,5.09vw,23px)] text-[#252525]" strokeWidth={3} />
                  </Button>
               </Link>
             </div>
          </div>

          {/* 5. Personality Journey */}
          <div className={getCardClass(3)}>
             {/* Upper row: Icon + Text on left, circular progress on right */}
             <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                   <div className="w-[clamp(39px,11.70vw,53px)] h-[clamp(39px,11.70vw,53px)] sm:w-[52px] sm:h-[52px] rounded-full bg-[#F6A8B7]/10 flex items-center justify-center shrink-0">
                      <Brain className="w-[clamp(17px,5.09vw,23px)] h-[clamp(17px,5.09vw,23px)] sm:w-[24px] sm:h-[24px] text-[#F6A8B7]" strokeWidth={2} />
                   </div>
                   <div className="min-w-0 flex-1">
                      <h3 className="text-[clamp(15px,4.5vw,17px)] font-extrabold text-[#252525] leading-tight pr-1 truncate tracking-tight">Personality Journey</h3>
                      <p className="text-[clamp(11px,3vw,12px)] text-[#444444] font-semibold mt-0.5 leading-[1.3] line-clamp-2">
                         Your personality profile is growing with every question.
                      </p>
                   </div>
                </div>
                
                {/* Circular Progress */}
                <div className="relative w-[clamp(50px,15vw,68px)] h-[clamp(50px,15vw,68px)] sm:w-[68px] sm:h-[68px] flex items-center justify-center shrink-0">
                   <ProgressRing 
                     progress={analysisProgressPercent} 
                     strokeWidth={5} 
                     gradientColors={["#F6A8B7", "#F8C3C6"]} 
                   />
                   <div className="absolute inset-0 flex flex-col items-center justify-center mt-0.5">
                      <span className="text-[clamp(15px,4vw,19px)] font-extrabold text-[#252525] leading-none">{analysisProgressPercent}%</span>
                      <span className="text-[clamp(8.5px,2.2vw,10.5px)] font-bold text-[#777777] mt-[3px] text-center leading-none">Progress</span>
                   </div>
                </div>
             </div>

             {/* Lower row: Full-width button link */}
             <div 
                onClick={() => navigate("/personality")}
                className="w-full pt-6 mt-6 border-t border-[#F5F5F5] flex items-center justify-between cursor-pointer group px-2"
             >
                <div className="flex items-center gap-3">
                   <BarChart3 className="w-[clamp(15px,4.58vw,21px)] h-[clamp(15px,4.58vw,21px)] text-[#F6A8B7]" strokeWidth={2.5} />
                   <span className="text-[clamp(14px,4.07vw,18px)] font-extrabold text-[#252525] group-hover:text-[#F6A8B7] transition-colors">View Full Analysis</span>
                </div>
                <ChevronRight className="w-[clamp(17px,5.09vw,23px)] h-[clamp(17px,5.09vw,23px)] text-[#252525]" strokeWidth={2.5} />
             </div>
          </div>

          {/* 6. Quick Actions */}
          <div className="space-y-2">
             <h3 className="text-[clamp(15px,4.58vw,21px)] font-bold text-[#252525] mb-2">Quick Actions</h3>
             <div className="flex overflow-x-auto no-scrollbar scroll-smooth gap-2.5 w-full pb-1 px-0.5">
                {[
                  { icon: Search, label: "Discover", color: "text-[#F6A8B7]", bg: "bg-[#F6A8B7]/10", path: "/discover" },
                  { icon: Heart, label: "Matches", color: "text-[#F6A8B7]", bg: "bg-[#F6A8B7]/10", path: "/matches" },
                  { icon: MessageCircle, label: "Chat", color: "text-[#F6A8B7]", bg: "bg-[#F6A8B7]/10", badge: unreadChatCount > 0 ? unreadChatCount.toString() : undefined, path: "/chat" },
                  { icon: BarChart3, label: "Story", color: "text-[#F6A8B7]", bg: "bg-[#F6A8B7]/10", path: "/my-story#personality-snapshot" },
                  { icon: Eye, label: "Profile", color: "text-[#F6A8B7]", bg: "bg-[#F6A8B7]/10", path: "/profile" },
                ].map((act, i) => (
                  <div key={i} onClick={() => navigate(act.path)} className="flex items-center justify-center gap-1.5 w-auto px-[clamp(10px,3.05vw,14px)] sm:px-[14px] h-[clamp(32px,9.67vw,44px)] shrink-0 rounded-full bg-white/45 border border-white/35 hover:border-white/50 transition-all cursor-pointer shadow-sm relative select-none">
                     <div className={`w-[clamp(19px,5.60vw,25px)] h-[clamp(19px,5.60vw,25px)] sm:w-[24px] sm:h-[24px] shrink-0 rounded-full ${act.bg} flex items-center justify-center`}>
                        <act.icon className={`w-[clamp(11px,3.31vw,15px)] h-[clamp(11px,3.31vw,15px)] sm:w-[15px] sm:h-[15px] ${act.color}`} strokeWidth={1.5} />
                     </div>
                     <span className="text-[clamp(11px,3.2vw,13px)] font-medium text-[#777777] leading-none whitespace-nowrap">{act.label}</span>
                     {act.badge && <span className="absolute -top-1 -right-1 min-w-[clamp(15px,4.58vw,21px)] h-[clamp(15px,4.58vw,21px)] px-1 w-full text-[#252525] rounded-full border border-white/40 transition-all flex items-center justify-center text-[clamp(9px,2.54vw,12px)] font-bold shadow-sm" style={{ background: 'linear-gradient(135deg, #F8C7C8, #F8D9D2, #F7E8EE)', boxShadow: '0 4px 12px rgba(246, 168, 183, 0.15)' }}>{act.badge}</span>}
                  </div>
                ))}
             </div>
          </div>

          {/* 7. Top Matches */}
          <div className="space-y-2">
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-[clamp(15px,4.58vw,21px)] font-bold text-[#252525]">Top Matches</h3>
               <Link href="/matches">
                 <span className="text-[clamp(11px,3.31vw,15px)] font-bold text-[#F6A8B7] hover:underline cursor-pointer">View All</span>
               </Link>
             </div>
             
             {(() => {
                const answeredQuestions = (journeyProgress as any)?.answeredQuestions || 0;
                
                if (answeredQuestions < 5) {
                   return (
                      <div className="premium-glass-card p-4 text-center flex flex-col items-center justify-center h-[clamp(153px,45.80vw,207px)]">
                         <div className="w-12 h-12 bg-[#F6A8B7]/10 rounded-full flex items-center justify-center mb-2">
                            <Heart className="w-6 h-6 text-[#F6A8B7] fill-[#F6A8B7]/5" strokeWidth={1.5} />
                         </div>
                         <h4 className="text-[clamp(13px,3.82vw,17px)] font-bold text-[#252525] mb-1">Unlock Your Matches</h4>
                         <p className="text-[clamp(11px,3.31vw,15px)] text-[#777777] mb-3 max-w-[clamp(204px,61.07vw,276px)] mx-auto leading-normal">
                            Complete your first 5 questions (Day 1) to reveal matches.
                         </p>
                         <Link href="/journey" className="block w-full">
                           <Button className="w-full h-[clamp(41px,12.21vw,55px)] text-[clamp(13px,3.82vw,17px)] font-bold premium-pastel-button rounded-full">
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
                      <div className="premium-glass-card p-4 text-center flex flex-col items-center justify-center h-[clamp(153px,45.80vw,207px)]">
                         <div className="w-12 h-12 bg-white/30 border border-white/20 rounded-full flex items-center justify-center mb-2 shadow-sm">
                            <Heart className="w-6 h-6 text-[#F6A8B7] fill-[#F6A8B7]/20" strokeWidth={1.5} />
                         </div>
                         <h4 className="text-[clamp(13px,3.82vw,17px)] font-bold text-[#252525] mb-1">Finding Matches...</h4>
                         <p className="text-[clamp(11px,3.31vw,15px)] text-[#777777] mb-0 max-w-[clamp(204px,61.07vw,276px)] mx-auto leading-normal">
                            Check back later or answer more questions to improve your profile accuracy.
                         </p>
                      </div>
                   );
                }

                return (
                   <div className="grid grid-cols-3 gap-2.5 w-full h-[clamp(153px,45.80vw,207px)]">
                      {validMatches.map((matchItem: any, i: number) => {
                         const match = matchItem.profile;
                         const photo = match.photos?.find((p: any) => p.isPrimary) ?? match.photos?.[0];
                         const displayName = match.displayName ?? match.firstName;
                         
                         return (
                           <div key={i} className="w-full h-[clamp(153px,45.80vw,207px)] rounded-xl bg-white/45 border border-white/35 relative overflow-hidden active:scale-[0.98] transition-transform shadow-sm cursor-pointer group" onClick={() => navigate(`/profile/${match.id}`)}>
                              {photo ? (
                                <img src={photo.url} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" alt={displayName} />
                              ) : (
                                <div className="absolute inset-0 w-full h-full bg-slate-200" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />
                              
                              {matchItem.isNew && (
                                <div className="absolute top-1.5 left-1.5 w-full text-[#252525] rounded-full border border-white/40 transition-all  text-[clamp(6px,1.78vw,8px)] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-md" style={{ background: 'linear-gradient(135deg, #F8C7C8, #F8D9D2, #F7E8EE)', boxShadow: '0 4px 12px rgba(246, 168, 183, 0.15)' }}>NEW</div>
                              )}
                              
                              <div className="absolute bottom-2 left-2 right-2 flex flex-col pointer-events-none">
                                 <h4 className="text-[clamp(10px,3.05vw,14px)] font-bold text-white mb-0.5 leading-tight truncate drop-shadow-sm">
                                   {displayName}{match.age ? `, ${match.age}` : ""}
                                 </h4>
                                 {(match.city || match.country) && (
                                   <span className="text-[clamp(8px,2.29vw,10px)] text-white/80 font-medium mb-1 line-clamp-1 drop-shadow-sm">
                                     {[match.city, match.country].filter(Boolean).join(", ")}
                                   </span>
                                 )}
                                 <div className="flex items-center gap-1 text-[#252525] text-[clamp(8px,2.29vw,10px)] font-black bg-[#F6A8B7]/95 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/20 w-fit shadow-sm">
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
      </div>
    </AppLayout>
  );
}
