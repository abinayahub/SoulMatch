import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Sparkles, TrendingUp, Target, ShieldCheck, Heart, 
  ChevronLeft, Info, User, ArrowRight, Briefcase, Users, 
  Compass, Star, Activity, MessageCircle, Palette, Globe, 
  DollarSign, Dog, Coffee, Sun, ChevronDown, ChevronUp
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link, useLocation } from "wouter";
import { useGetPersonalityProfile, useGetJourneyProgress } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

const CATEGORY_ICONS: Record<string, any> = {
  "Family Values": Heart,
  "Career Focus": Briefcase,
  "Personal Growth": TrendingUp,
  "Social Engagement": Users,
  "Adventure & Travel": Compass,
  "Kindness & Empathy": Star,
  "Health & Lifestyle": Activity,
  "Communication Style": MessageCircle,
  "Relationship Commitment": ShieldCheck,
  "Emotional Wellbeing": Brain,
  "Creativity & Hobbies": Palette,
  "Cultural & Social Awareness": Globe,
  "Financial Responsibility": DollarSign,
  "Pets & Animal Care": Dog,
  "Food & Lifestyle Preferences": Coffee,
  "Spirituality & Life Philosophy": Sun
};

const CATEGORY_COLORS: Record<string, string> = {
  "Family Values": "text-[#F6A8B7]",
  "Career Focus": "text-yellow-500",
  "Personal Growth": "text-green-500",
  "Social Engagement": "text-blue-500",
  "Adventure & Travel": "text-orange-500",
  "Kindness & Empathy": "text-[#F6A8B7]",
  "Health & Lifestyle": "text-green-600",
  "Communication Style": "text-indigo-500",
  "Relationship Commitment": "text-red-500",
  "Emotional Wellbeing": "text-teal-500",
  "Creativity & Hobbies": "text-purple-500",
  "Cultural & Social Awareness": "text-cyan-500",
  "Financial Responsibility": "text-emerald-500",
  "Pets & Animal Care": "text-amber-600",
  "Food & Lifestyle Preferences": "text-rose-500",
  "Spirituality & Life Philosophy": "text-sky-500"
};

const CATEGORY_BGS: Record<string, string> = {
  "Family Values": "bg-[#F6A8B7]",
  "Career Focus": "bg-yellow-500",
  "Personal Growth": "bg-green-500",
  "Social Engagement": "bg-blue-500",
  "Adventure & Travel": "bg-orange-500",
  "Kindness & Empathy": "bg-[#F6A8B7]",
  "Health & Lifestyle": "bg-green-600",
  "Communication Style": "bg-indigo-500",
  "Relationship Commitment": "bg-red-500",
  "Emotional Wellbeing": "bg-teal-500",
  "Creativity & Hobbies": "bg-purple-500",
  "Cultural & Social Awareness": "bg-cyan-500",
  "Financial Responsibility": "bg-emerald-500",
  "Pets & Animal Care": "bg-amber-600",
  "Food & Lifestyle Preferences": "bg-rose-500",
  "Spirituality & Life Philosophy": "bg-sky-500"
};

