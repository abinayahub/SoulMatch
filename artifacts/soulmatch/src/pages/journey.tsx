import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Flame, Lock, ChevronRight, ChevronLeft, Check } from "lucide-react";
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

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { 
    Authorization: `Bearer ${token}`,
    "x-timezone-offset": String(new Date().getTimezoneOffset())
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
            localStorage.setItem('journeyLockedUntil', nextDay.toISOString());
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#9B4DFF] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (mandatoryCompletion.percentage < 100) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 px-4 h-[calc(3.5rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] flex items-center">
          <button onClick={() => window.history.back()} className="w-10 h-10 flex items-center justify-start">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-base font-bold flex-1 text-center pr-10">Locked</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-pink-500" />
          </div>
          <h2 className="text-2xl font-black mb-3">Profile Incomplete</h2>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            Complete your profile to unlock personalized matching and start your journey.
          </p>
          <Button className="w-full h-14 rounded-full font-bold bg-gradient-to-r from-pink-500 to-[#9B4DFF] text-white shadow-lg" onClick={() => navigate('/profile')}>
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
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* 1. Top App Bar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 px-4 h-[calc(3.5rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] flex items-center justify-between">
        <button onClick={() => window.history.back()} className="w-10 h-10 flex items-center justify-start text-foreground/80 hover:text-foreground">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold tracking-tight">30-Day Journey</h1>
        <div className="w-10 flex justify-end"></div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* 2. Top Header Area */}
        <div className="mb-6 flex flex-col gap-4">
          


          <div className="bg-card border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-[2rem] pt-5 pb-5 px-4 flex justify-between items-center w-full self-stretch relative overflow-hidden">
            <div className="flex flex-col items-center flex-1 border-r border-border/40">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-1">
                <CalendarDays className="w-3 h-3" /> Day
              </div>
              <div className="text-xl font-black">{isLocked ? Math.min(30, Math.max(1, currentDay - 1)) : Math.min(30, currentDay)}/30</div>
            </div>
            
            <div className="flex flex-col items-center flex-1 border-r border-border/40">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-1">
                <Flame className="w-3 h-3" /> Streak
              </div>
              <div className="text-xl font-black">{streak}</div>
            </div>
            
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-1">
                 Progress
              </div>
              <div className="text-xl font-black">{pct}%</div>
            </div>

            {/* Progress Bar inside the stats card */}
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-foreground/5">
              <motion.div 
                className="h-full bg-[#9B4DFF]" 
                initial={{ width: 0 }} 
                animate={{ width: `${pct}%` }} 
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>

        {/* 3. Main Content Flow */}
        <AnimatePresence mode="wait">
          {isLocked ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center text-center py-12 px-6 bg-gradient-to-b from-pink-500/10 via-[#9B4DFF]/5 to-transparent rounded-[2.5rem] border border-[#9B4DFF]/20 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] mt-4"
            >
              {/* Background glow effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-gradient-to-b from-[#9B4DFF]/10 to-transparent blur-3xl pointer-events-none" />

              <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-[#9B4DFF] rounded-full flex items-center justify-center mb-8 shadow-[0_8px_30px_rgba(155,77,255,0.4)] relative">
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                <Check className="w-12 h-12 text-white relative z-10" />
              </div>
              
              <h2 className="text-3xl font-black mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-[#9B4DFF]">
                Day {Math.max(1, currentDay - 1)} Completed!
              </h2>
              
              <p className="text-foreground/80 text-[15px] leading-relaxed mb-10 max-w-sm flex flex-col gap-5 text-center">
                <span>Amazing work! You've successfully finished today's questions.</span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Completed On</span>
                  <span className="text-foreground font-black text-lg">{completedDateStr}</span>
                  <span className="text-muted-foreground text-sm">{completedTimeStr}</span>
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[#9B4DFF] text-[10px] font-bold uppercase tracking-wider">Next Journey Unlocks</span>
                  <span className="text-foreground font-black text-lg">{unlockDateStr}</span>
                  <span className="text-muted-foreground text-sm">{unlockTimeStr}</span>
                </span>
              </p>
              
              <Link href="/my-story" className="w-full relative z-10">
                <Button className="w-full h-14 rounded-full font-bold bg-card border-2 border-[#9B4DFF]/30 text-foreground hover:bg-[#9B4DFF]/10 transition-all shadow-sm">
                  Write in your Journal
                  <ChevronRight className="w-5 h-5 ml-2 text-[#9B4DFF]" />
                </Button>
              </Link>
            </motion.div>
          ) : !currentQ ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center text-center py-10"
            >
              <div className="w-20 h-20 bg-[#9B4DFF]/10 rounded-full flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-[#9B4DFF]" />
              </div>
              <h2 className="text-2xl font-black mb-3 tracking-tight">Journey Complete!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                You've answered all 150 questions. Your deep personality profile is fully mapped.
              </p>
              <div className="flex flex-col gap-3 w-full">
                <Link href="/personality" className="w-full">
                  <Button className="w-full h-14 rounded-full font-bold bg-gradient-to-r from-pink-500 to-[#9B4DFF] text-white shadow-lg">
                    View Your Deep Profile
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key={currentQ.id}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Question Text */}
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#9B4DFF]/10 text-[#9B4DFF] text-[10px] font-black mb-4 uppercase tracking-widest border border-[#9B4DFF]/20">
                  {currentQ.category}
                </div>
                <h2 className="text-3xl leading-[1.25] font-black tracking-tight mb-3">{currentQ.question}</h2>
                {currentQ.description && <p className="text-[15px] text-muted-foreground leading-relaxed">{currentQ.description}</p>}
              </div>

              {/* Answer Options */}
              <div className="space-y-3 pt-2">
                {currentQ.questionType === "choice" && currentQ.options?.length > 0 && (
                  <div className="space-y-3">
                    {currentQ.options.map((opt: string, index: number) => {
                      const isSelected = selectedOption === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => setSelectedOption(opt)}
                          className={`w-full flex items-center text-left p-4 rounded-2xl transition-all border-2 relative overflow-hidden ${
                            isSelected 
                              ? "border-[#9B4DFF] bg-[#9B4DFF]/5 shadow-[0_4px_20px_rgba(155,77,255,0.15)]" 
                              : "border-border/60 bg-card hover:bg-muted/50"
                          }`}
                        >
                          {isSelected && (
                            <motion.div layoutId="choice-bg" className="absolute inset-0 bg-[#9B4DFF]/5" initial={false} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                          )}
                          <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-black mr-4 transition-colors relative z-10 ${
                            isSelected ? "bg-[#9B4DFF] text-white" : "bg-foreground/5 text-muted-foreground"
                          }`}>
                            {alphabet[index] || '-'}
                          </div>
                          <span className={`text-[15px] font-medium leading-snug relative z-10 ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                            {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQ.questionType === "multi_choice" && currentQ.options?.length > 0 && (
                  <div className="space-y-3">
                    {currentQ.options.map((opt: string, index: number) => {
                      const isSelected = multiSelected.includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => toggleMulti(opt)}
                          className={`w-full flex items-center text-left p-4 rounded-2xl transition-all border-2 relative overflow-hidden ${
                            isSelected 
                              ? "border-[#9B4DFF] bg-[#9B4DFF]/5 shadow-[0_4px_20px_rgba(155,77,255,0.15)]" 
                              : "border-border/60 bg-card hover:bg-muted/50"
                          }`}
                        >
                          <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-sm font-black mr-4 transition-colors relative z-10 ${
                            isSelected ? "bg-[#9B4DFF] text-white" : "bg-foreground/5 border-2 border-border/60 text-transparent"
                          }`}>
                            <Check className="w-5 h-5" />
                          </div>
                          <span className={`text-[15px] font-medium leading-snug relative z-10 ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                            {opt}
                          </span>
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
                    className="bg-card border-2 border-border/60 min-h-[160px] text-[15px] resize-none rounded-2xl p-5 focus-visible:ring-0 focus-visible:border-[#9B4DFF] shadow-sm"
                  />
                )}

                {currentQ.questionType === "scale" && (
                  <div className="pt-8 pb-4 px-2">
                    <div className="relative mb-8">
                      <div className="absolute top-1/2 left-0 right-0 h-3 bg-muted rounded-full -translate-y-1/2 pointer-events-none" />
                      <div 
                        className="absolute top-1/2 left-0 h-3 bg-gradient-to-r from-pink-500 to-[#9B4DFF] rounded-full -translate-y-1/2 pointer-events-none" 
                        style={{ width: `${((scaleValue - 1) / 9) * 100}%` }}
                      />
                      <input
                        type="range" min={1} max={10} value={scaleValue}
                        onChange={(e) => setScaleValue(Number(e.target.value))}
                        className="w-full relative z-10 opacity-0 cursor-pointer h-10"
                      />
                      <div 
                        className="absolute top-1/2 w-8 h-8 bg-card border-4 border-[#9B4DFF] rounded-full -translate-y-1/2 -ml-4 pointer-events-none shadow-[0_4px_15px_rgba(155,77,255,0.4)]"
                        style={{ left: `${((scaleValue - 1) / 9) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-end text-sm text-muted-foreground font-bold">
                      <span>Not at all</span>
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-foreground">{scaleValue}</span>
                        <span className="text-[10px] uppercase tracking-widest text-[#9B4DFF] mt-1">Selected</span>
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
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/90 to-transparent z-40 pointer-events-none">
          <div className="max-w-lg mx-auto pt-6 pointer-events-auto">
            <Button 
              onClick={handleNext} 
              className="w-full h-14 rounded-full text-lg font-bold shadow-[0_8px_30px_rgba(155,77,255,0.3)] bg-gradient-to-r from-pink-500 to-[#9B4DFF] text-white transition-transform active:scale-[0.98]" 
              disabled={submitAnswer.isPending}
            >
              {submitAnswer.isPending ? "Saving..." : <>Continue <ChevronRight className="w-6 h-6 ml-1" /></>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
