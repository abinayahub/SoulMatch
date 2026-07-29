import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Flame, Lock, ChevronRight, ChevronLeft, Check, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  useGetJourneyQuestions, useGetJourneyProgress, useSubmitAnswer, useGetMe,
  getGetJourneyProgressQueryKey, getGetJourneyQuestionsQueryKey
} from "@workspace/api-client-react";
import { getAccessToken, useAuth } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { getMandatoryCompletion } from "@/lib/profile-utils";

const TEST_MODE = true; // TEMPORARY TESTING FLAG

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { 
    Authorization: `Bearer ${token}`,
    "x-timezone-offset": String(new Date().getTimezoneOffset()),
    "x-test-mode": TEST_MODE ? "true" : "false"
  } as Record<string, string>;
}

export default function JourneyPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [textAnswer, setTextAnswer] = useState("");
  const [scaleValue, setScaleValue] = useState(5);
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: questions = [], isLoading: loadingQ } = useGetJourneyQuestions({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const { data: profile } = useGetMe({ query: { enabled: true }, request: { headers: authHeaders() } } as any);
  const p = (profile as any) ?? user;
  const mandatoryCompletion = useMemo(() => getMandatoryCompletion(p), [p]);

  const { data: progress, isLoading: loadingP } = useGetJourneyProgress({
    query: { enabled: true, refetchInterval: 5000 } as any, // poll to unlock automatically
    request: { headers: authHeaders() },
  });

  const submitAnswer = useSubmitAnswer({ request: { headers: authHeaders() } });

  const unanswered = (questions as any[]).filter((q: any) => !q.isAnswered);
  const currentQ = unanswered[0];
  
  // Parse last answered date
  const lastAnsweredDate = progress?.lastAnsweredAt ? new Date(progress.lastAnsweredAt) : null;
  const isLastAnsweredValid = lastAnsweredDate && !isNaN(lastAnsweredDate.getTime());
  
  const completedDateStr = isLastAnsweredValid 
    ? lastAnsweredDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
    : '';
  const completedTimeStr = isLastAnsweredValid 
    ? lastAnsweredDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) 
    : '';

  // Calculate lock state
  let isLocked = false;
  let unlockDate = null;
  if (progress?.unlockedAt) {
    unlockDate = new Date(progress.unlockedAt);
    if (!isNaN(unlockDate.getTime()) && unlockDate > now) {
      isLocked = true;
    }
  }

  const totalAnswered = (progress as any)?.answeredQuestions || 0;
  const questionsRemaining = (progress as any)?.questionsRemainingToday;

  // TEST_MODE is defined at the module level

  if (!TEST_MODE) {
    // Enforce lock if they have no questions remaining today, or if they ran out of questions but haven't finished the 150-question journey
    if ((questionsRemaining !== undefined && questionsRemaining <= 0 && totalAnswered < 150) || (!currentQ && totalAnswered < 150)) {
      isLocked = true;
      if (!unlockDate || isNaN(unlockDate.getTime()) || unlockDate <= now) {
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);
        unlockDate = nextDay;
      }
    }

    // Frontend-only daily lock enforcement: Check if they were locked locally
    const localLockStr = localStorage.getItem('journeyLockedUntil');
    if (localLockStr) {
      const localLockDate = new Date(localLockStr);
      if (localLockDate && !isNaN(localLockDate.getTime()) && localLockDate > now && totalAnswered < 150) {
        isLocked = true;
        unlockDate = localLockDate;
      }
    }
  } else {
    // Bypass lock for testing
    isLocked = false;
    unlockDate = null;
  }

  const isUnlockDateValid = unlockDate !== null && !isNaN(unlockDate.getTime());
  const unlockDateStr = (unlockDate && !isNaN(unlockDate.getTime()))
    ? unlockDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
    : '';
  const unlockTimeStr = (unlockDate && !isNaN(unlockDate.getTime()))
    ? unlockDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) 
    : '';

  function getAnswer() {
    if (!currentQ) return "";
    switch (currentQ.questionType) {
      case "choice": return selectedOption;
      case "text": return textAnswer;
      case "scale": return String(scaleValue);
      case "multi_choice": return multiSelected.join(",");
      default: return textAnswer;
    }
  }

  function handleNext() {
    const answer = getAnswer();
    if (!answer) { toast({ title: "Please select an answer", variant: "destructive" }); return; }

    submitAnswer.mutate(
      { data: { questionId: currentQ.id, answer } },
      {
        onSuccess: () => {
          // If this was the last question for the day (e.g. 5th, 10th, etc.)
          if ((totalAnswered + 1) % 5 === 0 && (totalAnswered + 1) < 150) {
            const nextDay = new Date();
            nextDay.setDate(nextDay.getDate() + 1);
            nextDay.setHours(0, 0, 0, 0);
            // FOR TESTING ONLY: bypass frontend lock enforcement
            // localStorage.setItem('journeyLockedUntil', nextDay.toISOString());
          }
          
          queryClient.invalidateQueries({ queryKey: getGetJourneyProgressQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetJourneyQuestionsQueryKey() });
          setSelectedOption(""); setTextAnswer(""); setScaleValue(5); setMultiSelected([]);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.message, variant: "destructive" });
        },
      }
    );
  }

  function toggleMulti(opt: string) {
    setMultiSelected(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);
  }

  if (loadingQ || loadingP) {
    return (
      <div className="w-full min-h-screen relative flex flex-col font-sans flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 100%)' }}>
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, #F4F1FF 0%, transparent 50%), radial-gradient(circle at 100% 100%, #FFFDFC 0%, transparent 50%)' }} />
        <div className="w-8 h-8 rounded-full border-4 border-[#FF9F9F] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (mandatoryCompletion.percentage < 100) {
    return (
      <div className="w-full min-h-screen relative flex flex-col font-sans text-[#252525] flex flex-col" style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 100%)' }}>
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, #F4F1FF 0%, transparent 50%), radial-gradient(circle at 100% 100%, #FFFDFC 0%, transparent 50%)' }} />
        <div className="sticky top-0 z-50 bg-transparent/80 backdrop-blur-xl border-b border-border/40 px-4 h-[calc(3.5rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] flex items-center">
          <button onClick={() => window.history.back()} className="w-10 h-10 flex items-center justify-start">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-base font-bold flex-1 text-center pr-10">Locked</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 bg-[#FF9F9F]/15 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-[#FF9F9F]" />
          </div>
          <h2 className="text-2xl font-black mb-3">Profile Incomplete</h2>
          <p className="text-[#707070] text-sm mb-8 leading-relaxed">
            Complete your profile to unlock personalized matching and start your journey.
          </p>
          <Button className="w-full h-14 rounded-full font-bold bg-gradient-to-r from-[#FFB8B0] to-[#FFC9BF] text-[#242424] shadow-sm border border-white/20" onClick={() => navigate('/profile')}>
            Complete Profile Now
          </Button>
        </div>
      </div>
    );
  }

  const currentDay = progress?.currentDay || 1;
  const pct = progress?.completionPercentage || 0;
  const displayDay = Math.max(1, Math.ceil(totalAnswered / 5));
  const streak = Math.min(progress?.streak || 0, displayDay);
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="w-full min-h-screen soulmatch-dashboard-bg flex flex-col">
      {/* 1. Premium Glass Header */}
      <div className="sticky top-0 z-50 bg-white/55 backdrop-blur-[24px] border-b border-white/35 px-4 h-[calc(3.75rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] flex items-center justify-between shadow-sm">
        <button onClick={() => window.history.back()} className="w-10 h-10 flex items-center justify-start text-[#6F6F6F] hover:text-[#202020] transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center justify-center text-center flex-1 min-w-0 pr-10">
          <h1 className="text-xs font-black text-[#202020] uppercase tracking-wider">30-Day Journey</h1>
          <span className="text-[clamp(9px,2.80vw,13px)] font-bold text-[#FF9F9F] mt-0.5">Day {isLocked ? Math.min(30, Math.max(1, currentDay - 1)) : Math.min(30, currentDay)} of 30</span>
          <span className="hidden xs:block text-[clamp(8px,2.29vw,10px)] text-[#6F6F6F] font-semibold mt-0.5 truncate max-w-[clamp(170px,50.89vw,230px)]">"Every answer helps us understand you better."</span>
        </div>
      </div>

      <div className="px-4 py-4 max-w-md mx-auto space-y-4 flex-1 w-full flex flex-col justify-start">
        {/* 2. Floating Progress Glass Card */}
        <div className="dashboard-glass-card p-3 relative overflow-hidden flex justify-between items-center w-full shadow-sm">
          <div className="flex flex-col items-center flex-1 min-w-0 border-r border-white/20">
            <div className="flex items-center gap-1 text-[#6F6F6F] text-[clamp(8px,2.29vw,10px)] font-bold uppercase tracking-wider mb-0.5">
              <CalendarDays className="w-2.5 h-2.5 text-[#FF9F9F]" /> Day
            </div>
            <div className="text-sm font-black text-[#202020]">{isLocked ? Math.min(30, Math.max(1, currentDay - 1)) : Math.min(30, currentDay)}/30</div>
          </div>
          
          <div className="flex flex-col items-center flex-1 min-w-0 border-r border-white/20">
            <div className="flex items-center gap-1 text-[#6F6F6F] text-[clamp(8px,2.29vw,10px)] font-bold uppercase tracking-wider mb-0.5">
              <Flame className="w-2.5 h-2.5 text-[#FF9F9F]" /> Streak
            </div>
            <div className="text-sm font-black text-[#202020]">{streak}</div>
          </div>
          
          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[#6F6F6F] text-[clamp(8px,2.29vw,10px)] font-bold uppercase tracking-wider mb-0.5">
              <Target className="w-2.5 h-2.5 text-[#FF9F9F]" /> Progress
            </div>
            <div className="text-sm font-black text-[#202020]">{pct}%</div>
          </div>

          {/* Progress Bar inside the stats card */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/30">
            <motion.div 
              className="h-full bg-[#FF9F9F] rounded-r-full" 
              initial={{ width: 0 }} 
              animate={{ width: `${pct}%` }} 
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* 3. Main Content Flow */}
        <AnimatePresence mode="wait">
          {totalAnswered >= 150 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center text-center py-8"
            >
              <div className="w-16 h-16 bg-[#FF9F9F]/15 rounded-full flex items-center justify-center mb-5">
                <Check className="w-8 h-8 text-[#FF9F9F]" />
              </div>
              <h2 className="text-xl font-black mb-2 tracking-tight">Journey Complete!</h2>
              <p className="text-[#707070] text-xs leading-relaxed mb-6">
                You've answered all 150 questions. Your deep personality profile is fully mapped.
              </p>
              <div className="flex flex-col gap-3 w-full">
                <Link href="/personality" className="w-full">
                  <Button className="w-full h-12 rounded-full font-bold bg-gradient-to-r from-[#FFB8B0] to-[#FFC9BF] text-[#242424] shadow-sm border border-white/20 text-xs">
                    View Your Deep Profile
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : isLocked || !currentQ ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className="dashboard-glass-card p-5 py-6 text-center flex flex-col items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#FF9F9F]/10 to-transparent blur-3xl pointer-events-none" />

              <div className="w-14 h-14 bg-gradient-to-r from-[#FFB8B0] to-[#FFC9BF] rounded-full flex items-center justify-center mb-5 shadow-sm border border-white/20 relative">
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                <Check className="w-7 h-7 text-[#242424] relative z-10" />
              </div>
              
              <h2 className="text-xl font-black mb-2 tracking-tight text-[#202020]">
                Day {Math.max(1, currentDay - (isLocked && currentDay > 1 ? 1 : 0))} Completed!
              </h2>
              
              <p className="text-[#6F6F6F] text-xs leading-relaxed mb-5 max-w-sm flex flex-col gap-3 text-center">
                <span>Amazing work! You've successfully finished today's questions.</span>
                <span className="flex flex-col gap-0.5 bg-white/30 p-2 rounded-xl border border-white/20">
                  <span className="text-[#6F6F6F] text-[clamp(8px,2.29vw,10px)] font-bold uppercase tracking-wider">Completed On</span>
                  <span className="text-[#202020] font-black text-sm">{completedDateStr || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span className="text-[#6F6F6F] text-[clamp(9px,2.80vw,13px)]">{completedTimeStr || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                </span>
                <span className="flex flex-col gap-0.5 bg-white/30 p-2 rounded-xl border border-white/20">
                  <span className="text-[#FF9F9F] text-[clamp(8px,2.29vw,10px)] font-bold uppercase tracking-wider">Next Journey Unlocks</span>
                  <span className="text-[#202020] font-black text-sm">{unlockDateStr || "Tomorrow"}</span>
                  <span className="text-[#6F6F6F] text-[clamp(9px,2.80vw,13px)]">{unlockTimeStr || "12:00 AM"}</span>
                </span>
              </p>
              
              <Link href="/my-story" className="w-full relative z-10">
                <Button className="w-full h-11 rounded-full font-bold bg-white/60 border border-white/40 text-[#202020] hover:bg-[#FF9F9F]/10 transition-all shadow-sm text-xs">
                  Write in your Journal
                  <ChevronRight className="w-4 h-4 ml-1.5 text-[#FF9F9F]" />
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div 
              key={currentQ.id}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-4 flex flex-col"
            >
              {/* Question Text inside a large premium Glass card */}
              <div className="dashboard-glass-card p-5 space-y-2">
                <div>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#FF9F9F]/10 text-[#FF9F9F] text-[clamp(8px,2.29vw,10px)] font-black mb-2 uppercase tracking-widest border border-[#FF9F9F]/20">
                    {currentQ.category}
                  </div>
                  <h2 className="text-[clamp(16px,4.83vw,22px)] leading-[1.35] font-bold text-[#2B2B2B] tracking-tight">{currentQ.question}</h2>
                  {currentQ.description && <p className="text-[clamp(11px,3.31vw,15px)] text-[#6F6F6F] leading-normal mt-1">{currentQ.description}</p>}
                </div>
              </div>

              {/* Answer Options */}
              <div className="space-y-3 pt-0">
                {currentQ.questionType === "choice" && currentQ.options?.length > 0 && (
                  <div className="space-y-3 flex flex-col">
                    {currentQ.options.map((opt: string, index: number) => {
                      const isSelected = selectedOption === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => setSelectedOption(opt)}
                          className={`w-full flex items-center text-left p-4 rounded-[22px] transition-all border relative overflow-hidden active:scale-[0.98] ${
                            isSelected 
                              ? "border-[#FF9F9F] bg-white/65 shadow-md" 
                              : "border-white/35 bg-white/45 hover:bg-white/55 shadow-sm"
                          }`}
                        >
                          {isSelected && (
                            <motion.div layoutId="choice-bg" className="absolute inset-0 bg-[#FF9F9F]/5" initial={false} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                          )}
                          <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-black mr-3 transition-colors relative z-10 ${
                            isSelected ? "bg-[#FF9F9F] text-[#242424]" : "bg-white/60 border border-white/45 text-[#6F6F6F]"
                          }`}>
                            {alphabet[index] || '-'}
                          </div>
                          <span className={`text-base font-bold leading-[1.4] relative z-10 flex-1 ${isSelected ? "text-[#2B2B2B]" : "text-[#6F6F6F]"}`}>
                            {opt}
                          </span>
                          {isSelected && (
                            <motion.div 
                              initial={{ scale: 0 }} 
                              animate={{ scale: 1 }} 
                              className="w-5 h-5 rounded-full bg-[#FF9F9F] flex items-center justify-center shrink-0 ml-2 relative z-10"
                            >
                              <Check className="w-3.5 h-3.5 text-[#242424] stroke-[3]" />
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQ.questionType === "multi_choice" && currentQ.options?.length > 0 && (
                  <div className="space-y-3 flex flex-col">
                    {currentQ.options.map((opt: string, index: number) => {
                      const isSelected = multiSelected.includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => toggleMulti(opt)}
                          className={`w-full flex items-center text-left p-4 rounded-[22px] transition-all border relative overflow-hidden active:scale-[0.98] ${
                            isSelected 
                              ? "border-[#FF9F9F] bg-white/65 shadow-md" 
                              : "border-white/35 bg-white/45 hover:bg-white/55 shadow-sm"
                          }`}
                        >
                          <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-sm font-black mr-3 transition-colors relative z-10 ${
                            isSelected ? "bg-[#FF9F9F] text-[#242424]" : "bg-white/60 border border-white/45 text-transparent"
                          }`}>
                            <Check className="w-5 h-5" />
                          </div>
                          <span className={`text-sm font-bold leading-[1.4] relative z-10 flex-1 ${isSelected ? "text-[#2B2B2B]" : "text-[#6F6F6F]"}`}>
                            {opt}
                          </span>
                          {isSelected && (
                            <motion.div 
                              initial={{ scale: 0 }} 
                              animate={{ scale: 1 }} 
                              className="w-5 h-5 rounded-full bg-[#FF9F9F] flex items-center justify-center shrink-0 ml-2 relative z-10"
                            >
                              <Check className="w-3.5 h-3.5 text-[#242424] stroke-[3]" />
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQ.questionType === "text" && (
                  <Textarea
                    placeholder="Share your honest thoughts..."
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    className="bg-white/45 border border-white/35 min-h-[clamp(102px,30.53vw,138px)] text-sm resize-none rounded-[22px] p-4 focus-visible:ring-0 focus-visible:border-[#FF9F9F] shadow-sm text-[#2B2B2B] placeholder:text-[#6F6F6F]/60"
                  />
                )}

                {currentQ.questionType === "scale" && (
                  <div className="pt-5 pb-2 px-2 bg-white/45 border border-white/35 rounded-[22px] p-4 shadow-sm">
                    <div className="relative mb-6">
                      <div className="absolute top-1/2 left-0 right-0 h-2 bg-white/50 border border-white/20 rounded-full -translate-y-1/2 pointer-events-none" />
                      <div 
                        className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-[#FFB8B0] to-[#FFC9BF] rounded-full -translate-y-1/2 pointer-events-none" 
                        style={{ width: `${((scaleValue - 1) / 9) * 100}%` }}
                      />
                      <input
                        type="range" min={1} max={10} value={scaleValue}
                        onChange={(e) => setScaleValue(Number(e.target.value))}
                        className="w-full relative z-10 opacity-0 cursor-pointer h-8"
                      />
                      <div 
                        className="absolute top-1/2 w-6 h-6 bg-white border-2 border-[#FF9F9F] rounded-full -translate-y-1/2 -ml-3 pointer-events-none shadow-sm"
                        style={{ left: `${((scaleValue - 1) / 9) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-end text-xs text-[#6F6F6F] font-bold">
                      <span>Not at all</span>
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-[#2B2B2B]">{scaleValue}</span>
                        <span className="text-[clamp(8px,2.29vw,10px)] uppercase tracking-widest text-[#FF9F9F] mt-0.5">Selected</span>
                      </div>
                      <span>Absolutely</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Bottom Continue Button */}
      {(!isLocked && currentQ) && (
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-gradient-to-t from-background via-background/90 to-transparent z-40 pointer-events-none">
          <div className="max-w-md mx-auto pt-2 pointer-events-auto">
            <button 
              onClick={handleNext} 
              className="w-full h-14 rounded-full text-base font-bold shadow-sm gradient-coral-pill transition-transform flex items-center justify-center gap-1 disabled:opacity-50" 
              disabled={submitAnswer.isPending}
            >
              {submitAnswer.isPending ? "Saving..." : <>Continue <ChevronRight className="w-5 h-5 ml-1" /></>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
