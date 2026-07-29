import { API_URL } from '../config/api';
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Search, Send, MoreVertical, Heart, Lock, Crown, ArrowLeft, ChevronLeft, Check, CheckCheck, FileImage, Mic, Square, Phone, Video, PhoneOff, MicOff, CameraOff, Plus, SlidersHorizontal, Diamond, Trash2, CalendarDays, Gift, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";
import { useAuth } from "@/lib/auth-context";
import { getInitials, timeAgo, formatTime } from "@/lib/utils";
import { Link, useLocation, useRoute } from "wouter";
import { Peer } from "peerjs";
import { useGetConversations, useListMessages, useSendMessage, getListMessagesQueryKey, useGetCompatibility, useGetJourneyProgress } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

export default function ChatConversationPage() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [match, params] = useRoute("/chat/:id");
  const activeConversationId = match ? parseInt(params.id) : null;
  const isPremium = user?.isPremium ?? false;

  // Allow user to see the chat layout regardless of premium status
  const { data: conversations = [], isLoading: isLoadingChats } = useGetConversations({
    query: { enabled: true, refetchInterval: 3000 } as any,
    request: { headers: authHeaders() },
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const unreadConversationsCount = useMemo(() => {
    return (conversations as any[])?.filter(c => c.unreadCount > 0).length || 0;
  }, [conversations]);

  const { data: journeyProgress } = useGetJourneyProgress(
    { query: { enabled: true }, request: { headers: authHeaders() } } as any
  );
  
  const answeredQuestions = (journeyProgress as any)?.answeredQuestions || 0;
  const qDaysCompleted = Math.floor(answeredQuestions / 5);

  const filteredConversations = useMemo(() => {
    let result = [...(conversations as any[] || [])];
    
    // Sort by most recent message
    result.sort((a, b) => {
      const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    if (activeFilter === "Unread") {
      result = result.filter(c => c.unreadCount > 0);
    } else if (activeFilter === "Matches") {
      result = result.filter(c => !c.isGroup);
    } else if (activeFilter === "Favorites") {
      result = result.filter(c => c.isFavorite);
    } else if (activeFilter === "Groups") {
      result = result.filter(c => c.isGroup);
    }

    if (!searchQuery.trim()) return result;
    const lowerQuery = searchQuery.toLowerCase();
    return result.filter(conv => {
      const other = conv.participants?.[0];
      if (!other) return false;
      const name = `${other.firstName || ""} ${other.lastName || ""}`.toLowerCase();
      return name.includes(lowerQuery);
    });
  }, [conversations, searchQuery, activeFilter]);

  // Find the other participant in the active conversation
  const otherUser = useMemo(() => {
    if (!activeConversationId || !conversations) return null;
    const conv = (conversations as any[]).find((c) => c.id === activeConversationId);
    return conv?.participants?.[0] || null;
  }, [activeConversationId, conversations]);

  // Check active status
  const { data: activeUsersData } = useQuery({
    queryKey: ["/api/users/active"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/users/active`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      });
      return res.json();
    },
    refetchInterval: 30000,
  });
  
  const isOtherUserActive = useMemo(() => {
    if (!otherUser?.id || !activeUsersData?.users) return false;
    return activeUsersData.users.some((u: any) => u.id === otherUser.id);
  }, [otherUser?.id, activeUsersData]);

  const rawActiveUsers = activeUsersData?.users || [];
  const activeUsersList = rawActiveUsers.filter((u: any) => {
    if (user?.id && u.id === user.id) return false;
    if (!(user as any)?.gender || !u.gender) return true;
    const userGender = (user as any).gender.toLowerCase();
    const uGender = u.gender.toLowerCase();
    if (userGender === 'male') return uGender === 'female';
    if (userGender === 'female') return uGender === 'male';
    return true;
  });
  const totalActiveUsers = (activeUsersData?.total || 0) <= rawActiveUsers.length 
    ? activeUsersList.length 
    : Math.max(activeUsersList.length, Math.floor((activeUsersData?.total || 0) / 2));
  const remainingActiveUsers = Math.max(0, totalActiveUsers - activeUsersList.length);

  const { data: compatibilityData } = useGetCompatibility(otherUser?.id as number, {
    query: { enabled: !!otherUser?.id } as any,
    request: { headers: authHeaders() },
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Active Call State
  const [activeCallType, setActiveCallType] = useState<"audio" | "video" | null>(null);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  
  // PeerJS State
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerInstanceRef = useRef<any>(null);
  const currentCallRef = useRef<any>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream && activeCallType === "video") {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, activeCallType, isVideoEnabled]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, activeCallType]);

  useEffect(() => {
    if (!user?.id) return;
    const peer = new Peer(`soulmatch-user-${user.id}`);
    peer.on('open', (id) => console.log('Peer ID:', id));
    peer.on('call', (call) => setIncomingCall(call));
    peerInstanceRef.current = peer;
    return () => peer.destroy();
  }, [user?.id]);

  async function startCall(type: "audio" | "video", isAnswer: boolean = false, callToAnswer?: any) {
    setActiveCallType(type);
    setIsVideoEnabled(type === "video");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === "video" });
      setLocalStream(stream);
      setCallStartTime(Date.now());

      if (isAnswer && callToAnswer) {
        callToAnswer.answer(stream);
        currentCallRef.current = callToAnswer;
        callToAnswer.on('stream', (rStream: MediaStream) => setRemoteStream(rStream));
        callToAnswer.on('close', () => endCall());
        setIncomingCall(null);
      } else if (activeConversationId && otherUser?.id) {
        const call = peerInstanceRef.current.call(`soulmatch-user-${otherUser.id}`, stream);
        if (call) {
          currentCallRef.current = call;
          call.on('stream', (rStream: MediaStream) => setRemoteStream(rStream));
          call.on('close', () => endCall());
        }

        // Emit call invite to the other user via API (fallback/notification)
        await fetch(`${API_URL}/api/chat/conversations/${activeConversationId}/call`, {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ type })
        });
      }
    } catch(err) {
      toast({ title: "Permissions Error", description: "Could not access camera/microphone.", variant: "destructive" });
      setActiveCallType(null);
    }
  }

  function endCall() {
    if (callStartTime && activeCallType) {
      const durationMs = Date.now() - callStartTime;
      const mins = Math.floor(durationMs / 60000);
      const secs = Math.floor((durationMs % 60000) / 1000);
      const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      const msgType = activeCallType === "video" ? "Video" : "Audio";
      handleSend(`📞 ${msgType} Call ended (${formatted})`, "text");
    }
    setActiveCallType(null);
    setCallStartTime(null);
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      setLocalStream(null);
    }
    if (currentCallRef.current) {
      currentCallRef.current.close();
      currentCallRef.current = null;
    }
    setRemoteStream(null);
    setIncomingCall(null);
  }

  const { data: messages = [], isLoading: isLoadingMessages } = useListMessages(
    activeConversationId || 0,
    { limit: 50 },
    { query: { enabled: !!activeConversationId, refetchInterval: 3000 }, request: { headers: authHeaders() } } as any,
  );

  const sendMsg = useSendMessage({ request: { headers: authHeaders() } });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when viewing the conversation
  useEffect(() => {
    if (activeConversationId) {
      fetch(`${API_URL}/api/chat/conversations/${activeConversationId}/read`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      })
      .then(() => queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] }))
      .catch(err => console.error("Failed to mark as read", err));
    }
  }, [activeConversationId, messages.length, queryClient]);

  // Handle direct navigation to a chat with a specific user
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const targetUserId = searchParams.get("userId");
    
    if (targetUserId) {
      const targetId = Number(targetUserId);
      fetch(`${API_URL}/api/chat/direct`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: targetId })
      })
      .then(res => res.json())
      .then(newConv => {
        if (newConv && newConv.id) {
          queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
          navigate(`/chat/${newConv.id}`, { replace: true });
        }
      })
      .catch(err => console.error("Failed to create/get conversation", err));
    }
  }, [navigate, queryClient]);

  // Auto-Answer Flow
  useEffect(() => {
    if (activeConversationId) {
      const searchParams = new URLSearchParams(window.location.search);
      const action = searchParams.get("action");
      if (action === "answer_audio") {
        startCall("audio", true);
        window.history.replaceState({}, "", `/chat/${activeConversationId}`);
      } else if (action === "answer_video") {
        startCall("video", true);
        window.history.replaceState({}, "", `/chat/${activeConversationId}`);
      }
    }
  }, [activeConversationId]);

  function handleSend(overrideContent?: string, type: "text" | "image" | "emoji" | "audio" = "text") {
    const finalContent = overrideContent || content.trim();
    if (!finalContent || !activeConversationId) return;
    sendMsg.mutate(
      { conversationId: activeConversationId, data: { content: finalContent, messageType: type as any } },
      {
        onSuccess: () => {
          if (type === "text") setContent("");
          queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(activeConversationId) });
          queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  }

  function handleDeleteMessage(messageId: number) {
    if (!activeConversationId) return;
    fetch(`${API_URL}/api/chat/conversations/${activeConversationId}/messages/${messageId}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    .then(res => {
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(activeConversationId) });
        queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
      }
    })
    .catch(err => console.error("Failed to delete message", err));
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        const base64String = canvas.toDataURL("image/jpeg", 0.7);
        handleSend(base64String, "image");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      handleSend(base64String, "audio");
    };
    reader.readAsDataURL(file);
    
    if (audioInputRef.current) audioInputRef.current.value = "";
  };

  function startRecording() {
    // If not in a secure context (like testing on local IP) or mediaDevices missing, synchronously trigger the fallback
    if (!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (audioInputRef.current) audioInputRef.current.click();
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/mp4' });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            handleSend(base64String, "audio");
          };
          reader.readAsDataURL(audioBlob);
          
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      })
      .catch((err) => {
        toast({ title: "Microphone Access Denied", description: "Please allow microphone permissions.", variant: "destructive" });
      });
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  return (
    <div className="w-full h-[100dvh] max-w-md mx-auto flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 35%, #F4F1FF 70%, #FFFDFC 100%)' }}>
      <div className="flex flex-1 w-full relative overflow-hidden min-h-0">
          
          {/* Call Overlay */}
          <AnimatePresence>
            {activeCallType && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-50 bg-[#0a0a10] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              >
                 {/* Main Call View */}
                 <div className="flex-1 relative flex items-center justify-center bg-[#11111a]">
                    {activeCallType === "video" ? (
                       remoteStream ? (
                          <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                       ) : (
                          <img src={otherUser?.photos?.find((p: any) => p.isPrimary)?.url} className="absolute inset-0 w-full h-full object-cover blur-md opacity-30" />
                       )
                    ) : (
                       <div className="flex flex-col items-center">
                          <Avatar className="w-32 h-32 ring-4 ring-[#F6A8B7]/50 mb-6">
                            <AvatarImage src={otherUser?.photos?.find((p: any) => p.isPrimary)?.url} />
                            <AvatarFallback>{getInitials(otherUser?.firstName ?? "U")}</AvatarFallback>
                          </Avatar>
                          <h2 className="text-2xl font-bold text-white">{otherUser?.firstName} {otherUser?.lastName}</h2>
                          <p className="text-[#F6A8B7] mt-2 animate-pulse">{remoteStream ? "Connected" : "Calling..."}</p>
                          {remoteStream && <audio ref={remoteVideoRef} autoPlay playsInline className="hidden" />}
                       </div>
                    )}
                    
                    {/* Local Video PiP */}
                    {activeCallType === "video" && isVideoEnabled && (
                      <div className="absolute bottom-6 right-6 w-32 h-48 bg-transparent rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
                         <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                      </div>
                    )}
                 </div>

                 {/* Call Controls */}
                 <div className="h-24 bg-[#161622]/90 backdrop-blur flex items-center justify-center gap-6 border-t border-white/5 shrink-0">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => {
                        const newMuted = !isCallMuted;
                        setIsCallMuted(newMuted);
                        if (localStream) {
                          localStream.getAudioTracks().forEach(t => t.enabled = !newMuted);
                        }
                      }}
                      className={`w-14 h-14 rounded-full border-0 ${isCallMuted ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-card/10 text-white hover:bg-card/20"}`}
                    >
                      {isCallMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </Button>

                    {activeCallType === "video" && (
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => {
                          const newVideo = !isVideoEnabled;
                          setIsVideoEnabled(newVideo);
                          if (localStream) {
                            localStream.getVideoTracks().forEach(t => t.enabled = newVideo);
                          }
                        }}
                        className={`w-14 h-14 rounded-full border-0 ${!isVideoEnabled ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-card/10 text-white hover:bg-card/20"}`}
                      >
                        {!isVideoEnabled ? <CameraOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                      </Button>
                    )}

                    <Button 
                      variant="destructive" 
                      size="icon" 
                      onClick={endCall}
                      className="w-16 h-16 rounded-full shadow-lg shadow-red-500/20 hover:scale-105 transition-transform"
                    >
                      <PhoneOff className="w-8 h-8" />
                    </Button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Incoming Call Notification */}
          <AnimatePresence>
            {incomingCall && !activeCallType && (
              <motion.div 
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="absolute top-4 right-4 z-50 rounded-2xl p-4 shadow-2xl flex items-center gap-4 border border-white/35"
                style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
              >
                 <div className="w-12 h-12 rounded-full bg-[#F6A8B7]/25 flex items-center justify-center animate-pulse">
                   <Phone className="w-6 h-6 text-[#F6A8B7]" />
                 </div>
                 <div>
                   <h3 className="text-[#252525] font-bold">Incoming Call</h3>
                   <p className="text-sm text-[#777777]">Someone is calling you</p>
                 </div>
                 <div className="flex gap-2 ml-4">
                   <Button variant="destructive" size="icon" className="rounded-full shrink-0" onClick={() => { incomingCall.close(); setIncomingCall(null); }}>
                     <PhoneOff className="w-4 h-4" />
                   </Button>
                   <Button className="bg-green-500 hover:bg-green-600 rounded-full w-10 h-10 p-0 flex items-center justify-center shrink-0" onClick={() => startCall("video", true, incomingCall)}>
                     <Video className="w-4 h-4 text-white" />
                   </Button>
                   <Button className="bg-green-500 hover:bg-green-600 rounded-full w-10 h-10 p-0 flex items-center justify-center shrink-0" onClick={() => startCall("audio", true, incomingCall)}>
                     <Phone className="w-4 h-4 text-white" />
                   </Button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* View 2: Active Conversation */}
            <div className="w-full h-full flex flex-col bg-transparent relative overflow-hidden">
              
              {/* Chat Header — Premium Glass */}
              <div className="mx-3 mt-3 mb-2 px-3 py-2.5 flex items-center justify-between shrink-0 z-20 rounded-[24px] border border-white/35" style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', boxShadow: '0 4px 20px rgba(246,168,183,0.12)' }}>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => navigate("/chat")} className="text-[#252525] shrink-0 w-9 h-9 rounded-full hover:bg-white/40">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  
                  <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => otherUser?.id && navigate(`/profile/${otherUser.id}`)}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={otherUser?.photos?.find((p: any) => p.isPrimary)?.url} className="object-cover" />
                        <AvatarFallback className="bg-[#F6A8B7]/30 text-[#252525] font-bold">{getInitials(otherUser?.firstName ?? "U")}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${isOtherUserActive ? "bg-green-500" : "bg-slate-400"}`} />
                    </div>
                    
                    <div className="flex flex-col">
                      <h2 className="text-[clamp(14px,4.33vw,20px)] font-bold text-[#252525] leading-tight">{otherUser?.firstName}</h2>
                      <span className={`text-[clamp(9px,2.80vw,13px)] font-medium ${isOtherUserActive ? "text-green-500" : "text-[#8A8A8A]"}`}>
                        {isOtherUserActive ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-[#F6A8B7] hover:bg-[#F6A8B7]/10" onClick={() => startCall("audio")}>
                    <Phone className="w-4.5 h-4.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-[#F6A8B7] hover:bg-[#F6A8B7]/10" onClick={() => startCall("video")}>
                    <Video className="w-5 h-5" />
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-[#8A8A8A] hover:bg-white/40">
                        <MoreVertical className="w-4.5 h-4.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-48 p-2 rounded-2xl border border-white/35 shadow-2xl" style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)' }}>
                      <Button variant="ghost" className="w-full justify-start text-sm font-medium text-[#252525]" onClick={() => otherUser?.id && navigate(`/profile/${otherUser.id}`)}>View Profile</Button>
                      <Button variant="ghost" className="w-full justify-start text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 mt-1" onClick={() => toast({ title: "Chat Cleared", description: "All messages have been deleted." })}>Clear Chat</Button>
                      <Button variant="ghost" className="w-full justify-start text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 mt-1" onClick={() => toast({ title: "User Blocked", description: "You will no longer see messages from this user." })}>Block User</Button>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Chat Traits Strip Removed */}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 bg-transparent relative flex flex-col">
                {/* Glass Date Divider */}
                <div className="flex items-center justify-center mb-5 mt-1">
                  <div className="px-4 py-1 rounded-full text-[clamp(9px,2.80vw,13px)] font-medium text-[#8A8A8A] tracking-wider border border-white/30" style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>TODAY</div>
                </div>

                {isLoadingMessages ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                        <Skeleton className="h-12 w-48 rounded-2xl bg-foreground/5" />
                      </div>
                    ))}
                  </div>
                ) : (messages as any[]).length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center h-full space-y-5 px-6"
                  >
                    <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 8px 32px rgba(246,168,183,0.2)' }}>
                      <MessageCircle className="w-10 h-10 text-[#F6A8B7]" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-[clamp(15px,4.58vw,21px)] font-bold text-[#252525] mb-1">Start your conversation</h3>
                      <p className="text-[clamp(11px,3.31vw,15px)] text-[#8A8A8A] leading-relaxed">Meaningful conversations build stronger connections.</p>
                    </div>
                    <button
                      onClick={() => handleSend(`👋 Hey ${otherUser?.firstName}!`, 'text')}
                      className="px-6 py-2.5 rounded-full text-[clamp(12px,3.56vw,16px)] font-semibold text-[#252525] border border-white/40 active:scale-95 transition-transform"
                      style={{ background: 'linear-gradient(135deg, #F8C7C8, #F8D9D2, #F7E8EE)', boxShadow: '0 4px 16px rgba(246,168,183,0.3)' }}
                    >
                      Say Hello 👋
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-4 flex-1">
                    {(messages as any[]).map((msg: any, i: number) => {
                      const isMine = msg.senderId === user?.id;
                      const nextMsg = (messages as any[])[i + 1];
                      const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;
                      
                      return (
                        <motion.div
                          key={msg.id ?? i}
                          initial={{ opacity: 0, y: 10, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.25 }}
                          className={`flex items-end gap-2 group ${isMine ? "justify-end" : "justify-start"} ${isLastInGroup ? "mb-2" : ""}`}
                        >
                          {!isMine && isLastInGroup && (
                            <Avatar className="w-7 h-7 shrink-0 mb-1">
                              <AvatarImage src={otherUser?.photos?.find((p: any) => p.isPrimary)?.url} className="object-cover" />
                              <AvatarFallback className="bg-[#F6A8B7]/30 text-[#252525] text-[clamp(9px,2.54vw,12px)] font-bold">{getInitials(otherUser?.firstName ?? "U")}</AvatarFallback>
                            </Avatar>
                          )}
                          {!isMine && !isLastInGroup && (
                            <div className="w-7 h-7 shrink-0" />
                          )}
                          
                          <div
                            className={`relative max-w-[75%] px-4 py-2.5 text-[clamp(13px,3.82vw,17px)] rounded-[22px] ${
                              isMine
                                ? "rounded-tr-sm shadow-sm"
                                : "rounded-tl-sm"
                            }`}
                            style={isMine ? {
                              background: 'linear-gradient(135deg, #F8C7C8, #F8D9D2, #F7E8EE)',
                              boxShadow: '0 2px 12px rgba(246,168,183,0.25)',
                              color: '#252525'
                            } : {
                              background: 'rgba(255,255,255,0.55)',
                              border: '1px solid rgba(255,255,255,0.25)',
                              backdropFilter: 'blur(12px)',
                              WebkitBackdropFilter: 'blur(12px)',
                              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                              color: '#252525'
                            }}
                          >
                            {msg.messageType === "image" ? (
                              <img src={msg.content} alt="Upload" className="max-w-[clamp(170px,50.89vw,230px)] sm:max-w-[280px] rounded-lg mt-1" />
                            ) : msg.messageType === "audio" ? (
                              <audio controls src={msg.content} className="max-w-[clamp(170px,50.89vw,230px)] sm:max-w-[250px] h-10 mt-1" />
                            ) : (
                              <p className="leading-snug whitespace-pre-wrap">{msg.content}</p>
                            )}
                            <div className="flex items-center gap-1 text-[clamp(9px,2.80vw,13px)] mt-1 float-right translate-y-1 ml-3" style={{ color: '#8A8A8A' }}>
                              {formatTime(msg.createdAt).toLowerCase()}
                              {isMine && (
                                <span className="flex items-center">
                                  {msg.isRead ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-[#F6A8B7]" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-[#8A8A8A]" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={bottomRef} className="h-2" />
                  </div>
                )}
              </div>

              {/* Chat Input — Premium Floating Glass */}
              <div className="px-3 pt-2 bg-transparent shrink-0" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
                <div className="flex items-center gap-2 max-w-4xl mx-auto">
                  
                  <div className="flex-1 relative flex items-center min-h-[clamp(44px,13.23vw,60px)] px-2 rounded-[999px] border border-white/40" style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 2px 16px rgba(246,168,183,0.12)' }}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                      className={`shrink-0 h-9 w-9 rounded-full transition-colors ${showEmojiPicker ? 'bg-[#FF9F9F]/20 text-[#FF9F9F]' : 'text-[#F6A8B7] hover:text-[#F6A8B7]/80 hover:bg-[#FF9F9F]/10'}`}
                    >
                      <span className="text-lg">😊</span>
                    </Button>

                    <Input
                      placeholder={isRecording ? "Recording audio..." : "Message..."}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      disabled={isRecording}
                      className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-2 h-11 text-[clamp(13px,3.82vw,17px)] text-[#252525] placeholder:text-[#8A8A8A]/70"
                    />
                    
                    <div className="flex items-center pr-2 shrink-0">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                      />
                      <input 
                        type="file" 
                        accept="audio/*"
                        capture={"microphone" as any} 
                        className="hidden" 
                        ref={audioInputRef} 
                        onChange={handleAudioUpload} 
                      />
                      
                      {(!content.trim() && !isRecording) && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[#8A8A8A] hover:text-[#F6A8B7] shrink-0 h-9 w-9 rounded-full"
                          >
                            <FileImage className="w-5 h-5" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={startRecording}
                            className="text-[#8A8A8A] hover:text-[#F6A8B7] shrink-0 h-9 w-9 rounded-full"
                          >
                            <Mic className="w-5 h-5" />
                          </Button>
                        </>
                      )}

                      {isRecording && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={stopRecording}
                          className="text-red-500 hover:text-red-400 animate-pulse bg-red-500/10 shrink-0 h-9 w-9 rounded-full"
                        >
                          <Square className="w-4 h-4 fill-current" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {content.trim() && !isRecording && (
                    <Button
                      onClick={() => handleSend()}
                      disabled={sendMsg.isPending}
                      className="w-11 h-11 rounded-full shrink-0 shadow-md transition-all transform active:scale-90 flex items-center justify-center p-0 border border-white/40"
                      style={{ background: 'linear-gradient(135deg, #F6A8B7, #F8C7C8, #F8D9D2)', boxShadow: '0 4px 16px rgba(246,168,183,0.4)', color: '#252525' }}
                    >
                      <Send className="w-4.5 h-4.5" />
                    </Button>
                  )}
                </div>
                {showEmojiPicker && (
                  <div className="w-full mt-2 animate-in slide-in-from-bottom-2 bg-white/90 backdrop-blur-md rounded-t-[24px] overflow-hidden border-t border-white/40 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
                    <EmojiPicker 
                      theme={"light" as any} 
                      onEmojiClick={(emojiData) => setContent(prev => prev + emojiData.emoji)} 
                      width="100%"
                    />
                  </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
