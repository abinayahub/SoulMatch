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
  const photo = profile?.photos?.find((p) => p.isPrimary) ?? profile?.photos?.[0];
  const score = compatibilityScore ?? profile?.compatibilityScore ?? 0;
  const displayName = profile?.displayName ?? profile?.firstName ?? "User";

  // PREMIUM SOFT PASTEL LOCKED STATE UI
  if (isLocked) {
    return (
      <div
        className="rounded-[30px] overflow-hidden cursor-pointer relative h-[clamp(383px,114.50vw,518px)] border border-[#F8D6DD] shadow-[0_12px_32px_rgba(255,143,168,0.22)] bg-gradient-to-br from-[#FFF0F3] via-[#FDF2F5] to-[#FFF8F8] select-none active:scale-[0.98] transition-transform"
        onClick={() => onClick?.(profile?.id || 0, true)}
      >
        {/* Soft Pastel Ambient Glows */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#FF7E95]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#FF477E]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-6 text-center">
          
          {/* Top Match % Badge */}
          <div className="w-full flex justify-between items-start">
            <div className="bg-white/95 backdrop-blur-xl px-4 py-1.5 rounded-full shadow-[0_4px_16px_rgba(255,71,126,0.15)] border border-[#F8D6DD] flex items-center justify-center gap-1.5">
              <span className="text-sm sm:text-base font-black text-[#FF477E] leading-none">{score}%</span>
              <span className="text-[10px] font-extrabold text-[#FF6B8B] tracking-widest uppercase leading-none">MATCH</span>
            </div>
          </div>

          {/* Center Glowing Lock Icon & Subtext */}
          <div className="flex flex-col items-center justify-center my-auto">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF7E95] to-[#FF477E] flex items-center justify-center text-white shadow-[0_8px_25px_rgba(255,71,126,0.35)] mb-4 animate-pulse">
              <Lock className="w-7 h-7 text-white" strokeWidth={2.2} />
            </div>

            <h3 className="text-2xl font-black text-[#252525] mb-2 tracking-tight flex items-center justify-center">
              Great Match!
            </h3>
            
            <p className="text-[#6F6F6F] font-semibold text-sm max-w-xs leading-relaxed">
              Complete your 30-Day Journey to unlock this profile.
            </p>
          </div>

          {/* Bottom Lock Indicator */}
          <div className="w-full pt-3 border-t border-[#F8D6DD]/60 text-center">
            <span className="text-xs font-bold text-[#FF477E]">🔒 Locked Profile</span>
          </div>
        </div>
      </div>
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
              <span className="truncate max-w-[clamp(102px,30.53vw,138px)]">{profile.education}</span>
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
              <span className="text-[clamp(9px,2.54vw,12px)]">🔥</span>
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
