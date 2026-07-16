import { API_URL } from "../config/api";
import { useState, useMemo, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  format,
  subDays,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isToday,
  differenceInDays,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StoryCard, CATEGORY_STYLES } from "@/components/StoryCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth, getAccessToken } from "@/lib/auth-context";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/api";

import {
  Book,
  Image as ImageIcon,
  Send,
  Lock,
  Globe,
  LockKeyhole,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Heart,
  Briefcase,
  TrendingUp,
  Users,
  Plane,
  Apple,
  Lightbulb,
  MessageCircle,
  Calendar as CalendarIcon,
  Sparkles,
  CheckCircle2,
  Check,
  Search,
  Flame,
  Award,
  BookOpen,
  Star,
  RefreshCw,
  Timer,
  Upload,
  X,
  LayoutGrid,
  User,
} from "lucide-react";

// --- API Functions ---
const fetchMyJournals = async () => {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/api/journal/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch journals");
  return res.json();
};

const fetchMetrics = async () => {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/api/metrics/today`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch metrics");
  return res.json();
};

const fetchFeed = async () => {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/api/journal/feed`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch feed");
  return res.json();
};

const postJournal = async (data: { content: string; imageUrl?: string }) => {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/api/journal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to post journal");
  return res.json();
};

const deleteJournal = async (id: number) => {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/api/journal/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete journal");
  return res.json();
};

