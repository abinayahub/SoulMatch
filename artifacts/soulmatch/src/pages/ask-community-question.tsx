import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { MessageSquare, Info, MessageCircleQuestion, HelpCircle, Lock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "../config/api";
import { getAccessToken } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

// Removed Categories array

export default function AskCommunityQuestionPage() {
  const [, setLocation] = useLocation();
  const [question, setQuestion] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const maxQuestionLength = 150;

  const submitMutation = useMutation({
    mutationFn: async (data: { text: string, isAnonymous: boolean, category: string }) => {
      const res = await fetch(`${API_URL}/api/community-questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to submit question");
      return res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: "Question submitted successfully. Your question is now waiting for admin review." 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/community-questions/me"] });
      setLocation("/community-questions");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim().length === 0 || question.length > maxQuestionLength) return;
    
    submitMutation.mutate({ text: question.trim(), isAnonymous, category: "others" });
  };

  return (
    <AppLayout>
      <div 
        className="w-full min-h-screen pb-10"
        style={{ background: 'linear-gradient(135deg, #FAF2EF 0%, #F5F0FB 50%, #FFFDFB 75%, #F7F7FA 100%)' }}
      >
        <div className="w-full max-w-md mx-auto px-[clamp(16px,4vw,20px)] pt-[clamp(12px,3vw,16px)] pb-10 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5 flex-1 pr-4">
              <h1 className="text-[clamp(20px,5.5vw,24px)] font-black text-[#252525] tracking-tight leading-tight">
                Ask a Community Question
              </h1>
            </div>
            
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[18px] bg-gradient-to-br from-[#F6A8B7] to-[#F8D6DD] flex items-center justify-center shadow-lg shadow-[#F6A8B7]/30 shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
              <MessageSquare className="w-7 h-7 text-white relative z-10" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Question Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[16px] font-semibold text-[#252525] ml-1">
                Your Question <span className="text-[#F6A8B7]">*</span>
              </label>
              
              <div className="relative w-full rounded-[20px] bg-[#FAFAFA] border-2 border-[#F0F0F0] focus-within:border-[#F6A8B7] focus-within:ring-4 focus-within:ring-[#F6A8B7]/10 transition-all overflow-hidden h-[140px]">
                <HelpCircle className="absolute top-[18px] left-[18px] w-5 h-5 text-[#B0B0B0]" />
                <textarea
                  value={question}
                  onChange={(e) => {
                    if (e.target.value.length <= maxQuestionLength) {
                      setQuestion(e.target.value);
                    }
                  }}
                  placeholder="Write your question here..."
                  className="w-full h-full bg-transparent resize-none p-[18px] pl-12 pb-10 text-[15px] font-medium text-[#252525] placeholder:text-[#B0B0B0] placeholder:font-normal focus:outline-none"
                />
                <span className={`absolute bottom-3 right-4 text-[12px] font-bold ${question.length >= maxQuestionLength ? 'text-[#F6A8B7]' : 'text-[#A0A0A0]'}`}>
                  {question.length}/{maxQuestionLength}
                </span>
              </div>
              <p className="text-[13px] text-[#808080] font-medium ml-1">
                💡 Ask one clear and meaningful question.
              </p>

              {/* Question Tips Card */}
              <div className="w-full rounded-[18px] p-4 sm:p-5 border border-[#F8D6DD]/60 bg-[#FFF0F3]/30 flex flex-col gap-2 mt-2 shadow-sm">
                <h4 className="text-[13.5px] font-bold text-[#252525]">Question Tips</h4>
                <ul className="text-[12px] sm:text-[12.5px] text-[#707070] font-medium space-y-1.5 leading-snug">
                  <li className="flex gap-2">
                    <span className="text-[#F6A8B7] font-bold">•</span> 
                    Ask one question only.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#F6A8B7] font-bold">•</span> 
                    Keep it respectful.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#F6A8B7] font-bold">•</span> 
                    Avoid personal information.
                  </li>
                </ul>
              </div>
            </div>

            {/* Category Grid Removed */}

            {/* Anonymous Toggle */}
            <div className="w-full rounded-[20px] p-4 sm:p-5 border border-[#F8D6DD]/60 bg-white/80 backdrop-blur-xl shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isAnonymous ? 'bg-[#F6A8B7]' : 'bg-[#F0F0F0]'}`}>
                  <Lock className={`w-4 h-4 ${isAnonymous ? 'text-white' : 'text-[#A0A0A0]'}`} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] sm:text-[15px] font-extrabold text-[#252525]">Ask Anonymously</span>
                  <span className="text-[11px] sm:text-[12px] text-[#707070] font-medium leading-snug">
                    Hide your name from matches
                  </span>
                </div>
              </div>
              <Switch 
                checked={isAnonymous} 
                onCheckedChange={setIsAnonymous}
                className="data-[state=checked]:bg-[#F6A8B7]"
              />
            </div>

            {/* How it works */}
            <div className="w-full rounded-[20px] p-4 border border-[#F8D6DD]/60 bg-[#FFF0F3]/50 shadow-sm flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-[#F6A8B7]/20 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-3.5 h-3.5 text-[#F6A8B7]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[12.5px] sm:text-[13px] font-bold text-[#252525] mb-1.5">How it works</h3>
                <ul className="text-[11px] sm:text-[11.5px] text-[#707070] font-medium space-y-1.5 leading-snug">
                  <li className="flex gap-1.5">
                    <span className="text-[#F6A8B7]">•</span> 
                    Your question will be reviewed.
                  </li>
                  <li className="flex gap-1.5">
                    <span className="text-[#F6A8B7]">•</span> 
                    After approval, it will be shown only to eligible users.
                  </li>
                  <li className="flex gap-1.5">
                    <span className="text-[#F6A8B7]">•</span> 
                    You'll be notified when responses are available.
                  </li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              disabled={question.trim().length === 0 || submitMutation.isPending}
              className="w-full h-14 rounded-full bg-gradient-to-r from-[#F6A8B7] to-[#F8D6DD] hover:from-[#F38E9F] hover:to-[#F6A8B7] text-white font-black text-[15px] sm:text-[16px] shadow-[0_8px_20px_rgba(246,168,183,0.3)] transition-all flex items-center justify-center gap-2 mt-4"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Question"}
              {!submitMutation.isPending && <Send className="w-4 h-4 ml-1" />}
            </Button>
            
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