export default function PersonalityPage() {
  const [, navigate] = useLocation();
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  
  const { data: profile, isLoading: loadingProfile } = useGetPersonalityProfile({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const { data: journeyProgress, isLoading: loadingJourney } = useGetJourneyProgress({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const isLoading = loadingProfile || loadingJourney;

  const answeredQuestions = (journeyProgress as any)?.answeredQuestions || 0;
  const daysCompleted = Math.min(30, Math.floor(answeredQuestions / 5));

  let stage = 1;
  if (daysCompleted >= 30) stage = 4;
  else if (daysCompleted >= 21) stage = 3;
  else if (daysCompleted >= 11) stage = 2;
  else stage = 1;

  // Parse new JSON summary structure
  const summaryData = useMemo(() => {
    try {
      if (profile && (profile as any).summary) {
        const parsed = JSON.parse((profile as any).summary);
        if (parsed && parsed.categories) return parsed;
      }
    } catch (e) {
      // Not JSON, fallback to legacy
    }
    return null;
  }, [profile]);

  // Legacy fallback
  const rawTraits = (profile as any)?.traits;
  const snapshotTraits = Array.isArray(rawTraits) ? rawTraits : [];
  const connectionScore = snapshotTraits.find((t: any) => t?.trait === "Connection")?.score || 0;
  const stabilityScore = snapshotTraits.find((t: any) => t?.trait === "Stability")?.score || 0;
  const growthScore = snapshotTraits.find((t: any) => t?.trait === "Growth")?.score || 0;
  const explorationScore = snapshotTraits.find((t: any) => t?.trait === "Exploration")?.score || 0;

  const sortedTraits = useMemo(() => {
    return [
      { label: "Connection", score: connectionScore, icon: Heart, color: "text-[#F6A8B7]", bg: "bg-[#F6A8B7]/15 border-[#F6A8B7]/25", desc: "You value emotional bonds, empathy, and meaningful relationships." },
      { label: "Stability", score: stabilityScore, icon: ShieldCheck, color: "text-[#F6A8B7]", bg: "bg-[#F6A8B7]/15 border-[#F6A8B7]/25", desc: "You prefer trust, consistency, and long-term commitment." },
      { label: "Growth", score: growthScore, icon: TrendingUp, color: "text-[#F6A8B7]", bg: "bg-[#F6A8B7]/15 border-[#F6A8B7]/25", desc: "You enjoy learning, achieving goals, and personal development." },
      { label: "Exploration", score: explorationScore, icon: Target, color: "text-[#F6A8B7]", bg: "bg-[#F6A8B7]/15 border-[#F6A8B7]/25", desc: "You are open to new experiences, creativity, and adventure." },
    ].sort((a, b) => b.score - a.score);
  }, [connectionScore, stabilityScore, growthScore, explorationScore]);

  const primaryTrait = sortedTraits[0];
  const secondaryTrait = sortedTraits[1];

  return (
    <AppLayout>
      <div className="w-full min-h-screen pb-safe font-sans relative flex flex-col" style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 100%)' }}>
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, #F4F1FF 0%, transparent 50%), radial-gradient(circle at 100% 100%, #FFFDFC 0%, transparent 50%)' }} />
        <style>{`
          .premium-glass-card {
            background: rgba(255, 255, 255, 0.48) !important;
            backdrop-filter: blur(28px) !important;
            -webkit-backdrop-filter: blur(28px) !important;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08) !important;
          }
        `}</style>
        
        {/* Sticky Mobile Header */}
        <nav className="sticky top-[calc(4rem+env(safe-area-inset-top,0px))] z-50 bg-transparent/85 backdrop-blur-md py-4">
          <div className="px-4 max-w-md mx-auto flex items-center justify-between">
            <button onClick={() => navigate("/dashboard")} className="p-2 -ml-2 rounded-full hover:bg-black/5 active:scale-95 transition-all text-[#252525]">
              <ChevronLeft className="w-5 h-5 text-[#252525]" />
            </button>
            <h1 className="text-[clamp(17px,5.09vw,23px)] font-bold text-[#252525] tracking-tight">Personality Analysis</h1>
            <div className="w-8" />
          </div>
        </nav>

        <div className="px-4 max-w-md mx-auto mt-4 space-y-5">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-28 rounded-2xl bg-[#252525]/5" />
              <Skeleton className="h-10 w-1/3 rounded-lg" />
              <Skeleton className="h-24 rounded-2xl bg-[#252525]/5" />
              <Skeleton className="h-24 rounded-2xl bg-[#252525]/5" />
            </div>
          ) : (
            <>
              {stage === 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="premium-glass-card border border-white/40 rounded-[28px] p-8 text-center flex flex-col items-center justify-center min-h-[50vh]"
                >
                  <div className="w-16 h-16 bg-[#F6A8B7]/15 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Brain className="w-8 h-8 text-[#F6A8B7]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#252525] mb-2">Journey Progress</h3>
                  <div className="text-4xl font-black text-[#F6A8B7] mb-6">{daysCompleted} <span className="text-xl text-[#707070]">/ 30 Days</span></div>
                  <p className="text-sm text-[#707070] leading-relaxed max-w-[280px] mx-auto">
                    We're still learning about your personality. Continue your Journey to unlock a more accurate personality analysis.
                  </p>
                </motion.div>
              )}

              {stage === 2 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="premium-glass-card border border-white/40 rounded-[28px] p-8 text-center flex flex-col items-center justify-center min-h-[50vh]"
                >
                  <h3 className="text-lg font-bold text-[#252525] mb-8">Emerging Personality Traits</h3>
                  <div className="flex flex-col items-center mb-8 w-full max-w-[200px] mx-auto">
                    <span className="text-[10px] font-bold text-[#707070] uppercase tracking-wider mb-4">Likely Dominant Trait</span>
                    <div className={`w-20 h-20 rounded-full ${primaryTrait?.bg || 'bg-gray-200'} flex items-center justify-center mb-4 shadow-md border border-white/50 relative mx-auto`}>
                      <div className={`absolute inset-0 rounded-full ${primaryTrait?.bg || 'bg-gray-200'} blur-[12px] opacity-60`} />
                      {primaryTrait && <primaryTrait.icon className={`w-10 h-10 ${primaryTrait.color} relative z-10`} />}
                    </div>
                    <span className="text-2xl font-extrabold text-[#252525]">{primaryTrait?.label || "Unknown"}</span>
                  </div>
                  <div className="bg-yellow-500/10 text-yellow-600 font-bold text-xs px-4 py-2 rounded-full inline-block mb-4 mx-auto">
                    Medium Confidence
                  </div>
                  <p className="text-sm text-[#707070] leading-relaxed max-w-[280px] mx-auto">
                    Your profile is still evolving. Continue your Journey to solidify these insights.
                  </p>
                </motion.div>
              )}

              {stage === 3 && (
                <>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="premium-glass-card border border-white/40 rounded-[28px] relative overflow-hidden p-6 mb-5"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.4) 100%)' }}
                  >
                     <div className="flex items-center gap-2.5 mb-5 border-b border-[#F6A8B7]/15 pb-3 relative z-10">
                       <Brain className="w-5 h-5 text-[#F6A8B7]" />
                       <span className="text-sm font-bold text-[#252525] uppercase tracking-wide">Analysis Overview</span>
                     </div>
                     <div className="grid grid-cols-2 gap-6 text-center items-center max-w-[clamp(238px,71.25vw,322px)] mx-auto justify-center relative z-10 mb-5">
                       <div className="flex flex-col items-center">
                         <span className="text-[clamp(9px,2.80vw,13px)] text-[#707070] font-bold uppercase tracking-wider mb-2">Primary</span>
                         <div className="relative w-14 h-14 mb-2">
                            <div className={`absolute inset-0 rounded-full ${primaryTrait?.bg || 'bg-gray-200'} blur-[6px] opacity-60`} />
                            <div className={`relative w-full h-full rounded-full ${primaryTrait?.bg || 'bg-gray-200'} flex items-center justify-center border border-white/50 shadow-sm`}>
                              {primaryTrait && <primaryTrait.icon className={`w-6 h-6 ${primaryTrait.color}`} strokeWidth={2} />}
                            </div>
                         </div>
                         <span className="text-[clamp(13px,3.82vw,17px)] font-extrabold text-[#252525]">{primaryTrait?.label}</span>
                       </div>
                       <div className="flex flex-col items-center">
                         <span className="text-[clamp(9px,2.80vw,13px)] text-[#707070] font-bold uppercase tracking-wider mb-2">Secondary</span>
                         <div className="relative w-14 h-14 mb-2">
                            <div className={`absolute inset-0 rounded-full ${secondaryTrait?.bg || 'bg-gray-200'} blur-[6px] opacity-40`} />
                            <div className={`relative w-full h-full rounded-full ${secondaryTrait?.bg || 'bg-gray-200'} flex items-center justify-center border border-white/50 shadow-sm`}>
                              {secondaryTrait && <secondaryTrait.icon className={`w-6 h-6 ${secondaryTrait.color}`} strokeWidth={2} />}
                            </div>
                         </div>
                         <span className="text-[clamp(13px,3.82vw,17px)] font-bold text-[#252525]/80">{secondaryTrait?.label}</span>
                       </div>
                     </div>
                     <div className="text-[clamp(11px,3.31vw,14px)] text-[#707070] text-center italic bg-[#F6A8B7]/10 p-3 rounded-xl border border-[#F6A8B7]/20 relative z-10">
                       Your personality profile is becoming more accurate.
                     </div>
                  </motion.div>
                  
                  <div className="space-y-4">
                    <div className="mb-1 px-1">
                      <h3 className="text-[clamp(15px,4.58vw,21px)] font-bold text-[#252525] tracking-tight">Your Personality Traits</h3>
                    </div>

                    <div className="space-y-3">
                      {sortedTraits.map((trait, index) => {
                        const isTopTrait = trait.label === primaryTrait?.label;
                        
                        return (
                          <motion.div
                            key={trait.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`premium-glass-card rounded-[24px] relative overflow-hidden p-4.5 flex flex-col gap-3 transition-all ${isTopTrait ? 'border-[1.5px] border-[#F6A8B7]/40 shadow-[0_8px_24px_rgba(246,168,183,0.12)] bg-white/60' : 'border border-white/35 bg-white/40'}`}
                          >
                            <div className="flex items-center gap-3.5">
                               <div className={`w-12 h-12 rounded-[14px] ${trait.bg} flex items-center justify-center shrink-0 shadow-sm border border-white/50 relative`}>
                                 {isTopTrait && <div className="absolute inset-0 bg-[#F6A8B7]/20 rounded-[14px] blur-[8px]" />}
                                 <trait.icon className={`relative z-10 w-6 h-6 ${trait.color}`} strokeWidth={2} />
                               </div>

                               <div className="flex-1 min-w-0">
                                 <div className="flex items-center justify-between mb-0.5">
                                   <span className={`text-[clamp(14px,4.07vw,18px)] font-extrabold ${isTopTrait ? 'text-[#252525]' : 'text-[#252525]/90'}`}>{trait.label}</span>
                                   <span className={`text-[clamp(14px,4.07vw,18px)] font-black ${isTopTrait ? trait.color : 'text-[#252525]/70'}`}>{trait.score}%</span>
                                 </div>
                                 <p className="text-[clamp(10px,3.05vw,14px)] text-[#6F6F6F] leading-snug">
                                   {trait.desc}
                                 </p>
                               </div>
                            </div>
                            
                            <div className="relative h-2.5 w-full bg-[#E5E5E5]/50 rounded-full overflow-hidden shadow-inner mt-0.5">
                              {isTopTrait && (
                                 <div 
                                   className="absolute top-0 left-0 h-full bg-[#F6A8B7] blur-[4px] opacity-60 rounded-full"
                                   style={{ width: `${trait.score}%` }}
                                 />
                              )}
                              <div 
                                className={`relative h-full rounded-full transition-all duration-1000 ease-out ${isTopTrait ? 'bg-gradient-to-r from-[#F6A8B7] to-[#F8C3C6]' : 'bg-[#F6A8B7]/70'}`}
                                style={{ width: `${trait.score}%` }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {stage === 4 && (
                <>
                  {summaryData ? (
                    // NEW EXTENDED UI
                    <>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="premium-glass-card border border-white/40 rounded-[28px] relative overflow-hidden p-6"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.4) 100%)' }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#F6A8B7]/10 rounded-full blur-[40px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F4F1FF]/40 rounded-full blur-[40px] pointer-events-none" />
                    
                    <div className="flex items-center gap-2.5 mb-4 border-b border-[#F6A8B7]/15 pb-3 relative z-10">
                      <Brain className="w-5 h-5 text-[#F6A8B7]" />
                      <span className="text-sm font-bold text-[#252525] uppercase tracking-wide">Overall Personality</span>
                    </div>

                    <div className="relative z-10 space-y-4">
                      <p className="text-sm font-medium text-[#252525] leading-relaxed">
                        {summaryData.overall.summary}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/40 rounded-xl p-3 border border-white/50">
                          <span className="text-[10px] font-bold text-[#707070] uppercase tracking-wider block mb-1.5">Top Strengths</span>
                          <ul className="text-xs font-semibold text-[#252525] space-y-1">
                            {summaryData.overall.top5.slice(0, 3).map((t: string) => (
                              <li key={t} className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[#F6A8B7]"/> {t}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-white/40 rounded-xl p-3 border border-white/50">
                          <span className="text-[10px] font-bold text-[#707070] uppercase tracking-wider block mb-1.5">Growth Opportunities</span>
                          <ul className="text-xs font-semibold text-[#252525] space-y-1">
                            {summaryData.overall.growthOpportunities.map((t: string) => (
                              <li key={t} className="flex items-center gap-1.5"><TrendingUp className="w-3 h-3 text-blue-400"/> {t}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="space-y-4">
                    <div className="mb-1 px-1 flex items-center justify-between">
                      <h3 className="text-[clamp(15px,4.58vw,21px)] font-bold text-[#252525] tracking-tight">Detailed Traits</h3>
                      <span className="text-xs font-bold text-[#F6A8B7]">{Object.keys(summaryData.categories).length} Categories</span>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(summaryData.categories)
                        .sort((a: any, b: any) => b[1].score - a[1].score)
                        .map(([cat, data]: [string, any], index) => {
                        const Icon = CATEGORY_ICONS[cat] || Star;
                        const colorClass = CATEGORY_COLORS[cat] || "text-[#F6A8B7]";
                        const bgClass = CATEGORY_BGS[cat] || "bg-[#F6A8B7]";
                        const isExpanded = expandedCat === cat;
                        const hasData = data.score > 0;
                        
                        return (
                          <motion.div
                            key={cat}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setExpandedCat(isExpanded ? null : cat)}
                            className={`premium-glass-card rounded-[20px] relative overflow-hidden flex flex-col transition-all cursor-pointer border border-white/35 bg-white/40 ${isExpanded ? 'shadow-[0_8px_24px_rgba(0,0,0,0.08)] bg-white/60' : ''}`}
                          >
                            <div className="p-4 flex items-center gap-3.5">
                               <div className={`w-12 h-12 rounded-[14px] ${bgClass}/15 flex items-center justify-center shrink-0 shadow-sm border border-white/50 relative`}>
                                 <Icon className={`relative z-10 w-6 h-6 ${colorClass}`} strokeWidth={2} />
                               </div>

                               <div className="flex-1 min-w-0">
                                 <div className="flex items-center justify-between mb-0.5">
                                   <span className={`text-[clamp(14px,4.07vw,16px)] font-extrabold text-[#252525]`}>{cat}</span>
                                   {hasData ? (
                                      <span className={`text-[clamp(14px,4.07vw,16px)] font-black ${colorClass}`}>{data.score}%</span>
                                   ) : (
                                      <span className="text-[10px] font-bold text-[#707070] bg-[#E5E5E5]/50 px-2 py-0.5 rounded-md">Not enough data</span>
                                   )}
                                 </div>
                                 <p className="text-[clamp(10px,3.05vw,13px)] text-[#6F6F6F] leading-snug truncate pr-2">
                                   {data.summary}
                                 </p>
                               </div>
                               
                               <div className="shrink-0 text-[#707070]">
                                 {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                               </div>
                            </div>
                            
                            {hasData && (
                              <div className="relative h-1.5 w-full bg-[#E5E5E5]/50 overflow-hidden shadow-inner mt-0">
                                <div 
                                  className={`relative h-full transition-all duration-1000 ease-out ${bgClass}`}
                                  style={{ width: `${data.score}%` }}
                                />
                              </div>
                            )}

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden bg-black/5 border-t border-black/5"
                                >
                                  <div className="p-4 space-y-4">
                                    <div>
                                      <h4 className="text-xs font-bold text-[#252525] uppercase tracking-wider mb-1">Interpretation</h4>
                                      <p className="text-xs text-[#707070] leading-relaxed">{data.interpretation}</p>
                                    </div>
                                    
                                    {hasData && (
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="text-[10px] font-bold text-[#707070] uppercase tracking-wider mb-1.5">Key Strengths</h4>
                                          <ul className="space-y-1 text-xs font-semibold text-[#252525]">
                                            {data.strengths.map((s: string) => <li key={s} className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400"/> {s}</li>)}
                                          </ul>
                                        </div>
                                        <div>
                                          <h4 className="text-[10px] font-bold text-[#707070] uppercase tracking-wider mb-1.5">Growth Areas</h4>
                                          <ul className="space-y-1 text-xs font-semibold text-[#252525]">
                                            {data.growthAreas.map((g: string) => <li key={g} className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400"/> {g}</li>)}
                                          </ul>
                                        </div>
                                      </div>
                                    )}

                                    {hasData && (
                                      <div className="flex items-center justify-between pt-2 border-t border-black/5">
                                        <span className="text-[10px] font-bold text-[#707070] uppercase tracking-wider">Confidence Level</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                          data.confidenceLevel === "High" ? "bg-green-500/20 text-green-600" :
                                          data.confidenceLevel === "Medium" ? "bg-yellow-500/20 text-yellow-600" :
                                          "bg-red-500/20 text-red-600"
                                        }`}>{data.confidenceLevel}</span>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                // LEGACY UI
                <>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="premium-glass-card border border-white/40 rounded-[28px] relative overflow-hidden p-6"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.4) 100%)' }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#F6A8B7]/10 rounded-full blur-[40px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F4F1FF]/40 rounded-full blur-[40px] pointer-events-none" />
                    
                    <div className="flex items-center gap-2.5 mb-5 border-b border-[#F6A8B7]/15 pb-3 relative z-10">
                      <Brain className="w-5 h-5 text-[#F6A8B7]" />
                      <span className="text-sm font-bold text-[#252525] uppercase tracking-wide">Analysis Overview</span>
                    </div>

                    <div className="grid grid-cols-2 gap-6 text-center items-center max-w-[clamp(238px,71.25vw,322px)] mx-auto justify-center relative z-10">
                      {/* Primary Trait */}
                      <div className="flex flex-col items-center">
                        <span className="text-[clamp(9px,2.80vw,13px)] text-[#707070] font-bold uppercase tracking-wider mb-2">Primary</span>
                        <div className="relative w-14 h-14 mb-2">
                           <div className={`absolute inset-0 rounded-full ${primaryTrait?.bg} blur-[6px] opacity-60`} />
                           <div className={`relative w-full h-full rounded-full ${primaryTrait?.bg} flex items-center justify-center border border-white/50 shadow-sm`}>
                             {primaryTrait && <primaryTrait.icon className={`w-6 h-6 ${primaryTrait.color}`} strokeWidth={2} />}
                           </div>
                        </div>
                        <span className="text-[clamp(13px,3.82vw,17px)] font-extrabold text-[#252525]">{primaryTrait?.label || "Stability"}</span>
                      </div>

                      {/* Secondary Trait */}
                      <div className="flex flex-col items-center">
                        <span className="text-[clamp(9px,2.80vw,13px)] text-[#707070] font-bold uppercase tracking-wider mb-2">Secondary</span>
                        <div className="relative w-14 h-14 mb-2">
                           <div className={`absolute inset-0 rounded-full ${secondaryTrait?.bg} blur-[6px] opacity-40`} />
                           <div className={`relative w-full h-full rounded-full ${secondaryTrait?.bg} flex items-center justify-center border border-white/50 shadow-sm`}>
                             {secondaryTrait && <secondaryTrait.icon className={`w-6 h-6 ${secondaryTrait.color}`} strokeWidth={2} />}
                           </div>
                        </div>
                        <span className="text-[clamp(13px,3.82vw,17px)] font-bold text-[#252525]/80">{secondaryTrait?.label || "Connection"}</span>
                      </div>
                    </div>
                  </motion.div>

                  <div className="space-y-4">
                    <div className="mb-1 px-1">
                      <h3 className="text-[clamp(15px,4.58vw,21px)] font-bold text-[#252525] tracking-tight">Your Personality Traits</h3>
                    </div>

                    <div className="space-y-3">
                      {sortedTraits.map((trait, index) => {
                        const isTopTrait = trait.label === primaryTrait?.label;
                        
                        return (
                          <motion.div
                            key={trait.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`premium-glass-card rounded-[24px] relative overflow-hidden p-4.5 flex flex-col gap-3 transition-all ${isTopTrait ? 'border-[1.5px] border-[#F6A8B7]/40 shadow-[0_8px_24px_rgba(246,168,183,0.12)] bg-white/60' : 'border border-white/35 bg-white/40'}`}
                          >
                            <div className="flex items-center gap-3.5">
                               <div className={`w-12 h-12 rounded-[14px] ${trait.bg} flex items-center justify-center shrink-0 shadow-sm border border-white/50 relative`}>
                                 {isTopTrait && <div className="absolute inset-0 bg-[#F6A8B7]/20 rounded-[14px] blur-[8px]" />}
                                 <trait.icon className={`relative z-10 w-6 h-6 ${trait.color}`} strokeWidth={2} />
                               </div>

                               <div className="flex-1 min-w-0">
                                 <div className="flex items-center justify-between mb-0.5">
                                   <span className={`text-[clamp(14px,4.07vw,18px)] font-extrabold ${isTopTrait ? 'text-[#252525]' : 'text-[#252525]/90'}`}>{trait.label}</span>
                                   <span className={`text-[clamp(14px,4.07vw,18px)] font-black ${isTopTrait ? trait.color : 'text-[#252525]/70'}`}>{trait.score}%</span>
                                 </div>
                                 <p className="text-[clamp(10px,3.05vw,14px)] text-[#6F6F6F] leading-snug">
                                   {trait.desc}
                                 </p>
                               </div>
                            </div>
                            
                            <div className="relative h-2.5 w-full bg-[#E5E5E5]/50 rounded-full overflow-hidden shadow-inner mt-0.5">
                              {isTopTrait && (
                                 <div 
                                   className="absolute top-0 left-0 h-full bg-[#F6A8B7] blur-[4px] opacity-60 rounded-full"
                                   style={{ width: `${trait.score}%` }}
                                 />
                              )}
                              <div 
                                className={`relative h-full rounded-full transition-all duration-1000 ease-out ${isTopTrait ? 'bg-gradient-to-r from-[#F6A8B7] to-[#F8C3C6]' : 'bg-[#F6A8B7]/70'}`}
                                style={{ width: `${trait.score}%` }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
                </>
              )}

              {/* Why This Matters Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-glass-card border border-white/40 rounded-[28px] p-5 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(246,168,183,0.08) 0%, rgba(255,255,255,0.4) 100%)' }}
              >
                <div className="relative z-10 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-white/60 border border-white flex items-center justify-center shrink-0 shadow-sm">
                     <Info className="w-5 h-5 text-[#F6A8B7]" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="text-[clamp(13px,3.82vw,17px)] font-extrabold text-[#252525] mb-1">Why This Matters</h4>
                    <p className="text-[clamp(11px,3.31vw,15px)] text-[#6F6F6F] leading-relaxed">
                      Your daily answers train the <span className="font-semibold text-[#F6A8B7]">Hybrid Engine</span> to deeply understand your relationship preferences, unlocking highly compatible matches tailored to your exact lifestyle and core values.
                    </p>
                  </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-br from-[#F6A8B7]/20 to-transparent rounded-full blur-[20px] pointer-events-none" />
              </motion.div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
