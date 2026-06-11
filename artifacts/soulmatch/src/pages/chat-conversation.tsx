import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { getInitials, timeAgo } from "@/lib/utils";
import { useLocation } from "wouter";
import { useListMessages, useSendMessage, getListMessagesQueryKey } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

interface Props { conversationId: string }

export default function ChatConversationPage({ conversationId }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const convId = parseInt(conversationId);

  const { data: messages = [], isLoading } = useListMessages(
    convId,
    { limit: 50 },
    { query: { enabled: !!convId }, request: { headers: authHeaders() } } as any,
  );

  const sendMsg = useSendMessage({ request: { headers: authHeaders() } });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const trimmed = content.trim();
    if (!trimmed) return;
    sendMsg.mutate(
      { conversationId: convId, data: { content: trimmed, messageType: "text" } },
      {
        onSuccess: () => {
          setContent("");
          queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(convId) });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-0 sm:px-4 py-0 sm:py-4 h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="glass rounded-none sm:rounded-2xl px-4 py-3 flex items-center gap-3 shrink-0 border-b border-white/5">
          <Button variant="ghost" size="icon" onClick={() => navigate("/chat")} className="text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-9 h-9">
            <AvatarFallback className="gradient-primary text-white text-sm font-semibold">C</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">Conversation</h2>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                  <Skeleton className="h-10 w-48 rounded-2xl bg-white/5" />
                </div>
              ))}
            </div>
          ) : (messages as any[]).length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            (messages as any[]).map((msg: any, i: number) => {
              const isMine = msg.senderId === user?.id;
              return (
                <motion.div
                  key={msg.id ?? i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMine ? "gradient-primary text-white rounded-br-sm" : "glass rounded-bl-sm"
                  }`}>
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMine ? "text-white/60" : "text-muted-foreground"}`}>
                      {timeAgo(msg.createdAt)}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="glass rounded-none sm:rounded-2xl px-4 py-3 flex items-center gap-3 shrink-0 border-t border-white/5">
          <Input
            placeholder="Type a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="bg-white/5 border-white/10 flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!content.trim() || sendMsg.isPending}
            className="gradient-primary border-0 text-white w-10 h-10 p-0 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
