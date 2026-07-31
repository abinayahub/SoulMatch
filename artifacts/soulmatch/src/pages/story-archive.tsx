import { useState, useMemo } from "react";
import ReactDOM from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, subDays, subMonths, isAfter } from "date-fns";
import { 
  Search, 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  X,
  Heart, 
  Lock, 
  Trash2, 
  Image as ImageIcon, 
  Plus
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
              <Skeleton className="h-44 rounded-[24px] bg-black/5" />
              <Skeleton className="h-44 rounded-[24px] bg-black/5" />
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
                            const formattedTime = format(storyDate, "hh:mm a");
                            const formattedFullDate = `${format(storyDate, "d MMM yyyy")} • ${formattedTime}`;

                            return (
                              <motion.div
                                key={story.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.05, 0.4) }}
                              >
                                {/* Story Card */}
                                <div 
                                  onClick={() => {
                                    const idx = filteredStories.findIndex((s) => s.id === story.id);
                                    setSelectedStoryIndex(idx >= 0 ? idx : 0);
                                  }}
                                  className="w-full bg-white/90 backdrop-blur-md rounded-[20px] border border-[#F8D6DD]/40 p-4 shadow-[0_4px_20px_rgba(246,168,183,0.08)] hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
                                >
                                  {/* Top Image Preview if available */}
                                  {story.imageUrl && (
                                    <div className="w-full h-40 sm:h-48 rounded-[16px] overflow-hidden mb-3 border border-[#F8D6DD]/30 bg-[#FFF0F3]">
                                      <img 
                                        src={story.imageUrl} 
                                        alt="Story moment" 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}

                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <h4 className="text-xs sm:text-sm font-extrabold text-[#252525] leading-snug line-clamp-2">
                                        {story.content || "Memory"}
                                      </h4>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(story.id);
                                        }}
                                        className="text-[#707070] hover:text-red-500 p-1 shrink-0 transition-colors"
                                        title="Delete story"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {/* Category / Mood Badge */}
                                    {story.mood && (
                                      <div>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F6A8B7]/10 text-[#FF477E] text-[10px] font-bold border border-[#F6A8B7]/25">
                                          <span>✨</span>
                                          <span>{story.mood}</span>
                                        </span>
                                      </div>
                                    )}

                                    {/* Date & Privacy Row */}
                                    <div className="pt-1 border-t border-black/5 flex items-center justify-between text-[10px] sm:text-xs text-[#707070] font-medium">
                                      <span className="truncate">{formattedFullDate}</span>
                                      <span className="inline-flex items-center gap-1 shrink-0 bg-[#FAF4F6] px-2 py-0.5 rounded-full text-[#707070] font-semibold border border-black/5">
                                        <Lock className="w-3 h-3 text-[#707070]" />
                                        <span>Private</span>
                                      </span>
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

      {/* Full-Screen Story Viewer Modal */}
      {selectedStoryIndex !== null && filteredStories[selectedStoryIndex] && ReactDOM.createPortal(
        (() => {
          const activeStory = filteredStories[selectedStoryIndex];
          const activeStoryDate = new Date(activeStory.createdAt);
          const formattedDate = format(activeStoryDate, "d MMM yyyy");
          const formattedTime = format(activeStoryDate, "hh:mm a");

          const handlePrev = (e?: React.MouseEvent) => {
            if (e) e.stopPropagation();
            if (selectedStoryIndex > 0) {
              setSelectedStoryIndex(selectedStoryIndex - 1);
            }
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
              className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-0 sm:p-4 overflow-hidden select-none animate-in fade-in duration-200"
            >
              {/* Centered Mobile Phone Frame Container (Max 420px on Desktop) */}
              <div 
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[420px] h-full sm:h-[90vh] sm:max-h-[860px] sm:rounded-[36px] bg-slate-950 flex flex-col justify-between relative overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-white/10"
              >
                {/* Top Progress Bar & Header */}
                <div className="absolute top-0 left-0 right-0 p-4 z-30 bg-gradient-to-b from-black/90 via-black/50 to-transparent pt-3">
                  {/* Progress Bar Line */}
                  <div className="flex items-center gap-1.5 w-full mb-3">
                    {filteredStories.map((_, idx) => (
                      <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-white rounded-full transition-all duration-300 ${
                            idx < selectedStoryIndex ? "w-full" : idx === selectedStoryIndex ? "w-full animate-[progress_5s_linear]" : "w-0"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* User Info Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-white/50 bg-slate-800 shrink-0 shadow-md">
                        <img 
                          src={user?.photos?.[0]?.url || "/blurred-avatar.png"} 
                          alt="You" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-white font-extrabold text-xs sm:text-sm drop-shadow-md leading-tight">
                          You
                        </h4>
                        <p className="text-white/80 text-[11px] font-medium flex items-center gap-1 mt-0.5">
                          <span>{formattedDate}</span>
                          <span>•</span>
                          <span>{formattedTime}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold border border-white/20">
                        <Lock className="w-3 h-3 text-white" />
                        <span>Private</span>
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(activeStory.id);
                          setSelectedStoryIndex(null);
                        }}
                        className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/80 hover:text-red-400 flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all shadow-md"
                        title="Delete story"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setSelectedStoryIndex(null)} 
                        className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all shadow-md"
                        title="Close story"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main Story Image / Text Content */}
                <div className="relative flex-1 w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
                  {/* Left / Right Touch Tap Areas */}
                  <div className="absolute inset-0 z-10 flex">
                    <div 
                      onClick={handlePrev}
                      className="w-1/3 h-full cursor-pointer group flex items-center justify-start pl-3"
                    >
                      {selectedStoryIndex > 0 && (
                        <div className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronLeft className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div 
                      onClick={handleNext}
                      className="w-2/3 h-full cursor-pointer group flex items-center justify-end pr-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Media or Text Display */}
                  {activeStory.imageUrl ? (
                    <img 
                      src={activeStory.imageUrl} 
                      alt="Archived story" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#FF7E95] via-[#FF477E] to-[#FF8FA3]">
                      {activeStory.mood && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-4 border border-white/30">
                          <span>✨</span>
                          <span>{activeStory.mood}</span>
                        </span>
                      )}
                      <p className="text-white font-extrabold text-xl sm:text-2xl leading-relaxed drop-shadow-lg max-w-xs px-2">
                        "{activeStory.content}"
                      </p>
                    </div>
                  )}

                  {/* Caption Overlay for Image Stories */}
                  {activeStory.imageUrl && activeStory.content && (
                    <div className="absolute bottom-6 left-0 right-0 p-5 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white">
                      {activeStory.mood && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold mb-2 border border-white/20">
                          <span>✨</span>
                          <span>{activeStory.mood}</span>
                        </span>
                      )}
                      <p className="text-white font-semibold text-sm sm:text-base leading-snug drop-shadow-md">
                        {activeStory.content}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })(),
        document.body
      )}
    </AppLayout>
  );
}
