import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { MatchCard } from "@/components/MatchCard";
import { useToast } from "@/hooks/use-toast";
import { useGetInterests, useSendInterest } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useLocation } from "wouter";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

export default function MatchesPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: mutual = [], isLoading } = useGetInterests(
    { type: "mutual" },
    { query: { enabled: true }, request: { headers: authHeaders() } } as any,
  );

  const sendInterest = useSendInterest({ request: { headers: authHeaders() } });

  function handleSendInterest(userId: number) {
    sendInterest.mutate(
      { data: { toUserId: userId } },
      {
        onSuccess: () => toast({ title: "Interest sent!" }),
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
            <Heart className="w-7 h-7 text-primary" />Your Matches
          </h1>
          <p className="text-muted-foreground">People who have mutually expressed interest in you.</p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl bg-white/5" />)}
          </div>
        ) : (mutual as any[]).length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">No mutual matches yet</p>
            <p className="text-sm mt-1">Keep discovering and sending interests!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {(mutual as any[]).map((interest: any, i: number) => {
              const profile = interest.fromUser;
              if (!profile) return null;
              return (
                <motion.div key={interest.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <MatchCard
                    profile={profile}
                    onSendInterest={handleSendInterest}
                    onClick={(id) => navigate(`/profile/${id}`)}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
