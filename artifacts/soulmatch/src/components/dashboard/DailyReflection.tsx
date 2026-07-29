import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-context";
import { useLocation } from "wouter";
import {
  Flame, Clock, CheckCircle2, Sparkles, Lock,
  ChevronRight, Star, TrendingUp, Calendar, Zap, Heart, Target, ArrowRight, PenLine
} from "lucide-react";
import { Button } from "@/components/ui/button";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAILY_QUOTES = [
  "The smallest step forward is still progress.",
  "Take pride in how far you've come.",
  "Every day is another opportunity to grow.",
  "Reflection is the school of wisdom.",
  "Know yourself and you will win all battles.",
  "The journey inward is the greatest adventure.",
  "Consistency is what transforms average into excellence.",
];

const TOMORROW_THEMES = [
  { emoji: "🌞", label: "Gratitude" },
  { emoji: "💼", label: "Productivity" },
  { emoji: "❤️", label: "Relationships" },
  { emoji: "🌱", label: "Personal Growth" },
  { emoji: "😊", label: "Mood Check" },
  { emoji: "🧘", label: "Mindfulness" },
  { emoji: "🎯", label: "Goals" },
];

const MOOD_MESSAGES: Record<string, string> = {
  happy:        "Keep spreading your positive energy — it's contagious! ✨",
  calm:         "Peaceful moments help you grow. Cherish this stillness.",
  sad:          "Every day is different. Tomorrow is a fresh start. 🌅",
  loved:        "Feeling loved is a gift. Hold onto that warmth.",
  angry:        "It's okay to feel this way. Take a breath — this too shall pass.",
  excited:      "Hold on to today's excitement and let it fuel you forward! 🚀",
  nervous:      "Courage isn't the absence of nerves — it's going forward anyway.",
  tired:        "Rest is productive. You've earned this.",
  neutral:      "Steady days build a solid foundation. Keep going.",
  high:         "Amazing energy today! Use it wisely. ⚡",
  normal:       "A balanced day is a good day. Well done.",
  low:          "Even low-energy days count. Showing up is everything.",
  drained:      "Be gentle with yourself — recovery is part of growth.",
  very:         "You're thriving — keep that momentum going!",
  somewhat:     "Progress over perfection, always.",
  "not really": "Tomorrow holds new possibilities. Rest up.",
  default:      "Every reflection makes you a little wiser. Keep it up!",
};

function getMoodMessage(answer: string): string {
  const lower = answer.toLowerCase();
  for (const key of Object.keys(MOOD_MESSAGES)) {
    if (lower.includes(key)) return MOOD_MESSAGES[key];
  }
  return MOOD_MESSAGES.default;
}

function getDailyIndex(list: unknown[]) {
  const day = Math.floor(Date.now() / 86_400_000);
  return day % list.length;
}

// ─── Live countdown to midnight ───────────────────────────────────────────────
const CountdownToMidnight = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) { setTimeLeft("Unlocked!"); return; }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return <span>{timeLeft}</span>;
};

// ─── Types ────────────────────────────────────────────────────────────────────
type TodayData =
  | { answered: false; question: { id: number; category: string; question: string; options: { emoji: string; label: string }[] } }
  | { answered: true; answer: string; currentStreak: number; nextReflectionTime: string };

interface HistoryItem {
  id: number;
  date: string; // "YYYY-MM-DD"
  question: string;
  answer: string;
}

interface StatsData {
  totalReflections: number;
  currentStreak: number;
  longestStreak: number;
  mostSelectedMood: string;
  completionRate: number;
}

