import { motion } from "framer-motion";
import { Link } from "wouter";
import { Heart, Sparkles, Bell, ChevronRight, Star, TrendingUp, MessageCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { MatchCard } from "@/components/MatchCard";
import { useAuth } from "@/lib/auth-context";
import { getInitials } from "@/lib/utils";
import { useGetDailyMatches, useGetJourneyProgress, useGetInterestSummary, useGetUnreadCount, useSendInterest } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: dailyMatches = [], isLoading: loadingMatches } = useGetDailyMatches({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const { data: journeyProgress } = useGetJourneyProgress({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const { data: interestSummary } = useGetInterestSummary({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const { data: unreadData } = useGetUnreadCount({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const sendInterest = useSendInterest({ request: { headers: authHeaders() } });

  function handleSendInterest(userId: number) {
    sendInterest.mutate(
      { data: { toUserId: userId, message: undefined } },
      {
        onSuccess: () => toast({ title: "Interest sent!" }),
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  }

  const stats = [
    { label: "Interests Received", value: interestSummary?.pendingReceived ?? 0, icon: Heart, color: "text-primary" },
    { label: "Mutual Matches", value: interestSummary?.mutualCount ?? 0, icon: Star, color: "text-accent" },
    { label: "Unread Messages", value: (unreadData as any)?.count ?? 0, icon: MessageCircle, color: "text-secondary-foreground" },
    { label: "Profile Views", value: 24, icon: Eye, color: "text-green-400" },
  ];

  const journeyPct = journeyProgress?.completionPercentage ?? 0;
  const journeyDay = journeyProgress?.currentDay ?? 0;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-1">
            Welcome back, <span className="gradient-text">{user?.firstName}</span>
          </h1>
          <p className="text-muted-foreground">
            {journeyDay === 0 ? "Start your journey to find meaningful connections." : `Day ${journeyDay} of your journey — ${30 - journeyDay} days remaining.`}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
              className="glass rounded-2xl p-4"
            >
              <div className={`${stat.color} mb-2`}><stat.icon className="w-5 h-5" /></div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main: Daily Matches */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Today's Matches
              </h2>
              <Link href="/discover">
                <Button variant="ghost" size="sm" className="text-primary">
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {loadingMatches ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl bg-white/5" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(dailyMatches as any[]).slice(0, 4).map((m: any, i: number) => (
                  <motion.div key={m.userId ?? i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <MatchCard
                      profile={m.profile}
                      compatibilityScore={m.compatibilityScore}
                      commonTraits={m.commonTraits}
                      aiInsight={m.aiInsight}
                      isNew={m.isNew}
                      onSendInterest={handleSendInterest}
                      onClick={(id) => window.location.href = `/profile/${id}`}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Journey Progress */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent" /> Your Journey</h3>
                <Link href="/journey"><Button variant="ghost" size="sm" className="text-xs text-primary h-auto py-1">Continue</Button></Link>
              </div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Day {journeyDay} of 30</span>
                <span className="font-semibold text-primary">{journeyPct}%</span>
              </div>
              <Progress value={journeyPct} className="h-2 bg-white/10" />
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                {journeyPct < 30
                  ? "Complete daily questions to unlock better matches and your personality profile."
                  : journeyPct < 70 ? "Halfway there! Your personality profile is taking shape."
                  : "Almost done! Your profile is ready to attract the best matches."}
              </p>
            </motion.div>

            {/* Profile Completeness */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Profile Strength</h3>
                <Link href="/profile"><Button variant="ghost" size="sm" className="text-xs text-primary h-auto py-1">Edit</Button></Link>
              </div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Completeness</span>
                <span className="font-semibold text-primary">{user?.profileCompleteness ?? 40}%</span>
              </div>
              <Progress value={user?.profileCompleteness ?? 40} className="h-2 bg-white/10" />
              <p className="text-xs text-muted-foreground mt-2">
                {(user?.profileCompleteness ?? 40) < 80 ? "Complete your profile to get 3x more matches." : "Great profile! You're attracting quality connections."}
              </p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-5">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { href: "/discover", label: "Discover Matches", icon: Sparkles },
                  { href: "/interests", label: "View Interests", icon: Heart },
                  { href: "/journey", label: "Daily Question", icon: TrendingUp },
                  { href: "/chat", label: "Open Messages", icon: MessageCircle },
                ].map((a) => (
                  <Link key={a.href} href={a.href}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                      <a.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{a.label}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Upgrade banner for non-premium */}
            {!user?.isPremium && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="glass rounded-2xl p-5 border border-accent/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5" />
                <div className="relative">
                  <Star className="w-6 h-6 text-accent mb-2" />
                  <h3 className="font-semibold mb-1">Upgrade to Premium</h3>
                  <p className="text-xs text-muted-foreground mb-3">Unlock AI matching, chat, and see who viewed you.</p>
                  <Link href="/subscription">
                    <Button size="sm" className="w-full gradient-primary border-0 text-white">View Plans</Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
