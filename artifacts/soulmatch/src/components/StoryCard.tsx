import { useState } from "react";
import { format } from "date-fns";
import { API_URL } from "../config/api";
import { getAccessToken } from "@/lib/auth-context";
import { 
  Heart, Star, Trash2, Users, Briefcase, TrendingUp, Apple, 
  MessageCircle, Plane, Lightbulb, Lock, Globe, Share, ThumbsUp, Sparkles, Send, X, MoreHorizontal
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  "Family Values": { bg: "bg-[#F6A8B7]/20", text: "text-[#F6A8B7]", icon: Users },
  "Career Focus": { bg: "bg-[#F8C7C8]/30", text: "text-[#F8C7C8]", icon: Briefcase },
  "Personal Growth": { bg: "bg-[#F6A8B7]/20", text: "text-[#F6A8B7]", icon: TrendingUp },
  "Health & Lifestyle": { bg: "bg-[#F6A8B7]/20", text: "text-[#F6A8B7]", icon: Apple },
  "Communication Style": { bg: "bg-[#F6A8B7]/20", text: "text-[#F6A8B7]", icon: MessageCircle },
  "Adventure & Travel": { bg: "bg-[#F8D9D2]/30", text: "text-[#F8D9D2]", icon: Plane },
  "Emotional Wellbeing": { bg: "bg-[#F6A8B7]/20", text: "text-[#F6A8B7]", icon: Lightbulb },
};

const MOODS: Record<string, string> = {
  "Happy": "😄", "Calm": "😌", "Tired": "😴", "Excited": "🤩", "Sad": "😢", "Frustrated": "😤"
};

interface StoryCardProps {
  journal: any;
  onDelete?: (id: number) => void;
  isPublic?: boolean;
}

