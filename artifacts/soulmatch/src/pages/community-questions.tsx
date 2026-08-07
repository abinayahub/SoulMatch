import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  MessageCircle,
  ChevronRight,
  PenSquare,
  Heart,
  Clock,
  MessageCircleQuestion,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

type CommunityQuestion = {
  id: number;
  text: string;
  category: string;
  isAnonymous: boolean;
  status: string;
  answersCount: number;
  createdAt: string;
  rejectionReason?: string;
};

const CATEGORIES = [
  { id: "relationship", label: "Relationship", icon: "❤️" },
  { id: "communication", label: "Communication", icon: "💬" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧" },
  { id: "career", label: "Career", icon: "💼" },
  { id: "personal-growth", label: "Personal Growth", icon: "🌱" },
  { id: "emotional-wellbeing", label: "Emotional Wellbeing", icon: "🧠" },
  { id: "food-lifestyle", label: "Food & Lifestyle", icon: "🍳" },
  { id: "pets-animal-care", label: "Pets & Animal Care", icon: "🐶" },
  { id: "adventure-travel", label: "Adventure & Travel", icon: "✈️" },
  { id: "kindness-empathy", label: "Kindness & Empathy", icon: "🤝" },
  { id: "family-values", label: "Family Values", icon: "❤️" },
  { id: "cultural-social", label: "Cultural & Social Awareness", icon: "🌍" },
  { id: "financial-responsibility", label: "Financial Responsibility", icon: "💰" },
  { id: "trust-commitment", label: "Trust & Commitment", icon: "🛡️" },
  { id: "others", label: "Others", icon: "✨" }
];

export default function CommunityQuestionsPage() {
  const [, setLocation] = useLocation();

  const { data: myQuestions = [], isLoading } = useQuery<CommunityQuestion[]>({
    queryKey: ["/api/community-questions/me"],
    queryFn: () => apiRequest("/community-questions/me"),
  });

  const { data: myAnswers = [], isLoading: isAnswersLoading } = useQuery({
    queryKey: ["/api/community-questions/my-answers"],
    queryFn: () => apiRequest("/community-questions/my-answers"),
  });

  return (
    <AppLayout>
      <div 
        className="w-full min-h-screen pb-10"
        style={{ background: 'linear-gradient(135deg, #FAF2EF 0%, #F5F0FB 50%, #FFFDFB 75%, #F7F7FA 100%)' }}
      >
        <div className="w-full max-w-md mx-auto px-[clamp(16px,4vw,20px)] pt-[clamp(12px,3vw,16px)] pb-[clamp(24px,6vw,32px)] space-y-6 flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5 flex-1 pr-2">
              <h1 className="text-[clamp(20px,5.5vw,26px)] font-black text-[#252525] tracking-tight leading-tight">
                Community Questions
              </h1>
            </div>
            
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] bg-gradient-to-br from-[#F6A8B7] to-[#F8D6DD] flex items-center justify-center shadow-lg shadow-[#F6A8B7]/30 relative z-10 overflow-hidden">
                <MessageCircleQuestion className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white/20" strokeWidth={2} />
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFF0F3] absolute -bottom-3 -right-3 z-0 flex items-center justify-center shadow-md border border-[#F6A8B7]/20">
                 <div className="flex gap-1 mt-1 mr-1">
                   <div className="w-1 h-1 rounded-full bg-[#F6A8B7]" />
                   <div className="w-1 h-1 rounded-full bg-[#F6A8B7]" />
                   <div className="w-1 h-1 rounded-full bg-[#F6A8B7]" />
                 </div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="space-y-4 pt-2">
            {/* 1. Post a Question */}
            <div 
              onClick={() => setLocation("/ask-community-question")}
              className="w-full rounded-[20px] p-4 sm:p-5 border border-[#F8D6DD]/40 bg-white/90 backdrop-blur-xl shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFF0F3] flex items-center justify-center shrink-0 border border-[#F6A8B7]/20 shadow-sm">
                  <PenSquare className="w-5 h-5 sm:w-6 sm:h-6 text-[#F6A8B7]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#252525] text-[15px] sm:text-[16px] leading-tight mb-1">Post a Question</h4>
                  <p className="text-[11.5px] sm:text-[12px] text-[#707070] font-medium leading-snug max-w-[200px]">
                    Share your thoughts and get meaningful answers
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#808080] opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* 2. Browse Questions */}
            <div 
              onClick={() => setLocation("/browse-questions")}
              className="w-full rounded-[20px] p-4 sm:p-5 border border-[#F8D6DD]/40 bg-white/90 backdrop-blur-xl shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F0F5FF] flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 fill-current" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#252525] text-[15px] sm:text-[16px] leading-tight mb-1">Browse Questions</h4>
                  <p className="text-[11.5px] sm:text-[12px] text-[#707070] font-medium leading-snug max-w-[200px]">
                    Answer questions asked by others
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#808080] opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* My Submitted Questions Section */}
          <div className="pt-4 pb-8">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-[15px] sm:text-[16px] font-extrabold text-[#252525]">My Submitted Questions</h3>
              {myQuestions.length > 0 && (
                <button className="text-[11.5px] sm:text-[12px] font-bold text-[#F6A8B7] hover:opacity-80 transition-opacity">
                  View all
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="flex flex-col bg-white/70 backdrop-blur-md rounded-[18px] border border-[#F8D6DD]/40 p-8 items-center justify-center shadow-sm">
                 <div className="animate-spin w-8 h-8 rounded-full border-4 border-[#F8D6DD] border-t-[#F6A8B7]"></div>
              </div>
            ) : myQuestions.length > 0 ? (
              <div className="flex flex-col bg-white/70 backdrop-blur-md rounded-[18px] border border-[#F8D6DD]/40 px-4 shadow-sm">
                {myQuestions.map((question, index) => {
                  const categoryInfo = CATEGORIES.find(c => c.id === question.category);
                  const icon = categoryInfo ? categoryInfo.icon : "✨";
                  
                  // Format date: DD MMM YYYY
                  const dateObj = new Date(question.createdAt);
                  const dateStr = dateObj.toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric"
                  });

                  return (
                    <div 
                      key={question.id}
                      className={`w-full py-3.5 sm:py-4 flex items-center justify-between gap-3 cursor-pointer active:opacity-60 transition-opacity ${
                        index !== myQuestions.length - 1 ? "border-b border-[#F0F0F0]" : ""
                      }`}
                      onClick={() => setLocation(`/community-questions/${question.id}/responses`)}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-extrabold text-[#252525] text-[13.5px] sm:text-[14px] leading-snug line-clamp-2 mb-1.5 flex gap-1.5 items-start">
                          <span className="shrink-0 mt-[1px]">{icon}</span>
                          <span>{question.text}</span>
                        </h4>
                        <div className="flex flex-col gap-1 text-[11px] sm:text-[11.5px] font-medium text-[#808080]">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {question.status === 'Approved' || question.status === 'Published' ? (
                              <span className="text-green-600 font-bold">🟢 Published</span>
                            ) : question.status === 'Rejected' ? (
                              <span className="text-red-500 font-bold">🔴 Rejected</span>
                            ) : (
                              <span className="text-yellow-500 font-bold">🟡 Pending Review</span>
                            )}
                            <span className="text-[#D0D0D0]">•</span>
                            <span>{dateStr}</span>
                          </div>
                          {(question.status === 'Approved' || question.status === 'Published') && question.answersCount > 0 && (
                            <span className="text-[#252525] font-bold">{question.answersCount} Answers</span>
                          )}
                          {question.status === 'Rejected' && question.rejectionReason && (
                            <span className="text-red-400 font-normal mt-0.5">Reason: {question.rejectionReason}</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#A0A0A0] shrink-0" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col bg-white/70 backdrop-blur-md rounded-[18px] border border-[#F8D6DD]/40 p-6 sm:p-8 items-center text-center shadow-sm">
                <span className="text-4xl mb-3">📭</span>
                <h4 className="text-[15px] sm:text-[16px] font-extrabold text-[#252525] mb-1.5">
                  No Submitted Questions
                </h4>
                <p className="text-[12px] sm:text-[13px] text-[#707070] font-medium leading-relaxed max-w-[240px] mb-5">
                  You haven't submitted any community questions yet.
                </p>
                <button 
                  onClick={() => setLocation("/ask-community-question")}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#F6A8B7] to-[#F8D6DD] text-white font-bold text-[13px] shadow-[0_4px_12px_rgba(246,168,183,0.3)] hover:opacity-90 transition-opacity active:scale-[0.98]"
                >
                  Ask Your First Question
                </button>
              </div>
            )}
          </div>

          {/* My Answers Section */}
          <div className="pt-2 pb-8">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-[15px] sm:text-[16px] font-extrabold text-[#252525]">My Answers</h3>
              {myAnswers.length > 0 && (
                <button className="text-[11.5px] sm:text-[12px] font-bold text-[#F6A8B7] hover:opacity-80 transition-opacity">
                  View all
                </button>
              )}
            </div>

            {isAnswersLoading ? (
              <div className="flex flex-col bg-white/70 backdrop-blur-md rounded-[18px] border border-[#F8D6DD]/40 p-8 items-center justify-center shadow-sm">
                 <div className="animate-spin w-8 h-8 rounded-full border-4 border-[#F8D6DD] border-t-[#F6A8B7]"></div>
              </div>
            ) : myAnswers.length > 0 ? (
              <div className="flex flex-col bg-white/70 backdrop-blur-md rounded-[18px] border border-[#F8D6DD]/40 px-4 shadow-sm">
                {myAnswers.map((answer: any, index: number) => {
                  const categoryInfo = CATEGORIES.find(c => c.id === answer.question.category);
                  const icon = categoryInfo ? categoryInfo.icon : "✨";
                  
                  const dateObj = new Date(answer.createdAt);
                  const dateStr = dateObj.toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric"
                  });

                  return (
                    <div 
                      key={answer.id}
                      className={`w-full py-3.5 sm:py-4 flex items-center justify-between gap-3 cursor-pointer active:opacity-60 transition-opacity ${
                        index !== myAnswers.length - 1 ? "border-b border-[#F0F0F0]" : ""
                      }`}
                      onClick={() => setLocation(`/community-questions/my-answers/${answer.id}`)}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-extrabold text-[#252525] text-[13.5px] sm:text-[14px] leading-snug line-clamp-2 mb-1.5 flex gap-1.5 items-start">
                          <span className="shrink-0 mt-[1px]">{icon}</span>
                          <span>{answer.question.text}</span>
                        </h4>
                        <div className="flex flex-col gap-1 text-[11px] sm:text-[11.5px] font-medium text-[#808080]">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[#F6A8B7] font-bold">Your Answer</span>
                            <span className="text-[#D0D0D0]">•</span>
                            <span>{dateStr}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#A0A0A0] shrink-0" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col bg-white/70 backdrop-blur-md rounded-[18px] border border-[#F8D6DD]/40 p-6 sm:p-8 items-center text-center shadow-sm">
                <span className="text-4xl mb-3">💬</span>
                <h4 className="text-[15px] sm:text-[16px] font-extrabold text-[#252525] mb-1.5">
                  No Answers Yet
                </h4>
                <p className="text-[12px] sm:text-[13px] text-[#707070] font-medium leading-relaxed max-w-[240px] mb-5">
                  You haven't answered any community questions yet.
                </p>
                <button 
                  onClick={() => setLocation("/browse-questions")}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#F6A8B7] to-[#F8D6DD] text-white font-bold text-[13px] shadow-[0_4px_12px_rgba(246,168,183,0.3)] hover:opacity-90 transition-opacity active:scale-[0.98]"
                >
                  Browse Questions
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
