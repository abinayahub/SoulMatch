import { motion } from "framer-motion";
import { Heart, Star, MapPin, Briefcase, GraduationCap, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
}

interface MatchCardProps {
  profile: Profile;
  compatibilityScore?: number;
  commonTraits?: string[];
  aiInsight?: string;
  isNew?: boolean;
  onSendInterest?: (userId: number) => void;
  onClick?: (userId: number) => void;
  loading?: boolean;
}

export function MatchCard({
  profile, compatibilityScore, commonTraits = [], aiInsight,
  isNew, onSendInterest, onClick, loading,
}: MatchCardProps) {
  const photo = profile.photos?.find((p) => p.isPrimary) ?? profile.photos?.[0];
  const score = compatibilityScore ?? profile.compatibilityScore ?? 0;
  const displayName = profile.displayName ?? profile.firstName;

  return (
    <motion.div
      layout
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="glass rounded-2xl overflow-hidden cursor-pointer group"
      onClick={() => onClick?.(profile.id)}
    >
      {/* Photo */}
      <div className="relative h-56 bg-muted overflow-hidden">
        {photo ? (
          <img src={photo.url} alt={displayName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center gradient-primary">
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

        {/* Score */}
        {score > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 glass rounded-full px-2.5 py-1">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs font-bold text-primary">{score}%</span>
          </div>
        )}

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
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Briefcase className="w-3 h-3" />
              <span>{profile.occupation}</span>
            </div>
          )}
          {profile.education && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <GraduationCap className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{profile.education}</span>
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
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 italic">"{aiInsight}"</p>
        )}

        <Button
          size="sm"
          className="w-full gradient-primary border-0 text-white glow-primary"
          onClick={(e) => { e.stopPropagation(); onSendInterest?.(profile.id); }}
          disabled={loading}
        >
          <Heart className="w-3.5 h-3.5 mr-1.5" />
          Send Interest
        </Button>
      </div>
    </motion.div>
  );
}
