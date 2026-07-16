import { motion } from "framer-motion";
import { Heart, Check, X, Clock, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { getInitials, timeAgo } from "@/lib/utils";
import { useLocation } from "wouter";
import {
  useGetInterests, useRespondToInterest, useWithdrawInterest, useGetInterestSummary,
  getGetInterestSummaryQueryKey, getGetInterestsQueryKey,
} from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

function InterestCard({ interest, type }: { interest: any; type: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const respond = useRespondToInterest({ request: { headers: authHeaders() } });
  const withdraw = useWithdrawInterest({ request: { headers: authHeaders() } });

  const otherUser = type === "sent" ? interest.toUser : interest.fromUser;
  if (!otherUser) return null;
  const photo = otherUser.photos?.find((p: any) => p.isPrimary) ?? otherUser.photos?.[0];

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getGetInterestsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetInterestSummaryQueryKey() });
  }

  function handleRespond(action: "accept" | "decline") {
    respond.mutate(
      { interestId: interest.id, data: { action } },
      {
        onSuccess: () => { toast({ title: action === "accept" ? "Interest accepted!" : "Declined" }); invalidate(); },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  }

  function handleWithdraw() {
    withdraw.mutate(
      { interestId: interest.id },
      {
        onSuccess: () => { toast({ title: "Interest withdrawn" }); invalidate(); },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    accepted: "bg-green-500/20 text-green-400 border-green-500/30",
    declined: "bg-red-500/20 text-red-400 border-red-500/30",
    withdrawn: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border shadow-md rounded-2xl rounded-2xl p-4 flex items-center gap-4"
    >
      <Avatar className="w-14 h-14 shrink-0 ring-2 ring-white/10 cursor-pointer" onClick={() => navigate(`/profile/${otherUser.id}`)}>
        <AvatarImage src={photo?.url} />
        <AvatarFallback className="bg-primary text-primary-foreground shadow-md text-white font-semibold">
          {getInitials(otherUser.firstName ?? "U")}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-semibold truncate cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(`/profile/${otherUser.id}`)}>
            {otherUser.firstName}
            {otherUser.age ? `, ${otherUser.age}` : ""}
          </h3>
          <Badge className={`text-xs border ${statusColors[interest.status] ?? ""} shrink-0`}>{interest.status}</Badge>
        </div>
        {otherUser.city && <p className="text-xs text-muted-foreground">{otherUser.city}</p>}
        {interest.message && <p className="text-sm text-muted-foreground mt-1 italic truncate">"{interest.message}"</p>}
        <p className="text-xs text-muted-foreground mt-1">{timeAgo(interest.createdAt)}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {type === "received" && interest.status === "pending" && (
          <>
            <Button size="sm" onClick={() => handleRespond("accept")} className="bg-primary text-primary-foreground shadow-md border-0 text-white px-3" disabled={respond.isPending}>
              <Check className="w-4 h-4 mr-1.5" /> Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleRespond("decline")} className="border-white/20 bg-card/5 px-3" disabled={respond.isPending}>
              <X className="w-4 h-4 mr-1.5" /> Decline
            </Button>
          </>
        )}
        {type === "sent" && interest.status === "pending" && (
          <Button size="sm" variant="outline" onClick={handleWithdraw} className="border-white/20 bg-card/5 text-xs" disabled={withdraw.isPending}>
            Withdraw
          </Button>
        )}
        {interest.status === "accepted" && (
          <Button size="sm" onClick={() => navigate("/chat")} className="bg-primary text-primary-foreground shadow-md border-0 text-white text-xs">
            Chat <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function InterestsPage() {
  const { data: summary } = useGetInterestSummary({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const { data: received = [], isLoading: loadingR } = useGetInterests(
    { type: "received" },
    { query: { enabled: true }, request: { headers: authHeaders() } } as any,
  );
  const { data: sent = [], isLoading: loadingS } = useGetInterests(
    { type: "sent" },
    { query: { enabled: true }, request: { headers: authHeaders() } } as any,
  );
  const { data: mutual = [], isLoading: loadingM } = useGetInterests(
    { type: "mutual" },
    { query: { enabled: true }, request: { headers: authHeaders() } } as any,
  );

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-6 -ml-4 text-muted-foreground hover:bg-card/5">
          <ChevronLeft className="w-4 h-4 mr-1" />Back
        </Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
            <Heart className="w-7 h-7 text-primary" />Interests
          </h1>
          <p className="text-muted-foreground">Manage your connections and mutual matches.</p>
        </motion.div>

        {/* Summary */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Pending", value: (summary as any)?.pendingReceived ?? 0, color: "text-yellow-400" },
            { label: "Mutual", value: (summary as any)?.mutualCount ?? 0, color: "text-primary" },
            { label: "Sent", value: (summary as any)?.totalSent ?? 0, color: "text-muted-foreground" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border shadow-md rounded-2xl rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </motion.div>

        <Tabs defaultValue="received">
          <TabsList className="w-full bg-card/5 mb-6">
            <TabsTrigger value="received" className="flex-1">
              Received {(summary as any)?.pendingReceived > 0 && <Badge className="ml-1.5 bg-primary text-white text-xs px-1.5 py-0 border-0">{(summary as any)?.pendingReceived}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex-1">Sent</TabsTrigger>
            <TabsTrigger value="mutual" className="flex-1">Mutual</TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            {loadingR ? <Skeleton className="h-24 rounded-2xl bg-card/5" /> :
              (received as any[]).length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No interests received yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(received as any[]).map((i) => <InterestCard key={i.id} interest={i} type="received" />)}
                </div>
              )}
          </TabsContent>

          <TabsContent value="sent">
            {loadingS ? <Skeleton className="h-24 rounded-2xl bg-card/5" /> :
              (sent as any[]).length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>You haven't sent any interests yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(sent as any[]).map((i) => <InterestCard key={i.id} interest={i} type="sent" />)}
                </div>
              )}
          </TabsContent>

          <TabsContent value="mutual">
            {loadingM ? <Skeleton className="h-24 rounded-2xl bg-card/5" /> :
              (mutual as any[]).length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No mutual matches yet — keep discovering!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(mutual as any[]).map((i) => <InterestCard key={i.id} interest={i} type="mutual" />)}
                </div>
              )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
