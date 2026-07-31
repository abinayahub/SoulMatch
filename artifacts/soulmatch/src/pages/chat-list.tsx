import { API_URL } from '../config/api';
import { useState, useMemo, useRef, useEffect } from "react";
import { MessageCircle, Search, Plus, SlidersHorizontal, CheckCircle2, Star, X, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
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
import { toast } from "@/hooks/use-toast";

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
            </div>
            <div className="flex items-center gap-3">
              {/* Icons removed as requested */}
            </div>
          </div>

          {/* Search Bar — Single Container, No Double Border */}
          <div className="px-5 mb-5">
            {/*
              ONLY this outer div has border / border-radius / shadow / background.
              The <input> uses .chat-search-input which overrides every global style
              so it is fully transparent — no extra rounded rectangle on Android.
            */}
            <div
              className="flex items-center h-[52px] rounded-[30px] pl-4 pr-2 gap-2 transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
                border: '1px solid #F4E6EA',
              }}
            >
              {/* Search icon — vertically centred by the flex parent */}
              <Search className="w-[18px] h-[18px] text-[#A0A0A0] shrink-0" strokeWidth={2.5} />

              {/* Input — no border, no bg, no shadow, no outline, no ring */}
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={[
                  "chat-search-input",   /* overrides every global @layer base rule */
                  "flex-1",
                  "min-w-0",
                  "h-full",
                  "text-[15px]",
                  "font-medium",
                  "text-[#252525]",
                  "placeholder:text-[#A0A0A0]",
                  "border-0",
                  "outline-none",
                  "ring-0",
                  "focus:ring-0",
                  "focus:outline-none",
                  "focus:border-transparent",
                  "shadow-none",
                  "bg-transparent",
                ].join(" ")}
              />

              {/* Filter button — separate circular button, vertically centred */}
              <button
                type="button"
                aria-label="Filter conversations"
                className="w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-transform hover:scale-[1.05] active:scale-95"
                style={{
                  background: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(0,0,0,0.05)',
                }}
              >
                <SlidersHorizontal className="w-[16px] h-[16px] text-[#707070]" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Instagram-Style Notes Bar */}
          <InstagramNotesBar user={user} conversations={conversations as any[]} navigate={navigate} />

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

// ─── Instagram-Style Notes Bar ──────────────────────────────────────────────
//
// Behaviour:
//  • Shows only notes where expiresAt > now (24-h expiry, client-filtered too)
//  • Tapping another user's note: if connected → open their existing chat;
//    if not connected → open their profile. NO popup ever.
//  • Your own note: tapping opens a bottom sheet to edit/delete.
//  • Notes row refreshed on mount + every 60 s.