export function StoryCard({ journal, onDelete, isPublic = false }: StoryCardProps) {
  // Parse Mood if present in content
  let mood = "";
  let displayContent = journal.content || "";
  const moodMatch = displayContent.match(/^\[Feeling (.*?)\]\s*(.*)/s);
  if (moodMatch) {
    mood = moodMatch[1];
    displayContent = moodMatch[2];
  }

  const scores = journal.aiAnalysis?.storyAnalysis?.storyScores || {};
  const categories = Object.keys(scores);
  const insights = journal.aiAnalysis?.insights?.[0] || "";

  // Initialize state from database fields, fallback to local default
  const [liked, setLiked] = useState<boolean>(journal.hasLiked || false);
  const [likeCount, setLikeCount] = useState<number>(journal.likes || 0);
  const [reaction, setReaction] = useState<string | null>(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showCommentsList, setShowCommentsList] = useState(false);
  const [comments, setComments] = useState<{name: string, text: string}[]>(
    journal.comments ? journal.comments.map((c: any) => ({ name: c.user.firstName, text: c.content })) : []
  );
  const [newComment, setNewComment] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const handleToggleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/journal/${journal.id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error("Failed to toggle like", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isCommenting) return;
    setIsCommenting(true);
    
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/journal/${journal.id}/comment`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ content: newComment })
      });
      if (res.ok) {
        const data = await res.json();
        setComments([...comments, { name: data.user.firstName, text: data.content }]);
        setNewComment("");
        setShowCommentInput(false);
      }
    } catch (error) {
      console.error("Failed to post comment", error);
    } finally {
      setIsCommenting(false);
    }
  };

  const userName = journal.user?.firstName || "You";
  const isMe = userName === "You";

  return (
    <div className="rounded-[28px] p-5 mb-5 relative group transition-all flex flex-col gap-5 border border-white/35" style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', boxShadow: '0 4px 20px rgba(246,168,183,0.08)' }}>
      
      {/* Left side: Image (if present) */}
      {journal.imageUrl && (
        <div className="w-full shrink-0">
          <img 
            src={journal.imageUrl} 
            alt="Story visual" 
            className="w-full h-full min-h-[200px] object-cover rounded-2xl border border-white/40 shadow-sm" 
          />
        </div>
      )}

      {/* Right side: Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 border border-white/50 shadow-sm">
              <AvatarFallback className="bg-[#F6A8B7]/20 text-[#252525] font-bold text-sm">
                {userName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-bold text-[#252525] text-[15px]">{userName}</span>
              {mood && (
                <span className="text-[10px] px-2 py-0.5 rounded-full text-[#707070] flex items-center gap-1 border border-white/40 font-medium" style={{ background: 'rgba(255,255,255,0.5)' }}>
                  {MOODS[mood]} {mood}
                </span>
              )}
              <div className="flex items-center gap-2 text-[11px] text-[#8A8A8A] font-medium">
                <span>{format(new Date(journal.createdAt), "h:mm a")}</span>
                <span>•</span>
                {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                <span>{isPublic ? "Matches" : "Private"}</span>
              </div>
            </div>
          </div>

          {isMe && onDelete && (
            <button 
              onClick={() => onDelete(journal.id)}
              className="text-[#8A8A8A] hover:text-[#252525] transition-colors p-1 shrink-0"
              title="Delete Story"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Main Text */}
        <div className="mb-4">
          <p className={`text-[#252525] leading-relaxed whitespace-pre-wrap text-[15px] font-medium ${!isExpanded && displayContent.length > 200 ? 'line-clamp-3' : ''}`}>
            {displayContent}
          </p>
          {!isExpanded && displayContent.length > 200 && (
            <button 
              onClick={() => setIsExpanded(true)}
              className="text-[#F6A8B7] hover:opacity-80 text-sm font-bold mt-1 transition-opacity"
            >
              Read more...
            </button>
          )}
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.slice(0, 3).map((c) => {
              const s = CATEGORY_STYLES[c] || CATEGORY_STYLES["Personal Growth"];
              const colorMatch = s.text.match(/text-([a-z]+)-500/);
              const colorName = colorMatch ? colorMatch[1] : 'gray';
              const Icon = s.icon;
              
              return (
                <span
                  key={c}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border ${s.bg} border-${colorName}-500/20 ${s.text}`}
                >
                  <Icon className="w-3 h-3" /> {c}
                </span>
              );
            })}
          </div>
        )}

        <div className="flex-1"></div>

        {/* Footer / Interactions Summary */}
        <div className="flex items-center gap-4 text-xs font-medium text-[#707070] mt-2">
          <button 
            onClick={handleToggleLike} 
            disabled={isLiking}
            className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-[#F6A8B7]' : 'hover:text-[#F6A8B7]'}`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-[#F6A8B7] text-[#F6A8B7]' : ''}`} />
            <span>{likeCount}</span>
          </button>
          
          <div className="flex items-center gap-2">
            {["😄", "🥰", "🎉", "🔥"].map(emoji => (
              <button 
                key={emoji}
                onClick={() => setReaction(reaction === emoji ? null : emoji)}
                className={`flex items-center gap-1 transition-all text-sm hover:scale-110 ${reaction === emoji ? 'scale-110 opacity-100' : 'opacity-50 hover:opacity-100'}`}
                title={`React with ${emoji}`}
              >
                <span className="text-xl">{emoji}</span>
                {reaction === emoji && <span className="text-[10px] text-[#707070]">1</span>}
              </button>
            ))}
          </div>

          <div className="flex-1"></div>

          <button 
            onClick={() => setShowCommentsList(!showCommentsList)}
            className="flex items-center gap-1.5 hover:text-[#252525] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{comments.length}</span>
          </button>
        </div>

      {/* Comments Section */}
      {showCommentsList && (
        <div className="space-y-3 mt-4 pt-4 border-t border-white/20">
          {comments.map((c, i) => (
            <div key={i} className="flex gap-2">
              <Avatar className="w-6 h-6 border border-white/40 shrink-0 mt-0.5">
                <AvatarFallback className="text-[9px] bg-white/50">{c.name[0]}</AvatarFallback>
              </Avatar>
              <div className="rounded-2xl rounded-tl-sm px-3 py-2 text-sm max-w-full border border-white/30" style={{ background: 'rgba(255,255,255,0.5)' }}>
                <span className="font-bold text-[#252525] text-xs mr-2">{c.name}</span>
                <span className="text-[#707070] text-xs">{c.text}</span>
              </div>
            </div>
          ))}

          <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center mt-2">
            <Avatar className="w-6 h-6 border border-white/40 shrink-0">
              <AvatarFallback className="text-[9px] bg-white/50">{userName[0] || 'Y'}</AvatarFallback>
            </Avatar>
            <input 
              type="text" 
              placeholder="Write a comment..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 border border-white/40 rounded-full px-4 py-1.5 text-xs text-[#252525] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#F6A8B7]/50" 
              style={{ background: 'rgba(255,255,255,0.6)' }}
            />
            <button type="submit" disabled={!newComment.trim() || isCommenting} className="text-[#F6A8B7] disabled:opacity-50 p-1 hover:bg-white/40 rounded-full transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
      </div>
    </div>
  );
}
