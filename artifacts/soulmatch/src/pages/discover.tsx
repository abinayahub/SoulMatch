import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, SlidersHorizontal, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { MatchCard } from "@/components/MatchCard";
import { useToast } from "@/hooks/use-toast";
import { useGetMatches, useSendInterest } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useLocation } from "wouter";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

export default function DiscoverPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetMatches(
    { page, limit: 12 },
    { query: { enabled: true }, request: { headers: authHeaders() } } as any,
  );

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

  const matches = (data as any)?.matches ?? [];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-primary" />
            Discover Matches
          </h1>
          <p className="text-muted-foreground">AI-curated profiles ranked by compatibility with you.</p>
        </motion.div>

        {/* Filters bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-3 mb-8">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button variant="outline" className="border-white/20 bg-white/5 gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </Button>
          <Button onClick={() => navigate("/preferences")} variant="outline" className="border-white/20 bg-white/5">
            Preferences
          </Button>
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl bg-white/5" />)}
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">No matches found</p>
            <p className="text-sm mt-1">Try adjusting your preferences</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {matches.filter((m: any) => {
              if (!search) return true;
              const s = search.toLowerCase();
              return m.profile?.firstName?.toLowerCase().includes(s) || m.profile?.city?.toLowerCase().includes(s);
            }).map((m: any, i: number) => (
              <motion.div key={m.userId ?? i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <MatchCard
                  profile={m.profile}
                  compatibilityScore={m.compatibilityScore}
                  commonTraits={m.commonTraits}
                  aiInsight={m.aiInsight}
                  isNew={m.isNew}
                  onSendInterest={handleSendInterest}
                  onClick={(id) => navigate(`/profile/${id}`)}
                  loading={sendInterest.isPending}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {!isLoading && (data as any)?.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="border-white/20 bg-white/5">Previous</Button>
            <Button variant="outline" disabled={page >= (data as any).totalPages} onClick={() => setPage(p => p + 1)} className="border-white/20 bg-white/5">Next</Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
