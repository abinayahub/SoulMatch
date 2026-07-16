import { API_URL } from '../config/api';
import { useState, useMemo } from "react";
import { MessageCircle, Search, CalendarDays, Flame, Bell, Plus, SlidersHorizontal, Pin, CheckCircle2, Lock, ChevronRight, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { getInitials, formatTime } from "@/lib/utils";
import { useLocation } from "wouter";
import { useGetConversations, useGetJourneyProgress } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

export default function ChatListPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: conversations = [], isLoading: isLoadingChats } = useGetConversations({
    query: { enabled: true, refetchInterval: 3000 } as any,
    request: { headers: authHeaders() },
  });

  const { data: journeyProgress } = useGetJourneyProgress(
    { query: { enabled: true }, request: { headers: authHeaders() } } as any
  );
  
  const answeredQuestions = (journeyProgress as any)?.answeredQuestions || 0;
  const qDaysCompleted = Math.floor(answeredQuestions / 5);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chatFavorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (convId: string) => {
    setFavorites(prev => {
      const newFavs = prev.includes(convId) ? prev.filter(id => id !== convId) : [...prev, convId];
      localStorage.setItem('chatFavorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const unreadConversationsCount = useMemo(() => {
    return (conversations as any[] || []).filter(conv => conv.unreadCount > 0 && conv.lastMessage?.senderId !== user?.id).length;
  }, [conversations, user]);

  const filteredConversations = useMemo(() => {
    let result = [...(conversations as any[] || [])];
    
    if (activeTab === "Unread") {
      result = result.filter(conv => conv.unreadCount > 0 && conv.lastMessage?.senderId !== user?.id);
    } else if (activeTab === "Favorites") {
      result = result.filter(conv => favorites.includes(conv.id.toString()));
    }
    
    // Sort by most recent message
    result.sort((a, b) => {
      const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    if (!searchQuery.trim()) return result;
    const lowerQuery = searchQuery.toLowerCase();
    return result.filter(conv => {
      const other = conv.participants?.[0];
      if (!other) return false;
      const name = `${other.firstName || ""} ${other.lastName || ""}`.toLowerCase();
      return name.includes(lowerQuery);
    });
  }, [conversations, searchQuery, activeTab, user]);

  // Check active status
  const { data: activeUsersData } = useQuery({
    queryKey: ["/api/users/active"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/users/active`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      return res.json();
    },
    refetchInterval: 30000,
  });

  const rawActiveUsers = activeUsersData?.users || [];
  
  const connectionIds = useMemo(() => {
    const ids = new Set<number>();
    (conversations as any[] || []).forEach(conv => {
      conv.participants?.forEach((p: any) => {
        if (p.id !== user?.id) {
          ids.add(p.id);
        }
      });
    });
    return ids;
  }, [conversations, user]);

  const activeUsersList = rawActiveUsers.filter((u: any) => {
    if (user?.id && u.id === user.id) return false;
    if (!connectionIds.has(u.id)) return false;
    return true;
  });

  const remainingActiveUsers = 0;

  return (
    <AppLayout>
      <div className="w-full relative bg-background font-sans min-h-screen pt-4 pb-28">
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <div className="px-5 flex items-start justify-between mb-6">
            <div>
              <h1 className="text-[28px] font-bold text-foreground tracking-tight mb-0.5">
                Messages
              </h1>
              <p className="text-[13px] text-muted-foreground font-medium flex items-center gap-1.5">
                Stay connected, build real bonds <span className="text-[14px]">💕</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Icons removed as requested */}
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-5 mb-5">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-[18px] h-[18px] text-muted-foreground font-bold" />
              <Input 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-foreground/5 border border-border/50 pl-11 pr-11 text-[15px] h-[48px] text-foreground font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-2xl shadow-inner"
              />
              <div className="absolute right-3 w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-foreground/10 rounded-full transition-colors">
                <SlidersHorizontal className="w-[18px] h-[18px] text-foreground" />
              </div>
            </div>
          </div>

          {/* Daily Challenge Banner (B&W Premium) */}
          <div className="px-5 mb-6">
            <div 
              onClick={() => navigate('/journey')}
              className="bg-card/50 border border-primary/30 rounded-[20px] p-4 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-all shadow-[0_0_15px_rgba(236,72,153,0.1)] group relative overflow-hidden"
            >
              {/* Subtle background flair */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 group-hover:bg-primary/30 transition-colors">
                  <CalendarDays className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-[14px]">Daily Challenge</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Answer today's question to earn points!</p>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <div className="flex items-center gap-1.5 bg-background/80 border border-border/50 px-2.5 py-1.5 rounded-xl shadow-sm">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-[12px] text-orange-400 font-extrabold">+{qDaysCompleted > 0 ? qDaysCompleted : 30}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>

          {/* Filters Pill Bar */}
          <div className="px-5 mb-5">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {['All', 'Unread', 'Favorites'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all border ${
                    activeTab === tab 
                      ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border-pink-500/30 shadow-[0_0_10px_rgba(236,72,153,0.1)]" 
                      : "bg-background text-foreground border-border hover:bg-foreground/5"
                  }`}
                >
                  {tab}
                  {tab === 'Unread' && unreadConversationsCount > 0 && (
                    <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${activeTab === tab ? "bg-pink-500 text-white" : "bg-primary/20 text-primary"}`}>
                      {unreadConversationsCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Active Users Horizontal Scroll */}
          <div className="pl-5 py-2 mb-2">
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 pr-5">
              {activeUsersList.length === 0 ? null : (
                <>
                  {activeUsersList.map((activeU: any) => {
                    const photoUrl = activeU.photos?.[0]?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeU.displayName || "User")}&background=random`;
                    return (
                      <div key={activeU.id} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group w-[72px]" onClick={() => navigate(`/chat/${activeU.id}`)}>
                        <div className="w-[68px] h-[68px] rounded-full p-[3px] bg-gradient-to-tr from-pink-500 to-purple-500 active:scale-95 transition-transform relative">
                          <div className="w-full h-full rounded-full border-[3px] border-background overflow-hidden bg-card">
                            <img src={photoUrl} alt={activeU.displayName} className="w-full h-full object-cover" />
                          </div>
                          <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-[3px] border-background" />
                        </div>
                        <span className="text-[12px] text-foreground font-bold truncate w-full text-center">{activeU.displayName?.split(' ')[0] || "User"}</span>
                      </div>
                    );
                  })}
                  {remainingActiveUsers > 0 && (
                    <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0 cursor-pointer h-[68px] my-auto w-[68px]">
                       <div className="w-[68px] h-[68px] rounded-full bg-foreground/5 border border-border flex items-center justify-center text-foreground font-extrabold text-[15px] active:scale-95 transition-transform">
                        +{remainingActiveUsers}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="px-5 space-y-4">
            {isLoadingChats ? (
              <div className="space-y-4 mt-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <Skeleton className="w-[60px] h-[60px] rounded-full shrink-0 bg-foreground/5" />
                    <div className="flex-1 space-y-2 py-1">
                      <Skeleton className="h-4 w-1/2 bg-foreground/5" />
                      <Skeleton className="h-3 w-3/4 bg-foreground/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-[18px] font-extrabold text-foreground mb-2">
                  {searchQuery ? "No matches found" : "No conversations yet"}
                </h3>
                <p className="text-[14px] text-muted-foreground mb-8 max-w-[240px] font-medium">
                  {searchQuery ? "Try a different search term to find your connection." : "Start matching to begin chatting."}
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={() => navigate('/discover')}
                    className="w-full max-w-[260px] bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl h-14 font-bold text-[16px] shadow-lg shadow-pink-500/20"
                  >
                    Discover Matches
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Conversations List */}
                {filteredConversations.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3 pl-2 pr-1 mt-4">
                      <span className="text-[13px] font-extrabold text-muted-foreground">Recent Conversations</span>
                    </div>
                    <div className="space-y-1">
                      {filteredConversations.map(conv => (
                        <ConversationItem 
                          key={conv.id} 
                          conv={conv} 
                          user={user} 
                          navigate={navigate}
                          isFavorite={favorites.includes(conv.id.toString())}
                          toggleFavorite={toggleFavorite}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* No More Conversations Banner */}
            {!isLoadingChats && filteredConversations.length > 0 && (
              <div className="mt-8 bg-card/60 border border-primary/20 rounded-[24px] p-5 flex flex-col md:flex-row items-center gap-4 text-center md:text-left shadow-[0_0_20px_rgba(236,72,153,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 relative z-10">
                  <Lock className="w-6 h-6 text-primary" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-full flex items-center justify-center border-2 border-card shadow-sm">
                    <MessageCircle className="w-3 h-3 text-white fill-white" />
                  </div>
                </div>
                <div className="flex-1 relative z-10">
                  <h4 className="font-extrabold text-foreground text-[15px] mb-1">No more conversations</h4>
                  <p className="text-[12px] font-medium text-muted-foreground leading-relaxed max-w-[200px] mx-auto md:mx-0">
                    Start matching to grow your connections and conversations!
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/discover')}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 rounded-2xl px-6 h-12 font-bold text-[14px] shrink-0 w-full md:w-auto shadow-md shadow-pink-500/20 relative z-10"
                >
                  Discover Matches
                </Button>
              </div>
            )}

          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function ConversationItem({ conv, user, navigate, isFavorite, toggleFavorite }: { conv: any, user: any, navigate: any, isFavorite?: boolean, toggleFavorite?: (id: string) => void }) {
  const other = conv.participants?.[0];
  if (!other) return null;
  const photo = other.photos?.find((p: any) => p.isPrimary) ?? other.photos?.[0];
  // Calculate mock compatibility score to match the UI screenshot
  const compScore = other.compatibilityScore ?? Math.floor(Math.random() * 20 + 75); 
  const isUnread = conv.unreadCount > 0 && conv.lastMessage?.senderId !== user?.id;
  
  return (
    <div
      onClick={() => navigate(`/chat/${conv.id}`)}
      className="flex items-center gap-4 py-3.5 cursor-pointer rounded-[20px] transition-colors px-3 group hover:bg-foreground/5 active:bg-foreground/5"
    >
      <div className="relative shrink-0">
        <Avatar className="w-[56px] h-[56px] border border-border shadow-sm">
          <AvatarImage src={photo?.url} className="object-cover" />
          <AvatarFallback className="bg-foreground/10 text-foreground font-bold text-lg">{getInitials(other.firstName ?? "U")}</AvatarFallback>
        </Avatar>
        <div className="absolute bottom-0 right-0 w-[15px] h-[15px] rounded-full bg-green-500 border-[2.5px] border-background" />
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 truncate pr-2">
            <h3 className={`text-[16px] truncate ${isUnread ? 'font-extrabold text-foreground' : 'font-bold text-foreground'}`}>
              {other.firstName} {other.lastName}
            </h3>
            <span className="text-[10px] font-extrabold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full shrink-0">
              {compScore}%
            </span>
          </div>
          <span className={`text-[11px] shrink-0 tracking-wide ${isUnread ? 'text-foreground font-bold' : 'text-muted-foreground font-medium'}`}>
            {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ''}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <p className={`text-[13px] truncate pr-4 ${isUnread ? "text-foreground font-bold" : "text-muted-foreground font-medium"}`}>
            {conv.lastMessage?.senderId === user?.id ? (
               <span className="text-foreground/70">You: </span> 
            ) : ""}
            {conv.lastMessage?.content ?? "No messages yet"}
          </p>
          
          <div className="shrink-0 flex items-center justify-center gap-1.5 min-w-[20px]">
            {isUnread ? (
              <div className="h-[20px] min-w-[20px] rounded-full bg-pink-500 flex items-center justify-center text-[10px] text-white font-extrabold px-1.5 shadow-sm shadow-pink-500/30">
                {conv.unreadCount}
              </div>
            ) : conv.lastMessage?.senderId === user?.id ? (
              <CheckCircle2 className="w-[15px] h-[15px] text-muted-foreground/60" />
            ) : null}
            {toggleFavorite && (
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFavorite(conv.id.toString()); }}
                className="p-1 hover:bg-foreground/10 rounded-full transition-colors"
              >
                <Star className={`w-[18px] h-[18px] transition-colors ${isFavorite ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-muted-foreground/30 hover:text-muted-foreground/60"}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
