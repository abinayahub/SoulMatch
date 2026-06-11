import { motion } from "framer-motion";
import { Brain, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "wouter";
import { useGetPersonalityProfile } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { formatDate } from "@/lib/utils";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

const traitColors = [
  "from-primary/60 to-primary",
  "from-purple-500/60 to-purple-500",
  "from-accent/60 to-accent",
  "from-green-500/60 to-green-500",
  "from-blue-500/60 to-blue-500",
];

export default function PersonalityPage() {
  const { data: profile, isLoading } = useGetPersonalityProfile({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const p = profile as any;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
            <Brain className="w-7 h-7 text-primary" />Personality Profile
          </h1>
          <p className="text-muted-foreground">AI-generated insights based on your 30-day journey answers.</p>
        </motion.div>

        {isLoading ? (
          <Skeleton className="h-96 rounded-2xl bg-white/5" />
        ) : !p || (!p.traits && !p.summary) ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-10 text-center">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold mb-2">Profile Not Generated Yet</h2>
            <p className="text-muted-foreground mb-6 text-sm max-w-sm mx-auto">
              Complete at least 10 journey questions to generate your AI personality profile.
            </p>
            <Link href="/journey">
              <Button className="gradient-primary border-0 text-white glow-primary">Start Journey</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {/* Summary */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 gradient-primary opacity-5" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">Your Personality Type</h2>
                </div>
                {p.dominantType && (
                  <div className="text-2xl font-bold gradient-text mb-3">{p.dominantType}</div>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed">{p.summary}</p>
                {p.generatedAt && (
                  <p className="text-xs text-muted-foreground mt-3">Generated {formatDate(p.generatedAt)}</p>
                )}
              </div>
            </motion.div>

            {/* Traits */}
            {p.traits && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
                <h2 className="font-semibold mb-5">Personality Traits</h2>
                <div className="space-y-4">
                  {(Array.isArray(p.traits) ? p.traits : JSON.parse(p.traits ?? "[]")).map((t: any, i: number) => (
                    <div key={t.trait ?? i}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">{t.trait}</span>
                        <span className="text-primary font-semibold">{t.score}%</span>
                      </div>
                      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${t.score}%` }}
                          transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
                          className={`h-full rounded-full bg-gradient-to-r ${traitColors[i % traitColors.length]}`}
                        />
                      </div>
                      {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Keywords */}
            {p.compatibilityKeywords?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
                <h2 className="font-semibold mb-4">Compatibility Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {p.compatibilityKeywords.map((kw: string) => (
                    <span key={kw} className="px-3 py-1.5 bg-primary/15 border border-primary/30 text-primary text-sm rounded-full font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="flex justify-center">
              <Button variant="outline" className="border-white/20 bg-white/5 gap-2">
                <RefreshCw className="w-4 h-4" />Regenerate Profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
