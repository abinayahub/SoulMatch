import { motion } from "framer-motion";
import { Crown, Check, Sparkles, Coins, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  useGetPlans, useGetCurrentSubscription, useGetRewards,
  useCancelSubscription, useCreateCheckout,
  getGetCurrentSubscriptionQueryKey,
} from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading: loadingPlans } = useGetPlans({ query: { enabled: true } } as any);

  const { data: currentSub } = useGetCurrentSubscription({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const { data: rewards } = useGetRewards({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const checkout = useCreateCheckout({ request: { headers: authHeaders() } });
  const cancel = useCancelSubscription({ request: { headers: authHeaders() } });

  function handleSubscribe(planId: string) {
    checkout.mutate(
      { data: { planId, successUrl: `${window.location.origin}/subscription?success=true`, cancelUrl: `${window.location.origin}/subscription` } },
      {
        onSuccess: (data: any) => {
          if (data.url) window.location.href = data.url;
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  }

  function handleCancel() {
    cancel.mutate(undefined as any, {
      onSuccess: () => {
        toast({ title: "Subscription cancelled", description: "You'll retain access until the end of your billing period." });
        queryClient.invalidateQueries({ queryKey: getGetCurrentSubscriptionQueryKey() });
      },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  }

  const tierColors: Record<string, string> = {
    bronze: "text-orange-400", silver: "text-gray-400",
    gold: "text-yellow-400", platinum: "text-cyan-400",
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
            <Crown className="w-7 h-7 text-accent" />Subscription
          </h1>
          <p className="text-muted-foreground">Manage your plan and rewards.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Current plan & rewards */}
          <div className="space-y-4">
            {/* Current plan */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5">
              <h2 className="font-semibold mb-3">Current Plan</h2>
              {currentSub ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-accent" />
                    <span className="font-bold text-lg">{(currentSub as any).plan?.name}</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">{(currentSub as any).status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Renews {(currentSub as any).currentPeriodEnd ? formatDate((currentSub as any).currentPeriodEnd) : "—"}</p>
                  {!(currentSub as any).cancelAtPeriodEnd && (
                    <Button variant="outline" size="sm" onClick={handleCancel} className="w-full mt-3 border-red-500/30 text-red-400 hover:bg-red-500/10" disabled={cancel.isPending}>
                      Cancel Subscription
                    </Button>
                  )}
                  {(currentSub as any).cancelAtPeriodEnd && (
                    <p className="text-xs text-yellow-400 mt-2">Cancels at period end</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">You're on the free plan.</p>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {["Limited profile views", "10 interests/day", "No chat access"].map((f) => (
                      <div key={f} className="flex items-center gap-2"><X className="w-3.5 h-3.5 text-red-400" />{f}</div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Rewards */}
            {rewards && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-5">
                <h2 className="font-semibold mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" />Rewards</h2>
                <div className="text-3xl font-bold gradient-text mb-1">{(rewards as any).coins ?? 0}</div>
                <p className="text-xs text-muted-foreground mb-2">SoulCoins</p>
                <div className={`text-sm font-semibold ${tierColors[(rewards as any).tier ?? "bronze"]}`}>
                  {((rewards as any).tier ?? "bronze").toUpperCase()} Tier
                </div>
                <div className="mt-3 text-xs text-muted-foreground space-y-1">
                  {((rewards as any).recentTransactions ?? []).slice(0, 3).map((t: any) => (
                    <div key={t.id} className="flex justify-between">
                      <span className="truncate">{t.description}</span>
                      <span className={t.type === "earned" ? "text-green-400" : "text-red-400"}>
                        {t.type === "earned" ? "+" : "-"}{t.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Plans */}
          <div className="md:col-span-2">
            <h2 className="font-semibold mb-4">Available Plans</h2>
            {loadingPlans ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl bg-white/5" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {(plans as any[]).map((plan, i) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`glass rounded-2xl p-5 relative ${plan.isPopular ? "border-primary/40" : ""}`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-5">
                        <Badge className="gradient-primary border-0 text-white text-xs px-3">Most Popular</Badge>
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-2xl font-bold gradient-text">${plan.price}</span>
                          <span className="text-muted-foreground text-sm">/{plan.interval}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSubscribe(plan.id)}
                        className={plan.isPopular ? "gradient-primary border-0 text-white" : "bg-white/10 hover:bg-white/15"}
                        disabled={checkout.isPending || (currentSub as any)?.planId === plan.id}
                        size="sm"
                      >
                        {(currentSub as any)?.planId === plan.id ? "Current" : "Subscribe"}
                        {(currentSub as any)?.planId !== plan.id && <ChevronRight className="w-3.5 h-3.5 ml-1" />}
                      </Button>
                    </div>
                    <ul className="space-y-1.5">
                      {plan.features?.map((f: string) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
