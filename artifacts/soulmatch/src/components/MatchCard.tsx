import { motion } from "framer-motion";
import { Heart, Star, MapPin, Briefcase, GraduationCap, CheckCircle2, Lock, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getInitials } from "@/lib/utils";

interface Profile {
  id: number;
  firstName: string;
  displayName?: string | null;
  age?: number | null;
  occupation?: string | null;
  education?: string | null;
  city?: string | null;
  country?: string | null;
  religion?: string | null;
  bio?: string | null;
  photos: Array<{ id: number; url: string; isPrimary: boolean }>;
  verificationStatus: string;
  isPremium: boolean;
  compatibilityScore?: number | null;
  journeyProgress?: number;
  commonInterestsCount?: number;
  valueMatchScore?: number;
  interestSentByViewer?: boolean;
}

interface MatchCardProps {
  profile: Profile;
  compatibilityScore?: number;
  commonTraits?: string[];
  aiInsight?: string;
  isNew?: boolean;
  onSendInterest?: (userId: number) => void;
  onClick?: (userId: number, isLocked: boolean) => void;
  loading?: boolean;
  isLocked?: boolean;
}

export function MatchCard({
  profile, compatibilityScore, commonTraits = [], aiInsight,
  isNew, onSendInterest, onClick, loading, isLocked = false,
}: MatchCardProps) {
  const photo = profile.photos?.find((p) => p.isPrimary) ?? profile.photos?.[0];
  const score = compatibilityScore ?? profile.compatibilityScore ?? 0;
  const displayName = profile.displayName ?? profile.firstName;

  // PREMIUM LOCKED STATE UI
  if (isLocked) {
    return (
      <motion.div
        layout
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="rounded-2xl overflow-hidden cursor-pointer group relative h-[450px] border border-white/10 shadow-2xl bg-slate-900"
        onClick={() => onClick?.(profile.id, true)}
      >
        {/* Photo Background (Blurred) */}
        {photo ? (
          <img src={photo.url} alt="Hidden" className="absolute inset-0 w-full h-full object-cover filter blur-[20px] opacity-40 mix-blend-luminosity" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-primary text-primary-foreground shadow-md filter blur-[20px] opacity-30">
            <span className="text-4xl font-bold text-white">{getInitials(profile.firstName)}</span>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

        {/* Premium Content */}
        <div className="absolute inset-0 flex flex-col p-6 z-10">
          
          {/* Top Info */}
          <div className="flex justify-between items-start mb-auto">
            {score > 0 && (
              <div className="bg-[#F6A8B7]/20 border border-[#F6A8B7]/30 rounded-lg px-2 py-1 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F6A8B7] to-[#FAC985] block leading-none">{score}%</span>
                <span className="text-[10px] text-[#F5B75C] font-medium">Match Potential</span>
              </div>
            )}
            
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
              
            </div>
          </div>

          {/* Glowing Lock Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 backdrop-blur-xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <Lock className="w-6 h-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          </div>

          {/* Traits List */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-2 border border-white/5">
              <Heart className="w-4 h-4 text-[#F6A8B7]" fill="currentColor" />
              <span className="text-sm text-slate-200 font-medium">Compatibility Potential</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-2 border border-white/5">
              <div className="text-yellow-500">👨‍👩‍👧</div>
              <span className="text-sm text-slate-200 font-medium">Shared Family Values</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-2 border border-white/5">
              <div className="text-blue-400">💬</div>
              <span className="text-sm text-slate-200 font-medium">Communication Alignment</span>
            </div>

          </div>

          {/* Action Footer */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-sm text-slate-400 font-medium">
              Unlock after Day 30
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // NORMAL UNLOCKED STATE UI
  return (
    <motion.div
      layout
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="bg-card border border-border shadow-md rounded-2xl rounded-2xl overflow-hidden cursor-pointer group"
      onClick={() => onClick?.(profile.id, false)}
    >
      {/* Photo */}
      <div className="relative h-56 bg-muted overflow-hidden">
        {photo ? (
          <img src={photo.url} alt={displayName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground shadow-md">
            <span className="text-4xl font-bold text-white">{getInitials(profile.firstName)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isNew && (
            <Badge className="bg-primary/90 text-white text-xs border-0 backdrop-blur-sm">New</Badge>
          )}
          {profile.verificationStatus === "verified" && (
            <div className="flex items-center gap-1 bg-green-500/20 backdrop-blur-sm border border-green-500/40 rounded-full px-2 py-0.5">
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400 font-medium">Verified</span>
            </div>
          )}
          {profile.isPremium && (
            <div className="flex items-center gap-1 bg-accent/20 backdrop-blur-sm border border-accent/40 rounded-full px-2 py-0.5">
              <Star className="w-3 h-3 text-accent" />
              <span className="text-xs text-accent font-medium">Premium</span>
            </div>
          )}
        </div>

        {/* Score and Info Popover */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {score > 0 && (
            <div className="flex items-center gap-1 bg-card border border-border shadow-md rounded-full px-2.5 py-1">
              <span className="text-xs font-bold text-primary">{score}%</span>
            </div>
          )}
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-bold text-white text-lg leading-tight">
            {displayName}{profile.age ? `, ${profile.age}` : ""}
          </h3>
          {(profile.city || profile.country) && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-white/70" />
              <span className="text-xs text-white/70">{[profile.city, profile.country].filter(Boolean).join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {profile.occupation && (
            <div className="flex items-center gap-1 text-xs text-[#707070]">
              <Briefcase className="w-3 h-3" />
              <span>{profile.occupation}</span>
            </div>
          )}
          {profile.education && (
            <div className="flex items-center gap-1 text-xs text-[#707070]">
              <GraduationCap className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{profile.education}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          {profile.valueMatchScore !== undefined && (
            <div className="flex items-center gap-1 bg-[#F6A8B7]/10 border border-[#F6A8B7]/20 px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3 text-[#F6A8B7]" fill="currentColor" />
              <span className="text-xs text-[#F6A8B7] font-medium">{profile.valueMatchScore}% Value Match</span>
            </div>
          )}
          {profile.commonInterestsCount !== undefined && profile.commonInterestsCount > 0 && (
            <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
              <span className="text-[10px]">🔥</span>
              <span className="text-xs text-blue-400 font-medium">{profile.commonInterestsCount} Shared Interests</span>
            </div>
          )}
        </div>

        {commonTraits.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {commonTraits.slice(0, 3).map((t) => (
              <span key={t} className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-xs rounded-full">
                {t}
              </span>
            ))}
          </div>
        )}

        {aiInsight && (
          <p className="text-xs text-[#707070] line-clamp-2 mb-3 italic">"{aiInsight}"</p>
        )}

        {profile.interestSentByViewer ? (
          <Button
            size="sm"
            variant="outline"
            className="w-full border-border text-[#707070] bg-foreground/5 cursor-not-allowed"
            disabled
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Sent
          </Button>
        ) : (
          <Button
            size="sm"
            className="w-full bg-primary text-primary-foreground shadow-md border-0 text-white shadow-lg shadow-primary/20"
            onClick={(e) => { e.stopPropagation(); onSendInterest?.(profile.id); }}
            disabled={loading}
          >
            <Heart className="w-3.5 h-3.5 mr-1.5" />
            Send Interest
          </Button>
        )}
      </div>
    </motion.div>
  );
}
