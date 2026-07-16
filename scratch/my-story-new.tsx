import { API_URL } from '../config/api';
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Book, Image as ImageIcon, Send, Lock, Globe, LockKeyhole, Trash2, ChevronRight, ChevronLeft, Heart, Briefcase, TrendingUp, Users, Plane, Apple, Lightbulb, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth, getAccessToken } from "@/lib/auth-context";
import { toast } from "@/hooks/use-toast";

// Fetch personal journals
const fetchMyJournals = async () => {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/api/journal/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch journals");
  return res.json();
};

const fetchMetrics = async () => {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/api/metrics/today`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch metrics");
  return res.json();
};

// Fetch feed
const fetchFeed = async () => {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/api/journal/feed`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch feed");
  return res.json();
};

// Submit journal
const postJournal = async (data: { content: string, imageUrl?: string }) => {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/api/journal`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to post journal");
  return res.json();
};

// Delete journal
const deleteJournal = async (id: number) => {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/api/journal/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to delete journal");
  return res.json();
};

export default function MyStory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<"me" | "feed">("me");
  const [isPosting, setIsPosting] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<any>(null);

  const CATEGORY_STYLES: Record<string, { icon: any, color: string, bg: string, text: string }> = {
    "Family Values": { icon: Heart, color: "#f43f5e", bg: "bg-rose-500/10", text: "text-rose-500" },
    "Career Focus": { icon: Briefcase, color: "#3b82f6", bg: "bg-blue-500/10", text: "text-blue-500" },
    "Personal Growth": { icon: TrendingUp, color: "#22c55e", bg: "bg-green-500/10", text: "text-green-500" },
    "Social Engagement": { icon: Users, color: "#a855f7", bg: "bg-purple-500/10", text: "text-purple-500" },
    "Adventure & Travel": { icon: Plane, color: "#f97316", bg: "bg-orange-500/10", text: "text-orange-500" },
    "Health & Lifestyle": { icon: Apple, color: "#84cc16", bg: "bg-lime-500/10", text: "text-lime-500" },
    "Emotional Wellbeing": { icon: Lightbulb, color: "#06b6d4", bg: "bg-cyan-500/10", text: "text-cyan-500" },
    "Communication Style": { icon: MessageCircle, color: "#eab308", bg: "bg-yellow-500/10", text: "text-yellow-500" },
    "Kindness & Empathy": { icon: Heart, color: "#ec4899", bg: "bg-pink-500/10", text: "text-pink-500" },
    "Relationship Commitment": { icon: Heart, color: "#f43f5e", bg: "bg-rose-500/10", text: "text-rose-500" },
  };

  const { data: myJournals = [], isLoading: loadingMe } = useQuery({
    queryKey: ["myJournals"],
    queryFn: fetchMyJournals,
    refetchInterval: (query: any) => {
      const data = query.state.data;
      if (data && data.length > 0 && !data[0].aiAnalysis) return 5000;
      return false;
    }
  });

  const { data: feedData, isLoading: loadingFeed } = useQuery({
    queryKey: ["journalFeed"],
    queryFn: fetchFeed
  });

  const { data: metricsData } = useQuery({
    queryKey: ["systemMetrics"],
    queryFn: fetchMetrics,
    refetchInterval: 5000 // Refetch every 5 seconds to show updates quickly
  });

  const handlePost = async () => {
    if (!content.trim()) return;
    setIsPosting(true);
    try {
      // Very simple mock of an image upload logic.
      // In a real app, we'd upload the file to S3 and get the URL back.
      // For this prototype, if the user types "photo", we'll mock one.
      const imageUrl = content.toLowerCase().includes("photo") 
        ? "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80" 
        : undefined;

      await postJournal({ content, imageUrl });
      setContent("");
      toast({ title: "Journal posted!", description: "Your behavior profile has been updated." });
      queryClient.invalidateQueries({ queryKey: ["myJournals"] });
    } catch (e) {
      toast({ title: "Error", description: "Could not post journal", variant: "destructive" });
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this story?")) return;
    try {
      await deleteJournal(id);
      toast({ title: "Deleted", description: "Your story was removed." });
      queryClient.invalidateQueries({ queryKey: ["myJournals"] });
    } catch (e) {
      toast({ title: "Error", description: "Could not delete story", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 relative">
      <Button variant="ghost" onClick={() => window.history.back()} className="mb-6 -ml-4 text-muted-foreground hover:bg-white/5">
        <ChevronLeft className="w-4 h-4 mr-1" />Back
      </Button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Book className="w-8 h-8 text-primary" />
            My Story
          </h1>
          <p className="text-muted-foreground mt-2">
            Share your daily life. SoulMatch uses this to understand the *real* you.
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <Button 
          variant={activeTab === "me" ? "default" : "outline"} 
          onClick={() => setActiveTab("me")}
          className={activeTab === "me" ? "bg-primary text-primary-foreground shadow-md border-0" : ""}
        >
          My Journal
        </Button>
        <Button 
          variant={activeTab === "feed" ? "default" : "outline"} 
          onClick={() => setActiveTab("feed")}
          className={activeTab === "feed" ? "bg-primary text-primary-foreground shadow-md border-0" : ""}
        >
          <Globe className="w-4 h-4 mr-2" />
          Matches Feed
        </Button>
      </div>

      {/* Insights Section */}
      {(() => {
        if (loadingMe) return null;
        
        if (myJournals.length < 3) {
          return (
            <div className="bg-card border border-primary/20 shadow-[0_0_15px_rgba(236,72,153,0.1)] rounded-2xl p-6 mb-8 text-center">
              
              <p className="text-white/80 font-medium">Keep sharing stories. SoulMatch is still learning about you.</p>
              <p className="text-xs text-white/50 mt-1">Unlock profile insights after sharing 3 stories.</p>
            </div>
          );
        }

        const cumulativeProfile = myJournals[0]?.aiAnalysis?.cumulativeProfile;
        if (!cumulativeProfile) return (
          <div className="bg-card border border-primary/20 shadow-[0_0_15px_rgba(236,72,153,0.1)] rounded-2xl p-6 mb-8 text-center">
            <p className="text-white/80 font-medium">SoulMatch is still analyzing your stories.</p>
            <p className="text-xs text-white/50 mt-1">Try to be more descriptive about your feelings, values, and goals to build your deep profile!</p>
          </div>
        );

        const traitsMapping = [
          { key: "familyOrientation", label: "Family Oriented" },
          { key: "relationshipCommitment", label: "Relationship Oriented" },
          { key: "emotionalMaturity", label: "Emotional Awareness" },
          { key: "empathyCompassion", label: "Kindness & Supportiveness" },
          { key: "socialEngagement", label: "Social Engagement" },
          { key: "adventureSeeking", label: "Adventure & Exploration" },
          { key: "careerFocus", label: "Career & Goal Focus" },
          { key: "personalGrowthMindset", label: "Personal Growth" }
        ];

        const validTraits = traitsMapping.map(t => {
          const traitData = cumulativeProfile[t.key];
          return {
            label: t.label,
            value: traitData?.value,
            evidence: traitData?.evidence,
            confidence: traitData?.confidence || 0
          };
        }).filter(t => t.confidence > 50 && t.value !== "Unknown")
          .sort((a, b) => b.confidence - a.confidence);

        if (validTraits.length === 0) return (
          <div className="bg-card border border-primary/20 shadow-[0_0_15px_rgba(236,72,153,0.1)] rounded-2xl p-6 mb-8 text-center">
            <p className="text-white/80 font-medium">SoulMatch is still analyzing your stories.</p>
            <p className="text-xs text-white/50 mt-1">We need a bit more descriptive detail to identify your core personality traits!</p>
          </div>
        );

        return (
          <div className="bg-card border border-primary/20 shadow-[0_0_15px_rgba(236,72,153,0.1)] rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 text-primary font-semibold text-lg mb-6 border-b border-white/5 pb-3">
               What We Learned About You
            </div>
            <div className="space-y-6">
              {validTraits.map((t, i) => (
                <div key={i} className="flex flex-col">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-white/90 font-medium">{t.label}</span>
                    <span className="text-primary font-semibold text-sm">{t.confidence}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                    <div className="bg-gradient-to-r from-primary/80 to-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${t.confidence}%` }}></div>
                  </div>
                  {t.evidence && (
                    <p className="text-xs text-white/60 italic leading-relaxed">
                      "{t.evidence}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {activeTab === "me" && (
        <div className="space-y-8">
          {/* Composer */}
          <div className="bg-card border border-border shadow-md rounded-2xl rounded-2xl p-6 relative overflow-hidden border border-primary/20 shadow-[0_0_20px_rgba(236,72,153,0.1)]">
            <div className="flex gap-4">
              <Avatar className="w-10 h-10 border-2 border-primary/20">
                <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea 
                  placeholder="What did you do today? (e.g. visited grandparents, helped a friend, read a book)"
                  className="min-h-[100px] bg-background/50 border-white/10 resize-none focus-visible:ring-primary/50 text-base"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-full" title="Upload Photo">
                      <ImageIcon className="w-5 h-5" />
                    </Button>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Private (Used for compatibility matching)
                    </span>
                  </div>
                  <Button onClick={handlePost} disabled={!content.trim() || isPosting} className="bg-primary text-primary-foreground shadow-md border-0 rounded-full px-6 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    {isPosting ? "Posting..." : "Share Update"}
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-6 pl-4 border-l-2 border-white/5 relative">
            {loadingMe ? (
              <p className="text-muted-foreground animate-pulse ml-4">Loading your story...</p>
            ) : myJournals.length === 0 ? (
              <div className="ml-4 p-8 border border-dashed border-white/10 rounded-2xl text-center">
                <p className="text-muted-foreground">You haven't shared any updates yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Start journaling to improve your match accuracy!</p>
              </div>
            ) : (
              <>
                {/* Cumulative Profile Card */}
                {myJournals[0]?.aiAnalysis?.cumulativeProfile && (
                  <div className="relative ml-8 bg-card border border-border shadow-md rounded-2xl p-6 border-primary/30 shadow-[0_0_15px_rgba(236,72,153,0.15)] mb-8">
                    <div className="absolute -left-[39px] top-8 w-4 h-4 rounded-full bg-background border-2 border-primary/50 shadow-[0_0_10px_rgba(236,72,153,0.5)] z-10" />
                    
                    <div className="flex flex-col mb-4">
                       <span className="text-primary font-semibold text-lg flex items-center gap-2">
                         Personality Profile
                       </span>
                       <span className="text-sm text-white/60 mt-1 flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-primary/50"></span>
                         Profile Confidence: <strong className="text-white/90">{myJournals.length < 6 ? "Building Profile" : myJournals.length < 10 ? "Moderate Confidence" : "High Confidence"}</strong> ({myJournals.length} stories)
                       </span>
                    </div>
                    
                    <div className="space-y-4">
                      {Array.isArray(myJournals[0].aiAnalysis.cumulativeProfile.percentages) && myJournals[0].aiAnalysis.cumulativeProfile.percentages.map((item: any, i: number) => {
                        const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES["Personal Growth"];
                        const Icon = style.icon;
                        return (
                          <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col gap-2 relative">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${style.bg}`}>
                                  <Icon className={`w-4 h-4 ${style.text}`} />
                                </div>
                                <span className="text-lg text-white font-semibold">{item.category}</span>
                              </div>
                              {myJournals.length > 5 && <span className={`text-lg font-bold ${style.text}`}>{item.percentage}%</span>}
                            </div>
                            {myJournals.length > 5 && (
                              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-2">
                                <div 
                                  className="h-full rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${item.percentage}%`, backgroundColor: style.color }}
                                />
                              </div>
                            )}
                            {item.evidence && (
                              <div className={`text-xs text-white/50 italic mt-3 border-l-2 pl-3`} style={{ borderColor: style.color }}>
                                Evidence: <br/> "{item.evidence}"
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {myJournals.map((journal: any) => {
                  const storyScores = journal.aiAnalysis?.storyAnalysis?.storyScores || {};
                  const categories = Object.keys(storyScores);
                  const dominantCategory = categories.length > 0 ? categories.reduce((a, b) => storyScores[a] > storyScores[b] ? a : b) : null;
                  const domStyle = dominantCategory ? (CATEGORY_STYLES[dominantCategory] || CATEGORY_STYLES["Personal Growth"]) : CATEGORY_STYLES["Personal Growth"];
                  const DomIcon = domStyle.icon;

                  return (
                    <div key={journal.id} className="relative ml-8 bg-card border shadow-md rounded-2xl p-6 border-white/10 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setSelectedJournal(journal)}>
                      {/* Timeline dot */}
                      <div className="absolute -left-[39px] top-8 w-4 h-4 rounded-full bg-background border-2 border-primary/50 shadow-[0_0_10px_rgba(236,72,153,0.5)] z-10" />
                      
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${domStyle.bg}`}>
                          <DomIcon className={`w-5 h-5 ${domStyle.text}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider block">
                                {format(new Date(journal.createdAt), "MMM d, yyyy")}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(journal.createdAt), "h:mm a")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDelete(journal.id); }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <ChevronRight className="w-5 h-5 text-white/30" />
                            </div>
                          </div>
                          <p className="text-white/90 whitespace-pre-wrap leading-relaxed text-lg mt-3">{journal.content}</p>
                          
                          {journal.imageUrl && (
                            <div className="mt-4 rounded-xl overflow-hidden border border-white/10 relative group">
                              <img src={journal.imageUrl} alt="Journal" className="w-full h-auto max-h-[300px] object-cover transition-transform duration-500 group-hover:scale-105" />
                            </div>
                          )}

                          {categories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {categories.map((cat: string) => {
                                const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES["Personal Growth"];
                                return (
                                  <span key={cat} className={`text-xs px-2.5 py-1 rounded-full font-medium ${style.bg} ${style.text}`}>
                                    {cat}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            {/* Story Analysis Dialog */}
            <Dialog open={!!selectedJournal} onOpenChange={(open) => !open && setSelectedJournal(null)}>
              <DialogContent className="sm:max-w-[425px] bg-card border-border rounded-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 border-b border-white/5">
                  <DialogTitle className="text-xl font-bold flex items-center justify-center">Story Analysis</DialogTitle>
                </DialogHeader>
                <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                  {selectedJournal && (() => {
                    const storyScores = selectedJournal.aiAnalysis?.storyAnalysis?.storyScores || {};
                    const matchedKeywords = selectedJournal.aiAnalysis?.storyAnalysis?.matchedKeywords || [];
                    const categories = Object.keys(storyScores);
                    const dominantCategory = categories.length > 0 ? categories.reduce((a, b) => storyScores[a] > storyScores[b] ? a : b) : null;
                    const domStyle = dominantCategory ? (CATEGORY_STYLES[dominantCategory] || CATEGORY_STYLES["Personal Growth"]) : CATEGORY_STYLES["Personal Growth"];
                    const DomIcon = domStyle.icon;

                    return (
                      <>
                        {/* Highlighted Story */}
                        <div className={`p-4 rounded-xl ${domStyle.bg} border border-white/5 flex gap-4 items-start`}>
                          <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-white/10`}>
                            <DomIcon className={`w-5 h-5 ${domStyle.text}`} />
                          </div>
                          <div>
                            <p className="text-white/90 text-lg font-medium leading-relaxed">{selectedJournal.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">{format(new Date(selectedJournal.createdAt), "MMM d, yyyy • h:mm a")}</p>
                          </div>
                        </div>

                        {/* What this shows */}
                        {dominantCategory && (
                          <div className="space-y-3">
                            <h3 className="text-white font-semibold flex items-center gap-2">What this shows</h3>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3 items-center">
                              <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${domStyle.bg}`}>
                                <DomIcon className={`w-4 h-4 ${domStyle.text}`} />
                              </div>
                              <div>
                                <p className={`font-semibold ${domStyle.text}`}>{dominantCategory}</p>
                                <p className="text-sm text-white/60">This story shows that {dominantCategory.toLowerCase()} is important to you.</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Score Update */}
                        {categories.length > 0 && (() => {
                          let currentPercentage = 10;
                          if (selectedJournal.aiAnalysis?.cumulativeProfile?.percentages) {
                             const catData = selectedJournal.aiAnalysis.cumulativeProfile.percentages.find((p: any) => p.category === dominantCategory);
                             if (catData) {
                                currentPercentage = catData.percentage;
                             }
                          }
                          return (
                            <div className="space-y-3">
                              <h3 className="text-white font-semibold flex items-center gap-2">Score Update</h3>
                              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-sm text-white/80 mb-3">Your {dominantCategory || "profile"} score increased.</p>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${currentPercentage}%`, backgroundColor: domStyle.color }} />
                                  </div>
                                  <span className={`text-sm font-bold ${domStyle.text}`}>+{storyScores[dominantCategory || categories[0]]} Points</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Why */}
                        {matchedKeywords.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-white font-semibold flex items-center gap-2 flex-col items-start">
                              <div className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-yellow-500" /> Why</div>
                            </h3>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                              <p className="text-sm text-white/80 mb-4">You mentioned these key themes in your story.</p>
                              <div className="flex flex-wrap gap-2">
                                {matchedKeywords.map((word: string, i: number) => (
                                  <span key={i} className="text-xs px-3 py-1 rounded-full font-medium border border-rose-500/30 text-rose-400 bg-rose-500/5">
                                    {word}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        <Button className={`w-full h-12 text-md font-bold rounded-xl text-white hover:opacity-80 transition-opacity`} style={{ backgroundColor: domStyle.color }} onClick={() => setSelectedJournal(null)}>
                          Continue Writing
                        </Button>
                      </>
                    );
                  })()}
                </div>
              </DialogContent>
            </Dialog>

          </div>
        </div>
      )}

      {activeTab === "feed" && (
        <div className="space-y-6">
          {loadingFeed ? (
            <p className="text-muted-foreground animate-pulse">Loading feed...</p>
          ) : !feedData?.unlocked ? (
            <div className="bg-card border border-border shadow-md rounded-2xl rounded-3xl p-12 text-center relative overflow-hidden border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-background/80 flex items-center justify-center mb-6 border border-white/10 shadow-xl backdrop-blur-md">
                  <LockKeyhole className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-white">Unlock The Real Stories</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  The Matches Feed unlocks after you complete your 30-day Journey. Discover the authentic daily lives of your most compatible matches.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mb-8 opacity-40 blur-sm pointer-events-none select-none grayscale transition-all duration-1000">
                  <div className="bg-card border border-border shadow-md rounded-2xl p-4 rounded-xl text-left border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-white/20" />
                      <div className="h-3 w-24 bg-white/20 rounded" />
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded mb-2" />
                    <div className="h-2 w-3/4 bg-white/10 rounded" />
                  </div>
                  <div className="bg-card border border-border shadow-md rounded-2xl p-4 rounded-xl text-left border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-white/20" />
                      <div className="h-3 w-20 bg-white/20 rounded" />
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded mb-2" />
                    <div className="h-2 w-5/6 bg-white/10 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                
                <p className="text-sm text-primary/90">
                  <strong className="font-semibold text-primary">Day 30 Unlocked!</strong> Welcome to the inner circle. Here are the authentic daily updates from your highly compatible matches.
                </p>
              </div>

              {feedData.journals?.map((journal: any) => (
                <div key={journal.id} className="bg-card border border-border shadow-md rounded-2xl rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="border border-white/10">
                      <AvatarFallback className="bg-primary/20 text-primary">{journal.user?.firstName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white/90">{journal.user?.firstName} {journal.user?.lastName?.charAt(0)}.</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(journal.createdAt), "MMM d, h:mm a")}</p>
                    </div>
                  </div>
                  <p className="text-white/80 whitespace-pre-wrap">{journal.content}</p>
                  {journal.imageUrl && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-white/5">
                      <img src={journal.imageUrl} alt="Update" className="w-full h-auto max-h-[400px] object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
