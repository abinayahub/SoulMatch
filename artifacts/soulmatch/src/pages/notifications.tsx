import { motion } from "framer-motion";
import { Bell, Check, Heart, MessageCircle, Star, Shield, TrendingUp, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppLayout } from "@/components/layout/AppLayout";
import { timeAgo, getInitials } from "@/lib/utils";
import {
  useGetNotifications, useMarkAllNotificationsRead, useMarkNotificationRead,
  getGetNotificationsQueryKey, getGetUnreadCountQueryKey,
  useGetInterests, useRespondToInterest, getGetInterestsQueryKey, getGetInterestSummaryQueryKey,
} from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { HeartHandshake, X, ChevronLeft } from "lucide-react";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

const typeIcons: Record<string, any> = {
  interest: Heart, match: Star, message: MessageCircle,
  journey: TrendingUp, system: Bell, verification: Shield, subscription: Crown,
};
const typeColors: Record<string, string> = {
  interest: "text-[#F6A8B7]",
  match: "text-[#F6A8B7]",
  message: "text-[#F6A8B7]",
  journey: "text-[#F6A8B7]",
  system: "text-[#F6A8B7]",
  verification: "text-[#F6A8B7]",
  subscription: "text-[#F6A8B7]",
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data, isLoading } = useGetNotifications(
    { page: 1 },
    { query: { enabled: true }, request: { headers: authHeaders() } } as any,
  );

  const { data: interests = [] } = useGetInterests(
    { type: "received" },
    { query: { enabled: true }, request: { headers: authHeaders() } } as any,
  );

  const markAll = useMarkAllNotificationsRead({ request: { headers: authHeaders() } });
  const markOne = useMarkNotificationRead({ request: { headers: authHeaders() } });
  const respond = useRespondToInterest({ request: { headers: authHeaders() } });

  const notifications = (data as any)?.notifications ?? [];
  const unreadCount = (data as any)?.unreadCount ?? 0;

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetUnreadCountQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetInterestsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetInterestSummaryQueryKey() });
  }

  function handleMarkAll() {
    queryClient.setQueryData(getGetNotificationsQueryKey({ page: 1 }), (old: any) => {
      if (!old) return old;
      return {
        ...old,
        unreadCount: 0,
        notifications: old.notifications.map((n: any) => ({ ...n, isRead: true })),
      };
    });
    markAll.mutate(undefined as any, {
      onSuccess: () => { toast({ title: "All marked as read" }); invalidate(); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  }

  function handleMarkOne(id: number) {
    queryClient.setQueryData(getGetNotificationsQueryKey({ page: 1 }), (old: any) => {
      if (!old) return old;
      const alreadyRead = old.notifications.find((n: any) => n.id === id)?.isRead;
      if (alreadyRead) return old;
      return {
        ...old,
        unreadCount: Math.max(0, old.unreadCount - 1),
        notifications: old.notifications.map((n: any) => n.id === id ? { ...n, isRead: true } : n),
      };
    });
    markOne.mutate(
      { notificationId: id },
      { onSuccess: invalidate },
    );
  }

  function handleRespond(e: React.MouseEvent, interestId: number, action: "accept" | "decline") {
    e.stopPropagation();
    respond.mutate(
      { interestId, data: { action } },
      {
        onSuccess: () => { toast({ title: action === "accept" ? "Interest accepted!" : "Declined" }); invalidate(); },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen pb-28 font-sans relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 100%)' }}>
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, #F4F1FF 0%, transparent 50%), radial-gradient(circle at 100% 100%, #FFFDFC 0%, transparent 50%)' }} />
        <div className="w-full relative z-10 pt-4 max-w-md mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold flex items-center gap-3 text-[#252525]">
              <Bell className="w-7 h-7 text-[#F6A8B7]" />Notifications
            </h1>
            {unreadCount > 0 && <p className="text-[#707070] text-[14px] mt-1">{unreadCount} unread</p>}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-[24px] bg-white/20 backdrop-blur-md border border-white/20" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-[#707070]">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50 text-[#F6A8B7]" />
            <p className="font-bold text-[18px] text-[#252525]">No notifications yet</p>
            <p className="text-[14px] mt-2">We'll notify you about matches, interests, and messages.</p>
          </div>
        ) : (
          <div className="space-y-[18px]">
            {notifications.map((n: any, i: number) => {
              const Icon = typeIcons[n.type] ?? Bell;
              const iconClass = typeColors[n.type] ?? "text-[#F6A8B7]";
              const actorPhoto = n.actor?.photos?.find((p: any) => p.isPrimary) ?? n.actor?.photos?.[0];
              const pendingInterest = n.type === "interest" && n.actor ? (interests as any[]).find(int => int.fromUserId === n.actor.id && int.status === "pending") : null;

              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => {
                    if (!n.isRead) handleMarkOne(n.id);
                    if (n.type === "interest" && n.actor) {
                      navigate(`/profile/${n.actor.id}`);
                    } else if (n.actionUrl) {
                      navigate(n.actionUrl);
                    }
                  }}
                  className={`border transition-all flex items-start gap-4 p-[16px] rounded-[24px] cursor-pointer relative overflow-hidden`}
                  style={{
                    background: !n.isRead ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.48)',
                    backdropFilter: 'blur(28px)',
                    WebkitBackdropFilter: 'blur(28px)',
                    borderColor: !n.isRead ? 'rgba(246,168,183,0.5)' : 'rgba(255,255,255,0.35)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.08)'
                  }}
                >
                  {n.actor ? (
                    <Avatar className="w-12 h-12 shrink-0 border border-white/40 shadow-sm">
                      <AvatarImage src={actorPhoto?.url} />
                      <AvatarFallback className="bg-white/60 text-[#252525] text-[15px] font-bold">
                        {getInitials(n.actor.firstName ?? "U")}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-white/40 shadow-sm ${iconClass}`} style={{ background: 'rgba(255,255,255,0.6)' }}>
                      <Icon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[15px] text-[#252525] leading-tight pr-4">{n.title}</p>
                    <p className="text-[14px] text-[#707070] mt-1 leading-snug pr-2">{n.body}</p>
                    <p className="text-[12px] text-[#8A8A8A] mt-2 mb-2">{timeAgo(n.createdAt)}</p>
                    
                    {pendingInterest && (
                      <div className="flex items-center gap-3 mt-3 w-full">
                        <button onClick={(e) => handleRespond(e, pendingInterest.id, "accept")} disabled={respond.isPending} className="flex-1 py-[10px] rounded-full text-[14px] font-bold text-white gradient-coral-pill transition-transform active:scale-[0.98] border border-white/40 disabled:opacity-50 flex items-center justify-center gap-1.5" >
                          <Check className="w-4 h-4" /> Accept
                        </button>
                        <button onClick={(e) => handleRespond(e, pendingInterest.id, "decline")} disabled={respond.isPending} className="flex-1 py-[10px] rounded-full text-[14px] font-bold text-[#707070] transition-transform active:scale-[0.98] border border-white/40 disabled:opacity-50 flex items-center justify-center gap-1.5" style={{ background: 'rgba(255,255,255,0.5)' }}>
                          <X className="w-4 h-4" /> Decline
                        </button>
                      </div>
                    )}
                  </div>
                  {!n.isRead && <div className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ background: '#F6A8B7', boxShadow: '0 0 8px rgba(246,168,183,0.6)' }} />}
                </motion.div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </AppLayout>
  );
}
