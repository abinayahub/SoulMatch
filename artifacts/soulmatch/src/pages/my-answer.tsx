import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArrowLeft, MessageSquare, Edit3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { format } from "date-fns";

export default function MyAnswerPage({ answerId }: { answerId: string }) {
  const [, setLocation] = useLocation();

  // Fetch all my answers and find this one
  const { data: myAnswers = [], isLoading, isError } = useQuery({
    queryKey: ["/api/community-questions/my-answers"],
    queryFn: () => apiRequest("/community-questions/my-answers"),
  });

  const answer = myAnswers.find((a: any) => a.id === parseInt(answerId));

  return (
    <AppLayout>
      <div 
        className="w-full min-h-screen pb-10"
        style={{ background: 'linear-gradient(135deg, #FAF2EF 0%, #F5F0FB 50%, #FFFDFB 75%, #F7F7FA 100%)' }}
      >
        <div className="w-full max-w-md mx-auto px-[clamp(16px,4vw,20px)] pt-[clamp(12px,3vw,16px)] pb-10 space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLocation("/community-questions")}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-[#F0F0F0] hover:bg-[#FAFAFA] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#252525]" />
            </button>
            <div className="flex flex-col gap-1 flex-1 pr-4">
              <h1 className="text-[clamp(18px,5vw,22px)] font-black text-[#252525] tracking-tight leading-tight">
                My Answer
              </h1>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-[#F6A8B7] border-t-transparent animate-spin" />
              <p className="text-[14px] text-[#707070] font-medium">Loading answer...</p>
            </div>
          ) : isError || !answer ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-[16px] text-center font-medium border border-red-100">
              Failed to load answer. It might have been deleted.
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Original Question */}
              <div className="w-full rounded-[20px] p-5 border border-[#F0F0F0] bg-white shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-[#FFF0F3] text-[#F6A8B7] text-[11px] font-bold uppercase tracking-wider rounded-full">
                    {answer.question.category}
                  </span>
                </div>
                
                <h3 className="text-[18px] sm:text-[20px] font-extrabold text-[#252525] leading-tight mt-1">
                  {answer.question.text}
                </h3>
              </div>

              {/* User's Answer */}
              <div className="w-full rounded-[20px] p-5 border border-[#F6A8B7]/30 bg-gradient-to-br from-white to-[#FFF0F3]/30 shadow-sm relative">
                <div className="absolute top-4 right-4 text-[#A0A0A0]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                
                <h4 className="text-[15px] font-bold text-[#252525] mb-4 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#F6A8B7]" />
                  Your Response
                </h4>
                
                <p className="text-[15px] font-medium text-[#4B5563] leading-relaxed">
                  {answer.answer}
                </p>
                
                <div className="mt-5 pt-4 border-t border-[#F8D6DD]/50">
                  <span className="text-[11.5px] font-medium text-[#A0A0A0]">
                    Submitted on {format(new Date(answer.createdAt), "MMMM d, yyyy")}
                  </span>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
