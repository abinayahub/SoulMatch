import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ChevronRight, Flame, CheckCircle2, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import {
  useGetJourneyQuestions, useGetJourneyProgress, useSubmitAnswer,
  getGetJourneyProgressQueryKey,
} from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

export default function JourneyPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [textAnswer, setTextAnswer] = useState("");
  const [scaleValue, setScaleValue] = useState(5);
  const [multiSelected, setMultiSelected] = useState<string[]>([]);

  const { data: questions = [], isLoading: loadingQ } = useGetJourneyQuestions({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const { data: progress } = useGetJourneyProgress({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const submitAnswer = useSubmitAnswer({ request: { headers: authHeaders() } });

  const unanswered = (questions as any[]).filter((q: any) => !q.isAnswered);
  const currentQ = unanswered[currentIdx];
  const totalAnswered = (questions as any[]).filter((q: any) => q.isAnswered).length;
  const pct = questions.length > 0 ? Math.round((totalAnswered / questions.length) * 100) : 0;

  function getAnswer() {
    if (!currentQ) return "";
    switch (currentQ.questionType) {
      case "choice": return selectedOption;
      case "text": return textAnswer;
      case "scale": return String(scaleValue);
      case "multi_choice": return multiSelected.join(",");
      default: return textAnswer;
    }
  }

  function handleNext() {
    const answer = getAnswer();
    if (!answer) { toast({ title: "Please provide an answer", variant: "destructive" }); return; }

    submitAnswer.mutate(
      { data: { questionId: currentQ.id, answer } },
      {
        onSuccess: () => {
          toast({ title: "Answer saved!", description: `Day ${currentQ.day} complete.` });
          queryClient.invalidateQueries({ queryKey: getGetJourneyProgressQueryKey() });
          setCurrentIdx(i => i + 1);
          setSelectedOption(""); setTextAnswer(""); setScaleValue(5); setMultiSelected([]);
        },
        onError: (err: any) => {
          if (err.message?.includes("Already answered")) {
            setCurrentIdx(i => i + 1);
          } else {
            toast({ title: "Error", description: err.message, variant: "destructive" });
          }
        },
      },
    );
  }

  function toggleMulti(opt: string) {
    setMultiSelected(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-accent" />
            30-Day Journey
          </h1>
          <p className="text-muted-foreground">Daily questions that reveal your authentic self and improve your matches.</p>
        </motion.div>

        {/* Progress overview */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-accent" />
              <span className="font-semibold">{progress?.streak ?? 0} day streak</span>
            </div>
            <span className="text-sm font-semibold text-primary">{totalAnswered} / {questions.length} answered</span>
          </div>
          <Progress value={pct} className="h-3 bg-white/10" />
          <p className="text-xs text-muted-foreground mt-2">{pct}% complete — {questions.length - totalAnswered} questions remaining</p>
        </motion.div>

        {/* Question card */}
        {loadingQ ? (
          <Skeleton className="h-72 rounded-2xl bg-white/5" />
        ) : unanswered.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Journey Complete!</h2>
            <p className="text-muted-foreground mb-6 text-sm">You've answered all available questions. Your personality profile has been generated.</p>
            <Link href="/personality">
              <Button className="gradient-primary border-0 text-white glow-primary">View Personality Profile</Button>
            </Link>
          </motion.div>
        ) : currentQ ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 bg-primary/20 text-primary text-xs rounded-full font-medium">Day {currentQ.day}</span>
                <span className="px-2.5 py-0.5 bg-white/10 text-muted-foreground text-xs rounded-full">{currentQ.category}</span>
              </div>
              <h2 className="text-xl font-bold mb-1">{currentQ.question}</h2>
              {currentQ.description && <p className="text-sm text-muted-foreground mb-5">{currentQ.description}</p>}

              <div className="mt-5 space-y-3">
                {currentQ.questionType === "choice" && currentQ.options?.length > 0 && (
                  <div className="space-y-2">
                    {currentQ.options.map((opt: string) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedOption(opt)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all border ${
                          selectedOption === opt ? "border-primary bg-primary/15 text-primary" : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {currentQ.questionType === "multi_choice" && currentQ.options?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentQ.options.map((opt: string) => (
                      <button
                        key={opt}
                        onClick={() => toggleMulti(opt)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                          multiSelected.includes(opt) ? "border-primary bg-primary/15 text-primary" : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {currentQ.questionType === "text" && (
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    className="bg-white/5 border-white/10 min-h-[120px]"
                  />
                )}

                {currentQ.questionType === "scale" && (
                  <div>
                    <input
                      type="range" min={1} max={10} value={scaleValue}
                      onChange={(e) => setScaleValue(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Not at all</span>
                      <span className="font-bold text-primary text-base">{scaleValue}</span>
                      <span>Absolutely</span>
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={handleNext} className="w-full mt-6 gradient-primary border-0 text-white glow-primary" disabled={submitAnswer.isPending}>
                {submitAnswer.isPending ? "Saving..." : <>Save & Continue <ChevronRight className="w-4 h-4 ml-1" /></>}
              </Button>

              <div className="text-center mt-3 text-xs text-muted-foreground">
                Question {currentIdx + 1} of {unanswered.length} remaining
              </div>
            </motion.div>
          </AnimatePresence>
        ) : null}

        {/* All questions list */}
        {!loadingQ && questions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><Brain className="w-5 h-5 text-primary" />All Questions</h2>
            <div className="space-y-2">
              {(questions as any[]).map((q: any) => (
                <div key={q.id} className={`flex items-center gap-3 p-3 rounded-xl text-sm ${q.isAnswered ? "bg-green-500/5 border border-green-500/20" : "glass"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${q.isAnswered ? "bg-green-500/20 text-green-400" : "bg-white/10 text-muted-foreground"}`}>
                    {q.isAnswered ? <CheckCircle2 className="w-3.5 h-3.5" /> : q.day}
                  </div>
                  <span className={q.isAnswered ? "text-muted-foreground line-through" : ""}>{q.question}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{q.category}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
