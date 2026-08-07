import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  ArrowLeft, 
  Search, 
  MessageCircle, 
  ShieldCheck, 
  Bookmark,
  Heart,
  Home,
  MessageSquare,
  Star,
  User,
  SlidersHorizontal,
  Clock,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

type CommunityQuestion = {
  id: number;
  text: string;
  category: string;
  isAnonymous: boolean;
  status: string;
  answersCount: number;
  createdAt: string;
};

export default function BrowseQuestionsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { data: publishedQuestions = [], isLoading, refetch } = useQuery<CommunityQuestion[]>({
    queryKey: ["/api/community-questions/published"],
    queryFn: () => apiRequest("/community-questions/published"),
  });

  return (
    <AppLayout>
      <div 
        className="w-full min-h-screen pb-10"
        style={{ background: 'linear-gradient(135deg, #FAF2EF 0%, #F5F0FB 50%, #FFFDFB 75%, #F7F7FA 100%)' }}
      >
        <div className="w-full max-w-md mx-auto px-[clamp(16px,4vw,20px)] pt-[clamp(12px,3vw,16px)] space-y-4 flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5 flex-1 pr-2">
              <h1 className="text-[clamp(22px,5.5vw,26px)] font-black text-[#252525] tracking-tight leading-tight">
                Browse Questions
              </h1>
              <p className="text-[12px] sm:text-[13px] text-[#707070] font-medium leading-snug">
                Answer meaningful questions and connect with like-minded people.
              </p>
            </div>
            
            <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-[#F6A8B7] to-[#F8D6DD] flex items-center justify-center shadow-lg shadow-[#F6A8B7]/30 shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
              <div className="relative z-10 flex flex-col items-center justify-center">
                <MessageCircle className="w-8 h-8 text-white fill-white" />
              </div>
              {/* Decorative dots */}
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/80" />
              <div className="absolute bottom-3 left-3 w-1 h-1 rounded-full bg-white/60" />
              <div className="absolute top-1/2 right-3 flex gap-0.5">
                <div className="w-1 h-1 rounded-full bg-[#F6A8B7]" />
                <div className="w-1 h-1 rounded-full bg-[#F6A8B7]" />
                <div className="w-1 h-1 rounded-full bg-[#F6A8B7]" />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mt-2">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#A0A0A0]" />
            </div>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="w-full h-[50px] pl-10 pr-4 rounded-full border border-[#F8D6DD]/60 bg-white/80 backdrop-blur-md shadow-sm text-[13px] sm:text-[14px] text-[#252525] placeholder:text-[#A0A0A0] focus-visible:ring-1 focus-visible:ring-[#F6A8B7]"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full h-11 bg-white/70 backdrop-blur-md border border-[#F8D6DD]/60 rounded-[14px] px-3.5 text-[12px] sm:text-[13px] font-bold text-[#252525] shadow-sm focus:ring-1 focus:ring-[#F6A8B7]">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#707070]" />
                    <SelectValue placeholder="All Categories" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-[16px] border border-[#F8D6DD]/60 bg-white/95 backdrop-blur-xl shadow-lg">
                  <SelectItem value="all" className="font-medium">All Categories</SelectItem>
                  <SelectItem value="relationship" className="font-medium">Relationship</SelectItem>
                  <SelectItem value="family" className="font-medium">Family</SelectItem>
                  <SelectItem value="communication" className="font-medium">Communication</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 relative">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full h-11 bg-white/70 backdrop-blur-md border border-[#F8D6DD]/60 rounded-[14px] px-3.5 text-[12px] sm:text-[13px] font-bold text-[#252525] shadow-sm focus:ring-1 focus:ring-[#F6A8B7]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#707070]" />
                    <SelectValue placeholder="Newest First" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-[16px] border border-[#F8D6DD]/60 bg-white/95 backdrop-blur-xl shadow-lg">
                  <SelectItem value="newest" className="font-medium">Newest First</SelectItem>
                  <SelectItem value="oldest" className="font-medium">Oldest First</SelectItem>
                  <SelectItem value="popular" className="font-medium">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4 pt-1">
            {isLoading ? (
              <div className="flex flex-col bg-white/70 backdrop-blur-md rounded-[18px] border border-[#F8D6DD]/40 p-8 items-center justify-center shadow-sm h-[200px]">
                 <div className="animate-spin w-8 h-8 rounded-full border-4 border-[#F8D6DD] border-t-[#F6A8B7]"></div>
              </div>
            ) : publishedQuestions.length > 0 ? (
              publishedQuestions.map((q) => {
                // Determine icon and color based on category
                let categoryColor = "text-pink-500";
                let categoryBg = "bg-pink-50";
                let Icon = MessageSquare;
                
                if (q.category === "Relationship") {
                   Icon = Heart;
                } else if (q.category === "Family") {
                   Icon = Home; categoryColor = "text-purple-600"; categoryBg = "bg-purple-50";
                } else if (q.category === "Personal Values") {
                   Icon = Star; categoryColor = "text-orange-500"; categoryBg = "bg-orange-50";
                }

                // Format date: DD MMM YYYY
                const dateObj = new Date(q.createdAt);
                const dateStr = dateObj.toLocaleDateString("en-GB", {
                  day: "2-digit", month: "short", year: "numeric"
                });

                return (
                  <div 
                    key={q.id} 
                    onClick={() => setLocation(`/community-questions/${q.id}/answer`)}
                    className="w-full rounded-[22px] p-5 border border-[#F8D6DD]/50 shadow-[0_8px_25px_rgba(246,168,183,0.1)] relative bg-white/95 backdrop-blur-xl flex flex-col h-full min-h-[160px] cursor-pointer hover:border-[#F6A8B7]/80 transition-colors"
                  >
                    
                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className={`px-2 py-1 rounded-full ${categoryBg} flex items-center gap-1.5`}>
                        <Icon className={`w-3 h-3 ${categoryColor} fill-current`} />
                        <span className={`text-[10px] sm:text-[11px] font-bold ${categoryColor}`}>
                          {q.category}
                        </span>
                      </div>
                      <button className="text-[#A0A0A0] hover:text-[#F6A8B7] transition-colors">
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Question Text */}
                    <h3 className="text-[15px] sm:text-[16px] font-black text-[#252525] leading-snug mb-5 flex-1">
                      {q.text}
                    </h3>

                    {/* Card Footer */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-[#F8D6DD]/30 flex items-center justify-center shrink-0">
                          <User className="w-3 h-3 text-[#F6A8B7]" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] sm:text-[11px] font-medium text-[#707070]">{q.isAnonymous ? "Asked anonymously" : "Community Member"}</span>
                          <span className="text-[#D0D0D0] text-[10px]">•</span>
                          <span className="text-[10px] sm:text-[11px] font-medium text-[#A0A0A0]">{dateStr}</span>
                        </div>
                      </div>
                      <Button 
                        className="h-8 rounded-full bg-[#F6A8B7] hover:bg-[#F38E9F] text-white font-bold text-[11px] sm:text-xs shadow-md shadow-[#F6A8B7]/30 px-5 transition-all ml-2 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/community-questions/${q.id}/answer`);
                        }}
                      >
                        Answer
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full rounded-[22px] p-8 border border-[#F8D6DD]/40 bg-white/60 backdrop-blur-md shadow-sm flex flex-col items-center justify-center text-center gap-3">
                <span className="text-4xl mb-2">📭</span>
                <h3 className="text-[15px] sm:text-[16px] font-extrabold text-[#252525]">No Questions Available</h3>
                <p className="text-[12px] sm:text-[13px] text-[#707070] font-medium max-w-[280px]">
                  There are no community questions available at the moment.
                </p>
                <p className="text-[12px] sm:text-[13px] text-[#707070] font-medium max-w-[280px] mb-2">
                  New questions will appear here after users submit them and they are approved.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => refetch()}
                  className="mt-2 h-9 rounded-full border-[#F8D6DD] text-[#F6A8B7] font-bold text-[12px] px-6"
                >
                  Refresh
                </Button>
              </div>
            )}
          </div>

          {/* Bottom Information Card */}
          <div className="w-full rounded-[20px] p-4 border border-[#F8D6DD]/60 bg-[#FFF0F3]/80 backdrop-blur-md shadow-sm flex items-center justify-between mt-2">
            <div className="flex gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-[#F6A8B7]/20">
                <ShieldCheck className="w-4.5 h-4.5 text-[#F6A8B7]" />
              </div>
              <p className="text-[11px] sm:text-[12px] text-[#707070] font-medium leading-snug">
                All questions are reviewed before publishing. Your answers help build meaningful connections.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#F6A8B7] shrink-0 ml-2" />
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
