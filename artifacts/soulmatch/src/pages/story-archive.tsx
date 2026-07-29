import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, subDays, subMonths, isAfter, isSameDay } from "date-fns";
import { Search, ArrowLeft, Flame, BookOpen, Heart, ShieldCheck, Target, TrendingUp, Filter } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccessToken } from "@/lib/auth-context";
import { API_URL } from "@/config/api";
import { StoryCard } from "@/components/StoryCard";
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

const FILTERS = ["All", "This Week", "This Month", "Photos", "Notes", "Happy", "Calm", "Excited"];

export default function StoryArchivePage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

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

  // Stats Calculations
  const completedCount = myJournals.length;
  
  const currentStreak = useMemo(() => {
    if (!myJournals.length) return 0;
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const d = subDays(now, i);
      const hasPost = myJournals.some((j: any) => isSameDay(new Date(j.createdAt), d));
      if (hasPost) streak++;
      else if (i > 0) break; 
    }
    return streak;
  }, [myJournals]);

  const longestStreak = Math.max(currentStreak, Math.min(completedCount, 12)); 

  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    myJournals.forEach((j: any) => {
      if (j.mood) {
        counts[j.mood] = (counts[j.mood] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [myJournals]);
  
  const topMood = moodCounts.length > 0 ? moodCounts[0][0] : "N/A";

  // Filter & Search Logic
  const filteredStories = useMemo(() => {
    let filtered = [...myJournals];

    if (searchQuery) {
      filtered = filtered.filter((j) =>
        j.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilter !== "All") {
      const now = new Date();
      if (activeFilter === "This Week") {
        const cutoff = subDays(now, 7);
        filtered = filtered.filter((j) => isAfter(new Date(j.createdAt), cutoff));
      } else if (activeFilter === "This Month") {
        const cutoff = subMonths(now, 1);
        filtered = filtered.filter((j) => isAfter(new Date(j.createdAt), cutoff));
      } else if (activeFilter === "Photos") {
        filtered = filtered.filter((j) => j.imageUrl);
      } else if (activeFilter === "Notes") {
        filtered = filtered.filter((j) => !j.imageUrl && j.content);
      } else {
        // Mood filter
        filtered = filtered.filter((j) => j.mood === activeFilter);
      }
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return filtered;
  }, [myJournals, searchQuery, activeFilter]);

  // Group by Month for Timeline
  const groupedTimeline = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredStories.forEach(story => {
      const monthKey = format(new Date(story.createdAt), "MMMM yyyy");
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(story);
    });
    return groups;
  }, [filteredStories]);

  return (
    <AppLayout>
      <div className="w-full relative bg-transparent font-sans min-h-screen pt-4 pb-28">
        <div className="max-w-md mx-auto w-full">
          
          {/* Header & Controls */}
          <div className="px-5 mb-5 mt-2 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
               <button onClick={() => window.history.back()} className="text-[#707070] p-1 -ml-1 hover:text-[#252525] transition-colors">
                 <ArrowLeft className="w-5 h-5" />
               </button>
               <div>
                  <h1 className="text-[clamp(22px,6.62vw,30px)] font-extrabold text-[#252525] tracking-tight leading-none">Story Archive</h1>
                  <p className="text-[clamp(11px,3.31vw,15px)] text-[#707070] font-medium mt-1">{completedCount} total stories</p>
               </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707070]" />
                <input
                  type="text"
                  placeholder="Search memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-foreground/5 border-none rounded-[20px] pl-10 pr-4 py-3 text-[clamp(12px,3.56vw,16px)] font-medium text-[#252525] placeholder:text-[#707070] focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Horizontal Filter Chips */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-[clamp(11px,3.31vw,15px)] font-bold transition-all active:scale-95 ${
                    activeFilter === filter
                      ? "bg-foreground text-background shadow-md"
                      : "bg-card border border-border text-[#252525] hover:bg-foreground/5"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="px-5 space-y-6">
          
          {/* Story Statistics row */}
          {!searchQuery && activeFilter === "All" && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-2.5 pb-2">
               <div className="bg-card border border-border rounded-[18px] p-3.5 shadow-sm">
                  <BookOpen className="w-4 h-4 text-blue-500 mb-2" />
                  <div className="text-[clamp(15px,4.58vw,21px)] font-extrabold text-[#252525] leading-none mb-0.5">{completedCount}</div>
                  <div className="text-[clamp(9px,2.54vw,12px)] font-bold text-[#707070] uppercase tracking-wider">Stories</div>
               </div>
               <div className="bg-card border border-border rounded-[18px] p-3.5 shadow-sm">
                  <Flame className="w-4 h-4 text-[#F6A8B7] mb-2" />
                  <div className="text-[clamp(15px,4.58vw,21px)] font-extrabold text-[#252525] leading-none mb-0.5">{longestStreak}</div>
                  <div className="text-[clamp(9px,2.54vw,12px)] font-bold text-[#707070] uppercase tracking-wider">Streak</div>
               </div>
               <div className="bg-card border border-border rounded-[18px] p-3.5 shadow-sm">
                  <Heart className="w-4 h-4 text-[#F6A8B7] mb-2" />
                  <div className="text-[clamp(15px,4.58vw,21px)] font-extrabold text-[#252525] leading-none mb-0.5 truncate">{topMood}</div>
                  <div className="text-[clamp(9px,2.54vw,12px)] font-bold text-[#707070] uppercase tracking-wider">Top Mood</div>
               </div>
            </motion.div>
          )}

          {/* AI Story Analysis Removed as requested */}

          {/* Story List & Timeline */}
          {isLoading ? (
            <div className="space-y-4 pt-4">
              <Skeleton className="h-[clamp(170px,50.89vw,230px)] rounded-[24px] bg-foreground/5" />
              <Skeleton className="h-[clamp(170px,50.89vw,230px)] rounded-[24px] bg-foreground/5" />
            </div>
          ) : filteredStories.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border shadow-xl rounded-[32px] p-10 text-center mt-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-primary opacity-80" />
              </div>
              <h2 className="text-[clamp(19px,5.60vw,25px)] font-extrabold mb-3 text-[#252525]">No Stories Found</h2>
              <p className="text-[clamp(13px,3.82vw,17px)] text-[#707070] mb-8 leading-relaxed">
                Try adjusting your search query or removing the filters to explore your archive.
              </p>
              {(searchQuery || activeFilter !== "All") && (
                <Button className="w-full h-14 bg-foreground/5 text-[#252525] font-bold text-[clamp(14px,4.07vw,18px)] rounded-2xl hover:bg-foreground/10" onClick={() => { setSearchQuery(""); setActiveFilter("All"); }}>
                  Clear Filters
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-8 pt-2 pb-8">
              {Object.entries(groupedTimeline).map(([month, stories]: [string, any], groupIndex) => (
                <div key={month} className="relative">
                   {/* Timeline Month Header */}
                   <div className="sticky top-[clamp(128px,38.17vw,173px)] z-40 bg-transparent/95 backdrop-blur-sm py-2 mb-4 -mx-5 px-5">
                      <h3 className="text-[clamp(13px,3.82vw,17px)] font-extrabold text-foreground/80 flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-primary/50" />
                         {month}
                      </h3>
                   </div>
                   
                   {/* Stories in this month */}
                   <div className="space-y-5 relative">
                     {/* Vertical Timeline Line */}
                     <div className="absolute left-1 top-2 bottom-2 w-[2px] bg-border/50 -z-10" />
                     
                     {stories.map((journal: any, i: number) => (
                       <motion.div key={journal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.5) }} className="relative pl-6">
                         <div className="absolute left-[3px] top-6 w-[clamp(5px,1.53vw,7px)] h-[clamp(5px,1.53vw,7px)] rounded-full bg-primary -translate-x-[50%]" />
                         <div className="bg-card border border-border rounded-[24px] p-1 shadow-sm transition-shadow hover:shadow-md">
                           <StoryCard journal={journal} onDelete={handleDelete} />
                         </div>
                       </motion.div>
                     ))}
                   </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
