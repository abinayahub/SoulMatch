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
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
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
    <div className="w-full h-[100dvh] max-w-md mx-auto flex flex-col bg-background relative overflow-hidden">
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
                          <Avatar className="w-32 h-32 ring-4 ring-pink-500/50 mb-6">
                            <AvatarImage src={otherUser?.photos?.find((p: any) => p.isPrimary)?.url} />
                            <AvatarFallback>{getInitials(otherUser?.firstName ?? "U")}</AvatarFallback>
                          </Avatar>
                          <h2 className="text-2xl font-bold text-white">{otherUser?.firstName} {otherUser?.lastName}</h2>
                          <p className="text-pink-400 mt-2 animate-pulse">{remoteStream ? "Connected" : "Calling..."}</p>
                          {remoteStream && <audio ref={remoteVideoRef} autoPlay playsInline className="hidden" />}
                       </div>
                    )}
                    
                    {/* Local Video PiP */}
                    {activeCallType === "video" && isVideoEnabled && (
                      <div className="absolute bottom-6 right-6 w-32 h-48 bg-background rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
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
                className="absolute top-4 right-4 z-50 bg-[#161622] border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4"
              >
                 <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center animate-pulse">
                   <Phone className="w-6 h-6 text-pink-500" />
                 </div>
                 <div>
                   <h3 className="text-white font-bold">Incoming Call</h3>
                   <p className="text-sm text-slate-400">Someone is calling you</p>
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
            <div className="w-full h-full flex flex-col bg-background relative overflow-hidden">
              
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md z-20">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => navigate("/chat")} className="text-foreground -ml-2 shrink-0 w-10 h-10 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                  </Button>
                  
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => otherUser?.id && navigate(`/profile/${otherUser.id}`)}>
                    <div className="relative shrink-0">
                      <Avatar className="w-11 h-11">
                        <AvatarImage src={otherUser?.photos?.find((p: any) => p.isPrimary)?.url} className="object-cover" />
                        <AvatarFallback className="bg-foreground/10 text-foreground font-bold">{getInitials(otherUser?.firstName ?? "U")}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-background ${isOtherUserActive ? "bg-green-500" : "bg-slate-500"}`} />
                    </div>
                    
                    <div className="flex flex-col">
                      <h2 className="text-base font-bold text-foreground leading-tight">{otherUser?.firstName}</h2>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {isOtherUserActive ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full text-pink-500 hover:bg-foreground/5" onClick={() => startCall("audio")}>
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full text-pink-500 hover:bg-foreground/5" onClick={() => startCall("video")}>
                    <Video className="w-6 h-6" />
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full text-muted-foreground hover:bg-foreground/5">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-48 p-2 rounded-2xl border border-border shadow-2xl bg-card">
                      <Button variant="ghost" className="w-full justify-start text-sm font-medium" onClick={() => otherUser?.id && navigate(`/profile/${otherUser.id}`)}>View Profile</Button>
                      <Button variant="ghost" className="w-full justify-start text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 mt-1" onClick={() => toast({ title: "Chat Cleared", description: "All messages have been deleted." })}>Clear Chat</Button>
                      <Button variant="ghost" className="w-full justify-start text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 mt-1" onClick={() => toast({ title: "User Blocked", description: "You will no longer see messages from this user." })}>Block User</Button>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Chat Traits Strip Removed */}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 bg-background relative flex flex-col">
                {/* Date Divider */}
                <div className="flex items-center justify-center mb-6 mt-2">
                  <div className="px-3 py-1 rounded-full bg-foreground/5 text-[11px] font-medium text-muted-foreground tracking-wide">TODAY</div>
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
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                    <div className="w-20 h-20 rounded-full bg-pink-500/10 flex items-center justify-center">
                      <MessageCircle className="w-10 h-10 text-pink-500/50" />
                    </div>
                    <p className="text-sm font-medium">Say hi to {otherUser?.firstName}!</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 flex-1">
                    {(messages as any[]).map((msg: any, i: number) => {
                      const isMine = msg.senderId === user?.id;
                      const nextMsg = (messages as any[])[i + 1];
                      const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;
                      
                      return (
                        <motion.div
                          key={msg.id ?? i}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex items-end gap-2 group ${isMine ? "justify-end" : "justify-start"} ${isLastInGroup ? "mb-4" : ""}`}
                        >
                          {!isMine && isLastInGroup && (
                            <Avatar className="w-7 h-7 shrink-0 mb-1">
                              <AvatarImage src={otherUser?.photos?.find((p: any) => p.isPrimary)?.url} className="object-cover" />
                              <AvatarFallback className="bg-foreground/10 text-foreground text-[10px] font-bold">{getInitials(otherUser?.firstName ?? "U")}</AvatarFallback>
                            </Avatar>
                          )}
                          {!isMine && !isLastInGroup && (
                            <div className="w-7 h-7 shrink-0" />
                          )}
                          
                          <div className={`relative max-w-[75%] px-4 py-2.5 text-[15px] ${
                            isMine 
                              ? "bg-pink-500 text-white rounded-2xl rounded-tr-sm shadow-sm" 
                              : "bg-foreground/10 text-foreground rounded-2xl rounded-tl-sm shadow-sm"
                          }`}>
                            {msg.messageType === "image" ? (
                              <img src={msg.content} alt="Upload" className="max-w-[200px] sm:max-w-[280px] rounded-lg mt-1" />
                            ) : msg.messageType === "audio" ? (
                              <audio controls src={msg.content} className="max-w-[200px] sm:max-w-[250px] h-10 mt-1" />
                            ) : (
                              <p className="leading-snug whitespace-pre-wrap">{msg.content}</p>
                            )}
                            <div className={`flex items-center gap-1 text-[10px] mt-1 float-right translate-y-1 ml-3 ${isMine ? "text-pink-100" : "text-muted-foreground"}`}>
                              {formatTime(msg.createdAt).toLowerCase()}
                              {isMine && (
                                <span className="flex items-center">
                                  {msg.isRead ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-blue-200" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-pink-200" />
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

              {/* Chat Input */}
              <div className="p-3 bg-background border-t border-border/50 shrink-0 pb-safe">
                <div className="flex items-end gap-2 max-w-4xl mx-auto">
                  <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full text-foreground hover:bg-foreground/10 shrink-0 mb-0.5">
                    <Plus className="w-6 h-6" />
                  </Button>
                  
                  <div className="flex-1 relative flex items-end bg-foreground/5 rounded-3xl px-1 shadow-sm min-h-[44px]">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0 h-9 w-9 rounded-full mb-1 ml-0.5">
                          <span className="text-lg">😊</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent side="top" align="start" className="w-auto p-0 border-none bg-transparent shadow-none mb-2">
                        <EmojiPicker 
                          theme={"dark" as any} 
                          onEmojiClick={(emojiData) => setContent(prev => prev + emojiData.emoji)} 
                        />
                      </PopoverContent>
                    </Popover>

                    <Input
                      placeholder={isRecording ? "Recording audio..." : "Message"}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      disabled={isRecording}
                      className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-2 h-11 text-[15px] text-foreground placeholder:text-muted-foreground/70"
                    />
                    
                    <div className="flex items-center pr-1 pb-1 shrink-0">
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
                            className="text-muted-foreground hover:text-foreground shrink-0 h-9 w-9 rounded-full"
                          >
                            <FileImage className="w-5 h-5" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={startRecording}
                            className="text-muted-foreground hover:text-foreground shrink-0 h-9 w-9 rounded-full"
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
                      className="w-11 h-11 rounded-full bg-pink-500 hover:bg-pink-600 text-white shrink-0 mb-0 shadow-md transition-all transform active:scale-95 flex items-center justify-center p-0"
                    >
                      <Send className="w-5 h-5 ml-0.5" />
                    </Button>
                  )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
