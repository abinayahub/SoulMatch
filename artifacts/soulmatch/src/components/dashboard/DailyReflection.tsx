import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-context";
import {
  Flame, Clock, CheckCircle2, Sparkles, Lock,
  ChevronRight, Star, TrendingUp, Calendar, Zap, Heart, BookHeart
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

  let currentStreak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (historyMap.has(dateStr)) {
      currentStreak++;
    } else if (i > 0) {
      break; 
    }
  }

  return (
    <div className="w-full h-full flex flex-col justify-between p-5 gap-4">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-pink-500" />
        <span className="text-sm font-bold text-foreground tracking-tight">Reflection This Week</span>
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
                    ? "bg-pink-500/15 border border-pink-500/30 shadow-[0_0_8px_rgba(236,72,153,0.2)]"
                    : isToday
                    ? "bg-purple-500/15 border-[1.5px] border-purple-500/30 border-dashed text-purple-500"
                    : "bg-foreground/5 border border-border text-muted-foreground"
                  }`}
              >
                {emoji ?? (isToday ? "·" : "")}
              </div>
              <span className={`text-[10px] font-bold ${isToday ? "text-purple-500" : "text-muted-foreground"}`}>
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
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div className="relative z-10 flex-1 pr-2">
            <h4 className="text-sm font-bold text-foreground mb-1 flex items-center gap-1.5">
              Great job! <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You reflected <span className="text-pink-500 font-semibold">{completedThisWeek} days</span> this week. Keep it up to build a stronger connection with yourself.
            </p>
          </div>
          <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center shadow-sm border border-purple-500/20 transform rotate-[-5deg]">
            <BookHeart className="w-8 h-8 text-purple-500 drop-shadow-sm" />
          </div>
        </div>
      </div>

      {/* Completion bar */}
      <div className="mt-auto">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">Weekly Progress</span>
          <span className="text-xs font-bold text-pink-500">{completedThisWeek}/7</span>
        </div>
        <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedThisWeek / 7) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
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

  const submitMutation = useMutation({
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

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
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
          className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.5)]"
        >
          <CheckCircle2 className="w-10 h-10 text-foreground" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <p className="text-xl font-bold text-foreground flex items-center gap-2 justify-center">
            Reflection Saved
          </p>
          <p className="text-sm text-muted-foreground mt-1">Great job checking in today!</p>
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
            className="absolute w-2 h-2 rounded-full bg-pink-400"
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
        className="flex-1 flex flex-col w-full gap-4"
      >
        {/* ── Header Row ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-full w-fit">
            <CheckCircle2 className="w-4 h-4" />
            Today's Reflection Complete
          </span>
          {/* Today's Thought */}
          <span className="text-[11px] text-muted-foreground italic max-w-[260px] text-right hidden sm:block">
            "{todayQuote}"
          </span>
        </div>

        {/* ── Row 1: Your Answer + Streak ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Your Answer card */}
          <div className="relative bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-5 overflow-hidden group hover:shadow-[0_8px_30px_-4px_rgba(236,72,153,0.1)] hover:border-pink-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-500/10 to-transparent rounded-bl-full" />
            <span className="text-[12px] text-muted-foreground font-bold tracking-wide uppercase mb-4 block">Your Answer</span>
            <div className="flex items-center gap-3 mb-3">
              {answerEmoji && (
                <span className="text-3xl drop-shadow-sm leading-none">{answerEmoji}</span>
              )}
              <span className="text-2xl font-extrabold text-foreground tracking-tight leading-tight">{answerLabel}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              {moodMessage}
            </p>
          </div>

          {/* Streak card */}
          <div className="relative bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-5 overflow-hidden group hover:shadow-[0_8px_30px_-4px_rgba(249,115,22,0.1)] hover:border-orange-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-orange-500/10 text-orange-500 p-1.5 rounded-md">
                <Flame className="w-4 h-4 fill-orange-500" />
              </div>
              <span className="text-[12px] text-muted-foreground font-bold tracking-wide uppercase">Reflection Streak</span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-4 mt-1">
              <span className="text-4xl font-extrabold text-foreground tracking-tight leading-none">{streak}</span>
              <span className="text-sm font-semibold text-muted-foreground">Day{streak !== 1 ? "s" : ""}</span>
            </div>
            {/* Milestone progress */}
            <div className="space-y-2 mt-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 drop-shadow-sm" />
                  <span>Next badge at {nextMilestone} days</span>
                </div>
                <span className="text-[11px] font-bold text-orange-500">{streak % 5}/{5}</span>
              </div>
              <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${milestoneProgress}%` }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                  className="h-full rounded-full bg-gradient-to-r from-orange-400 to-yellow-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: Countdown + Tomorrow's Theme ── */}
        <div className="relative bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-5 overflow-hidden group hover:shadow-[0_8px_30px_-4px_rgba(168,85,247,0.1)] hover:border-purple-500/30 transition-all duration-300 mt-1">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 relative z-10">
            {/* Countdown section */}
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-sm">
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Next Reflection</p>
                <p className="text-[19px] font-extrabold text-purple-500 tracking-tight tabular-nums">
                  {nextTime ? <CountdownToMidnight targetDate={nextTime} /> : "—"}
                </p>
              </div>
            </div>
            {/* Divider */}
            <div className="hidden sm:block w-px h-12 bg-border shrink-0" />
            {/* Tomorrow's Theme */}
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0 text-2xl leading-none shadow-sm">
                {tomorrowTheme.emoji}
              </div>
              <div>
                <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Tomorrow's Theme</p>
                <p className="text-[17px] font-extrabold text-foreground tracking-tight">{tomorrowTheme.label}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 3: Weekly Summary pills ── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              icon: <TrendingUp className="w-3.5 h-3.5 text-pink-400" />,
              label: "Total",
              value: `${totalReflections} Days`,
            },
            {
              icon: <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />,
              label: "Streak",
              value: `${streak} Days`,
            },
            {
              icon: <span className="text-sm leading-none">{mostMoodEmoji}</span>,
              label: "Top Mood",
              value: mostMoodLabel || "—",
            },
          ].map((pill, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="bg-card border border-border shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl px-4 py-3 flex flex-col items-center gap-1.5 hover:shadow-md hover:border-foreground/20 transition-all duration-200"
            >
              <div className="flex items-center gap-1.5">{pill.icon}
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{pill.label}</span>
              </div>
              <span className="text-[15px] font-extrabold text-foreground truncate max-w-full text-center tracking-tight">{pill.value}</span>
            </motion.div>
          ))}
        </div>

        {/* ── Today's Thought (mobile — full-width) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="sm:hidden text-center text-[11px] text-muted-foreground italic px-2"
        >
          "{todayQuote}"
        </motion.div>
      </motion.div>
    );
  }

  // ─── Question State (UNCHANGED) ───────────────────────────────────────────
  const questionData = data as Extract<TodayData, { answered: false }>;
  const question = questionData?.question;

  if (!question) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
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
      className="flex-1 flex flex-col w-full justify-between"
    >
      {/* Question text */}
      <h2 className="text-[19px] font-bold text-foreground mb-6 leading-snug text-center">
        {question.question}
      </h2>

      {/* Options grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
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
                className={`flex flex-col items-center justify-center h-[100px] rounded-2xl bg-card border transition-all cursor-pointer
                  ${isSelected
                    ? "border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.15)] bg-pink-500/5"
                    : "border-border hover:border-foreground/20 hover:bg-white/5"
                  }`}
              >
                <span className="text-2xl lg:text-3xl mb-1">{opt.emoji}</span>
                <span className={`text-[10px] lg:text-xs font-semibold ${isSelected ? "text-pink-400" : "text-muted-foreground"}`}>
                  {opt.label}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer row */}
      <div className="flex flex-col items-center gap-4 mt-auto w-full">
        <Button
          disabled={!selected || submitMutation.isPending}
          onClick={() => {
            if (question && selected) {
              submitMutation.mutate({ questionId: question.id, answer: selected.emoji + " " + selected.label });
            }
          }}
          className={`${
            !selected ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
          } bg-pink-500 w-full text-white rounded-xl h-[48px] shadow-[0_4px_15px_rgba(236,72,153,0.3)] flex items-center justify-center gap-2 font-bold text-base shrink-0`}
        >
          {submitMutation.isPending ? "Saving..." : "Submit Answer"}
        </Button>
        <div className="flex items-center gap-2 text-muted-foreground text-[11px] lg:text-xs">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>Your response is private and secure</span>
        </div>
      </div>
    </motion.div>
  );
}
