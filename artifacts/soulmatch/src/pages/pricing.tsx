import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Heart, Check, Crown, ArrowRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPlans, useCreateCheckout } from "@workspace/api-client-react";
import { useAuth, getAccessToken } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

export default function PricingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { data: plans = [], isLoading } = useGetPlans({ query: { enabled: true } } as any);
  const checkout = useCreateCheckout({ request: { headers: authHeaders() } });

  function handleSubscribe(planId: string) {
    if (!user) {
      navigate('/login');
      return;
    }
    checkout.mutate(
      { data: { planId, successUrl: `${window.location.origin}/subscription?success=true`, cancelUrl: `${window.location.origin}/pricing` } },
      {
        onSuccess: (data: any) => {
          if (data.url) window.location.href = data.url;
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  }

  return (
    <div className="min-h-screen bg-background relative pb-20">
      <div className="max-w-md mx-auto px-5 py-6 relative z-10">
        
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground hover:bg-foreground/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center">
               <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-foreground tracking-tight text-lg">SoulMatch</span>
          </div>
          <div className="w-10 h-10" /> {/* Spacer for centering */}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-accent/10 mx-auto flex items-center justify-center mb-4">
             <Crown className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-[28px] font-extrabold mb-3 leading-tight text-foreground">Upgrade to <span className="text-primary">Premium</span></h1>
          <p className="text-muted-foreground text-[15px] max-w-[280px] mx-auto font-medium">Invest in finding the one. Cancel anytime.</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-[32px] bg-foreground/5 w-full" />)}
          </div>
        ) : (
          <div className="space-y-5">
            {(plans as any[]).map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-card border shadow-sm rounded-[32px] p-7 relative ${plan.isPopular ? "border-primary/50 shadow-lg shadow-primary/10" : "border-border"}`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-md border-0 text-white px-4 py-1 font-bold text-[11px] uppercase tracking-wider rounded-full">Most Popular</Badge>
                  </div>
                )}
                <h3 className="font-extrabold text-[22px] mb-2 text-foreground text-center">{plan.name}</h3>
                <div className="mb-6 text-center">
                  <span className="text-[40px] font-extrabold text-primary tracking-tight">${plan.price}</span>
                  <span className="text-muted-foreground font-bold ml-1 text-[15px]">/{plan.interval}</span>
                </div>
                <div className="space-y-3.5 mb-8">
                  {plan.features?.map((f: string) => (
                    <div key={f} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                         <Check className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-[14px] font-medium text-foreground leading-snug">{f}</span>
                    </div>
                  ))}
                </div>
                {user ? (
                  <Button 
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={checkout.isPending || user?.isPremium}
                    className={`w-full h-14 rounded-2xl font-bold text-[16px] transition-all ${plan.isPopular ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 border-0 text-white" : "bg-foreground/5 hover:bg-foreground/10 text-foreground"}`}
                  >
                    {user?.isPremium ? "Already Subscribed" : "Subscribe Now"} {(!user?.isPremium) && <ArrowRight className="w-5 h-5 ml-2" />}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => navigate('/register')}
                    className={`w-full h-14 rounded-2xl font-bold text-[16px] transition-all ${plan.isPopular ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 border-0 text-white" : "bg-foreground/5 hover:bg-foreground/10 text-foreground"}`}
                  >
                    Get Started <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