function InstagramNotesBar({
  user,
  conversations,
  navigate,
}: {
  user: any;
  conversations: any[];
  navigate: any;
}) {
  const queryClient = useQueryClient();

  // Fetch + refetch every 60 s; also refetch immediately on mount
  const { data: rawNotes = [] } = useQuery({
    queryKey: ["active-notes"],
    queryFn: async () => {
      const res = await getActiveNotes();
      console.log("Notes API Response:", res);
      return res;
    },
    refetchInterval: 60_000,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Client-side expiry guard — never show expired notes
  const activeNotes = useMemo(() => {
    const now = Date.now();
    return rawNotes.filter(
      (note: any) =>
        note.isActive !== false &&
        new Date(note.expiresAt).getTime() > now,
    );
  }, [rawNotes]);

  const myNote = useMemo(
    () => activeNotes.find((n: any) => n.userId === user?.id),
    [activeNotes, user?.id],
  );

  // Build a quick lookup: userId → existing conversationId
  const userToConvId = useMemo(() => {
    const map = new Map<any, number>();
    (conversations || []).forEach((conv: any) => {
      conv.participants?.forEach((p: any) => {
        if (Number(p.id) !== Number(user?.id)) {
          map.set(Number(p.id), conv.id);
          map.set(String(p.id), conv.id);
        }
      });
    });
    return map;
  }, [conversations, user?.id]);

  // Other users who have an active note
  const othersWithNotes = useMemo(
    () => activeNotes.filter((n: any) => Number(n.userId) !== Number(user?.id)),
    [activeNotes, user?.id],
  );

  // ── Own note sheet ──────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["active-notes"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["active-notes"] }),
  });

  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const openSheet = () => {
    setDraft(myNote?.content ?? myNote?.note ?? "");
    setConfirmDelete(false);
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (!draft.trim()) return;
    createMutation.mutate(draft.trim(), {
      onSuccess: () => {
        toast({ title: "Note shared ✓" });
        setSheetOpen(false);
      },
      onError: (err: any) =>
        toast({ title: "Couldn't share note", description: String(err.message || err), variant: "destructive" }),
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        toast({ title: "Note deleted" });
        setSheetOpen(false);
        setConfirmDelete(false);
      },
      onError: () => toast({ title: "Couldn't delete note", variant: "destructive" }),
    });
  };

  // ── Tap handler for other users ─────────────────────────────────────────
  const handleTapOther = (note: any) => {
    const targetUserId = note.userId || note.user?.id;
    const convId = userToConvId.get(targetUserId) || userToConvId.get(Number(targetUserId));
    if (convId) {
      navigate(`/chat/${convId}`);
    } else if (targetUserId) {
      navigate(`/profile/${targetUserId}`);
    }
  };

  const myPhotoUrl =
    user?.photos?.find((p: any) => p.isPrimary)?.url ||
    user?.photos?.[0]?.url;

  return (
    <div className="w-full mb-3">
      {/* ── Scrollable row ── */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 px-5">

        {/* ── Your Note ── */}
        <button
          type="button"
          onClick={openSheet}
          className="flex flex-col items-center flex-shrink-0 w-[80px] cursor-pointer bg-transparent border-none p-0"
        >
          {/* Bubble zone */}
          <div className="h-[64px] w-full flex flex-col items-center justify-end mb-2">
            <AnimatePresence mode="wait">
              {myNote ? (
                <motion.div
                  key="my-note"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex flex-col items-center w-full"
                >
                  <div className="w-[78px] bg-white/95 backdrop-blur-md px-2 py-[6px] rounded-[13px] shadow-[0_2px_10px_rgba(246,168,183,0.22)] border border-[#F6A8B7]/30 text-[10.5px] font-medium text-[#252525] text-center relative">
                    <span className="line-clamp-2 leading-[1.35] break-words">{myNote.content}</span>
                    {/* tiny edit badge */}
                    <span className="absolute -top-1.5 -right-1.5 w-[16px] h-[16px] rounded-full bg-[#F6A8B7] flex items-center justify-center shadow">
                      <Pencil className="w-2 h-2 text-white" strokeWidth={3} />
                    </span>
                  </div>
                  <div className="w-2 h-2 bg-white/95 border-b border-r border-[#F6A8B7]/30 rotate-45 -mt-1 mx-auto" />
                </motion.div>
              ) : (
                <motion.div
                  key="my-empty"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex flex-col items-center w-full"
                >
                  <div className="w-[78px] bg-white/88 backdrop-blur-md px-2 py-[6px] rounded-[13px] shadow-[0_2px_8px_rgba(0,0,0,0.07)] border border-[#E0E0E0]/50 text-[10.5px] font-medium text-[#8A8A8A] text-center">
                    <span className="leading-[1.35]">What's on your mind?</span>
                  </div>
                  <div className="w-2 h-2 bg-white/88 border-b border-r border-[#E0E0E0]/50 rotate-45 -mt-1 mx-auto" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <div className="relative w-[60px] h-[60px]">
            <Avatar className="w-[60px] h-[60px] ring-[2.5px] ring-[#F6A8B7]/55 ring-offset-[2px] ring-offset-transparent">
              <AvatarImage src={myPhotoUrl} className="object-cover" />
              <AvatarFallback className="bg-[#F6A8B7]/15 text-[#252525] font-bold text-base">
                {getInitials(user?.firstName || "U")}
              </AvatarFallback>
            </Avatar>
            {!myNote && (
              <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] bg-white rounded-full flex items-center justify-center shadow-sm z-10 border border-white">
                <div className="w-full h-full bg-[#F6A8B7]/20 rounded-full flex items-center justify-center">
                  <Plus className="w-2.5 h-2.5 text-[#F6A8B7]" strokeWidth={3.5} />
                </div>
              </div>
            )}
          </div>
          <span className="text-[10.5px] font-medium text-[#707070] mt-1.5 text-center w-full truncate">
            Your Note
          </span>
        </button>

        {/* ── Other users' active notes ── */}
        {othersWithNotes.map((note: any) => (
          <NoteAvatar
            key={note.id}
            note={note}
            onTap={() => handleTapOther(note)}
          />
        ))}
      </div>

      {/* ── Own note bottom-sheet (edit / delete) ── */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            {/* backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
              onClick={() => setSheetOpen(false)}
            />

            {/* sheet */}
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 340 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] bg-white/97 backdrop-blur-2xl px-5 pt-4 pb-8 shadow-[0_-8px_40px_rgba(0,0,0,0.14)]"
              style={{ maxHeight: "80vh" }}
            >
              {/* drag handle */}
              <div className="w-10 h-1 rounded-full bg-[#E0E0E0] mx-auto mb-4" />

              {confirmDelete ? (
                <div className="text-center py-2">
                  <h3 className="text-[#252525] font-bold text-[16px] mb-1">Delete note?</h3>
                  <p className="text-[13px] text-[#707070] mb-5">This will remove your note for everyone.</p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setConfirmDelete(false)}
                      variant="ghost"
                      className="flex-1 rounded-[14px] h-11 bg-black/5 text-[#707070] font-semibold"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="flex-1 rounded-[14px] h-11 bg-red-500 hover:bg-red-600 text-white font-bold"
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-center text-[13px] font-semibold text-[#707070] mb-3">
                    {myNote ? "Edit your note" : "Share a thought"}
                  </p>

                  {/* text input */}
                  <div className="relative">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value.slice(0, 60))}
                      placeholder="What's on your mind?"
                      rows={2}
                      autoFocus
                      className={
                        "chat-search-input w-full resize-none rounded-[16px] px-4 py-3 " +
                        "text-[15px] text-[#252525] font-medium placeholder:text-[#A0A0A0] " +
                        "bg-[#F6A8B7]/6 border border-[#F6A8B7]/25 leading-snug"
                      }
                    />
                    <span className="absolute bottom-2 right-3 text-[10px] text-[#A0A0A0] font-medium">
                      {draft.length}/60
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 mt-4">
                    <Button
                      onClick={handleSave}
                      disabled={createMutation.isPending || !draft.trim()}
                      className="h-12 rounded-[16px] w-full font-bold text-[15px] text-white shadow-sm"
                      style={{ background: "linear-gradient(135deg,#F6A8B7,#F8C3C6)" }}
                    >
                      {createMutation.isPending
                        ? myNote ? "Updating..." : "Sharing..."
                        : myNote ? "Update Note" : "Share Note"}
                    </Button>

                    {myNote && (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="h-11 rounded-[14px] w-full font-semibold text-[14px] text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Delete Note
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setSheetOpen(false)}
                      className="h-10 rounded-[14px] w-full font-medium text-[13px] text-[#A0A0A0] hover:bg-black/5 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── NoteAvatar: a single other-user note item ───────────────────────────────
// No popup. Tap → navigate directly.
function getNoteUserData(note: any) {
  const user = note.user;
  
  if (!user || (!user.id && !note.userId)) {
    console.error("[Notes Frontend Data Error] Note object is missing associated user record:", note);
  }

  // Display name priority:
  // user.firstName ?? user.displayName ?? user.username ?? user.email.split("@")[0]
  const fn = (note.firstName || user?.firstName || "").trim();
  const dn = (note.displayName || user?.displayName || "").trim();
  const un = (note.username || user?.username || "").trim();
  const em = (note.email || user?.email || "").trim();

  let displayName = "";

  if (fn && fn !== "User" && fn !== "Unknown User") {
    displayName = fn.split(" ")[0]; // First name (e.g. Priya K -> Priya)
  } else if (dn && dn !== "User" && dn !== "Unknown User") {
    displayName = dn.split(" ")[0];
  } else if (un && un !== "User") {
    displayName = un;
  } else if (em) {
    displayName = em.split("@")[0];
  } else if (fn) {
    displayName = fn;
  } else {
    displayName = "User";
  }

  // Photo priority:
  // note.profileImage || note.profilePhoto || user.profileImage || user.profilePhoto || photos primary
  const photoUrl = 
    note.profileImage ||
    note.profilePhoto || 
    user?.profileImage ||
    user?.profilePhoto || 
    user?.photos?.find((p: any) => p.isPrimary)?.url ||
    user?.photos?.[0]?.url ||
    undefined;

  return { displayName, photoUrl };
}

function NoteAvatar({ note, onTap }: { note: any; onTap: () => void }) {
  const { displayName, photoUrl } = getNoteUserData(note);
  const noteContent = note.note || note.content;

  return (
    <button
      type="button"
      onClick={onTap}
      className="flex flex-col items-center flex-shrink-0 w-[80px] cursor-pointer bg-transparent border-none p-0 active:scale-95 transition-transform"
    >
      {/* Bubble zone */}
      <div className="h-[64px] w-full flex flex-col items-center justify-end mb-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="flex flex-col items-center w-full"
        >
          <div className="w-[78px] bg-white/95 backdrop-blur-md px-2 py-[6px] rounded-[13px] shadow-[0_2px_10px_rgba(246,168,183,0.18)] border border-[#F6A8B7]/28 text-[10.5px] font-medium text-[#252525] text-center">
            <span className="line-clamp-2 leading-[1.35] break-words">{noteContent}</span>
          </div>
          <div className="w-2 h-2 bg-white/95 border-b border-r border-[#F6A8B7]/28 rotate-45 -mt-1 mx-auto" />
        </motion.div>
      </div>

      {/* Avatar */}
      <div className="relative w-[60px] h-[60px]">
        <Avatar className="w-[60px] h-[60px] ring-[2.5px] ring-[#F6A8B7] ring-offset-[2px] ring-offset-transparent">
          {photoUrl && <AvatarImage src={photoUrl} className="object-cover" />}
          <AvatarFallback className="bg-[#F6A8B7]/20 text-[#252525] font-bold text-base">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
      </div>
      <span className="text-[10.5px] font-medium text-[#252525] mt-1.5 text-center w-full truncate">
        {displayName}
      </span>
    </button>
  );
}
