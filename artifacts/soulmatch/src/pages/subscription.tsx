import { motion } from "framer-motion";
import { Crown, Check, ChevronRight, X, ChevronLeft, CreditCard, Sparkles } from "lucide-react";
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
    bronze: "text-orange-400 bg-orange-400/10 border-orange-400/20", 
    silver: "text-gray-400 bg-gray-400/10 border-gray-400/20",
    gold: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", 
    platinum: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative pb-28">
        <div className="max-w-md mx-auto px-5 py-6">
          
          <button onClick={() => window.history.back()} className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium mb-6 w-fit transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Settings
          </button>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-[28px] font-extrabold flex items-center gap-3 mb-1 text-foreground">
              <CreditCard className="w-7 h-7 text-primary" />Subscription
            </h1>
            <p className="text-muted-foreground font-medium text-[15px]">Manage your plan and rewards.</p>
          </motion.div>

          <div className="space-y-6">
            
            {/* Current plan */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border shadow-sm rounded-[32px] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                 <Crown className="w-24 h-24" />
              </div>
              <h2 className="text-[13px] font-extrabold text-muted-foreground uppercase tracking-widest mb-4">Current Plan</h2>
              {currentSub ? (
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-6 h-6 text-accent" />
                    <span className="font-extrabold text-[22px] text-foreground">{(currentSub as any).plan?.name}</span>
                    <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 font-bold px-2.5 py-0.5 rounded-full ml-auto">{(currentSub as any).status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[14px] font-bold text-foreground/80 mb-6 bg-foreground/5 p-3 rounded-2xl">
                     <span className="w-2 h-2 rounded-full bg-green-500" />
                     Renews {(currentSub as any).currentPeriodEnd ? formatDate((currentSub as any).currentPeriodEnd) : "—"}
                  </div>
                  {!(currentSub as any).cancelAtPeriodEnd && (
                    <Button variant="outline" onClick={handleCancel} className="w-full h-12 rounded-2xl border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold" disabled={cancel.isPending}>
                      Cancel Subscription
                    </Button>
                  )}
                  {(currentSub as any).cancelAtPeriodEnd && (
                    <div className="flex items-center justify-center p-3 rounded-2xl bg-yellow-500/10 text-yellow-600 font-bold text-[13px]">
                       Cancels at period end
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-extrabold text-[22px] text-foreground">Free Plan</span>
                  </div>
                  <div className="space-y-3 mb-6 bg-foreground/5 p-4 rounded-2xl">
                    {["Limited profile views", "10 interests/day", "No chat access"].map((f) => (
                      <div key={f} className="flex items-center gap-3 text-[14px] font-medium text-foreground">
                         <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                           <X className="w-3 h-3 text-red-500" />
                         </div>
                         {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Rewards */}
            {rewards && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border shadow-sm rounded-[32px] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[13px] font-extrabold text-muted-foreground uppercase tracking-widest">Rewards</h2>
                  <div className={`px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${tierColors[(rewards as any).tier ?? "bronze"]}`}>
                    {((rewards as any).tier ?? "bronze")} Tier
                  </div>
                </div>
                <div className="flex items-end gap-2 mb-6">
                  <Sparkles className="w-8 h-8 text-primary mb-1" />
                  <span className="text-[40px] font-extrabold text-foreground leading-none">{(rewards as any).coins ?? 0}</span>
                  <span className="text-[14px] font-bold text-muted-foreground mb-1">SoulCoins</span>
                </div>
                
                <h3 className="text-[12px] font-bold text-foreground mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  {((rewards as any).recentTransactions ?? []).slice(0, 3).map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-foreground/5 rounded-2xl">
                      <span className="text-[13px] font-medium text-foreground truncate mr-4">{t.description}</span>
                      <span className={`text-[14px] font-extrabold shrink-0 ${t.type === "earned" ? "text-green-500" : "text-red-500"}`}>
                        {t.type === "earned" ? "+" : "-"}{t.amount}
                      </span>
                    </div>
                  ))}
                  {((rewards as any).recentTransactions ?? []).length === 0 && (
                     <p className="text-[13px] text-muted-foreground italic p-2">No recent activity.</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Available Plans */}
            <div>
              <h2 className="text-[18px] font-extrabold text-foreground mb-4 pl-1">Available Plans</h2>
              {loadingPlans ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-[32px] bg-foreground/5" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {(plans as any[]).map((plan, i) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (i * 0.1) }}
                      className={`bg-card border shadow-sm rounded-[32px] p-6 relative ${plan.isPopular ? "border-primary/50" : "border-border"}`}
                    >
                      {plan.isPopular && (
                        <div className="absolute -top-3.5 left-6">
                          <Badge className="bg-primary text-primary-foreground shadow-md border-0 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full">Most Popular</Badge>
                        </div>
                      )}
                      
                      <div className="mb-5">
                         <h3 className="font-extrabold text-[20px] text-foreground mb-1">{plan.name}</h3>
                         <div className="flex items-baseline gap-1">
                           <span className="text-[28px] font-extrabold text-primary">${plan.price}</span>
                           <span className="text-muted-foreground font-bold text-[14px]">/{plan.interval}</span>
                         </div>
                      </div>

                      <div className="space-y-2.5 mb-6">
                        {plan.features?.map((f: string) => (
                          <div key={f} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                               <Check className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-[13px] font-medium text-foreground leading-snug">{f}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={() => handleSubscribe(plan.id)}
                        className={`w-full h-12 rounded-2xl font-bold text-[15px] transition-all ${(currentSub as any)?.planId === plan.id ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0" : plan.isPopular ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 border-0 text-white" : "bg-foreground/5 hover:bg-foreground/10 text-foreground"}`}
                        disabled={checkout.isPending || (currentSub as any)?.planId === plan.id}
                      >
                        {(currentSub as any)?.planId === plan.id ? "Current Plan Active" : "Subscribe"}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
