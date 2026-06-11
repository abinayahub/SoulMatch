import { motion } from "framer-motion";
import { MessageCircle, Lock, Crown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { getInitials, timeAgo } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useGetConversations } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

export default function ChatListPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const isPremium = user?.isPremium ?? false;

  const { data: conversations = [], isLoading } = useGetConversations({
    query: { enabled: isPremium } as any,
    request: { headers: authHeaders() },
  });

  if (!isPremium) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-10">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-5 glow-primary">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Chat is Premium</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Upgrade to Premium to unlock real-time chat with your matches, read receipts, and photo sharing.
            </p>
            <Link href="/subscription">
              <Button className="gradient-primary border-0 text-white glow-primary px-8">
                <Crown className="w-4 h-4 mr-2" />Upgrade to Premium
              </Button>
            </Link>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
            <MessageCircle className="w-7 h-7 text-primary" />Messages
          </h1>
          <p className="text-muted-foreground">Chat with your mutual matches.</p>
        </motion.div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search conversations..." className="pl-9 bg-white/5 border-white/10" />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl bg-white/5" />)}
          </div>
        ) : (conversations as any[]).length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold">No conversations yet</p>
            <p className="text-sm mt-1">Accept or receive an interest to start chatting</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(conversations as any[]).map((conv, i) => {
              const other = conv.participants?.[0];
              if (!other) return null;
              const photo = other.photos?.find((p: any) => p.isPrimary) ?? other.photos?.[0];
              return (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/chat/${conv.id}`)}
                  className="glass rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12 ring-2 ring-white/10">
                      <AvatarImage src={photo?.url} />
                      <AvatarFallback className="gradient-primary text-white font-semibold text-sm">
                        {getInitials(other.firstName ?? "U")}
                      </AvatarFallback>
                    </Avatar>
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-xs text-white font-bold">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-semibold text-sm truncate">{other.firstName}</h3>
                      {conv.lastMessage && <span className="text-xs text-muted-foreground">{timeAgo(conv.lastMessage.createdAt)}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.lastMessage?.content ?? "Start a conversation..."}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
