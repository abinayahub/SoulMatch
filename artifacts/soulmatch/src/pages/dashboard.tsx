import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Link, useLocation } from "wouter";
import { 
  User, CalendarDays, Flame, Gift, ChevronRight, 
  Target, PenTool, Image as ImageIcon, 
  MessageCircle, TrendingUp, 
  Eye, Heart, ShieldCheck, Check, Bell, BarChart3, Brain, Lightbulb, Search, Sparkles, Pencil,
  Lock, CheckCircle2
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

function SwipeToUnlockButton({ label, onSwipeComplete }: { label: string; onSwipeComplete: () => void }) {
  const x = useMotionValue(0);
  const fillWidth = useTransform(x, [0, 190], ['0%', '100%']);
  const [unlocked, setUnlocked] = useState(false);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 130) {
      setUnlocked(true);
      onSwipeComplete();
    }
  };

  return (
    <div className="relative w-full h-[clamp(48px,13.5vw,60px)] rounded-full overflow-hidden hero-journey-button p-1 flex items-center justify-between select-none">
      {/* 1. Base Layer (Unswiped): Centered Dark Text + Right-Aligned Chevrons */}
      <div className="absolute inset-0 flex items-center justify-between pointer-events-none pl-[60px] pr-[18px] z-0">
        <span className="flex-1 text-center text-[clamp(13px,3.8vw,15px)] font-extrabold text-[#242424] tracking-wide whitespace-nowrap">
          {label}
        </span>

        <div className="flex items-center justify-end gap-[4px] min-w-[60px] shrink-0 text-white">
          <ChevronRight className="w-4 h-4 text-white shrink-0 opacity-95" strokeWidth={2.5} />
          <ChevronRight className="w-4 h-4 text-white shrink-0 opacity-95" strokeWidth={2.5} />
          <ChevronRight className="w-4 h-4 text-white shrink-0 opacity-95" strokeWidth={2.5} />
        </div>
      </div>

      {/* 2. Swiped Layer: Filled Vibrant Rose Pink Track + Crisp White Text + Right-Aligned Chevrons */}
      <motion.div 
        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#FF7E95] to-[#FF477E] rounded-full pointer-events-none z-10 overflow-hidden"
        style={{ width: unlocked ? '100%' : fillWidth }}
      >
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none pl-[60px] pr-[18px] min-w-[280px]">
          <span className="flex-1 text-center text-[clamp(13px,3.8vw,15px)] font-extrabold text-white tracking-wide whitespace-nowrap drop-shadow-xs">
            {label}
          </span>

          <div className="flex items-center justify-end gap-[4px] min-w-[60px] shrink-0 text-white">
            <ChevronRight className="w-4 h-4 text-white shrink-0 opacity-95" strokeWidth={2.5} />
            <ChevronRight className="w-4 h-4 text-white shrink-0 opacity-95" strokeWidth={2.5} />
            <ChevronRight className="w-4 h-4 text-white shrink-0 opacity-95" strokeWidth={2.5} />
          </div>
        </div>
      </motion.div>

      {/* 3. Draggable Circle Knob */}
      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: 0, right: 190 }}
        dragElastic={0.05}
        dragSnapToOrigin
        onDragEnd={handleDragEnd}
        animate={{ x: unlocked ? 190 : undefined }}
        className="w-[42px] h-[42px] sm:w-[50px] sm:h-[50px] rounded-full bg-white text-[#242424] flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing z-20 shrink-0"
      >
        <MessageCircle className="w-5 h-5 text-[#FF6B8B]" strokeWidth={2.5} />
      </motion.div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showLockedModal, setShowLockedModal] = useState(false);

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
      ? "premium-glass-card-highlighted px-5 py-4 sm:px-6 sm:py-5 relative flex flex-col gap-2.5 shrink-0 h-auto" 
      : "premium-glass-card px-5 py-4 sm:px-6 sm:py-5 relative flex flex-col gap-2.5 shrink-0 h-auto opacity-95";
  };

  const getButtonStyle = (step: number) => {
    if (activeStep === step) {
      return "primary-action-button text-[#242424]";
    } else if (step === 2) {
      return "bg-white/70 hover:bg-white/90 border border-white/60 text-[#444444] shadow-sm";
    } else if (step === 3) {
      return "bg-white/70 hover:bg-white/90 border border-white/60 text-[#444444] shadow-sm";
    }
    return "bg-white/70 hover:bg-white/90 border border-white/60 text-[#444444] shadow-sm";
  };

  return (
    <AppLayout>
      <div 
        className="w-full min-h-screen"
        style={{ background: 'linear-gradient(135deg, #FAF2EF 0%, #F5F0FB 50%, #FFFDFB 75%, #F7F7FA 100%)' }}
      >
        <div className="w-full max-w-md mx-auto px-[clamp(12px,3.56vw,16px)] pt-[clamp(12px,3.56vw,16px)] pb-[clamp(14px,4.07vw,18px)] space-y-3 flex flex-col">
          <style>{`
            .premium-glass-card {
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 240, 245, 0.4)) !important;
              backdrop-filter: blur(26px) !important;
              -webkit-backdrop-filter: blur(26px) !important;
              border: 1px solid rgba(248, 214, 221, 0.4) !important;
              box-shadow: 0 10px 30px rgba(246, 168, 183, 0.08) !important;
              border-radius: 28px !important;
            }
            .hero-journey-card {
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 240, 245, 0.4)) !important;
              backdrop-filter: blur(26px) !important;
              -webkit-backdrop-filter: blur(26px) !important;
              border: 1px solid rgba(248, 214, 221, 0.4) !important;
              box-shadow: 0 10px 30px rgba(246, 168, 183, 0.08) !important;
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
            className="relative w-full h-auto overflow-hidden premium-glass-card rounded-[28px] flex items-center pl-[clamp(17px,5.09vw,23px)] pr-[clamp(12px,3.56vw,16px)] py-4 sm:py-5 shrink-0"
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
            <div className="relative z-10 w-full flex flex-col justify-center pr-[65px] sm:pr-[85px]">
              <h1 className="text-[clamp(14px,4.5vw,18px)] font-black text-[#252525] leading-tight line-clamp-1 break-words">
                {getGreeting()}, <span className="text-[#F6A8B7] font-black">{user?.firstName || "Mani"} !</span>
              </h1>
              <p className="text-[clamp(11px,3.31vw,13px)] font-medium text-[#6D6D6D] mt-0.5 flex items-center gap-1">
                <span>Let's continue your journey</span>
                <span className="text-[#F6A8B7]">💗</span>
              </p>
            </div>

            {/* Mascot — slightly zoomed for an even, balanced look on the card */}
            <div className="absolute right-2 sm:right-3 top-0 bottom-0 z-10 flex items-center justify-end pointer-events-none">
              <motion.div 
                animate={{ y: [0, -2, 0] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative h-[110%] max-h-[82px] flex items-center justify-end scale-110"
              >
                <img 
                  src="/mascot_light.png" 
                  alt="Mascot Light" 
                  className="h-full w-auto object-contain mix-blend-darken"
                  style={{
                    maskImage: 'radial-gradient(circle at center, black 45%, transparent 78%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 78%)'
                  }}
                />
              </motion.div>
            </div>



          </motion.div>

          {/* 2. 30-Day Journey */}
          <div className="hero-journey-card px-5 py-4 sm:px-6 sm:py-5 relative overflow-hidden flex flex-col shrink-0 h-auto">
             <div className="mb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[clamp(16px,5vw,20px)] font-extrabold text-[#1F1F1F] tracking-tight pr-1 truncate">
                    Your 30-Day Journey
                  </h3>
                  <span className="text-[clamp(11px,3.2vw,13px)] font-black text-[#FF6B8B] bg-[#FFF0F5] border border-[#FFD6E0] px-2.5 py-1 rounded-full shrink-0 shadow-xs">
                    Streak Day {Math.floor(((journeyProgress as any)?.answeredQuestions || 0) / 5)}
                  </span>
                </div>
             </div>
             
             <div className="w-full">
                {(() => {
                  const isCompleted = (journeyProgress as any)?.journeyCompleted === true || answeredQuestions >= 30;
                  return (
                    <SwipeToUnlockButton 
                      label={isCompleted ? "🎉 Journey Complete" : `Swipe to unlock Day ${Math.min(30, Math.floor(answeredQuestions / 5) + 1)}`}
                      onSwipeComplete={() => navigate(isCompleted ? '/discover' : '/journey')}
                    />
                  );
                })()}
             </div>

             {/* 5-Day Completed Timeline Stepper + Seamless Track to Gift Icon */}
             {(() => {
                const curDay = Math.min(30, Math.floor(answeredQuestions / 5) + 1);
                const endNum = Math.min(29, Math.max(5, curDay));
                const startNum = Math.max(1, endNum - 4);
                const fiveDays = [startNum, startNum + 1, startNum + 2, startNum + 3, endNum];

                return (
                   <div className="w-full mt-4 pt-1 relative flex items-center justify-between px-2 select-none">
                      {/* Unified Base Track Line across full stepper */}
                      <div className="absolute left-5 right-5 top-1/2 -translate-y-1/2 h-[2px] bg-[#F8D6DD] rounded-full z-0" />
                      
                      {/* Active Progress Track Line */}
                      <div 
                        className="absolute left-5 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-[#FF7E95] to-[#FF477E] rounded-full z-0 transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(82, Math.max(0, ((curDay - startNum) / 4) * 68))}%` }}
                      />

                      {fiveDays.map((dayNum) => {
                         const isDone = dayNum < curDay;
                         const isCurrent = dayNum === curDay;

                         return (
                            <div key={dayNum} className="relative z-10 flex items-center justify-center">
                               {isDone ? (
                                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-[#FF7E95] to-[#FF477E] text-white flex items-center justify-center shadow-xs">
                                     <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                  </div>
                               ) : isCurrent ? (
                                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#FF477E] bg-white text-[#FF477E] font-black text-xs sm:text-sm flex items-center justify-center shadow-sm">
                                     {dayNum}
                                  </div>
                               ) : (
                                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-[#F8D6DD] bg-white text-gray-400 font-bold text-xs flex items-center justify-center">
                                     {dayNum}
                                  </div>
                               )}
                            </div>
                         );
                      })}

                      {/* Gift Icon Node (30 Day Reward) */}
                      <div className="relative z-10 flex items-center justify-center">
                         {curDay >= 30 ? (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#FF7E95] to-[#FF477E] text-white flex items-center justify-center shadow-xs">
                               <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                         ) : (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#FF8FA8] bg-gradient-to-br from-white to-[#FFE6EC] text-[#FF477E] flex items-center justify-center shadow-xs" title="Day 30 Gift Reward">
                               <Gift className="w-4 h-4 text-[#FF477E]" strokeWidth={2.2} />
                            </div>
                         )}
                      </div>
                   </div>
                );
             })()}
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
             <div className="w-full mt-3">
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
                className="w-full pt-2.5 mt-2.5 border-t border-[#F5F5F5] flex items-center justify-between cursor-pointer group px-2"
             >
                <div className="flex items-center gap-3">
                   <BarChart3 className="w-[clamp(15px,4.58vw,21px)] h-[clamp(15px,4.58vw,21px)] text-[#F6A8B7]" strokeWidth={2.5} />
                   <span className="text-[clamp(14px,4.07vw,18px)] font-extrabold text-[#252525] group-hover:text-[#F6A8B7] transition-colors">View Full Analysis</span>
                </div>
                <ChevronRight className="w-[clamp(17px,5.09vw,23px)] h-[clamp(17px,5.09vw,23px)] text-[#252525]" strokeWidth={2.5} />
             </div>
          </div>


          {/* 7. Top Matches */}
          <div className="space-y-2">
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-[clamp(15px,4.58vw,21px)] font-bold text-[#252525]">Top Matches</h3>
               <Link href="/matches">
                 <span className="text-[clamp(11px,3.31vw,15px)] font-bold text-[#F6A8B7] hover:underline cursor-pointer">View Matches</span>
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
                         const score = getScore(matchItem);
                         const isLocked = matchItem?.isLocked === true || (matchItem?.isUnlocked !== true && answeredQuestions < 30);
                         
                         return (
                           <div 
                             key={i} 
                             className="w-full h-[clamp(153px,45.80vw,207px)] rounded-2xl bg-[#FFF8F8] border border-white/80 relative overflow-hidden active:scale-[0.98] transition-transform shadow-[0_4px_16px_rgba(255,143,168,0.15)] cursor-pointer group select-none" 
                             onClick={() => {
                               if (isLocked) {
                                 setShowLockedModal(true);
                               } else {
                                 navigate(`/profile/${match.id}`);
                               }
                             }}
                           >
                              {photo ? (
                                <img 
                                  src={photo.url} 
                                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                                    isLocked ? 'blur-xl scale-125 opacity-70' : 'opacity-90 group-hover:scale-105'
                                  }`} 
                                  alt="Match Preview" 
                                />
                              ) : (
                                <div className="absolute inset-0 w-full h-full bg-[#FFF8F8]" />
                              )}
                              
                              {/* Pastel White Frosted Glass Overlay (NO BLACK OVERLAY) */}
                              {isLocked ? (
                                <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8F8]/75 via-[#FDF2F5]/80 to-[#FFF3EF]/85 backdrop-blur-xl pointer-events-none" />
                              ) : (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                              )}
                              
                              {/* Content based on Lock state */}
                              {isLocked ? (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-between p-2 text-center">
                                  {/* Top Badge: Match % */}
                                  <div className="bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full border border-[#F8D6DD] shadow-xs flex items-center gap-1">
                                     <span className="text-[10px] font-black text-[#FF477E] leading-none">{score}%</span>
                                     <span className="text-[7px] font-extrabold text-[#FF6B8B] tracking-wider uppercase leading-none">MATCH</span>
                                  </div>

                                  {/* Center Lock Icon */}
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF7E95] to-[#FF477E] flex items-center justify-center text-white shadow-xs my-auto animate-pulse">
                                    <Lock className="w-4 h-4 text-white" strokeWidth={2.2} />
                                  </div>

                                  {/* Bottom Lock Subtext */}
                                  <div className="text-[9px] font-black text-[#252525] leading-tight drop-shadow-sm mb-0.5">
                                     🔒 Locked
                                  </div>
                                </div>
                              ) : (
                                /* Unlocked Content */
                                <>
                                  {matchItem.isNew && (
                                    <div className="absolute top-1.5 left-1.5 text-[#252525] rounded-full border border-white/40 transition-all text-[clamp(6px,1.78vw,8px)] font-black px-1.5 py-0.5 uppercase tracking-wider shadow-md" style={{ background: 'linear-gradient(135deg, #F8C7C8, #F8D9D2, #F7E8EE)', boxShadow: '0 4px 12px rgba(246, 168, 183, 0.15)' }}>NEW</div>
                                  )}
                                  
                                  <div className="absolute bottom-2 left-2 right-2 flex flex-col pointer-events-none z-10">
                                     <h4 className="text-[clamp(10px,3.05vw,14px)] font-bold text-white mb-0.5 leading-tight truncate drop-shadow-sm">
                                       {displayName}{match.age ? `, ${match.age}` : ""}
                                     </h4>
                                     {(match.city || match.country) && (
                                       <span className="text-[clamp(8px,2.29vw,10px)] text-white/80 font-medium mb-1 line-clamp-1 drop-shadow-sm">
                                         {[match.city, match.country].filter(Boolean).join(", ")}
                                       </span>
                                     )}
                                     <div className="flex items-center gap-1 text-[#FF477E] text-[clamp(8px,2.29vw,10px)] font-black bg-white/90 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/40 w-fit shadow-xs">
                                        {score}% MATCH
                                     </div>
                                  </div>
                                </>
                              )}
                           </div>
                         );
                      })}
                   </div>
                );
             })()}
          </div>

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
