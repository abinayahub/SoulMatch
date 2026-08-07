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
import { Link, useLocation } from "wouter";
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
  Feather,
  ArrowLeft,
  Camera,
  Video as VideoIcon,
  ShieldCheck,
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
  const [, setLocation] = useLocation();

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
  const [isComposerOpen, setIsComposerOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.search.includes("create=true") || 
             window.location.search.includes("compose=true") ||
             window.location.hash.includes("compose");
    }
    return false;
  });

  useEffect(() => {
    if (window.location.search.includes("create=true") || window.location.search.includes("compose=true")) {
      setIsComposerOpen(true);
    }
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
      setIsComposerOpen(false);
      toast({
        title: "Journal posted!",
        description: "Your behavior profile has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["myJournals"] });
      queryClient.invalidateQueries({ queryKey: ["journalFeed"] });
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
      <div className="min-h-screen relative overflow-x-hidden font-sans pt-4" style={{ background: 'linear-gradient(135deg, #FAF2EF 0%, #F5F0FB 50%, #FFFDFB 75%, #F7F7FA 100%)' }}>
        <div className="max-w-md mx-auto px-5 space-y-6">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md shadow-[#F6A8B7]/20" style={{ background: 'linear-gradient(135deg, #F6A8B7, #F8C7C8)' }}>
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <span className="text-[clamp(18px,5vw,24px)] font-black text-[#252525] tracking-tight">Stories</span>
              </div>
              <button
                onClick={() => setShowJourney(!showJourney)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] border text-[clamp(9px,2.80vw,13px)] font-bold transition-all ${
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
          </div>

          {/* 1. YOUR STORY CARD (Always Share Story Action) */}
          {(() => {
            return (
              <div 
                onClick={() => setIsComposerOpen(true)}
                className="w-full rounded-[24px] p-4.5 border border-[#F8D6DD]/40 shadow-[0_10px_30px_rgba(246,168,183,0.08)] cursor-pointer active:scale-[0.99] transition-all relative overflow-hidden group mb-6 backdrop-blur-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,240,245,0.4) 100%)',
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Left Feather Icon Box with + badge */}
                  <div className="w-14 h-14 rounded-[20px] bg-[#F6A8B7]/10 flex items-center justify-center shrink-0 relative border border-[#F6A8B7]/30 shadow-2xs">
                    <Feather className="w-6 h-6 text-[#F6A8B7]" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-white flex items-center justify-center text-[#F6A8B7] text-xs font-black shadow-2xs">
                      +
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-extrabold text-[#252525] leading-tight">Your Story</h3>
                    <span className="text-xs sm:text-sm font-bold text-[#F6A8B7] mt-0.5 block group-hover:underline">
                      Tap to create your story
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 2. STORIES FROM CONNECTIONS (Portrait Rectangular Cards) */}
          <div className="w-full mb-6 select-none">
            <div className="flex items-center justify-between mb-3 px-0.5">
              <h3 className="text-[#252525] font-extrabold text-sm sm:text-base">
                Stories from connections
              </h3>
            </div>

            <div 
              className="flex items-center gap-3.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* 1. Your Story Portrait Card */}
              {(() => {
                const hasPostedToday = todayStories.length > 0;
                const userPhoto = user?.photos?.[0]?.url || myJournals?.[0]?.imageUrl || undefined;

                return (
                  <div 
                    onClick={() => {
                      if (hasPostedToday) {
                        setSelectedJournal(todayStories[0]);
                      } else {
                        setIsComposerOpen(true);
                      }
                    }}
                    className={`w-[96px] h-[152px] rounded-[18px] shrink-0 relative overflow-hidden cursor-pointer active:scale-95 transition-all group shadow-md ${
                      hasPostedToday
                        ? "border-2 border-[#F6A8B7] shadow-[0_4px_16px_rgba(246,168,183,0.18)]"
                        : "border-2 border-dashed border-[#F6A8B7]/70 bg-[#FFF0F3]"
                    }`}
                  >
                    {/* User Background Image */}
                    {userPhoto ? (
                      <img 
                        src={userPhoto} 
                        alt="Your Story" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#FFF0F3] to-[#FCE4EC] flex items-center justify-center">
                        <User className="w-9 h-9 text-[#F6A8B7]" />
                      </div>
                    )}

                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-2.5 flex flex-col justify-between">
                      {/* Top Action Badge */}
                      <div className="flex justify-end">
                        {!hasPostedToday ? (
                          <div className="w-6 h-6 rounded-full bg-[#F6A8B7] border-2 border-white flex items-center justify-center text-white text-xs font-black shadow-2xs">
                            +
                          </div>
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#F6A8B7] border border-white shadow-2xs" />
                        )}
                      </div>

                      {/* Bottom Info */}
                      <div>
                        <span className="text-[12px] font-bold text-white leading-tight block truncate drop-shadow-sm">
                          Your Story
                        </span>
                        <span className="text-[10px] font-semibold text-white/80 block leading-tight">
                          {hasPostedToday ? "Active" : "Add story"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 2. Connected Users' Story Cards */}
              {(() => {
                const feedJournals = Array.isArray(feedData) ? feedData : (feedData as any)?.journals || [];
                
                const userStoriesMap = new Map<number, any>();
                feedJournals.forEach((j: any) => {
                  if (j.user && j.user.id && !userStoriesMap.has(j.user.id)) {
                    userStoriesMap.set(j.user.id, j);
                  }
                });

                const userStories = Array.from(userStoriesMap.values());

                if (userStories.length === 0) {
                  return (
                    <div className="w-[96px] h-[152px] rounded-[18px] shrink-0 border border-dashed border-[#F6A8B7]/30 bg-white/40 p-3 flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs">
                      <div className="w-8 h-8 rounded-full bg-[#F6A8B7]/10 flex items-center justify-center text-[#F6A8B7]">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-[#707070] leading-snug">
                        No connection stories today
                      </span>
                    </div>
                  );
                }

                return userStories.map((j: any) => {
                  const firstName = j.user.firstName || j.user.displayName || "User";
                  const avatar = j.user.photos?.[0]?.url || j.imageUrl || "/blurred-avatar.png";
                  const date = new Date(j.createdAt);
                  const now = new Date();
                  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
                  let timeAgo = "Just now";
                  if (diffInMinutes >= 60) {
                    const hours = Math.floor(diffInMinutes / 60);
                    timeAgo = `${hours}h ago`;
                  } else if (diffInMinutes > 0) {
                    timeAgo = `${diffInMinutes}m ago`;
                  }

                  return (
                    <div
                      key={j.id}
                      onClick={() => setSelectedJournal(j)}
                      className="w-[96px] h-[152px] rounded-[18px] shrink-0 relative overflow-hidden cursor-pointer active:scale-95 transition-all group shadow-md border-2 border-[#F6A8B7] shadow-[0_4px_14px_rgba(246,168,183,0.15)]"
                    >
                      {/* Background Image */}
                      <img 
                        src={avatar} 
                        alt={firstName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-2.5 flex flex-col justify-between">
                        {/* Top Indicator */}
                        <div className="flex justify-between items-center">
                          <span className="px-1.5 py-0.5 rounded-full bg-[#F6A8B7] backdrop-blur-xs text-[8px] font-black uppercase text-white tracking-wider">
                            NEW
                          </span>
                          <div className="w-2.5 h-2.5 rounded-full bg-[#F6A8B7] border border-white shadow-2xs" />
                        </div>

                        {/* Bottom Label */}
                        <div>
                          <span className="text-[12px] font-bold text-white leading-tight block truncate drop-shadow-sm">
                            {firstName}
                          </span>
                          <span className="text-[10px] font-medium text-white/80 block leading-tight">
                            {timeAgo}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>


          {/* 3. COMMUNITY QUESTIONS CARD */}
          <div className="w-full mb-6">
            <div 
              onClick={() => setLocation("/community-questions")}
              className="w-full rounded-[24px] p-4.5 border border-[#F8D6DD]/40 cursor-pointer active:scale-[0.99] transition-all relative overflow-hidden group backdrop-blur-xl shadow-[0_10px_30px_rgba(246,168,183,0.08)]"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,240,245,0.4) 100%)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[20px] bg-[#F6A8B7]/10 flex items-center justify-center shrink-0 border border-[#F6A8B7]/30 shadow-2xs">
                    <MessageCircle className="w-6 h-6 text-[#F6A8B7]" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#252525] leading-snug">Community Questions</h3>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-full bg-[#F6A8B7] text-[10px] font-black uppercase text-white tracking-wider shadow-sm mr-2">
                    NEW
                  </span>
                  <div className="w-9 h-9 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center text-[#707070] group-hover:text-[#F6A8B7] group-hover:scale-110 transition-all border border-[#F8D6DD]/40 mr-2">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. MY STORY JOURNAL LINK CARD */}
          <div className="w-full mb-6">
            <Link href="/story-archive">
              <div 
                className="w-full rounded-[24px] p-4.5 border border-[#F8D6DD]/40 cursor-pointer active:scale-[0.99] transition-all relative overflow-hidden group backdrop-blur-xl shadow-[0_10px_30px_rgba(246,168,183,0.08)]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,240,245,0.4) 100%)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[20px] bg-[#F6A8B7]/10 flex items-center justify-center shrink-0 border border-[#F6A8B7]/30 shadow-2xs">
                      <BookOpen className="w-6 h-6 text-[#F6A8B7]" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#252525] leading-snug">My Story Journal</h3>
                      <p className="text-xs text-[#707070] font-medium leading-normal">
                        View your previous stories and memories
                      </p>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center text-[#707070] group-hover:text-[#F6A8B7] group-hover:scale-110 transition-all border border-[#F8D6DD]/40">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>
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
                    <h3 className="text-[#252525] font-extrabold text-[clamp(14px,4.33vw,20px)]">Today's Journey</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-foreground/5 px-2.5 py-1 rounded-[10px] border border-border">
                      <Flame className="w-3 h-3 text-[#ff6b6b]" />
                      <span className="text-[clamp(9px,2.80vw,13px)] font-bold text-[#252525]">{currentStreak} Days</span>
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
                      <p className="text-[clamp(10px,3.05vw,14px)] text-[#707070] leading-relaxed">
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
                          <div className={`font-bold text-[clamp(11px,3.31vw,15px)] ${isQuestionAnsweredToday ? "text-primary" : "text-[#252525]"}`}>Daily Question</div>
                          <div className="text-[clamp(9px,2.80vw,13px)] text-[#707070]">{isQuestionAnsweredToday ? "✓ Completed" : "Not answered yet"}</div>
                        </div>
                        {!isQuestionAnsweredToday && <span className="text-[clamp(9px,2.54vw,12px)] font-bold text-primary bg-primary/10 px-2 py-1 rounded-[8px]">Go →</span>}
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
                          <div className={`font-bold text-[clamp(11px,3.31vw,15px)] ${isStorySharedToday ? "text-primary" : "text-[#252525]"}`}>Story Shared</div>
                          <div className="text-[clamp(9px,2.80vw,13px)] text-[#707070]">{isStorySharedToday ? "✓ Shared today" : "Share today's experience"}</div>
                        </div>
                        {!isStorySharedToday && <span className="text-[clamp(9px,2.54vw,12px)] font-bold text-primary bg-primary/10 px-2 py-1 rounded-[8px]">Go →</span>}
                      </div>

                      <div className="h-[1px] bg-border" />

                      <div className="flex justify-between items-center">
                        <span className="text-[clamp(10px,3.05vw,14px)] font-bold text-[#252525]">Today's Progress</span>
                        <span className="text-[clamp(10px,3.05vw,14px)] font-bold text-primary">{completedActivities} / 2 Complete</span>
                      </div>
                      <div className="h-2 w-full bg-foreground/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-700 ease-out" style={{ width: `${(completedActivities / 2) * 100}%` }} />
                      </div>

                      {completedActivities === 2 && (
                        <div className="bg-primary/10 border border-primary/20 rounded-[12px] p-3 text-center">
                          <div className="font-bold text-[clamp(11px,3.31vw,15px)] text-primary">🎉 All done for today!</div>
                          <div className="text-[clamp(9px,2.80vw,13px)] text-[#707070] mt-0.5">Great job completing your daily journey.</div>
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

        {/* Full-Screen Dedicated "Share Your Story" Page Overlay */}
        {isComposerOpen && ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-[99999] overflow-hidden font-sans flex flex-col select-none"
            style={{ background: "linear-gradient(135deg, #FAF2EF 0%, #F5F0FB 50%, #FFFDFB 75%, #F7F7FA 100%)" }}
          >
            <div
              className="w-full max-w-md mx-auto flex flex-col gap-2.5 px-4 relative"
              style={{
                paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)",
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)",
                height: "100%",
              }}
            >

              {/* ── COMPACT HEADER ── */}
              <div className="shrink-0 flex items-center justify-between">
                <button
                  onClick={() => setIsComposerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/90 border border-[#F8D6DD]/50 shadow-2xs flex items-center justify-center text-[#252525] active:scale-90 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="text-center">
                  <h1 className="text-[15px] font-extrabold text-[#252525] leading-tight">Share Your Story</h1>
                  <p className="text-[10px] text-[#707070] font-medium">Your moment. Your story.</p>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#F6A8B7]/30 bg-[#F6A8B7]/10 text-[#FF477E] text-[10px] font-bold">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span>Private</span>
                </div>
              </div>

              {/* ── PROGRESS STEPS ── */}
              <div className="shrink-0 flex items-center justify-center gap-2">
                {[
                  { step: 1, label: "Write", active: content.trim().length > 0 },
                  { step: 2, label: "Media", active: Boolean(imageFile) },
                  { step: 3, label: "Post", active: isPosting },
                ].map((item, i) => (
                  <div key={item.step} className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                          item.active ? "bg-[#FF477E] text-white" : "bg-black/8 text-[#9E9E9E]"
                        }`}
                      >
                        {item.step}
                      </div>
                      <span className={`text-[10px] font-bold ${item.active ? "text-[#FF477E]" : "text-[#9E9E9E]"}`}>
                        {item.label}
                      </span>
                    </div>
                    {i < 2 && <div className="w-5 h-[1.5px] bg-black/10 rounded-full" />}
                  </div>
                ))}
              </div>

              {/* ── MAIN CONTENT CARD ── */}
              <div className="shrink-0 bg-white/90 backdrop-blur-md border border-[#F8D6DD]/40 rounded-[20px] p-3 shadow-[0_8px_24px_rgba(246,168,183,0.08)] space-y-2.5">

                {/* Prompt Header */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#F6A8B7]/10 border border-[#F6A8B7]/20 flex items-center justify-center shrink-0">
                    <BookOpen className="w-3.5 h-3.5 text-[#F6A8B7]" />
                  </div>
                  <div>
                    <h2 className="text-[12px] font-extrabold text-[#252525] leading-tight">
                      {todayPrompt || "How did today make you feel?"}
                    </h2>
                    <p className="text-[10px] text-[#9E9E9E] font-medium">Try one of these starters:</p>
                  </div>
                </div>

                {/* Prompt Chips — 2-column grid, tighter */}
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: "family", label: "I spent time with family..." },
                    { id: "friend", label: "I helped a friend..." },
                    { id: "goals", label: "I worked on my goals..." },
                    { id: "myself", label: "I took care of myself..." },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setContent(s.label.replace("...", " "))}
                      className="px-2.5 py-1.5 rounded-full border border-black/5 text-[10px] text-[#707070] font-bold transition-all active:scale-95 text-left truncate bg-[#FAF4F6]/60 hover:bg-white hover:border-[#F6A8B7]/40 shadow-2xs"
                      title={s.label}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Textarea with inline toolbar */}
                <div className="relative border border-[#F6A8B7]/40 rounded-[16px] overflow-hidden bg-white shadow-2xs focus-within:border-[#FF477E]/60 focus-within:ring-2 focus-within:ring-[#FF477E]/15 transition-all">
                  {imagePreview && (
                    <div className="relative p-2 pb-0 group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-h-24 rounded-lg object-cover border border-black/5"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <textarea
                    placeholder="What's on your mind today? Share something meaningful..."
                    spellCheck={false}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="story-textarea w-full bg-transparent text-[13px] text-[#252525] placeholder:text-[#B0B0B0] leading-relaxed block"
                    style={{
                      outline: "none",
                      border: "none",
                      boxShadow: "none",
                      resize: "none",
                      borderRadius: "0",
                      minHeight: "110px",
                      maxHeight: "110px",
                      padding: "12px 14px",
                      WebkitAppearance: "none",
                    }}
                  />
                  {/* Inline toolbar */}
                  <div className="flex items-center justify-between px-3 py-2 border-t border-black/5 bg-[#FAFAFA]">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-[#707070] hover:text-[#FF477E] transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#F6A8B7]" />
                      <span>Add Photo</span>
                    </button>
                    <span className="text-[10px] font-extrabold text-[#B0B0B0] tracking-wider">
                      {content.length}/1000
                    </span>
                  </div>
                </div>

                {/* Compact Media Row */}
                <div className="flex items-center justify-between border border-dashed border-[#F6A8B7]/40 rounded-[14px] px-3 py-2 bg-[#FFF0F3]/20">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#F6A8B7]/15 flex items-center justify-center text-[#FF477E] shrink-0">
                      <ImageIcon className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold text-[#252525] leading-tight">Add Media</p>
                      <p className="text-[9px] text-[#9E9E9E] font-medium">Optional</p>
                    </div>
                  </div>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                  />

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-full bg-white border border-[#F8D6DD]/60 text-[10px] font-bold text-[#FF477E] flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                    >
                      <Camera className="w-2.5 h-2.5" /> Photo
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-full bg-white border border-[#F8D6DD]/60 text-[10px] font-bold text-[#FF477E] flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                    >
                      <VideoIcon className="w-2.5 h-2.5" /> Video
                    </button>
                  </div>
                </div>
              </div>

              {/* ── POST BUTTON ── */}
              <div className="shrink-0">
                <button
                  onClick={handlePost}
                  disabled={(!content.trim() && !imageFile) || isPosting}
                  className="w-full text-white rounded-full h-12 font-extrabold text-sm transition-transform active:scale-[0.98] border border-white/40 disabled:opacity-50 flex items-center justify-center gradient-coral-pill shadow-md shadow-[#FF477E]/20 gap-2"
                >
                  <span>{isPosting ? "Posting..." : "Post Story"}</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>,
          document.body
        )}

        {/* Instagram-Style Mobile-Framed Story Viewer Modal */}
        {selectedJournal && ReactDOM.createPortal(
          <div 
            onClick={() => setSelectedJournal(null)}
            className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-0 sm:p-4 overflow-hidden select-none animate-in fade-in duration-200"
          >
            {/* Centered Mobile Phone Frame Container (Max-width 420px on Desktop) */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[420px] h-full sm:h-[90vh] sm:max-h-[860px] sm:rounded-[36px] bg-slate-950 flex flex-col justify-between relative overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-white/10"
            >
              {/* Top Progress Bar & Header */}
              <div className="absolute top-0 left-0 right-0 p-4 z-20 bg-gradient-to-b from-black/85 via-black/40 to-transparent pt-3">
                {/* Progress Bar Line */}
                <div className="h-1 w-full bg-white/30 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-white rounded-full w-full animate-[progress_5s_linear]" />
                </div>
                
                {/* User Info Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/50 bg-slate-800 shrink-0 shadow-md">
                      <img 
                        src={selectedJournal.user?.photos?.[0]?.url || selectedJournal.imageUrl || user?.photos?.[0]?.url || "/blurred-avatar.png"} 
                        alt="User" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-extrabold text-sm drop-shadow-md leading-tight">
                        {selectedJournal.user?.firstName || (selectedJournal.userId === user?.id ? "You" : user?.firstName || "Your Story")}
                      </h4>
                      <p className="text-white/80 text-xs font-medium flex items-center gap-1 mt-0.5">
                        <span>{selectedJournal.createdAt ? format(new Date(selectedJournal.createdAt), "h:mm a") : "Just now"}</span>
                        <span>•</span>
                        <Lock className="w-3 h-3 text-white/80" />
                        <span>Private</span>
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedJournal(null)} 
                    className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all shadow-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Story Image / Text Content */}
              <div className="relative flex-1 w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
                {selectedJournal.imageUrl ? (
                  <img 
                    src={selectedJournal.imageUrl} 
                    alt="Story" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#FF7E95] via-[#FF477E] to-[#FF8FA3]">
                    <p className="text-white font-extrabold text-xl sm:text-2xl leading-relaxed drop-shadow-lg max-w-xs px-2">
                      "{selectedJournal.content}"
                    </p>
                  </div>
                )}

                {/* Caption Overlay for Image Stories */}
                {selectedJournal.imageUrl && selectedJournal.content && (
                  <div className="absolute bottom-20 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                    <p className="text-white font-semibold text-sm sm:text-base leading-snug drop-shadow-md">
                      {selectedJournal.content}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Story Controls (Message, Like, Send) */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex items-center gap-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent pb-5">
                <input 
                  type="text" 
                  placeholder="Send message..." 
                  className="flex-1 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder:text-white/70 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/50"
                />
                <button 
                  onClick={() => toast({ title: "Reaction sent", description: "Liked this story ❤️" })}
                  className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center active:scale-90 transition-transform shrink-0"
                >
                  <Heart className="w-5 h-5 text-white fill-white/20" />
                </button>
                <button 
                  onClick={() => toast({ title: "Shared", description: "Story shared to chat" })}
                  className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center active:scale-90 transition-transform shrink-0"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}







        {/* Footer */}
        <div className="rounded-[24px] p-6 flex items-center justify-between relative overflow-hidden mt-6 mb-8 border border-white/35" style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', boxShadow: '0 4px 20px rgba(246,168,183,0.12)' }}>
          <div className="flex items-center gap-4 z-10">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-[#F6A8B7]/30" style={{ background: 'rgba(246,168,183,0.15)' }}>
              <Heart className="w-6 h-6 text-[#F6A8B7] fill-[#F6A8B7]" />
            </div>
            <p className="text-[#707070] font-medium text-[clamp(11px,3.31vw,15px)] leading-relaxed max-w-[clamp(204px,61.07vw,276px)]">
              Every story you share is a step towards finding your perfect match.
            </p>
          </div>
        </div>
      </div>
      </div>
    </AppLayout>
  );
}
