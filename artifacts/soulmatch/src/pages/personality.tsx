import { useMemo } from "react";
import { motion } from "framer-motion";
import { Brain, RefreshCw, Sparkles, TrendingUp, Compass, Target, ArrowRight, ShieldCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link, useLocation } from "wouter";
import { useGetPersonalityProfile, useGetJourneyProgress } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { formatDate } from "@/lib/utils";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

const traitColors = [
  "from-pink-500 to-purple-500",
  "from-purple-500 to-indigo-500",
  "from-indigo-500 to-blue-500",
  "from-blue-500 to-cyan-500",
  "from-cyan-500 to-teal-500",
];

export default function PersonalityPage() {
  const [, navigate] = useLocation();
  const { data: profile, isLoading } = useGetPersonalityProfile({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const { data: journeyProgress } = useGetJourneyProgress({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const p = profile as any;

  const displayScores = useMemo(() => {
    if (!p) return {};
    const qScores = (journeyProgress as any)?.categoryScores || p.questionnaireCategoryScores || {};
    const sScores = p.storyCategoryScores || {};
    
    const cats = Array.from(new Set([...Object.keys(qScores), ...Object.keys(sScores)]));
    if (cats.length === 0 && p.finalUnifiedCategoryScores) {
      return p.finalUnifiedCategoryScores;
    }

    const raw: Record<string, number> = {};
    cats.forEach(c => {
       const q = Number(qScores[c]) || 0;
       const s = Number(sScores[c]) || 0;
       if (q > 0 && s > 0) raw[c] = (q * 0.6) + (s * 0.4);
       else if (q > 0) raw[c] = q;
       else if (s > 0) raw[c] = s;
    });
    
    const max = Math.max(...(Object.values(raw) as number[]), 1);
    const normalized: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw)) {
       normalized[k] = Math.round(((v as number) / max) * 100);
    }
    return normalized;
  }, [p, journeyProgress]);

  // Derive Insights from Behavioral Traits
  const insights = useMemo(() => {
    if (!p || !p.behavioralTraits) return [];
    const b = typeof p.behavioralTraits === "string" ? JSON.parse(p.behavioralTraits) : p.behavioralTraits;
    const entries = Object.entries(b) as [string, number][];
    if (entries.length === 0) return [];
    
    const sorted = entries.sort(([, a], [, b]) => b - a);
    const maxScore = sorted[0][1];
    
    const results = [];
    // Top Strength
    if (sorted.length > 0) {
      results.push({
        title: "Top Strength",
        trait: sorted[0][0],
        percentage: Math.round((sorted[0][1] / maxScore) * 100),
        icon: <TrendingUp className="w-5 h-5 text-green-400" />,
        color: "from-green-500/20 to-emerald-500/10",
        borderColor: "border-green-500/30"
      });
    }
    
    // Communication / Relationship Style (middle trait)
    if (sorted.length > 1) {
      const mid = Math.floor(sorted.length / 2);
      results.push({
        title: "Communication Style",
        trait: sorted[mid][0],
        percentage: Math.round((sorted[mid][1] / maxScore) * 100),
        icon: <Brain className="w-5 h-5 text-purple-400" />,
        color: "from-purple-500/20 to-fuchsia-500/10",
        borderColor: "border-purple-500/30"
      });
    }
    
    // Growth Opportunity (lowest trait)
    if (sorted.length > 2) {
      results.push({
        title: "Growth Opportunity",
        trait: sorted[sorted.length - 1][0],
        percentage: Math.round((sorted[sorted.length - 1][1] / maxScore) * 100),
        icon: <Target className="w-5 h-5 text-orange-400" />,
        color: "from-orange-500/20 to-amber-500/10",
        borderColor: "border-orange-500/30"
      });
    }
    
    return results;
  }, [p]);

  const profileCompletion = Math.min(100, ((journeyProgress as any)?.qDaysCompleted || 0) * 3 + 10);

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative pb-28">
        
        {/* Sticky Mobile Header */}
        <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md pt-4 pb-3">
          <div className="px-5 max-w-md mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-extrabold text-foreground tracking-tight">Personality</h1>
              {p?.generatedAt && (
                <p className="text-[13px] text-muted-foreground font-medium mt-0.5 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary" /> Analysis: {formatDate(p.generatedAt)}
                </p>
              )}
            </div>
            {p && (
              <div className="w-12 h-12 relative flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray="283" strokeDashoffset={283 - (283 * profileCompletion) / 100} className="text-primary transition-all duration-1000 ease-out" strokeLinecap="round" />
                </svg>
                <span className="absolute text-[10px] font-extrabold text-foreground">{profileCompletion}%</span>
              </div>
            )}
          </div>
        </nav>

        <div className="px-5 max-w-md mx-auto mt-4 space-y-6">
          {isLoading ? (
            <div className="space-y-5">
              <Skeleton className="h-48 rounded-[24px] bg-foreground/5" />
              <Skeleton className="h-32 rounded-[24px] bg-foreground/5" />
              <Skeleton className="h-32 rounded-[24px] bg-foreground/5" />
            </div>
          ) : !p || (!p.traits && !p.summary) ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border shadow-xl rounded-[32px] p-8 text-center mt-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-primary opacity-80" />
              </div>
              <h2 className="text-[22px] font-extrabold mb-3 text-foreground">Profile Not Ready</h2>
              <p className="text-[15px] text-muted-foreground mb-8 leading-relaxed max-w-[260px] mx-auto">
                Complete at least 10 journey questions to generate your highly accurate personality profile.
              </p>
              <Button className="w-full h-14 bg-primary text-white font-bold text-[16px] rounded-2xl shadow-lg shadow-primary/25" onClick={() => navigate('/journey')}>
                Start Journey
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Personality Overview Card */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border shadow-md rounded-[28px] p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-[100px] -z-0" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary mb-4 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> Your Type
                  </div>
                  
                  {p.dominantType && (
                    <h2 className="text-[26px] font-extrabold text-foreground mb-3 leading-tight">{p.dominantType}</h2>
                  )}
                  <p className="text-[15px] text-muted-foreground leading-relaxed font-medium">{p.summary}</p>
                </div>
              </motion.div>

              {/* AI Insights - Swipeable Cards */}
              {insights.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <h3 className="text-[18px] font-extrabold text-foreground mb-4 px-1">AI Insights</h3>
                  <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-5 px-5">
                    {insights.map((insight, i) => (
                      <div key={i} className={`min-w-[240px] bg-gradient-to-br ${insight.color} border ${insight.borderColor} rounded-[24px] p-5 shadow-sm snap-center shrink-0`}>
                        <div className="flex items-center justify-between mb-8">
                          <span className="text-[12px] font-extrabold text-foreground/70 uppercase tracking-widest">{insight.title}</span>
                          {insight.icon}
                        </div>
                        <h4 className="text-[20px] font-extrabold text-foreground mb-1 leading-tight">{insight.trait}</h4>
                        <div className="flex items-center gap-2 mt-4">
                          <div className="h-1.5 flex-1 bg-foreground/10 rounded-full overflow-hidden">
                            <div className="h-full bg-foreground/30 rounded-full" style={{ width: `${insight.percentage}%` }} />
                          </div>
                          <span className="text-[13px] font-bold text-foreground/70">{insight.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Personality Dimensions (What Matters Most) */}
              {displayScores && Object.keys(displayScores).length > 0 && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border shadow-sm rounded-[28px] p-6">
                  <h3 className="text-[18px] font-extrabold text-foreground mb-6 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-primary" /> Personality Dimensions
                  </h3>
                  <div className="space-y-5">
                    {Object.entries(displayScores)
                      .sort(([, a]: any, [, b]: any) => b - a)
                      .map(([category, score]: any, i: number) => (
                        <div key={category}>
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-[15px] font-bold text-foreground">{category}</span>
                            <span className={`text-[12px] font-extrabold px-2 py-0.5 rounded-md ${score >= 80 ? "bg-green-500/10 text-green-500" : score >= 50 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                              {score}%
                            </span>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden border border-border/50">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ delay: 0.3 + i * 0.1, duration: 1 }}
                              className={`h-full rounded-full bg-gradient-to-r ${traitColors[i % traitColors.length]}`}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </motion.div>
              )}

              {/* Compatibility Keywords (Detailed Analysis) */}
              {p.compatibilityKeywords?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <h3 className="text-[18px] font-extrabold text-foreground mb-4 px-1 mt-2">Core Traits</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {p.compatibilityKeywords.map((kw: string) => (
                      <span key={kw} className="px-4 py-2 bg-card border border-border shadow-sm text-foreground text-[14px] rounded-full font-bold">
                        {kw}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Progress & Actions */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="pt-4 pb-8">
                <Button variant="outline" className="w-full h-14 bg-card border-border shadow-sm text-foreground font-bold text-[15px] rounded-2xl gap-2 hover:bg-foreground/5">
                  <RefreshCw className="w-4 h-4" /> Regenerate Profile Analysis
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
