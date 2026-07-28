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

  const displayedActiveUsers = activeUsersList.slice(0, 5);
  const remainingActiveUsers = Math.max(0, activeUsersList.length - 5);

  return (
    <AppLayout>
      <div className="w-full relative font-sans min-h-screen pt-4" style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 35%, #F4F1FF 70%, #FFFDFC 100%)' }}>
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <div className="px-5 flex items-start justify-between mb-6">
            <div>
              <h1 className="text-[28px] font-bold text-[#252525] tracking-tight mb-0.5">
                Messages
              </h1>
              <p className="text-[13px] text-[#707070] font-medium flex items-center gap-1.5">
                Stay connected, build real bonds <span className="text-[14px]">💕</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Icons removed as requested */}
            </div>
          </div>

          {/* Search Bar — Glass Floating */}
          <div className="px-5 mb-5">
            <div className="relative flex items-center h-[48px] rounded-[24px] border border-white/40 px-4" style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 2px 16px rgba(246,168,183,0.10)' }}>
              <Search className="absolute left-4 w-[18px] h-[18px] text-[#8A8A8A]" />
              <Input 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-0 bg-transparent shadow-none focus-visible:ring-0 pl-8 pr-8 text-[15px] h-full text-[#252525] font-medium placeholder:text-[#8A8A8A]"
              />
              <div className="absolute right-3 w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-white/40 rounded-full transition-colors">
                <SlidersHorizontal className="w-[18px] h-[18px] text-[#8A8A8A]" />
              </div>
            </div>
          </div>

          {/* Daily Challenge Banner — Glass */}
          <div className="px-5 mb-6">
            <div 
              onClick={() => navigate('/journey')}
              className="rounded-[20px] p-4 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-all active:scale-[0.99] relative overflow-hidden border border-white/35"
              style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', boxShadow: '0 4px 20px rgba(246,168,183,0.12)' }}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-[#F6A8B7]/30" style={{ background: 'rgba(246,168,183,0.15)' }}>
                  <CalendarDays className="w-5 h-5 text-[#F6A8B7]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#252525] text-[14px]">Daily Challenge</h3>
                  <p className="text-[11px] text-[#707070] mt-0.5 font-medium">Answer today's question to earn points!</p>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#F6A8B7]/30" style={{ background: 'rgba(246,168,183,0.15)' }}>
                  <Flame className="w-3.5 h-3.5 text-[#F6A8B7]" />
                  <span className="text-[12px] text-[#F6A8B7] font-extrabold">+{qDaysCompleted > 0 ? qDaysCompleted : 30}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8A8A8A]" />
              </div>
            </div>
          </div>

          {/* Filter Chips — Glass */}
          <div className="px-5 mb-5">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {['All', 'Unread', 'Favorites'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all border ${
                    activeTab === tab 
                      ? "text-[#252525] border-[#F6A8B7]/40" 
                      : "text-[#707070] border-white/40 hover:border-[#F6A8B7]/30"
                  }`}
                  style={activeTab === tab ? {
                    background: 'linear-gradient(135deg, #F8C7C8, #F8D9D2, #F7E8EE)',
                    boxShadow: '0 2px 12px rgba(246,168,183,0.25)'
                  } : {
                    background: 'rgba(255,255,255,0.55)',
                    backdropFilter: 'blur(12px)'
                  }}
                >
                  {tab}
                  {tab === 'Unread' && unreadConversationsCount > 0 && (
                    <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${activeTab === tab ? "bg-[#F6A8B7] text-white" : "bg-[#F6A8B7]/20 text-[#F6A8B7]"}`}>
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
              {displayedActiveUsers.length === 0 ? null : (
                <>
                  {displayedActiveUsers.map((activeU: any) => {
                    const photoUrl = activeU.photos?.[0]?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeU.displayName || "User")}&background=random`;
                    return (
                      <div key={activeU.id} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group w-[72px]" onClick={() => navigate(`/chat/${activeU.id}`)}>
                        <div className="w-[68px] h-[68px] rounded-full p-[3px] active:scale-95 transition-transform relative" style={{ background: 'linear-gradient(135deg, #F6A8B7, #F8C7C8, #F8D9D2)' }}>
                          <div className="w-full h-full rounded-full border-[3px] border-white overflow-hidden bg-white">
                            <img src={photoUrl} alt={activeU.displayName} className="w-full h-full object-cover" />
                          </div>
                          <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-[3px] border-white" />
                        </div>
                        <span className="text-[12px] text-[#252525] font-bold truncate w-full text-center">{activeU.displayName?.split(' ')[0] || "User"}</span>
                      </div>
                    );
                  })}
                  {remainingActiveUsers > 0 && (
                    <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0 cursor-pointer h-[68px] my-auto w-[68px]">
                       <div className="w-[68px] h-[68px] rounded-full bg-foreground/5 border border-border flex items-center justify-center text-[#252525] font-extrabold text-[15px] active:scale-95 transition-transform">
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
                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-5" style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 8px 32px rgba(246,168,183,0.2)' }}>
                  <MessageCircle className="w-10 h-10 text-[#F6A8B7]" />
                </div>
                <h3 className="text-[18px] font-extrabold text-[#252525] mb-2">
                  {searchQuery ? "No matches found" : "No conversations yet"}
                </h3>
                <p className="text-[14px] text-[#707070] mb-8 max-w-[240px] font-medium">
                  {searchQuery ? "Try a different search term to find your connection." : "Start matching to begin chatting."}
                </p>
                {!searchQuery && (
                  <button 
                    onClick={() => navigate('/discover')}
                    className="w-full max-w-[260px] h-14 rounded-full font-bold text-[16px] text-[#252525] border border-white/40 active:scale-95 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #F8C7C8, #F8D9D2, #F7E8EE)', boxShadow: '0 4px 20px rgba(246,168,183,0.35)' }}
                  >
                    Discover Matches
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Conversations List */}
                {filteredConversations.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3 pl-2 pr-1 mt-4">
                      <span className="text-[13px] font-extrabold text-[#707070]">Recent Conversations</span>
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



          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function ConversationItem({ conv, user, navigate, isFavorite, toggleFavorite }: { conv: any, user: any, navigate: any, isFavorite?: boolean, toggleFavorite?: (id: string) => void }) {
  const other = conv.participants?.find((p: any) => p.id !== user?.id) || conv.participants?.[0];
  if (!other) return null;
  const photo = other.photos?.find((p: any) => p.isPrimary) ?? other.photos?.[0];
  // Calculate mock compatibility score to match the UI screenshot
  const compScore = other.compatibilityScore ?? Math.floor(Math.random() * 20 + 75); 
  const isUnread = conv.unreadCount > 0 && conv.lastMessage?.senderId !== user?.id;
  
  return (
    <div
      onClick={() => navigate(`/chat/${conv.id}`)}
      className="flex items-center gap-4 py-3.5 cursor-pointer rounded-[20px] transition-all px-3 group hover:bg-white/40 active:bg-white/30"
    >
      <div className="relative shrink-0">
        <Avatar className="w-[56px] h-[56px] border border-white/50 shadow-sm">
          <AvatarImage src={photo?.url} className="object-cover" />
          <AvatarFallback className="bg-[#F6A8B7]/20 text-[#252525] font-bold text-lg">{getInitials(other.firstName ?? "U")}</AvatarFallback>
        </Avatar>
        <div className="absolute bottom-0 right-0 w-[15px] h-[15px] rounded-full bg-green-500 border-[2.5px] border-white" />
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 truncate pr-2">
            <h3 className={`text-[16px] truncate ${isUnread ? 'font-extrabold text-[#252525]' : 'font-bold text-[#252525]'}`}>
              {other.firstName} {other.lastName}
            </h3>
            <span className="text-[10px] font-extrabold text-[#F6A8B7] bg-[#F6A8B7]/15 border border-[#F6A8B7]/25 px-2 py-0.5 rounded-full shrink-0">
              {compScore}%
            </span>
          </div>
          <span className={`text-[11px] shrink-0 tracking-wide ${isUnread ? 'text-[#252525] font-bold' : 'text-[#707070] font-medium'}`}>
            {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ''}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <p className={`text-[13px] truncate pr-4 ${isUnread ? "text-[#252525] font-bold" : "text-[#707070] font-medium"}`}>
            {conv.lastMessage?.senderId === user?.id ? (
               <span className="text-[#707070]">You: </span> 
            ) : ""}
            {conv.lastMessage?.content?.startsWith('data:image') ? '📷 Image' : (conv.lastMessage?.content ?? "No messages yet")}
          </p>
          
          <div className="shrink-0 flex items-center justify-center gap-1.5 min-w-[20px]">
            {isUnread ? (
              <div className="h-[20px] min-w-[20px] rounded-full flex items-center justify-center text-[10px] text-white font-extrabold px-1.5 shadow-sm" style={{ background: 'linear-gradient(135deg, #F6A8B7, #F8C7C8)' }}>
                {conv.unreadCount}
              </div>
            ) : conv.lastMessage?.senderId === user?.id ? (
              <CheckCircle2 className="w-[15px] h-[15px] text-[#707070]/60" />
            ) : null}
            {toggleFavorite && (
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFavorite(conv.id.toString()); }}
                className="p-1 hover:bg-foreground/10 rounded-full transition-colors"
              >
                <Star className={`w-[18px] h-[18px] transition-colors ${isFavorite ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-[#707070]/30 hover:text-[#707070]/60"}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
