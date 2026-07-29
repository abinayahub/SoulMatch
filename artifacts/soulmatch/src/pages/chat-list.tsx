import { API_URL } from '../config/api';
import { useState, useMemo } from "react";
import { MessageCircle, Search, CalendarDays, Flame, Bell, Plus, SlidersHorizontal, Pin, CheckCircle2, Lock, ChevronRight, Star, Edit3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth, getAccessToken } from "@/lib/auth-context";
import { getInitials, formatTime } from "@/lib/utils";
import { useLocation } from "wouter";
import { useGetConversations, useGetJourneyProgress } from "@workspace/api-client-react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { getActiveNotes, createNote, deleteNote } from "@/lib/api";
import { useToast, toast } from "@/hooks/use-toast";

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

  const [myNotes, setMyNotes] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('soulmatch_notes');
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.sort((a: any, b: any) => b.updatedAt - a.updatedAt);
    } catch {
      return [];
    }
  });

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

  const { data: activeUsersData } = useQuery({
    queryKey: ["/api/users/active"],
    queryFn: async () => {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/users/active`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
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
              <h1 className="text-[clamp(24px,7.12vw,32px)] font-bold text-[#252525] tracking-tight mb-0.5">
                Messages
              </h1>
              <p className="text-[clamp(11px,3.31vw,15px)] text-[#707070] font-medium flex items-center gap-1.5">
                Stay connected, build real bonds <span className="text-[clamp(12px,3.56vw,16px)]">💕</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Icons removed as requested */}
            </div>
          </div>

          {/* Search Bar — Clean Glassmorphism */}
          <div className="px-5 mb-5">
            <div className="relative flex items-center h-[52px] rounded-[24px] pl-5 pr-2 transition-all duration-300 border border-black/5 focus-within:shadow-[0_0_24px_rgba(246,168,183,0.25)]" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <Search className="w-[18px] h-[18px] text-[#A0A0A0] shrink-0" strokeWidth={2.5} />
              <input 
                type="text"
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent shadow-none outline-none ring-0 focus:outline-none focus:ring-0 pl-3 pr-4 text-[15px] h-full text-[#252525] font-medium placeholder:text-[#A0A0A0]"
              />
              <div className="w-[36px] h-[36px] bg-white rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-black/5 shrink-0">
                <SlidersHorizontal className="w-[16px] h-[16px] text-[#707070]" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Instagram-Style Notes Bar */}
          <InstagramNotesBar user={user} activeUsers={activeUsersList} navigate={navigate} />

          {/* Filter Chips — Glass */}
          <div className="px-5 mb-4">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {['All', 'Unread', 'Favorites'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[clamp(11px,3.31vw,15px)] font-bold whitespace-nowrap transition-all border ${
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
                    <span className={`w-4 h-4 rounded-full text-[clamp(9px,2.54vw,12px)] flex items-center justify-center ${activeTab === tab ? "bg-[#F6A8B7] text-white" : "bg-[#F6A8B7]/20 text-[#F6A8B7]"}`}>
                      {unreadConversationsCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="px-5 space-y-4">
            {isLoadingChats ? (
              <div className="space-y-4 mt-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <Skeleton className="w-[clamp(51px,15.27vw,69px)] h-[clamp(51px,15.27vw,69px)] rounded-full shrink-0 bg-foreground/5" />
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
                <h3 className="text-[clamp(15px,4.58vw,21px)] font-extrabold text-[#252525] mb-2">
                  {searchQuery ? "No matches found" : "No conversations yet"}
                </h3>
                <p className="text-[clamp(12px,3.56vw,16px)] text-[#707070] mb-8 max-w-[clamp(204px,61.07vw,276px)] font-medium">
                  {searchQuery ? "Try a different search term to find your connection." : "Start matching to begin chatting."}
                </p>
                {!searchQuery && (
                  <button 
                    onClick={() => navigate('/discover')}
                    className="w-full max-w-[clamp(221px,66.16vw,299px)] h-14 rounded-full font-bold text-[clamp(14px,4.07vw,18px)] text-[#252525] border border-white/40 active:scale-95 transition-transform"
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
                    <div className="flex items-center justify-between mb-3 pl-2 pr-1 mt-0">
                      <span className="text-[clamp(11px,3.31vw,15px)] font-extrabold text-[#707070]">Recent Conversations</span>
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
        <Avatar className="w-[clamp(48px,14.25vw,64px)] h-[clamp(48px,14.25vw,64px)] border border-white/50 shadow-sm">
          <AvatarImage src={photo?.url} className="object-cover" />
          <AvatarFallback className="bg-[#F6A8B7]/20 text-[#252525] font-bold text-lg">{getInitials(other.firstName ?? "U")}</AvatarFallback>
        </Avatar>
        <div className="absolute bottom-0 right-0 w-[clamp(13px,3.82vw,17px)] h-[clamp(13px,3.82vw,17px)] rounded-full bg-green-500 border-[2.5px] border-white" />
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 truncate pr-2">
            <h3 className={`text-[clamp(14px,4.07vw,18px)] truncate ${isUnread ? 'font-extrabold text-[#252525]' : 'font-bold text-[#252525]'}`}>
              {other.firstName} {other.lastName}
            </h3>
            <span className="text-[clamp(9px,2.54vw,12px)] font-extrabold text-[#F6A8B7] bg-[#F6A8B7]/15 border border-[#F6A8B7]/25 px-2 py-0.5 rounded-full shrink-0">
              {compScore}%
            </span>
          </div>
          <span className={`text-[clamp(9px,2.80vw,13px)] shrink-0 tracking-wide ${isUnread ? 'text-[#252525] font-bold' : 'text-[#707070] font-medium'}`}>
            {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ''}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <p className={`text-[clamp(11px,3.31vw,15px)] truncate pr-4 ${isUnread ? "text-[#252525] font-bold" : "text-[#707070] font-medium"}`}>
            {conv.lastMessage?.senderId === user?.id ? (
               <span className="text-[#707070]">You: </span> 
            ) : ""}
            {conv.lastMessage?.content?.startsWith('data:image') ? '📷 Image' : (conv.lastMessage?.content ?? "No messages yet")}
          </p>
          
          <div className="shrink-0 flex items-center justify-center gap-1.5 min-w-[clamp(17px,5.09vw,23px)]">
            {isUnread ? (
              <div className="h-[clamp(17px,5.09vw,23px)] min-w-[clamp(17px,5.09vw,23px)] rounded-full flex items-center justify-center text-[clamp(9px,2.54vw,12px)] text-white font-extrabold px-1.5 shadow-sm" style={{ background: 'linear-gradient(135deg, #F6A8B7, #F8C7C8)' }}>
                {conv.unreadCount}
              </div>
            ) : conv.lastMessage?.senderId === user?.id ? (
              <CheckCircle2 className="w-[clamp(13px,3.82vw,17px)] h-[clamp(13px,3.82vw,17px)] text-[#707070]/60" />
            ) : null}
            {toggleFavorite && (
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFavorite(conv.id.toString()); }}
                className="p-1 hover:bg-foreground/10 rounded-full transition-colors"
              >
                <Star className={`w-[clamp(15px,4.58vw,21px)] h-[clamp(15px,4.58vw,21px)] transition-colors ${isFavorite ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-[#707070]/30 hover:text-[#707070]/60"}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom hook for Long Press
function useLongPress(callback: () => void, ms = 500) {
  const [startLongPress, setStartLongPress] = useState(false);

  useEffect(() => {
    let timerId: any;
    if (startLongPress) {
      timerId = setTimeout(callback, ms);
    } else {
      clearTimeout(timerId);
    }
    return () => clearTimeout(timerId);
  }, [callback, ms, startLongPress]);

  return {
    onMouseDown: () => setStartLongPress(true),
    onMouseUp: () => setStartLongPress(false),
    onMouseLeave: () => setStartLongPress(false),
    onTouchStart: () => setStartLongPress(true),
    onTouchEnd: () => setStartLongPress(false),
  };
}

function InstagramNotesBar({ user, activeUsers, navigate }: { user: any, activeUsers: any[], navigate: any }) {
  const queryClient = useQueryClient();

  const { data: rawNotes = [] } = useQuery({
    queryKey: ["active-notes"],
    queryFn: getActiveNotes,
    refetchInterval: 60000,
  });

  const activeNotes = useMemo(() => {
    const now = Date.now();
    return rawNotes.filter((note: any) => new Date(note.expiresAt).getTime() > now && note.isActive);
  }, [rawNotes]);

  const myNote = useMemo(() => activeNotes.find((n: any) => n.userId === user?.id), [activeNotes, user?.id]);

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["active-notes"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["active-notes"] }),
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draftNote, setDraftNote] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleOpenDialog = () => {
    setDraftNote(myNote?.content || "");
    setConfirmDelete(false);
    setIsDialogOpen(true);
  };

  const handleSaveNote = () => {
    if (!draftNote.trim()) {
      return;
    }
    createMutation.mutate(draftNote.trim(), {
      onSuccess: () => {
        toast({ title: "Note shared successfully" });
        setIsDialogOpen(false);
      },
      onError: (error: any) => toast({ title: "Failed to share note", description: String(error.message || error), variant: "destructive" })
    });
  };

  const handleDeleteNote = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        toast({ title: "Note deleted successfully" });
        setDraftNote("");
        setIsDialogOpen(false);
        setConfirmDelete(false);
      },
      onError: () => toast({ title: "Failed to delete note", variant: "destructive" })
    });
  };

  return (
    <div className="w-full mb-3">
      <div className="flex gap-[18px] overflow-x-auto hide-scrollbar pb-1 px-5">
        {/* Your Note */}
        <div className="flex flex-col items-center flex-shrink-0 w-[72px] cursor-pointer" onClick={handleOpenDialog}>
          <div className="h-[48px] w-full relative mb-2">
            {myNote ? (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center w-max max-w-[100px] z-10">
                <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-[0_2px_12px_rgba(246,168,183,0.25)] border border-[#F6A8B7]/30 text-[11px] font-medium text-[#252525] text-center w-full">
                  <span className="line-clamp-2 leading-tight break-words">{myNote.content}</span>
                </div>
                <div className="w-2.5 h-2.5 bg-white/95 border-b border-r border-[#F6A8B7]/30 rotate-45 -mt-1.5 shadow-[2px_2px_4px_rgba(246,168,183,0.05)]" />
              </motion.div>
            ) : (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center w-max max-w-[100px] z-10">
                <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50 text-[11px] font-medium text-[#8A8A8A] text-center w-full">
                  <span className="line-clamp-2 leading-tight break-words">What's on your mind?</span>
                </div>
                <div className="w-2.5 h-2.5 bg-white/95 border-b border-r border-[#E0E0E0]/50 rotate-45 -mt-1.5 shadow-[2px_2px_4px_rgba(0,0,0,0.02)]" />
              </motion.div>
            )}
          </div>
          
          <div className="relative w-[60px] h-[60px]">
            <Avatar className="w-[60px] h-[60px] ring-[2px] ring-[#F6A8B7]/40 ring-offset-[3px] ring-offset-transparent">
              <AvatarImage src={user?.photos?.find((p:any) => p.isPrimary)?.url || user?.photos?.[0]?.url} className="object-cover" />
              <AvatarFallback className="bg-[#F6A8B7]/15 text-[#252525] font-bold text-lg">{getInitials(user?.firstName || "U")}</AvatarFallback>
            </Avatar>
            {!myNote && (
              <div className="absolute -bottom-1 -right-1 w-[20px] h-[20px] bg-white rounded-full flex items-center justify-center shadow-sm z-10 border-[1.5px] border-white text-[#F6A8B7]">
                <div className="w-full h-full bg-[#F6A8B7]/15 rounded-full flex items-center justify-center">
                  <Plus className="w-3 h-3" strokeWidth={3.5} />
                </div>
              </div>
            )}
          </div>
          <span className="text-[12px] font-medium text-[#707070] mt-1.5 text-center w-full truncate">Your Note</span>
        </div>

        {/* Connected Users' Notes */}
        {activeUsers.map(activeU => {
          const theirNote = activeNotes.find((n: any) => n.userId === activeU.id);
          if (!theirNote) return null;

          return (
            <ConnectionNoteItem key={activeU.id} activeU={activeU} theirNote={theirNote} navigate={navigate} />
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[85vw] max-w-[320px] rounded-[24px] border-white/40 bg-white/95 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] p-4 md:p-5">
          <DialogHeader className="mb-1">
            <DialogTitle className="text-center text-[#252525] text-lg font-bold">Your Note</DialogTitle>
          </DialogHeader>
          {confirmDelete ? (
            <div className="py-2 text-center">
              <h3 className="text-[#252525] font-bold text-[15px] mb-1.5">Delete this note?</h3>
              <p className="text-[12px] text-[#707070] mb-4">This note will be permanently removed.</p>
              <div className="flex gap-2">
                <Button onClick={() => setConfirmDelete(false)} variant="ghost" className="flex-1 rounded-[14px] h-10 text-[#707070] font-medium bg-black/5 hover:bg-black/10">Cancel</Button>
                <Button onClick={handleDeleteNote} disabled={deleteMutation.isPending} className="flex-1 rounded-[14px] h-10 bg-red-500 hover:bg-red-600 text-white font-bold shadow-sm shadow-red-500/20">Delete</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="py-1">
                <Input
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value.slice(0, 60))}
                  placeholder="Share a thought..."
                  className="text-center border-0 bg-[#F6A8B7]/5 rounded-[16px] h-12 text-[15px] text-[#252525] font-medium focus-visible:ring-1 focus-visible:ring-[#F6A8B7]/50 shadow-inner px-4 placeholder:text-[#8A8A8A]"
                  autoFocus
                />
                
                <div className="text-center text-[10px] text-[#8A8A8A] mt-2 font-medium">
                  {draftNote.length}/60 characters
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-3">
                <Button onClick={handleSaveNote} disabled={createMutation.isPending || deleteMutation.isPending || !draftNote.trim()} className="rounded-[16px] h-11 w-full bg-[#F6A8B7] hover:bg-[#F6A8B7]/90 text-white font-bold text-[14px] shadow-sm shadow-[#F6A8B7]/20 transition-all disabled:opacity-50">
                  {createMutation.isPending 
                    ? (myNote ? "Updating..." : "Sharing...") 
                    : (myNote ? "Update Note" : "Share Note")}
                </Button>
                {myNote && (
                  <Button onClick={() => setConfirmDelete(true)} disabled={createMutation.isPending || deleteMutation.isPending} variant="ghost" className="rounded-[14px] h-10 w-full text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-[13px]">
                    Delete Note
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ConnectionNoteItem({ activeU, theirNote, navigate }: { activeU: any, theirNote: any, navigate: any }) {
  const photoUrl = activeU.photos?.[0]?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeU.displayName || "User")}&background=random`;
  const [showActions, setShowActions] = useState(false);

  const longPressProps = useLongPress(() => {
    setShowActions(true);
  });

  return (
    <Popover open={showActions} onOpenChange={setShowActions}>
      <PopoverTrigger asChild>
        <div {...longPressProps} className="flex flex-col items-center flex-shrink-0 w-[72px] cursor-pointer group" onClick={() => setShowActions(true)}>
          <div className="h-[48px] w-full relative mb-2">
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center w-max max-w-[100px] z-10">
              <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-[0_2px_12px_rgba(246,168,183,0.15)] border border-[#F6A8B7]/30 text-[11px] font-medium text-[#252525] text-center w-full">
                <span className="line-clamp-2 leading-tight break-words">{theirNote.content}</span>
              </div>
              <div className="w-2.5 h-2.5 bg-white/95 border-b border-r border-[#F6A8B7]/30 rotate-45 -mt-1.5 shadow-[2px_2px_4px_rgba(246,168,183,0.05)]" />
            </motion.div>
          </div>
          
          <div className="relative w-[60px] h-[60px]">
            <Avatar className="w-[60px] h-[60px] ring-[2px] ring-[#F6A8B7] ring-offset-[3px] ring-offset-transparent transition-transform active:scale-95">
              <AvatarImage src={photoUrl} className="object-cover" />
              <AvatarFallback className="bg-[#F6A8B7]/20 text-[#252525] font-bold">{getInitials(activeU.displayName || "U")}</AvatarFallback>
            </Avatar>
          </div>
          <span className="text-[12px] font-medium text-[#252525] mt-1.5 text-center w-full truncate">
            {activeU.displayName?.split(' ')[0] || "User"}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent align="center" side="bottom" className="w-56 p-2 rounded-2xl border-white/40 bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <div className="p-3 pb-2 text-center border-b border-black/5 mb-1">
          <p className="text-[14px] text-[#252525] font-semibold leading-snug">"{theirNote.content}"</p>
          <p className="text-[10px] text-[#8A8A8A] mt-1.5">{formatTime(theirNote.createdAt)}</p>
        </div>
        <Button variant="ghost" className="w-full justify-start text-[13px] font-semibold text-[#252525] hover:bg-[#F6A8B7]/10 rounded-xl" onClick={() => navigate(`/profile/${activeU.id}`)}>
          View Profile
        </Button>
        <Button variant="ghost" className="w-full justify-start text-[13px] font-semibold text-[#252525] hover:bg-[#F6A8B7]/10 rounded-xl mt-0.5" onClick={() => navigate(`/chat/new?userId=${activeU.id}`)}>
          Open Chat
        </Button>
      </PopoverContent>
    </Popover>
  );
}