// ─── Weekly Mood Panel (exported for dashboard left-panel use) ────────────────
export function WeeklyMoodPanel() {
  const { data: history = [] } = useQuery<HistoryItem[]>({
    queryKey: ["/api/reflections/history"],
    queryFn: () => apiRequest<HistoryItem[]>("/reflections/history", { headers: authHeaders() }),
  });

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  // Build last 7 days aligned to Mon-Sun
  const last7: { label: string; dateStr: string }[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const label = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
    return { label, dateStr };
  });

  const historyMap = new Map<string, string>();
  history.forEach((h) => historyMap.set(h.date, h.answer));

  // Extract emoji from answer string (answer is stored as "emoji label")
  const getEmoji = (answer: string) => {
    const match = answer.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u);
    return match ? match[0] : null;
  };

  const completedThisWeek = last7.filter((d) => historyMap.has(d.dateStr)).length;

  return (
    <div className="w-full h-full flex flex-col justify-between p-5 gap-4">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-[#F6A8B7]" />
        <span className="text-sm font-bold text-[#252525] tracking-tight">Reflection This Week</span>
      </div>

      {/* Day dots */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {last7.map(({ label, dateStr }, i) => {
          const answer = historyMap.get(dateStr);
          const emoji = answer ? getEmoji(answer) : null;
          const isToday = dateStr === today.toISOString().split("T")[0];
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all
                  ${answer
                    ? "bg-[#F6A8B7]/15 border border-[#F6A8B7]/30 shadow-[0_0_8px_rgba(236,72,153,0.2)]"
                    : isToday
                    ? "bg-[#F6A8B7]/15 border-[1.5px] border-[#F6A8B7]/30 border-dashed text-[#F6A8B7]"
                    : "bg-foreground/5 border border-border text-[#707070]"
                  }`}
              >
                {emoji ?? (isToday ? "·" : "")}
              </div>
              <span className={`text-[clamp(9px,2.54vw,12px)] font-bold ${isToday ? "text-[#F6A8B7]" : "text-[#707070]"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Middle Motivation Blocks */}
      <div className="flex-1 flex flex-col justify-center py-2">
        {/* Great Job Block */}
        <div className="bg-foreground/5 border border-border/50 rounded-2xl p-4 flex items-center justify-between relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F6A8B7]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div className="relative z-10 flex-1 pr-2">
            <h4 className="text-sm font-bold text-[#252525] mb-1 flex items-center gap-1.5">
              Great job! <Sparkles className="w-3.5 h-3.5 text-[#F6A8B7]" />
            </h4>
            <p className="text-xs text-[#707070] leading-relaxed">
              You reflected <span className="text-[#F6A8B7] font-semibold">{completedThisWeek} days</span> this week. Keep it up to build a stronger connection with yourself.
            </p>
          </div>
          <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#F6A8B7]/20 to-indigo-500/20 rounded-xl flex items-center justify-center shadow-sm border border-[#F6A8B7]/20 transform rotate-[-5deg]">
            <span className="text-2xl">📖</span>
          </div>
        </div>
      </div>

      {/* Completion bar */}
      <div className="mt-auto">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[#707070]">Weekly Progress</span>
          <span className="text-xs font-bold text-[#F6A8B7]">{completedThisWeek}/7</span>
        </div>
        <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedThisWeek / 7) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-[#F8C7C8] via-[#F8D9D2] to-[#F7E8EE]"
          />
        </div>
        <p className="text-[clamp(9px,2.54vw,12px)] text-[#707070] mt-2 text-center">
          {completedThisWeek === 7
            ? "🎉 Perfect week!"
            : completedThisWeek >= 5
            ? "Almost there — keep it up!"
            : "Every reflection counts."}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function DailyReflection() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<{ emoji: string; label: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showSavedFlash, setShowSavedFlash] = useState(false);

  const { data, isLoading } = useQuery<TodayData>({
    queryKey: ["/api/reflections/today"],
    queryFn: () =>
      apiRequest<TodayData>("/reflections/today", { headers: authHeaders() }),
  });

  const { data: stats } = useQuery<StatsData>({
    queryKey: ["/api/reflections/stats"],
    queryFn: () =>
      apiRequest<StatsData>("/reflections/stats", { headers: authHeaders() }),
    enabled: data?.answered === true || submitted,
  });

  const { data: history = [] } = useQuery<HistoryItem[]>({
    queryKey: ["/api/reflections/history"],
    queryFn: () => apiRequest<HistoryItem[]>("/reflections/history", { headers: authHeaders() }),
  });

  const submitMutation = useMutation({
    mutationKey: ["submit-reflection"],
    mutationFn: (body: { questionId: number; answer: string }) =>
      apiRequest("/reflections/today", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      setShowSavedFlash(true);
      setTimeout(() => {
        setShowSavedFlash(false);
        setSubmitted(true);
      }, 1400);
      queryClient.invalidateQueries({ queryKey: ["/api/reflections/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reflections/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reflections/history"] });
    },
  });

  const isAnswered = data?.answered === true;

  // Daily rotating content
  const todayQuote = DAILY_QUOTES[getDailyIndex(DAILY_QUOTES)];
  const tomorrowTheme = TOMORROW_THEMES[getDailyIndex(TOMORROW_THEMES)];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const last7: { label: string; dateStr: string }[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const label = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
    return { label, dateStr };
  });

  const historyMap = new Map<string, string>();
  history.forEach((h) => historyMap.set(h.date, h.answer));

  // Extract emoji from answer string (answer is stored as "emoji label")
  const getEmoji = (answer: string) => {
    const match = answer.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u);
    return match ? match[0] : null;
  };

  const completedThisWeek = last7.filter((d) => historyMap.has(d.dateStr)).length;

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F6A8B7]" />
      </div>
    );
  }

  // ─── ✨ Reflection Saved Flash Overlay ─────────────────────────────────────
  if (showSavedFlash) {
    return (
      <motion.div
        key="flash"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        className="flex-1 flex flex-col items-center justify-center gap-4 py-10"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F6A8B7] to-[#F8C7C8] flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.5)]"
        >
          <CheckCircle2 className="w-10 h-10 text-[#252525]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <p className="text-xl font-bold text-[#252525] flex items-center gap-2 justify-center">
            Reflection Saved
          </p>
          <p className="text-sm text-[#707070] mt-1">Great job checking in today!</p>
        </motion.div>
        {/* Particle sparks */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{
              opacity: 0,
              x: Math.cos((i / 6) * Math.PI * 2) * 60,
              y: Math.sin((i / 6) * Math.PI * 2) * 60,
              scale: 0,
            }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="absolute w-2 h-2 rounded-full bg-[#F6A8B7]"
            style={{ top: "50%", left: "50%" }}
          />
        ))}
      </motion.div>
    );
  }

  // ─── Already Answered State ────────────────────────────────────────────────
  if (isAnswered || submitted) {
    const answeredData = data as Extract<TodayData, { answered: true }>;
    const streak = answeredData?.currentStreak ?? stats?.currentStreak ?? 1;
    const nextTime = answeredData?.nextReflectionTime ?? "";
    const answerRaw = answeredData?.answer ?? selected?.label ?? "";

    // Parse emoji + label from stored answer ("😃 Happy")
    const answerParts = answerRaw.match(/^([\p{Emoji_Presentation}\p{Emoji}\uFE0F]+)\s*(.*)$/u);
    const answerEmoji = answerParts ? answerParts[1] : (selected?.emoji ?? "");
    const answerLabel = answerParts ? answerParts[2].trim() : answerRaw;

    const moodMessage = getMoodMessage(answerRaw);

    // Milestone: next multiple of 5
    const nextMilestone = Math.ceil((streak + 1) / 5) * 5;
    const milestoneProgress = Math.round(((streak % 5) / 5) * 100);

    // Stats data
    const totalReflections = stats?.totalReflections ?? 0;
    const mostMood = stats?.mostSelectedMood ?? "";
    const mostMoodEmoji = mostMood.match(/^([\p{Emoji_Presentation}\p{Emoji}\uFE0F]+)/u)?.[1] ?? "😊";
    const mostMoodLabel = mostMood.replace(/^[\p{Emoji_Presentation}\p{Emoji}\uFE0F]+\s*/u, "") || mostMood;

    return (
      <motion.div
        key="answered"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="flex-1 flex flex-col w-full gap-4 pb-4"
      >
        {/* Title and Subtitle */}
        <div className="text-center mb-1">
           <h1 className="text-xl font-black flex items-center justify-center gap-1.5 text-[#252525]">
              Reflection <Heart className="w-5 h-5 text-[#F6A8B7] fill-[#F6A8B7]" />
           </h1>
           <p className="text-[clamp(9px,2.67vw,12px)] text-[#707070] mt-1 font-medium">A few minutes today, a better you tomorrow ✨</p>
        </div>



        {/* 2. Success Message */}
        <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-[20px] p-3 flex items-center gap-3 relative overflow-hidden">
           <div className="w-8 h-8 rounded-full bg-[#4CAF50]/15 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5 text-[#4CAF50]" />
           </div>
           <div className="flex-1">
              <h4 className="text-[clamp(9px,2.80vw,13px)] font-black text-[#2E7D32] tracking-wide uppercase">Today's Reflection Complete</h4>
              <p className="text-[clamp(9px,2.54vw,12px)] text-[#4CAF50] font-medium mt-0.5">Great job keeping your streak alive.</p>
           </div>
        </div>

        {/* 3. Your Answer Card */}
        <div className="premium-glass-card border border-white/35 rounded-[24px] relative overflow-hidden p-4">
           <div className="flex justify-between items-center mb-3">
               <span className="text-[clamp(9px,2.54vw,12px)] font-black text-[#707070] uppercase tracking-widest flex items-center gap-1.5"><PenLine className="w-3.5 h-3.5" /> Your Answer</span>
           </div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-white/40 border border-white/50 flex items-center justify-center text-2xl shadow-sm shrink-0">
                  {answerEmoji}
              </div>
              <div>
                 <span className="text-[clamp(15px,4.58vw,21px)] font-black text-[#252525] tracking-tight leading-tight block">{answerLabel}</span>
                 <p className="text-[clamp(9px,2.54vw,12px)] text-[#707070] leading-snug mt-1 max-w-[90%]">
                    {moodMessage}
                 </p>
              </div>
           </div>
        </div>

        {/* 4. Reflection Streak Card */}
        <div className="premium-glass-card border border-white/35 rounded-[24px] relative overflow-hidden p-4">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[clamp(9px,2.54vw,12px)] font-black text-[#707070] uppercase tracking-widest flex items-center gap-1.5">
                   <Flame className="w-3.5 h-3.5 text-[#F6A8B7] fill-[#F6A8B7]" /> Reflection Streak
                </span>
                <span className="text-[clamp(9px,2.54vw,12px)] font-bold text-[#F6A8B7]">{streak % 5}/{5}</span>
            </div>
            
            <div className="flex items-end gap-1.5 mb-3">
               <span className="text-[clamp(24px,7.12vw,32px)] font-black text-[#252525] leading-none tracking-tight">{streak}</span>
               <span className="text-[clamp(9px,2.80vw,13px)] font-bold text-[#707070] mb-1">Days</span>
            </div>

            <div className="w-full h-2 bg-foreground/5 rounded-full overflow-hidden mb-1.5">
               <div className="h-full bg-gradient-to-r from-[#F6A8B7] to-[#F8D9D2] rounded-full transition-all" style={{ width: `${milestoneProgress}%` }}></div>
            </div>
            <span className="text-[clamp(8px,2.29vw,10px)] font-bold text-[#707070] flex items-center gap-1 mt-2">
               <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> Next milestone at {nextMilestone} days
            </span>
        </div>

        {/* 5. Next Reflection & Theme (Merged) */}
        <div className="premium-glass-card border border-white/35 rounded-[24px] relative overflow-hidden p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-[#F6A8B7]/15 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#F6A8B7]" />
               </div>
               <div>
                  <span className="text-[clamp(8px,2.29vw,10px)] font-black text-[#707070] uppercase tracking-widest block mb-0.5">Next Check-in</span>
                  <span className="text-[clamp(13px,3.82vw,17px)] font-black text-[#252525] tracking-tight tabular-nums">
                     {nextTime ? <CountdownToMidnight targetDate={nextTime} /> : "—"}
                  </span>
               </div>
            </div>
            <div className="h-8 w-px bg-white/40"></div>
            <div className="flex items-center gap-2">
               <div className="text-xl leading-none">{tomorrowTheme.emoji}</div>
               <div>
                  <span className="text-[clamp(7px,2.04vw,9px)] font-black text-[#707070] uppercase tracking-widest block mb-0.5">Tomorrow</span>
                  <span className="text-[clamp(9px,2.80vw,13px)] font-bold text-[#252525]">{tomorrowTheme.label}</span>
               </div>
            </div>
        </div>

        {/* 6. Statistics Chips */}
        <div className="grid grid-cols-3 gap-2.5">
           {[
             {
               icon: <TrendingUp className="w-3.5 h-3.5 text-[#F6A8B7]" />,
               label: "Total",
               value: `${totalReflections}d`,
             },
             {
               icon: <Flame className="w-3.5 h-3.5 text-[#F6A8B7] fill-[#F6A8B7]" />,
               label: "Streak",
               value: `${streak}d`,
             },
             {
               icon: <span className="text-sm leading-none">{mostMoodEmoji}</span>,
               label: "Top",
               value: mostMoodLabel || "—",
             },
           ].map((pill, i) => (
             <div
               key={i}
               className="bg-white/40 border border-white/50 backdrop-blur-md rounded-[16px] p-2 flex flex-col items-center justify-center gap-1 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
             >
               <div className="flex items-center gap-1 mb-0.5">
                  {pill.icon}
                  <span className="text-[clamp(7px,2.16vw,10px)] font-black text-[#707070] uppercase tracking-wider">{pill.label}</span>
               </div>
               <span className="text-[clamp(9px,2.80vw,13px)] font-bold text-[#252525] truncate max-w-[clamp(68px,20.36vw,92px)] text-center tracking-tight leading-none">{pill.value}</span>
             </div>
           ))}
        </div>

        {/* 1. Weekly Section (Merged) */}
        <div className="premium-glass-card border border-white/35 rounded-[24px] relative overflow-hidden p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
               <span className="text-[clamp(9px,2.54vw,12px)] font-black text-[#707070] uppercase tracking-widest">Weekly Progress</span>
               <div className="flex items-center gap-1">
                   <span className="text-[clamp(9px,2.80vw,13px)] font-bold text-[#F6A8B7]">{completedThisWeek}/7</span>
                   <span className="text-[clamp(9px,2.54vw,12px)] text-[#707070] font-medium">Completed</span>
               </div>
            </div>
            
            <div className="flex justify-between">
               {last7.map(({ label, dateStr }, i) => {
                  const answer = historyMap.get(dateStr);
                  const emoji = answer ? getEmoji(answer) : null;
                  const isToday = dateStr === today.toISOString().split("T")[0];
                  return (
                     <div key={i} className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-[clamp(10px,3.05vw,14px)] transition-all
                           ${answer 
                             ? "bg-[#F6A8B7]/20 border-[#F6A8B7]/40 shadow-[0_0_8px_rgba(236,72,153,0.15)]" 
                             : isToday 
                               ? "bg-[#F6A8B7]/20 border-[#F6A8B7]/50 border-dashed text-[#F6A8B7] font-bold" 
                               : "bg-muted/80 border-slate-600/60 dark:border-slate-500/70 border-slate-300"}`}>
                           {emoji ?? (isToday ? "·" : "")}
                        </div>
                        <span className={`text-[clamp(7px,2.04vw,9px)] font-bold ${isToday ? "text-[#F6A8B7]" : "text-[#252525]/70"}`}>{label}</span>
                     </div>
                  );
               })}
            </div>
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-2 w-full pt-2 sticky bottom-0 bg-background/85 backdrop-blur-md pb-safe">
           <Button onClick={() => navigate("/my-story")} className="hover:opacity-90 active:scale-95 w-full text-white gradient-coral-pill rounded-[20px] h-[clamp(41px,12.21vw,55px)] border border-white/40 flex items-center justify-center gap-2 font-bold text-[clamp(13px,3.82vw,17px)] shrink-0 transition-all shadow-[0_4px_15px_rgba(246,168,183,0.3)]" >
              <PenLine className="w-4.5 h-4.5 mr-1" /> Write Story
           </Button>
        </div>
      </motion.div>
    );
  }

  // ─── Question State ────────────────────────────────────────────────────────
  const questionData = data as Extract<TodayData, { answered: false }>;
  const question = questionData?.question;

  if (!question) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#707070] text-sm">
        No reflection available today
      </div>
    );
  }

  return (
    <motion.div
      key="question"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex-1 flex flex-col w-full gap-4 pb-6"
    >
      {/* Title and Subtitle */}
      <div className="text-center mb-1">
         <h1 className="text-xl font-black flex items-center justify-center gap-1.5 text-[#252525]">
            Reflection <Heart className="w-5 h-5 text-[#F6A8B7] fill-[#F6A8B7]" />
         </h1>
         <p className="text-[clamp(9px,2.67vw,12px)] text-[#707070] mt-0.5 font-medium">A few minutes today, a better you tomorrow ✨</p>
      </div>



      {/* Question text */}
      <h2 className="text-[clamp(17px,5.09vw,23px)] font-bold text-[#252525] mt-4 mb-5 text-center" style={{ lineHeight: "1.45" }}>
        {question.question}
      </h2>

      {/* Options grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <AnimatePresence>
          {question.options.map((opt, i) => {
            const isSelected = selected?.label === opt.label;
            return (
              <motion.div
                key={opt.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(opt)}
                className="flex flex-col items-center justify-center h-[clamp(77px,22.90vw,103px)] rounded-[20px] border transition-all cursor-pointer"
                style={{ 
                  background: isSelected ? 'rgba(246,168,183,0.12)' : 'rgba(255,255,255,0.48)', 
                  backdropFilter: 'blur(28px)', 
                  WebkitBackdropFilter: 'blur(28px)', 
                  borderColor: isSelected ? '#F6A8B7' : 'rgba(255,255,255,0.35)', 
                  boxShadow: isSelected ? '0 0 15px rgba(246,168,183,0.3)' : '0 8px 30px rgba(0,0,0,0.06)',
                  transform: isSelected ? 'scale(0.97)' : 'scale(1)'
                }}
              >
                <span className="text-2xl mb-1">{opt.emoji}</span>
                <span className={`text-[clamp(9px,2.54vw,12px)] lg:text-xs font-semibold ${isSelected ? "text-[#F6A8B7]" : "text-[#707070]"}`}>
                  {opt.label}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer row */}
      <div className="flex flex-col items-center gap-3 mt-auto w-full">
        <Button
          disabled={!selected || submitMutation.isPending}
          onClick={() => {
            if (question && selected) {
              submitMutation.mutate({ questionId: question.id, answer: selected.emoji + " " + selected.label });
            }
          }}
          className={`${
            !selected ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 active:scale-95"
          } w-full text-white rounded-full h-[clamp(41px,12.21vw,55px)] border border-white/40 flex items-center justify-center gap-2 font-bold text-[clamp(14px,4.07vw,18px)] shrink-0 transition-all gradient-coral-pill`}
        >
          {submitMutation.isPending ? "Saving..." : "Submit Answer"}
        </Button>
        <div className="flex items-center gap-2 text-[#707070] text-[clamp(9px,2.54vw,12px)]">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>Your response is private and secure</span>
        </div>
      </div>
    </motion.div>
  );
}
