import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { MessageSquare, ArrowLeft, User, Heart, HeartHandshake, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "../config/api";
import { getAccessToken } from "@/lib/auth-context";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function QuestionResponsesPage({ questionId }: { questionId: string }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch the original question
  const { data: question, isLoading: isQuestionLoading, isError: isQuestionError } = useQuery({
    queryKey: ["community-question", questionId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/community-questions/${questionId}`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      });
      if (!res.ok) throw new Error("Failed to fetch question details.");
      return res.json();
    }
  });

  // Fetch answers
  const { data: answers = [], isLoading: isAnswersLoading, isError: isAnswersError } = useQuery({
    queryKey: ["community-question-answers", questionId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/community-questions/${questionId}/answers`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      });
      if (!res.ok) throw new Error("Failed to fetch answers.");
      return res.json();
    }
  });

  const sendInterestMutation = useMutation({
    mutationFn: async (toUserId: number) => {
      const res = await fetch(`${API_URL}/api/interests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify({ toUserId })
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to send interest");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Interest Sent!", description: "They will be notified of your interest." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const ignoreMutation = useMutation({
    mutationFn: async (answerId: number) => {
      const res = await fetch(`${API_URL}/api/community-questions/answers/${answerId}/ignore`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      });
      if (!res.ok) throw new Error("Failed to ignore answer");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-question-answers", questionId] });
      toast({ title: "Answer ignored", description: "This response has been hidden." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const isLoading = isQuestionLoading || isAnswersLoading;
  const isError = isQuestionError || isAnswersError;

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
                Question Responses
              </h1>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-[#F6A8B7] border-t-transparent animate-spin" />
              <p className="text-[14px] text-[#707070] font-medium">Loading responses...</p>
            </div>
          ) : isError ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-[16px] text-center font-medium border border-red-100">
              Failed to load data. Please try again.
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Original Question Card */}
              {question && (
                <div className="w-full rounded-[20px] p-5 border border-[#F0F0F0] bg-white shadow-sm flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-[#FFF0F3] text-[#F6A8B7] text-[11px] font-bold uppercase tracking-wider rounded-full">
                      {question.category}
                    </span>
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5">
                      {question.status === "Approved" ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#10B981]/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                          <span className="text-[11px] font-bold text-[#047857]">Published</span>
                        </div>
                      ) : question.status === "Pending" ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFBEB] border border-[#F59E0B]/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                          <span className="text-[11px] font-bold text-[#B45309]">Pending Review</span>
                        </div>
                      ) : question.status === "Closed" ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F4F6] border border-[#6B7280]/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#6B7280]" />
                          <span className="text-[11px] font-bold text-[#374151]">Closed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] border border-[#EF4444]/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                          <span className="text-[11px] font-bold text-[#B91C1C]">Rejected</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-[18px] sm:text-[20px] font-extrabold text-[#252525] leading-tight mt-1">
                    {question.text}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-2 pt-3 border-t border-[#F0F0F0]">
                    <div className="w-6 h-6 rounded-full bg-[#F8D6DD]/30 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-3 h-3 text-[#F6A8B7]" />
                    </div>
                    <span className="text-[13px] text-[#707070] font-medium">
                      {answers.length} {answers.length === 1 ? 'Response' : 'Responses'}
                    </span>
                  </div>
                </div>
              )}

              {/* Answers List */}
              <div className="space-y-4">
                <h4 className="text-[16px] font-bold text-[#252525] ml-1">Community Answers</h4>
                
                {answers.length === 0 ? (
                  <div className="w-full rounded-[22px] p-8 border border-[#F8D6DD]/40 bg-white/60 backdrop-blur-md shadow-sm flex flex-col items-center justify-center text-center gap-3">
                    <span className="text-4xl mb-2">📭</span>
                    <h3 className="text-[15px] sm:text-[16px] font-extrabold text-[#252525]">No Answers Yet</h3>
                    <p className="text-[12px] sm:text-[13px] text-[#707070] font-medium max-w-[280px]">
                      Your question has been published, but nobody has answered it yet.
                    </p>
                  </div>
                ) : (
                  answers.map((answer: any) => (
                    <div key={answer.id} className="w-full rounded-[20px] p-5 border border-[#F0F0F0] bg-white shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:border-[#F8D6DD]/80 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {answer.user?.photoUrl ? (
                            <img src={answer.user.photoUrl} alt="User avatar" className="w-10 h-10 rounded-full object-cover shadow-sm border border-[#F0F0F0]" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center shadow-sm border border-[#F0F0F0]">
                              <User className="w-5 h-5 text-[#9CA3AF]" />
                            </div>
                          )}
                          <div>
                            <span className="text-[15px] font-extrabold text-[#252525] block">
                              {answer.user 
                                ? (answer.user.displayName || `${answer.user.firstName || ''} ${answer.user.lastName || ''}`.trim() || "Community Member")
                                : "Anonymous Member"}
                            </span>
                            <span className="text-[11px] font-semibold text-[#A0A0A0]">
                              {format(new Date(answer.createdAt), "dd MMM yyyy")}
                            </span>
                          </div>
                        </div>
                        {answer.compatibilityScore != null && (
                          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF0F3] to-[#F8D6DD] px-3 py-1.5 rounded-xl border border-[#F6A8B7]/30">
                            <span className="text-[14px] font-black text-[#F6A8B7] leading-none">
                              {answer.compatibilityScore}%
                            </span>
                            <span className="text-[9px] font-bold text-[#F6A8B7]/70 uppercase tracking-wider mt-0.5">
                              Match
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3.5 bg-[#F9FAFB] rounded-[14px] border border-[#F0F0F0]">
                        <p className="text-[14.5px] font-medium text-[#4B5563] leading-relaxed">
                          {answer.answer}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2">
                        {answer.user && (
                          <>
                            <Button 
                              variant="outline" 
                              className="flex-1 h-10 rounded-full border-[#F6A8B7] text-[#F6A8B7] hover:bg-[#FFF0F3] font-bold text-[13px]"
                              onClick={() => setLocation(`/profile/user/${answer.user.id}`)}
                            >
                              <Heart className="w-4 h-4 mr-1.5" /> View Profile
                            </Button>
                            <Button 
                              className="flex-1 h-10 rounded-full bg-gradient-to-r from-[#F6A8B7] to-[#F8D6DD] text-white shadow-[0_4px_12px_rgba(246,168,183,0.3)] hover:opacity-90 font-bold text-[13px]"
                              onClick={() => sendInterestMutation.mutate(answer.user.id)}
                              disabled={sendInterestMutation.isPending}
                            >
                              <HeartHandshake className="w-4 h-4 mr-1.5" /> Interest
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="ghost" 
                          className="h-10 w-10 p-0 rounded-full text-[#A0A0A0] hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                          onClick={() => ignoreMutation.mutate(answer.id)}
                          disabled={ignoreMutation.isPending}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
