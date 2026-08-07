import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { MessageCircleQuestion, HelpCircle, Send, ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "../config/api";
import { getAccessToken } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AnswerCommunityQuestionPage({ questionId }: { questionId: string }) {
  const [, setLocation] = useLocation();
  const [answer, setAnswer] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const maxAnswerLength = 500;

  // Fetch question details
  const { data: question, isLoading, isError, error } = useQuery({
    queryKey: ["community-question", questionId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/community-questions/${questionId}`, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      if (!res.ok) {
        throw new Error("Failed to fetch question details.");
      }
      return res.json();
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { answer: string }) => {
      const res = await fetch(`${API_URL}/api/community-questions/${questionId}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Unable to submit your answer. Please try again.");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: "✅ Your answer has been submitted successfully." 
      });
      
      // Refresh the Browse Questions list immediately
      queryClient.invalidateQueries({ queryKey: ["/api/community-questions/published"] });
      
      // Automatically return to the Browse Questions page after 2 seconds
      setTimeout(() => {
        setLocation("/browse-questions");
      }, 2000);
    },
    onError: (err: any) => {
      // If already answered, or API fails, error message will be shown
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim().length === 0 || answer.length > maxAnswerLength) return;
    
    submitMutation.mutate({ answer: answer.trim() });
  };

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
              onClick={() => setLocation("/browse-questions")}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-[#F0F0F0] hover:bg-[#FAFAFA] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#252525]" />
            </button>
            <div className="flex flex-col gap-1 flex-1 pr-4">
              <h1 className="text-[clamp(18px,5vw,22px)] font-black text-[#252525] tracking-tight leading-tight">
                Answer Question
              </h1>
            </div>
            
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F6A8B7] to-[#F8D6DD] flex items-center justify-center shadow-lg shadow-[#F6A8B7]/30 shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
              <MessageCircleQuestion className="w-6 h-6 text-white relative z-10" />
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-[#F6A8B7] border-t-transparent animate-spin" />
              <p className="text-[14px] text-[#707070] font-medium">Loading question...</p>
            </div>
          ) : isError ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-[16px] text-center font-medium border border-red-100">
              {error instanceof Error ? error.message : "Failed to load question."}
            </div>
          ) : question ? (
            <div className="space-y-6">
              
              {/* Question Card */}
              <div className="w-full rounded-[20px] p-5 border border-[#F0F0F0] bg-white shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-[#FFF0F3] text-[#F6A8B7] text-[11px] font-bold uppercase tracking-wider rounded-full">
                    {question.category}
                  </span>
                  <span className="text-[11.5px] text-[#A0A0A0] font-medium">
                    {question.createdAt ? format(new Date(question.createdAt), "dd MMM yyyy") : "Unknown Date"}
                  </span>
                </div>
                <h3 className="text-[18px] sm:text-[20px] font-extrabold text-[#252525] leading-tight mt-1">
                  {question.text}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-6 h-6 rounded-full bg-[#FAFAFA] flex items-center justify-center">
                    <HelpCircle className="w-3.5 h-3.5 text-[#B0B0B0]" />
                  </div>
                  <span className="text-[13px] text-[#707070] font-medium">
                    {question.isAnonymous ? "Asked Anonymously" : "Community Member"}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Answer Field */}
                <div className="flex flex-col gap-2">
                  <label className="text-[16px] font-semibold text-[#252525] ml-1">
                    Your Answer
                  </label>
                  
                  <div className="relative w-full rounded-[20px] bg-[#FAFAFA] border-2 border-[#F0F0F0] focus-within:border-[#F6A8B7] focus-within:ring-4 focus-within:ring-[#F6A8B7]/10 transition-all overflow-hidden h-[200px]">
                    <textarea
                      value={answer}
                      onChange={(e) => {
                        if (e.target.value.length <= maxAnswerLength) {
                          setAnswer(e.target.value);
                        }
                      }}
                      placeholder="Write your thoughtful answer..."
                      className="w-full h-full bg-transparent resize-none p-[18px] pb-10 text-[15px] font-medium text-[#252525] placeholder:text-[#B0B0B0] placeholder:font-normal focus:outline-none"
                    />
                    <span className={`absolute bottom-3 right-4 text-[12px] font-bold ${answer.length >= maxAnswerLength ? 'text-[#F6A8B7]' : 'text-[#A0A0A0]'}`}>
                      {answer.length}/{maxAnswerLength}
                    </span>
                  </div>
                </div>

                {/* Note */}
                <div className="w-full rounded-[16px] p-4 border border-[#F8D6DD]/60 bg-[#FFF0F3]/40 flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-[#F6A8B7]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Info className="w-3 h-3 text-[#F6A8B7]" />
                  </div>
                  <p className="text-[12.5px] text-[#707070] font-medium leading-snug">
                    Your answer should be respectful and genuine. It may help us recommend meaningful matches.
                  </p>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit"
                  disabled={answer.trim().length === 0 || submitMutation.isPending}
                  className="w-full h-14 rounded-full bg-gradient-to-r from-[#F6A8B7] to-[#F8D6DD] hover:from-[#F38E9F] hover:to-[#F6A8B7] text-white font-black text-[15px] sm:text-[16px] shadow-[0_8px_20px_rgba(246,168,183,0.3)] transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Answer"}
                  {!submitMutation.isPending && <Send className="w-4 h-4 ml-1" />}
                </Button>
                
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </AppLayout>
  );
}
