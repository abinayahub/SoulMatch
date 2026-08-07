import { useState, useMemo } from "react";
import ReactDOM from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, subDays, subMonths, isAfter } from "date-fns";
import {
  Search,
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  Heart,
  Lock,
  Trash2,
  Plus,
  MessageCircle,
  Share2,
  BookMarked,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccessToken } from "@/lib/auth-context";
import { API_URL } from "@/config/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { toast } from "@/hooks/use-toast";

const fetchMyJournals = async () => {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/api/journal/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch journals");
  return res.json();
};

const FILTERS = ["All Stories", "This Week", "This Month", "Photos", "Videos"];

export default function StoryArchivePage() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Stories");
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  const { data: user } = useQuery<any>({
    queryKey: ["/api/users/me"],
    queryFn: async () => {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: myJournals = [], isLoading } = useQuery({
    queryKey: ["myJournals"],
    queryFn: fetchMyJournals,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/journal/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete story");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myJournals"] });
      toast({ title: "Story deleted", description: "Your story has been permanently removed." });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this story? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleMonthCollapse = (monthKey: string) => {
    setCollapsedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  };

  // Filter & Search Logic
  const filteredStories = useMemo(() => {
    let filtered = [...myJournals];

    if (searchQuery) {
      filtered = filtered.filter((j) =>
        j.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilter !== "All Stories") {
      const now = new Date();
      if (activeFilter === "This Week") {
        const cutoff = subDays(now, 7);
        filtered = filtered.filter((j) => isAfter(new Date(j.createdAt), cutoff));
      } else if (activeFilter === "This Month") {
        const cutoff = subMonths(now, 1);
        filtered = filtered.filter((j) => isAfter(new Date(j.createdAt), cutoff));
      } else if (activeFilter === "Photos") {
        filtered = filtered.filter((j) => j.imageUrl);
      } else if (activeFilter === "Videos") {
        filtered = filtered.filter((j) => j.videoUrl || (j.imageUrl && j.imageUrl.includes(".mp4")));
      }
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return filtered;
  }, [myJournals, searchQuery, activeFilter]);

  // Group by Month for Collapsible Timeline
  const groupedTimeline = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredStories.forEach((story) => {
      const monthKey = format(new Date(story.createdAt), "MMMM yyyy");
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(story);
    });
    return groups;
  }, [filteredStories]);

  return (
    <AppLayout>
      <div 
        className="w-full relative min-h-screen font-sans pt-4 pb-28"
        style={{ background: 'linear-gradient(135deg, #FAF2EF 0%, #F5F0FB 50%, #FFFDFB 75%, #F7F7FA 100%)' }}
      >
        <div className="max-w-md mx-auto w-full px-5">
          
          {/* Compact Mobile Header */}
          <div className="flex items-center justify-between mb-4 mt-1">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.history.back()} 
                className="w-9 h-9 rounded-full bg-white/90 border border-[#F8D6DD]/50 shadow-xs flex items-center justify-center text-[#252525] hover:bg-white active:scale-95 transition-all"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-[#252525] tracking-tight leading-tight">
                  Story Archive
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                className="w-8 h-8 rounded-full bg-white/90 border border-[#F8D6DD]/50 flex items-center justify-center text-[#F6A8B7] hover:bg-[#FFF0F3] active:scale-95 transition-all shadow-2xs"
                title="Calendar view"
              >
                <Calendar className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707070]" />
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-black/5 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-[#252525] placeholder:text-[#9E9E9E] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#FF477E]/30 transition-all"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 shadow-2xs ${
                  activeFilter === filter
                    ? "bg-[#FF477E] text-white shadow-md shadow-[#FF477E]/25"
                    : "bg-white/80 border border-black/5 text-[#707070] hover:bg-white hover:text-[#252525]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Timeline & Story Content */}
          {isLoading ? (
            <div className="space-y-4 pt-2">
              <Skeleton className="h-[110px] rounded-[20px] bg-black/5" />
              <Skeleton className="h-[110px] rounded-[20px] bg-black/5" />
              <Skeleton className="h-[110px] rounded-[20px] bg-black/5" />
            </div>
          ) : filteredStories.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="bg-white/80 border border-black/5 shadow-xl rounded-[28px] p-8 text-center my-6"
            >
              <div className="w-16 h-16 bg-[#FF477E]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#FF477E]">
                <BookOpen className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-extrabold text-[#252525] mb-1">No Memories Found</h2>
              <p className="text-xs text-[#707070] leading-relaxed mb-6 font-medium max-w-[260px] mx-auto">
                No stories match your current search or filters. Try adjusting them to explore your memories.
              </p>
              {(searchQuery || activeFilter !== "All Stories") && (
                <Button 
                  onClick={() => { setSearchQuery(""); setActiveFilter("All Stories"); }}
                  className="rounded-full bg-[#FF477E] text-white text-xs font-bold px-6 py-2.5 hover:bg-[#FF3366] transition-all"
                >
                  Clear Filters
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-6 pt-2 pb-6">
              {Object.entries(groupedTimeline).map(([month, stories]: [string, any]) => {
                const isCollapsed = collapsedMonths[month];

                return (
                  <div key={month} className="relative">
                    {/* Collapsible Month Header */}
                    <div 
                      onClick={() => toggleMonthCollapse(month)}
                      className="sticky top-0 z-30 bg-[#FAF4F6]/90 backdrop-blur-md py-2.5 mb-3 px-3 rounded-2xl flex items-center justify-between border border-black/5 cursor-pointer hover:bg-white/90 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF477E]" />
                        <h3 className="text-sm font-extrabold text-[#252525]">
                          {month}
                        </h3>
                        <span className="text-xs font-bold text-[#707070] bg-black/5 px-2 py-0.5 rounded-full">
                          {stories.length} {stories.length === 1 ? "story" : "stories"}
                        </span>
                      </div>

                      <div className="text-[#FF477E] flex items-center gap-1 text-xs font-bold bg-[#FF7E95]/10 px-2.5 py-1 rounded-full border border-[#FF477E]/20">
                        <span>{isCollapsed ? "Expand" : "Collapse"}</span>
                        {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    {/* Story Cards List */}
                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="space-y-4"
                        >
                          {stories.map((story: any, i: number) => {
                            const storyDate = new Date(story.createdAt);
                            const formattedDate = format(storyDate, "d MMM yyyy");
                            const formattedTime = format(storyDate, "hh:mm a");

                            return (
                              <motion.div
                                key={story.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.05, 0.4) }}
                              >
                                {/* Story Card — Horizontal Layout */}
                                <div
                                  onClick={() => {
                                    const idx = filteredStories.findIndex((s) => s.id === story.id);
                                    setSelectedStoryIndex(idx >= 0 ? idx : 0);
                                  }}
                                  className="w-full bg-white/90 backdrop-blur-md rounded-[20px] border border-[#F8D6DD]/40 p-3 shadow-[0_4px_20px_rgba(246,168,183,0.08)] hover:shadow-md transition-all cursor-pointer active:scale-[0.99] flex items-stretch gap-3"
                                >
                                  {/* LEFT — Thumbnail */}
                                  <div className="shrink-0 w-[100px] h-[100px] rounded-[16px] overflow-hidden border border-[#F8D6DD]/30">
                                    {story.imageUrl ? (
                                      <img
                                        src={story.imageUrl}
                                        alt="Story moment"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      /* Gradient placeholder when no image */
                                      <div
                                        className="w-full h-full flex flex-col items-center justify-center gap-1"
                                        style={{
                                          background:
                                            "linear-gradient(135deg, #FFD6E0 0%, #F6A8B7 50%, #FFBCD1 100%)",
                                        }}
                                      >
                                        <BookOpen className="w-7 h-7 text-white/90 drop-shadow" />
                                        <span className="text-[9px] font-bold text-white/80 tracking-wide uppercase">
                                          Journal
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* RIGHT — Story Details */}
                                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                    {/* Row 1: Title + Delete */}
                                    <div className="flex items-start justify-between gap-2">
                                      <h4 className="text-[13px] font-extrabold text-[#252525] leading-snug line-clamp-2 flex-1 min-w-0">
                                        {story.content || "Memory"}
                                      </h4>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(story.id);
                                        }}
                                        className="text-[#B0B0B0] hover:text-red-400 p-0.5 shrink-0 transition-colors mt-0.5"
                                        title="Delete story"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {/* Row 2: Date • Time */}
                                    <p className="text-[11px] text-[#9E9E9E] font-medium mt-1">
                                      {formattedDate} • {formattedTime}
                                    </p>

                                    {/* Row 3: Privacy Badge */}
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                      <span className="inline-flex items-center gap-1 bg-[#FAF4F6] border border-black/5 px-2 py-0.5 rounded-full text-[#707070] text-[10px] font-semibold">
                                        <Lock className="w-2.5 h-2.5" />
                                        <span>Private</span>
                                      </span>

                                      {/* Mood / Category Chip */}
                                      {story.mood && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F6A8B7]/10 text-[#FF477E] text-[10px] font-bold border border-[#F6A8B7]/25">
                                          <span>✨</span>
                                          <span className="truncate max-w-[80px]">{story.mood}</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Safe Space Banner Card */}
          <div 
            className="rounded-[28px] p-6 text-center shadow-[0_10px_30px_rgba(246,168,183,0.08)] border border-[#F8D6DD]/50 space-y-4 my-6 flex flex-col items-center justify-center backdrop-blur-xl"
            style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 240, 245, 0.4))' }}
          >
            <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-[#F8D6DD]/40 flex items-center justify-center mx-auto text-[#FF477E]">
              <Heart className="w-6 h-6 fill-[#FF477E]/20 text-[#FF477E]" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-[#252525]">Your story archive is your safe space.</h4>
            </div>

            <Button
              onClick={() => { window.location.href = "/story?create=true"; }}
              className="gradient-coral-pill text-white font-bold text-xs sm:text-sm rounded-full px-6 py-3 shadow-md shadow-[#FF477E]/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center mx-auto"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Write New Story
            </Button>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           PREMIUM STORY VIEWER MODAL
      ═══════════════════════════════════════════════════════════ */}
      {selectedStoryIndex !== null && filteredStories[selectedStoryIndex] &&
        ReactDOM.createPortal(
          (() => {
            const activeStory = filteredStories[selectedStoryIndex];
            const activeStoryDate = new Date(activeStory.createdAt);
            const formattedDate = format(activeStoryDate, "d MMM yyyy");
            const formattedTime = format(activeStoryDate, "hh:mm a");
            const hasImage = Boolean(activeStory.imageUrl);
            const hasMood = Boolean(activeStory.mood);

            const handlePrev = (e?: React.MouseEvent) => {
              if (e) e.stopPropagation();
              if (selectedStoryIndex > 0) setSelectedStoryIndex(selectedStoryIndex - 1);
            };

            const handleNext = (e?: React.MouseEvent) => {
              if (e) e.stopPropagation();
              if (selectedStoryIndex < filteredStories.length - 1) {
                setSelectedStoryIndex(selectedStoryIndex + 1);
              } else {
                setSelectedStoryIndex(null);
              }
            };

            return (
              <div
                onClick={() => setSelectedStoryIndex(null)}
                className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center overflow-hidden select-none animate-in fade-in duration-200"
                style={{ background: "rgba(0,0,0,0.92)" }}
              >
                {/* ── Phone Frame ── */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full sm:max-w-[400px] h-full sm:h-[88vh] sm:max-h-[820px] flex flex-col sm:rounded-[32px] overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
                  style={{
                    background: hasImage
                      ? "#0a0a0a"
                      : "linear-gradient(160deg, #1a0a0f 0%, #2d0e1a 40%, #1a0a14 100%)",
                    boxShadow: "0 30px 80px rgba(0,0,0,0.9)",
                  }}
                >

                    {/* ══ PROGRESS BAR TRACK ══ */}
                    <div className="absolute top-0 left-0 right-0 z-40 pt-[env(safe-area-inset-top,12px)] px-3 pt-3">
                      <div className="flex items-center gap-[3px] w-full mb-0">
                        {filteredStories.map((_, idx) => (
                          <div
                            key={idx}
                            className="h-[2.5px] flex-1 rounded-full overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.25)" }}
                          >
                            <div
                              className={`h-full rounded-full ${
                                idx < selectedStoryIndex
                                  ? "w-full"
                                  : idx === selectedStoryIndex
                                  ? "w-full"
                                  : "w-0"
                              }`}
                              style={{
                                background:
                                  idx <= selectedStoryIndex
                                    ? "rgba(255,255,255,0.95)"
                                    : "transparent",
                                transition: idx === selectedStoryIndex ? "width 6s linear" : "none",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ══ HEADER OVERLAY ══ */}
                    <div
                      className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-8 pb-6"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.30) 70%, transparent 100%)",
                        paddingTop: "calc(env(safe-area-inset-top, 0px) + 28px)",
                      }}
                    >
                      {/* Left — Avatar + Name + Date */}
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-full overflow-hidden border-2 shrink-0"
                          style={{
                            borderColor: "rgba(246,168,183,0.7)",
                            boxShadow: "0 2px 12px rgba(246,168,183,0.35)",
                          }}
                        >
                          <img
                            src={user?.photos?.[0]?.url || "/blurred-avatar.png"}
                            alt="You"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-white font-extrabold text-[13px] leading-tight drop-shadow">
                            {user?.firstName || "You"}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-white/70 text-[10px] font-medium">
                              {formattedDate} · {formattedTime}
                            </span>
                            <span
                              className="inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded-full text-[9px] font-bold"
                              style={{
                                background: "rgba(255,255,255,0.15)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                color: "rgba(255,255,255,0.9)",
                                backdropFilter: "blur(6px)",
                              }}
                            >
                              <Lock className="w-2 h-2" />
                              Private
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right — Close */}
                      <button
                        onClick={() => setSelectedStoryIndex(null)}
                        className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all"
                        style={{
                          background: "rgba(0,0,0,0.45)",
                          border: "1px solid rgba(255,255,255,0.18)",
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        <X className="w-4.5 h-4.5 text-white" />
                      </button>
                    </div>

                    {/* ══ MAIN CONTENT AREA ══ */}
                    <div className="flex-1 relative flex items-center justify-center overflow-hidden">

                      {/* Tap Zones — Left (prev) / Right (next) */}
                      <div className="absolute inset-0 z-20 flex pointer-events-none">
                        <div
                          className="w-[38%] h-full pointer-events-auto cursor-pointer"
                          onClick={handlePrev}
                        />
                        <div
                          className="flex-1 h-full pointer-events-auto cursor-pointer"
                          onClick={handleNext}
                        />
                      </div>

                      {/* ── IMAGE STORY ── */}
                      {hasImage && (
                        <img
                          src={activeStory.imageUrl}
                          alt="Story"
                          className="w-full h-full"
                          style={{ objectFit: "contain" }}
                        />
                      )}

                      {/* ── TEXT-ONLY STORY ── */}
                      {!hasImage && (
                        <div
                          className="w-full h-full flex flex-col items-center justify-center px-8 py-20 text-center"
                          style={{
                            background:
                              "linear-gradient(160deg, #2d1020 0%, #3d1428 40%, #1f0c1a 100%)",
                          }}
                        >
                          {/* Decorative soft glow blob */}
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background:
                                "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(246,168,183,0.18) 0%, transparent 70%)",
                            }}
                          />

                          {/* BookOpen icon */}
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 relative z-10"
                            style={{
                              background: "rgba(246,168,183,0.15)",
                              border: "1px solid rgba(246,168,183,0.3)",
                              backdropFilter: "blur(8px)",
                            }}
                          >
                            <BookMarked className="w-7 h-7" style={{ color: "#F6A8B7" }} />
                          </div>

                          {/* Mood chip */}
                          {hasMood && (
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold mb-5 relative z-10"
                              style={{
                                background: "rgba(246,168,183,0.18)",
                                border: "1px solid rgba(246,168,183,0.35)",
                                color: "#F6A8B7",
                                backdropFilter: "blur(6px)",
                              }}
                            >
                              <span>✨</span>
                              <span>{activeStory.mood}</span>
                            </span>
                          )}

                          {/* Story text */}
                          <p
                            className="font-extrabold leading-relaxed relative z-10"
                            style={{
                              color: "rgba(255,255,255,0.95)",
                              fontSize: activeStory.content?.length > 120 ? "16px" : "20px",
                              textShadow: "0 2px 16px rgba(0,0,0,0.5)",
                            }}
                          >
                            ❝ {activeStory.content} ❞
                          </p>
                        </div>
                      )}

                      {/* ── CAPTION OVERLAY (Image + Text) ── */}
                      {hasImage && activeStory.content && (
                        <div
                          className="absolute bottom-0 left-0 right-0 z-10 px-5 pt-16 pb-5"
                          style={{
                            background:
                              "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 50%, transparent 100%)",
                          }}
                        >
                          {hasMood && (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-2"
                              style={{
                                background: "rgba(246,168,183,0.2)",
                                border: "1px solid rgba(246,168,183,0.3)",
                                color: "#F6A8B7",
                                backdropFilter: "blur(4px)",
                              }}
                            >
                              <span>✨</span>
                              <span>{activeStory.mood}</span>
                            </span>
                          )}
                          <p
                            className="text-white font-semibold text-sm leading-snug"
                            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
                          >
                            {activeStory.content}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ══ BOTTOM ACTION BAR ══ */}
                    <div
                      className="relative z-30 flex items-center justify-between px-5 py-3"
                      style={{
                        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.30) 80%, transparent 100%)",
                        borderTop: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      {/* Left actions: Like, Comment, Share */}
                      <div className="flex items-center gap-2">
                        {/* Like */}
                        <button
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full active:scale-90 transition-all"
                          style={{
                            background: "rgba(246,168,183,0.15)",
                            border: "1px solid rgba(246,168,183,0.25)",
                            backdropFilter: "blur(8px)",
                          }}
                        >
                          <Heart className="w-4 h-4" style={{ color: "#F6A8B7" }} />
                          <span className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>Like</span>
                        </button>

                        {/* Comment */}
                        <button
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full active:scale-90 transition-all"
                          style={{
                            background: "rgba(255,255,255,0.09)",
                            border: "1px solid rgba(255,255,255,0.14)",
                            backdropFilter: "blur(8px)",
                          }}
                        >
                          <MessageCircle className="w-4 h-4 text-white/70" />
                          <span className="text-[11px] font-bold text-white/70">Note</span>
                        </button>

                        {/* Share */}
                        <button
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full active:scale-90 transition-all"
                          style={{
                            background: "rgba(255,255,255,0.09)",
                            border: "1px solid rgba(255,255,255,0.14)",
                            backdropFilter: "blur(8px)",
                          }}
                        >
                          <Share2 className="w-4 h-4 text-white/70" />
                          <span className="text-[11px] font-bold text-white/70">Share</span>
                        </button>
                      </div>

                      {/* Right — Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(activeStory.id);
                          setSelectedStoryIndex(null);
                        }}
                        className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all"
                        style={{
                          background: "rgba(239,68,68,0.15)",
                          border: "1px solid rgba(239,68,68,0.25)",
                          backdropFilter: "blur(8px)",
                        }}
                        title="Delete story"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: "rgba(239,68,68,0.85)" }} />
                      </button>
                    </div>

                </div>
              </div>
            );
          })()
          ,
          document.body
        )
      }
    </AppLayout>
  );
}
