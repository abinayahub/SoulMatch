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
} from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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
  interest: "text-primary bg-primary/10",
  match: "text-accent bg-accent/10",
  message: "text-blue-400 bg-blue-500/10",
  journey: "text-green-400 bg-green-500/10",
  system: "text-muted-foreground bg-white/10",
  verification: "text-yellow-400 bg-yellow-500/10",
  subscription: "text-purple-400 bg-purple-500/10",
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetNotifications(
    { page: 1 },
    { query: { enabled: true }, request: { headers: authHeaders() } } as any,
  );

  const markAll = useMarkAllNotificationsRead({ request: { headers: authHeaders() } });
  const markOne = useMarkNotificationRead({ request: { headers: authHeaders() } });

  const notifications = (data as any)?.notifications ?? [];
  const unreadCount = (data as any)?.unreadCount ?? 0;

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetUnreadCountQueryKey() });
  }

  function handleMarkAll() {
    markAll.mutate(undefined as any, {
      onSuccess: () => { toast({ title: "All marked as read" }); invalidate(); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  }

  function handleMarkOne(id: number) {
    markOne.mutate(
      { notificationId: id },
      { onSuccess: invalidate },
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bell className="w-7 h-7 text-primary" />Notifications
            </h1>
            {unreadCount > 0 && <p className="text-muted-foreground text-sm mt-0.5">{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAll} className="border-white/20 bg-white/5 gap-2" disabled={markAll.isPending}>
              <Check className="w-4 h-4" />Mark all read
            </Button>
          )}
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl bg-white/5" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold">No notifications yet</p>
            <p className="text-sm mt-1">We'll notify you about matches, interests, and messages.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n: any, i: number) => {
              const Icon = typeIcons[n.type] ?? Bell;
              const iconClass = typeColors[n.type] ?? "text-muted-foreground bg-white/10";
              const actorPhoto = n.actor?.photos?.find((p: any) => p.isPrimary) ?? n.actor?.photos?.[0];

              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => !n.isRead && handleMarkOne(n.id)}
                  className={`glass rounded-2xl p-4 flex items-start gap-4 cursor-pointer transition-all ${
                    !n.isRead ? "border border-primary/20 bg-primary/3" : "hover:bg-white/5"
                  }`}
                >
                  {n.actor ? (
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarImage src={actorPhoto?.url} />
                      <AvatarFallback className="gradient-primary text-white text-xs font-semibold">
                        {getInitials(n.actor.firstName ?? "U")}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{n.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
