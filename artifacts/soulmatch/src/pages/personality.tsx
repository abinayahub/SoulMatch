import { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Brain, Sparkles, TrendingUp, Target, ShieldCheck, Heart, 
  ChevronLeft, Info, User, ArrowRight
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

export default function PersonalityPage() {
  const [, navigate] = useLocation();
  
  const { data: profile, isLoading: loadingProfile } = useGetPersonalityProfile({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const { data: journeyProgress, isLoading: loadingJourney } = useGetJourneyProgress({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const isLoading = loadingProfile || loadingJourney;

  const rawTraits = (profile as any)?.traits;
  const snapshotTraits = Array.isArray(rawTraits) ? rawTraits : [];
  
  const connectionScore = snapshotTraits.find((t: any) => t?.trait === "Connection")?.score || 0;
  const stabilityScore = snapshotTraits.find((t: any) => t?.trait === "Stability")?.score || 0;
  const growthScore = snapshotTraits.find((t: any) => t?.trait === "Growth")?.score || 0;
  const explorationScore = snapshotTraits.find((t: any) => t?.trait === "Exploration")?.score || 0;

  const answeredQuestions = (journeyProgress as any)?.answeredQuestions || 0;
  const analysisProgressPercent = Math.min(100, Math.round((answeredQuestions / 150) * 100));

  // Determine Primary & Secondary Traits
  const sortedTraits = useMemo(() => {
    const list = [
      { label: "Connection", score: connectionScore, icon: Heart, color: "text-[#F6A8B7]", bg: "bg-[#F6A8B7]/15 border-[#F6A8B7]/25" },
      { label: "Stability", score: stabilityScore, icon: ShieldCheck, color: "text-[#F6A8B7]", bg: "bg-[#F6A8B7]/15 border-[#F6A8B7]/25" },
      { label: "Growth", score: growthScore, icon: TrendingUp, color: "text-[#F6A8B7]", bg: "bg-[#F6A8B7]/15 border-[#F6A8B7]/25" },
      { label: "Exploration", score: explorationScore, icon: Target, color: "text-[#F6A8B7]", bg: "bg-[#F6A8B7]/15 border-[#F6A8B7]/25" },
    ];
    return list.sort((a, b) => b.score - a.score);
  }, [connectionScore, stabilityScore, growthScore, explorationScore]);

  const primaryTrait = sortedTraits[0];
  const secondaryTrait = sortedTraits[1];

  const traitsWithDescriptions = [
    {
      label: "Connection",
      score: connectionScore,
      icon: Heart,
      color: "text-[#F6A8B7]",
      barBg: "bg-[#F6A8B7]",
      bg: "bg-[#F6A8B7]/15 border-[#F6A8B7]/25",
      desc: "You value emotional bonds, empathy, and meaningful relationships."
    },
    {
      label: "Stability",
      score: stabilityScore,
      icon: ShieldCheck,
      color: "text-[#F6A8B7]",
      barBg: "bg-[#F6A8B7]",
      bg: "bg-[#F6A8B7]/15 border-[#F6A8B7]/25",
      desc: "You prefer trust, consistency, and long-term commitment."
    },
    {
      label: "Growth",
      score: growthScore,
      icon: TrendingUp,
      color: "text-[#F6A8B7]",
      barBg: "bg-[#F6A8B7]",
      bg: "bg-[#F6A8B7]/15 border-[#F6A8B7]/25",
      desc: "You enjoy learning, achieving goals, and personal development."
    },
    {
      label: "Exploration",
      score: explorationScore,
      icon: Target,
      color: "text-[#F6A8B7]",
      barBg: "bg-[#F6A8B7]",
      bg: "bg-[#F6A8B7]/15 border-[#F6A8B7]/25",
      desc: "You are open to new experiences, creativity, and adventure."
    }
  ];

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
              {/* Overview Card */}
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

              {/* Your Personality Traits Section */}
              <div className="space-y-4">
                <div className="mb-1 px-1">
                  <h3 className="text-[clamp(15px,4.58vw,21px)] font-bold text-[#252525] tracking-tight">Your Personality Traits</h3>
                </div>

                <div className="space-y-3">
                  {traitsWithDescriptions.map((trait, index) => {
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