// --- Helpers & Constants ---
const MOODS = [
  {
    id: "Happy",
    emoji: "😄",
    color: "text-pink-500",
    bg: "bg-pink-500/10 border-pink-500/20",
  },
  {
    id: "Calm",
    emoji: "😌",
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "Tired",
    emoji: "😴",
    color: "text-slate-400",
    bg: "bg-slate-500/10 border-slate-500/20",
  },
  {
    id: "Excited",
    emoji: "🤩",
    color: "text-orange-500",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
  {
    id: "Sad",
    emoji: "😢",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    id: "Frustrated",
    emoji: "😤",
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20",
  },
];

const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function MyStory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState("Happy");
  const [activeTab, setActiveTab] = useState<"me" | "feed">("me");
  const [isPosting, setIsPosting] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<any>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showJourney, setShowJourney] = useState(false);

  useEffect(() => {
    if (window.location.hash) {
      setTimeout(() => {
        const id = window.location.hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  const dailyPollQuery = useQuery({
    queryKey: ["/api/journey/daily-poll"],
    queryFn: () => {
      const token = getAccessToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return apiRequest<any>("/journey/daily-poll", {
        headers: headers as any,
      });
    },
  });

  const dailyReflectionQuery = useQuery({
    queryKey: ["/api/reflections/today"],
    queryFn: () => {
      const token = getAccessToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return apiRequest<any>("/reflections/today", { headers: headers as any });
    },
  });

  const todayPrompt =
    dailyPollQuery.data?.poll?.question || "What made you smile today?";

  // Queries
  const { data: myJournals = [], isLoading: loadingMe } = useQuery({
    queryKey: ["myJournals"],
    queryFn: fetchMyJournals,
    refetchInterval: (q: any) =>
      q.state.data?.length > 0 && !q.state.data[0].aiAnalysis ? 5000 : false,
  });

  const { data: feedData, isLoading: loadingFeed } = useQuery({
    queryKey: ["journalFeed"],
    queryFn: fetchFeed,
  });
  const { data: metricsData } = useQuery({
    queryKey: ["systemMetrics"],
    queryFn: fetchMetrics,
    refetchInterval: 5000,
  });

  // Handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB.",
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid format",
        description: "Only JPG, PNG and WEBP formats are supported.",
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handlePost = async () => {
    if (!content.trim() && !imageFile) return;
    setIsPosting(true);
    try {
      let imageUrl: string | undefined = undefined;

      if (imageFile) {
        imageUrl = await toBase64(imageFile);
      } else if (content.toLowerCase().includes("photo")) {
        imageUrl =
          "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80";
      }

      // Add mood to content visually as prefix for now since we can't change DB
      const finalContent = `[Feeling ${selectedMood}] ${content}`;
      await postJournal({ content: finalContent, imageUrl });

      setContent("");
      removeImage();
      toast({
        title: "Journal posted!",
        description: "Your behavior profile has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["myJournals"] });
    } catch (e) {
      toast({
        title: "Error",
        description: "Could not post journal",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteJournal(id);
      toast({ title: "Deleted", description: "Your story was removed." });
      queryClient.invalidateQueries({ queryKey: ["myJournals"] });
    } catch (e) {
      toast({
        title: "Error",
        description: "Could not delete story",
        variant: "destructive",
      });
    }
  };

  // Calculations
  const { todayStories, yesterdayStories, earlierStories } = useMemo(() => {
    const today: any[] = [];
    const yesterday: any[] = [];
    const earlier: any[] = [];
    const now = new Date();

    myJournals.slice(0, 4).forEach((j: any) => {
      const date = new Date(j.createdAt);
      if (isSameDay(date, now)) {
        today.push(j);
      } else if (isSameDay(date, subDays(now, 1))) {
        yesterday.push(j);
      } else {
        earlier.push(j);
      }
    });

    return {
      todayStories: today,
      yesterdayStories: yesterday,
      earlierStories: earlier,
    };
  }, [myJournals]);

  const cumulativeProfile = myJournals[0]?.aiAnalysis?.cumulativeProfile;
  const completedCount = myJournals.length;
  const journeyProgress = Math.min(
    100,
    Math.round((completedCount / 30) * 100),
  );

  // Streak calc
  const currentStreak = useMemo(() => {
    if (!myJournals.length) return 0;
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const d = subDays(now, i);
      const hasPost = myJournals.some((j: any) =>
        isSameDay(new Date(j.createdAt), d),
      );
      if (hasPost) streak++;
      else if (i > 0) break; // Missed a day
    }
    return streak;
  }, [myJournals]);


  const validTraits = useMemo(() => {
    let totalScore = 0;
    const scores = {
      "Emotional Understanding": 0,
      "Communication Style": 0,
      "Relationship Values": 0,
      "Life Goals Alignment": 0,
      "Adventure & Openness": 0,
    };

    myJournals.forEach((j: any) => {
      const s = j.aiAnalysis?.storyAnalysis?.storyScores || {};
      scores["Emotional Understanding"] +=
        (s["Emotional Wellbeing"] || 0) + (s["Kindness & Empathy"] || 0);
      scores["Communication Style"] += s["Communication Style"] || 0;
      scores["Relationship Values"] +=
        (s["Family Values"] || 0) + (s["Relationship Commitment"] || 0);
      scores["Life Goals Alignment"] +=
        (s["Career Focus"] || 0) + (s["Personal Growth"] || 0);
      scores["Adventure & Openness"] += s["Adventure & Travel"] || 0;
    });

    const storyCount = Math.max(1, myJournals.length);
    // Calculate average score per story, multiply by a scalar to get a nice 0-100 absolute percentage
    // A typical strong story might yield 10-15 points in a category.
    const scalar = 6;

    return {
      emotional: Math.min(
        100,
        Math.round((scores["Emotional Understanding"] / storyCount) * scalar),
      ),
      communication: Math.min(
        100,
        Math.round((scores["Communication Style"] / storyCount) * scalar),
      ),
      relationship: Math.min(
        100,
        Math.round((scores["Relationship Values"] / storyCount) * scalar),
      ),
      goals: Math.min(
        100,
        Math.round((scores["Life Goals Alignment"] / storyCount) * scalar),
      ),
      adventure: Math.min(
        100,
        Math.round((scores["Adventure & Openness"] / storyCount) * scalar),
      ),
    };
  }, [myJournals]);

  // For the overall average, calculate it from all non-zero traits (or just all 5 traits)
  const allTraits = Object.values(validTraits);
  const overallAvg = allTraits.length
    ? Math.round(allTraits.reduce((acc, v) => acc + v, 0) / allTraits.length)
    : 0;

  return (
    <AppLayout>
      <div className="min-h-screen relative overflow-x-hidden font-sans pt-4">
        <div className="max-w-md mx-auto px-5 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-[17px] font-extrabold text-foreground tracking-tight">My Story</span>
            </div>
            <button
              onClick={() => setShowJourney(!showJourney)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] border text-[11px] font-bold transition-all ${
                showJourney
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-foreground/5 text-foreground border-border"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Today's Journey
            </button>
          </div>
          
          {/* Share Your Day */}
          <div className="bg-card border border-border shadow-sm rounded-[24px] p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.15em]">
              🎉 Share Your Day
            </div>
          </div>
          <h2 className="text-[18px] font-extrabold text-foreground mb-2 leading-snug">
            How did today make you feel?
          </h2>

          <div className="grid grid-cols-6 gap-1.5 mb-2">
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMood(m.id)}
                className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-[12px] border transition-all ${
                  selectedMood === m.id ? m.bg : "border-border bg-background"
                }`}
              >
                <span className="text-[20px] leading-none">{m.emoji}</span>
                <span
                  className={`text-[9px] font-bold leading-none mt-0.5 ${
                    selectedMood === m.id ? m.color : "text-muted-foreground"
                  }`}
                >
                  {m.id}
                </span>
              </button>
            ))}
          </div>

          {/* Textarea with image upload inside */}
          <div className="relative mb-3">
            {imagePreview && (
              <div className="relative mb-2 group inline-block w-full">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-28 rounded-[14px] object-cover border border-border"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground rounded-full p-1 border border-border"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="relative">
              <Textarea
                placeholder="Write your story..."
                className="min-h-[72px] bg-background border border-border resize-none text-[14px] text-foreground placeholder:text-muted-foreground rounded-[18px] pt-3 pl-4 pr-4 pb-9 focus-visible:ring-1 focus-visible:ring-primary/50 leading-relaxed shadow-inner"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              {/* Upload icon inside textarea - bottom bar */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-1.5 rounded-b-[18px] bg-background border-t border-border/40">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                />
                <button
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group/btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Add photo"
                >
                  <div className="w-6 h-6 rounded-[8px] bg-foreground/5 border border-border flex items-center justify-center group-hover/btn:bg-primary/10 group-hover/btn:border-primary/30 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                      <circle cx="12" cy="13" r="3"/>
                    </svg>
                  </div>
                  <span className="text-[11px] font-semibold">Add Photo</span>
                </button>
                <span className="text-[11px] font-bold text-muted-foreground">
                  {content.length}/1000
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={handlePost}
            disabled={(!content.trim() && !imageFile) || isPosting}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-[18px] h-[44px] font-bold text-[15px] shadow-xl shadow-primary/20 transition-transform active:scale-[0.98]"
          >
            {isPosting ? "Saving..." : "Save Story"}
            <Send className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Recent Stories */}
        <div className="bg-card border border-border shadow-sm rounded-[24px] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-foreground font-extrabold text-[18px]">
              Recent Stories
            </h3>
            {myJournals.length > 5 && (
              <Link
                href="/story-archive"
                className="text-primary hover:text-primary/80 text-[13px] font-bold transition-colors"
              >
                View All {">"}
              </Link>
            )}
          </div>

          <div className="space-y-2">
            {myJournals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 font-medium">
                No stories found. Start sharing your moments!
              </p>
            ) : (
              <>
                {todayStories.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-muted-foreground text-[11px] font-extrabold uppercase tracking-widest mb-4 px-1">
                      Today
                    </h4>
                    {todayStories.map((journal: any) => (
                      <StoryCard
                        key={journal.id}
                        journal={journal}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
                {yesterdayStories.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-muted-foreground text-[11px] font-extrabold uppercase tracking-widest mb-4 px-1">
                      Yesterday
                    </h4>
                    {yesterdayStories.map((journal: any) => (
                      <StoryCard
                        key={journal.id}
                        journal={journal}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
                {earlierStories.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-muted-foreground text-[11px] font-extrabold uppercase tracking-widest mb-4 px-1">
                      Earlier
                    </h4>
                    {earlierStories.map((journal: any) => (
                      <StoryCard
                        key={journal.id}
                        journal={journal}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}

                {myJournals.length > 4 && (
                  <div className="pt-4 text-center border-t border-border mt-4">
                    <Link href="/story-archive">
                      <Button
                        variant="outline"
                        className="w-full bg-background border-border text-foreground rounded-[20px] hover:bg-[var(--border)] transition-colors h-[60px] font-bold text-[16px]"
                      >
                        View All Stories Archive
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {/* Today's Journey - Centered Modal Popup */}
        {showJourney && ReactDOM.createPortal(
          <>
            {/* Backdrop */}
            <div
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 9998 }}
              onClick={() => setShowJourney(false)}
            />
            {/* Centered Modal */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div
                className="bg-card border border-border rounded-[24px] shadow-2xl p-5 w-full"
                style={{ maxWidth: '400px', animation: 'popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-foreground font-extrabold text-[17px]">Today's Journey</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-foreground/5 px-2.5 py-1 rounded-[10px] border border-border">
                      <Flame className="w-3 h-3 text-[#ff6b6b]" />
                      <span className="text-[11px] font-bold text-foreground">{currentStreak} Days</span>
                    </div>
                    <button
                      onClick={() => setShowJourney(false)}
                      className="w-7 h-7 rounded-full bg-foreground/5 border border-border flex items-center justify-center text-muted-foreground hover:bg-foreground/10 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {(() => {
                  const isQuestionAnsweredToday =
                    dailyReflectionQuery.data?.answered === true ||
                    dailyPollQuery.data?.isLocked ||
                    ((journeyProgress as any)?.lastAnsweredAt &&
                      isSameDay(new Date((journeyProgress as any).lastAnsweredAt), new Date())) ||
                    (journeyProgress as any)?.questionsRemainingToday === 0;
                  const isStorySharedToday = todayStories.length > 0;
                  const completedActivities = (isQuestionAnsweredToday ? 1 : 0) + (isStorySharedToday ? 1 : 0);

                  return (
                    <div className="flex flex-col gap-3">
                      <p className="text-[12px] text-muted-foreground leading-relaxed">
                        Complete today's activities to improve your personality and compatibility.
                      </p>

                      {/* Daily Question */}
                      <div className={`p-3.5 rounded-[14px] border flex items-center gap-3 transition-colors ${
                        isQuestionAnsweredToday ? "bg-primary/5 border-primary/20" : "bg-foreground/5 border-border"
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isQuestionAnsweredToday ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-background border border-border text-muted-foreground"
                        }`}>
                          {isQuestionAnsweredToday ? <Check className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-[var(--muted-foreground)]" />}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-[13px] ${isQuestionAnsweredToday ? "text-primary" : "text-foreground"}`}>Daily Question</div>
                          <div className="text-[11px] text-muted-foreground">{isQuestionAnsweredToday ? "✓ Completed" : "Not answered yet"}</div>
                        </div>
                        {!isQuestionAnsweredToday && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-[8px]">Go →</span>}
                      </div>

                      {/* Story Shared */}
                      <div className={`p-3.5 rounded-[14px] border flex items-center gap-3 transition-colors ${
                        isStorySharedToday ? "bg-primary/5 border-primary/20" : "bg-foreground/5 border-border"
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isStorySharedToday ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-background border border-border text-muted-foreground"
                        }`}>
                          {isStorySharedToday ? <Check className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-[var(--muted-foreground)]" />}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-[13px] ${isStorySharedToday ? "text-primary" : "text-foreground"}`}>Story Shared</div>
                          <div className="text-[11px] text-muted-foreground">{isStorySharedToday ? "✓ Shared today" : "Share today's experience"}</div>
                        </div>
                        {!isStorySharedToday && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-[8px]">Go →</span>}
                      </div>

                      <div className="h-[1px] bg-border" />

                      <div className="flex justify-between items-center">
                        <span className="text-[12px] font-bold text-foreground">Today's Progress</span>
                        <span className="text-[12px] font-bold text-primary">{completedActivities} / 2 Complete</span>
                      </div>
                      <div className="h-2 w-full bg-foreground/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-700 ease-out" style={{ width: `${(completedActivities / 2) * 100}%` }} />
                      </div>

                      {completedActivities === 2 && (
                        <div className="bg-primary/10 border border-primary/20 rounded-[12px] p-3 text-center">
                          <div className="font-bold text-[13px] text-primary">🎉 All done for today!</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">Great job completing your daily journey.</div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
            <style>{`@keyframes popIn { from { transform: scale(0.85); opacity:0; } to { transform: scale(1); opacity:1; } }`}</style>
          </>,
          document.body
        )}

        {/* Personality Snapshot */}
        <div
          id="personality-snapshot"
          className="bg-card border border-border shadow-sm rounded-[24px] p-4 flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[16px] text-foreground font-extrabold">
              Personality Snapshot
            </h3>
            <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-primary fill-primary/20" />
            </div>
          </div>

          {/* Side-by-side: circle left, traits right */}
          <div className="flex gap-3 items-center">
            {/* Left: Circle Chart */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                {/* Background ring */}
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  className="text-foreground/10"
                  strokeWidth="10"
                />
                {/* Progress ring */}
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  className="stroke-primary transition-all duration-1000 ease-out"
                  strokeWidth="10"
                  strokeDasharray="251.33"
                  strokeDashoffset={251.33 - (overallAvg / 100) * 251.33}
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex flex-col items-center z-10">
                <span className="text-[18px] font-extrabold text-foreground leading-none tracking-tight">
                  {overallAvg}%
                </span>
                <span className="text-[7px] text-muted-foreground font-bold text-center leading-tight mt-0.5 uppercase tracking-wide">
                  Overall<br/>Awareness
                </span>
              </div>
            </div>

            {/* Right: Trait Rows */}
            <div className="flex flex-col gap-1.5 flex-1">
              {[
                {
                  label: "Emotional Understanding",
                  val: validTraits.emotional,
                  icon: Heart,
                  color: "bg-[#ff4b4b]",
                  text: "text-[#ff4b4b]",
                  border: "border-[#ff4b4b]/20",
                  bg: "bg-[#ff4b4b]/10",
                },
                {
                  label: "Communication Style",
                  val: validTraits.communication,
                  icon: MessageCircle,
                  color: "bg-[#9B4DFF]",
                  text: "text-[#9B4DFF]",
                  border: "border-[#9B4DFF]/20",
                  bg: "bg-[#9B4DFF]/10",
                },
                {
                  label: "Relationship Values",
                  val: validTraits.relationship,
                  icon: Users,
                  color: "bg-[#3b82f6]",
                  text: "text-[#3b82f6]",
                  border: "border-[#3b82f6]/20",
                  bg: "bg-[#3b82f6]/10",
                },
                {
                  label: "Life Goals Alignment",
                  val: validTraits.goals,
                  icon: TrendingUp,
                  color: "bg-[#10b981]",
                  text: "text-[#10b981]",
                  border: "border-[#10b981]/20",
                  bg: "bg-[#10b981]/10",
                },
                {
                  label: "Adventure & Openness",
                  val: validTraits.adventure,
                  icon: Sparkles,
                  color: "bg-[#f59e0b]",
                  text: "text-[#f59e0b]",
                  border: "border-[#f59e0b]/20",
                  bg: "bg-[#f59e0b]/10",
                },
              ].map((item, i) => {
                const tag =
                  item.val >= 75
                    ? "HIGH"
                    : item.val >= 50
                    ? "GOOD"
                    : item.val >= 25
                    ? "AVG"
                    : "LOW";
                const tagStyles =
                  item.val >= 75
                    ? "text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20"
                    : item.val >= 50
                    ? "text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/20"
                    : item.val >= 25
                    ? "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20"
                    : "text-[#ff4b4b] bg-[#ff4b4b]/10 border-[#ff4b4b]/20";

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-card border border-border px-2.5 py-1.5 rounded-[12px]"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-[7px] ${item.bg} flex items-center justify-center shrink-0`}>
                        <item.icon className={`w-3 h-3 ${item.text}`} />
                      </div>
                      <span className="text-foreground font-semibold text-[11px] leading-tight">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-extrabold text-foreground text-[12px]">{item.val}%</span>
                      <span className={`text-[8px] font-bold px-1 py-0.5 rounded-[5px] border uppercase tracking-wider ${tagStyles}`}>
                        {tag}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>





        {/* Footer */}
        <div className="bg-card border border-border shadow-sm rounded-[24px] p-6 flex items-center justify-between relative overflow-hidden mt-6 mb-8">
          <div className="flex items-center gap-4 z-10">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 text-primary fill-primary" />
            </div>
            <p className="text-muted-foreground font-medium text-[13px] leading-relaxed max-w-[240px]">
              Every story you share is a step towards finding your perfect match.
            </p>
          </div>
        </div>
      </div>
      </div>
    </AppLayout>
  );
}
