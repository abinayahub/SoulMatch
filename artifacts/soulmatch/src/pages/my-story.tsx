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
    color: "text-[#F6A8B7]",
    bg: "bg-[#F6A8B7]/10 border-[#F6A8B7]/20",
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
    color: "text-[#F6A8B7]",
    bg: "bg-[#F6A8B7]/10 border-[#F6A8B7]/20",
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

      const finalContent = content;
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
      <div className="min-h-screen relative overflow-x-hidden font-sans pt-4" style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 35%, #F4F1FF 70%, #FFFDFC 100%)' }}>
        <div className="max-w-md mx-auto px-5 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md shadow-[#F6A8B7]/20" style={{ background: 'linear-gradient(135deg, #F6A8B7, #F8C7C8)' }}>
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-[17px] font-extrabold text-[#252525] tracking-tight">My Story</span>
            </div>
            <button
              onClick={() => setShowJourney(!showJourney)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] border text-[11px] font-bold transition-all ${
                showJourney
                  ? "bg-[#F6A8B7] text-white border-[#F6A8B7] shadow-md shadow-[#F6A8B7]/20"
                  : "text-[#707070] border-white/40"
              }`}
              style={!showJourney ? { background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)' } : undefined}
            >
              <Flame className="w-3.5 h-3.5" />
              Today's Journey
            </button>
          </div>
          
          {/* Share Your Story */}
          <div className="rounded-[28px] p-5 border border-white/35" style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', boxShadow: '0 4px 20px rgba(246,168,183,0.12)' }}>
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[#F6A8B7] text-[9px] font-black uppercase tracking-widest border border-[#F6A8B7]/30" style={{ background: 'rgba(246,168,183,0.15)' }}>
                <BookOpen className="w-3 h-3 text-[#F6A8B7]" /> Share Your Story
             </div>
          </div>
          <h2 className="text-[18px] font-extrabold text-[#252525] mb-1 leading-snug">
             What happened today that mattered to you?
          </h2>
          <p className="text-xs text-[#707070] mb-3">
             Try one of these starters:
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4">
             {[
               { id: "family", label: "I spent time with family..." },
               { id: "friend", label: "I helped a friend..." },
               { id: "goals", label: "I worked on my goals..." },
               { id: "myself", label: "I took care of myself..." },
             ].map((s) => (
               <button
                 key={s.id}
                 onClick={() => setContent(s.label.replace("...", " "))}
                 className="px-2 py-2 rounded-full border border-white/40 text-[10.5px] text-[#707070] font-bold transition-all active:scale-95 text-center truncate whitespace-nowrap hover:bg-white/40"
                 style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)' }}
                 title={s.label}
               >
                 {s.label}
               </button>
             ))}
          </div>

          {/* Textarea with image upload inside */}
          <div className="relative mb-4 border border-white/40 rounded-2xl overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[#F6A8B7]/50" style={{ background: 'rgba(255,255,255,0.6)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
            {imagePreview && (
              <div className="relative p-3 pb-0 group">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-28 rounded-xl object-cover border border-white/30"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-5 right-5 bg-black/40 backdrop-blur-sm text-white rounded-full p-1 border border-white/20"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <Textarea
              placeholder="What's on your mind today? Share something meaningful from your day..."
              className="w-full min-h-[100px] bg-transparent border-0 shadow-none resize-none text-[15px] text-[#252525] placeholder:text-[#8A8A8A] p-4 pb-2 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:outline-none focus:ring-0 leading-relaxed"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {/* Upload icon inside textarea - bottom bar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-white/30" style={{ background: 'rgba(255,255,255,0.4)' }}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageSelect}
              />
              <button
                className="flex items-center gap-1.5 text-[#707070] hover:text-[#F6A8B7] transition-colors group/btn"
                onClick={() => fileInputRef.current?.click()}
                title="Add photo"
              >
                <div className="w-5.5 h-5.5 p-1 rounded-lg border border-white/40 flex items-center justify-center group-hover/btn:bg-[#F6A8B7]/10 group-hover/btn:border-[#F6A8B7]/30 transition-all" style={{ background: 'rgba(255,255,255,0.5)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-[#707070] group-hover/btn:text-[#F6A8B7]">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                    <circle cx="12" cy="13" r="3"/>
                  </svg>
                </div>
                <span className="text-[10.5px] font-bold">Add Photo</span>
              </button>
              <span className="text-[10px] font-black text-[#8A8A8A] tracking-wider">
                {content.length}/1000
              </span>
            </div>
          </div>

          <button
            onClick={handlePost}
            disabled={(!content.trim() && !imageFile) || isPosting}
            className="w-full text-white rounded-full h-[48px] font-bold text-[15px] transition-transform active:scale-[0.98] border border-white/40 disabled:opacity-50 flex items-center justify-center gradient-coral-pill"
          >
            {isPosting ? "Posting..." : "Post Story"}
            <Send className="w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Recent Stories */}
        <div className="rounded-[28px] p-6 border border-white/35" style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', boxShadow: '0 4px 20px rgba(246,168,183,0.12)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#252525] font-extrabold text-[18px]">
              Recent stories
            </h3>
            <span className="text-[12px] text-[#707070] font-semibold">
               {myJournals.length} {myJournals.length === 1 ? 'story' : 'stories'}
            </span>
          </div>

          <div className="space-y-2">
            {myJournals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                 {/* Book icon */}
                 <div className="w-12 h-12 text-[#707070]/30 mb-3 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                 </div>
                 <h4 className="text-[15px] font-extrabold text-[#252525] mb-2">No stories yet</h4>
                 <p className="text-xs text-[#707070] max-w-[260px] leading-relaxed mb-5 font-medium">
                    Your first story builds your personality profile and helps us find people who truly match your values and lifestyle.
                 </p>
                 <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                    className="border border-[#F6A8B7]/40 hover:bg-[#F6A8B7]/10 text-[#F6A8B7] rounded-full px-5 py-2.5 text-xs font-bold transition-all active:scale-95 bg-transparent"
                 >
                    Write your first story
                 </button>
              </div>
            ) : (
              <>
                {todayStories.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-[#707070] text-[11px] font-extrabold uppercase tracking-widest mb-4 px-1">
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
                    <h4 className="text-[#707070] text-[11px] font-extrabold uppercase tracking-widest mb-4 px-1">
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
                    <h4 className="text-[#707070] text-[11px] font-extrabold uppercase tracking-widest mb-4 px-1">
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
                  <div className="pt-4 text-center border-t border-white/30 mt-4">
                    <Link href="/story-archive">
                      <Button
                        variant="outline"
                        className="w-full bg-transparent border-white/40 text-[#252525] rounded-[20px] hover:bg-white/40 transition-colors h-[60px] font-bold text-[16px]"
                        style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(12px)' }}
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
                    <h3 className="text-[#252525] font-extrabold text-[17px]">Today's Journey</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-foreground/5 px-2.5 py-1 rounded-[10px] border border-border">
                      <Flame className="w-3 h-3 text-[#ff6b6b]" />
                      <span className="text-[11px] font-bold text-[#252525]">{currentStreak} Days</span>
                    </div>
                    <button
                      onClick={() => setShowJourney(false)}
                      className="w-7 h-7 rounded-full bg-foreground/5 border border-border flex items-center justify-center text-[#707070] hover:bg-foreground/10 transition-colors"
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
                      <p className="text-[12px] text-[#707070] leading-relaxed">
                        Complete today's activities to improve your personality and compatibility.
                      </p>

                      {/* Daily Question */}
                      <div className={`p-3.5 rounded-[14px] border flex items-center gap-3 transition-colors ${
                        isQuestionAnsweredToday ? "bg-primary/5 border-primary/20" : "bg-foreground/5 border-border"
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isQuestionAnsweredToday ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-transparent border border-border text-[#707070]"
                        }`}>
                          {isQuestionAnsweredToday ? <Check className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-[var(--muted-foreground)]" />}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-[13px] ${isQuestionAnsweredToday ? "text-primary" : "text-[#252525]"}`}>Daily Question</div>
                          <div className="text-[11px] text-[#707070]">{isQuestionAnsweredToday ? "✓ Completed" : "Not answered yet"}</div>
                        </div>
                        {!isQuestionAnsweredToday && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-[8px]">Go →</span>}
                      </div>

                      {/* Story Shared */}
                      <div className={`p-3.5 rounded-[14px] border flex items-center gap-3 transition-colors ${
                        isStorySharedToday ? "bg-primary/5 border-primary/20" : "bg-foreground/5 border-border"
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isStorySharedToday ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-transparent border border-border text-[#707070]"
                        }`}>
                          {isStorySharedToday ? <Check className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-[var(--muted-foreground)]" />}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-[13px] ${isStorySharedToday ? "text-primary" : "text-[#252525]"}`}>Story Shared</div>
                          <div className="text-[11px] text-[#707070]">{isStorySharedToday ? "✓ Shared today" : "Share today's experience"}</div>
                        </div>
                        {!isStorySharedToday && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-[8px]">Go →</span>}
                      </div>

                      <div className="h-[1px] bg-border" />

                      <div className="flex justify-between items-center">
                        <span className="text-[12px] font-bold text-[#252525]">Today's Progress</span>
                        <span className="text-[12px] font-bold text-primary">{completedActivities} / 2 Complete</span>
                      </div>
                      <div className="h-2 w-full bg-foreground/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-700 ease-out" style={{ width: `${(completedActivities / 2) * 100}%` }} />
                      </div>

                      {completedActivities === 2 && (
                        <div className="bg-primary/10 border border-primary/20 rounded-[12px] p-3 text-center">
                          <div className="font-bold text-[13px] text-primary">🎉 All done for today!</div>
                          <div className="text-[11px] text-[#707070] mt-0.5">Great job completing your daily journey.</div>
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







        {/* Footer */}
        <div className="rounded-[24px] p-6 flex items-center justify-between relative overflow-hidden mt-6 mb-8 border border-white/35" style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', boxShadow: '0 4px 20px rgba(246,168,183,0.12)' }}>
          <div className="flex items-center gap-4 z-10">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-[#F6A8B7]/30" style={{ background: 'rgba(246,168,183,0.15)' }}>
              <Heart className="w-6 h-6 text-[#F6A8B7] fill-[#F6A8B7]" />
            </div>
            <p className="text-[#707070] font-medium text-[13px] leading-relaxed max-w-[240px]">
              Every story you share is a step towards finding your perfect match.
            </p>
          </div>
        </div>
      </div>
      </div>
    </AppLayout>
  );
}
