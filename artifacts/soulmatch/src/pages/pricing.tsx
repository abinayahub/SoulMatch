import { motion } from "framer-motion";
import { Link } from "wouter";
import { Heart, Check, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPlans } from "@workspace/api-client-react";

export default function PricingPage() {
  const { data: plans = [], isLoading } = useGetPlans({ query: { enabled: true } } as any);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><span className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center"><Heart className="w-4 h-4 text-white" /></div>
            <span className="font-bold gradient-text">SoulMatch AI</span>
          </span></Link>
          <div className="flex gap-3">
            <Link href="/login"><Button variant="ghost" className="text-muted-foreground">Login</Button></Link>
            <Link href="/register"><Button className="gradient-primary border-0 text-white">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Crown className="w-10 h-10 text-accent mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-3">Simple, <span className="gradient-text">Transparent</span> Pricing</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Invest in finding the one. Cancel anytime.</p>
        </motion.div>

        {isLoading ? (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl bg-white/5" />)}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {(plans as any[]).map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass rounded-2xl p-6 relative ${plan.isPopular ? "border-primary/50 glow-primary" : ""}`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gradient-primary border-0 text-white px-4">Most Popular</Badge>
                  </div>
                )}
                <h3 className="font-bold text-xl mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold gradient-text">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features?.map((f: string) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button className={`w-full ${plan.isPopular ? "gradient-primary border-0 text-white" : "bg-white/10 hover:bg-white/15"}`}>
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
