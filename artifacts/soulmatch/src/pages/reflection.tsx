import { useLocation } from "wouter";
import { ArrowLeft, Heart, MessageCircleHeart } from "lucide-react";
import { DailyReflection } from "@/components/dashboard/DailyReflection";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function ReflectionPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [wasUnanswered, setWasUnanswered] = useState(false);

  useEffect(() => {
    // Check initial state in case query is already in cache
    const initialData = queryClient.getQueryData<any>(['/api/reflections/today']);
    if (initialData && !initialData.answered) {
      setWasUnanswered(true);
    }

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.query.queryKey.includes('/api/reflections/today')) {
        const data: any = event.query.state.data;
        if (data && !data.answered) {
           setWasUnanswered(true);
        } else if (data?.answered && wasUnanswered) {
           // They just submitted! Wait for the flash animation, then return to Dashboard.
           setTimeout(() => navigate("/dashboard"), 2000);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate, queryClient, wasUnanswered]);

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground font-sans w-full max-w-md mx-auto relative overflow-hidden pb-safe">
      <div className="flex items-center justify-between px-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-4 shrink-0 z-10 sticky top-0 bg-background/80 backdrop-blur-md h-[calc(4rem+env(safe-area-inset-top,0px))]">
        <button onClick={() => navigate("/dashboard")} className="p-2 -ml-2 rounded-full hover:bg-card/5 active:scale-95 transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-bold flex items-center gap-1.5">
          Reflection <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
        </h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col px-4 pb-6 overflow-y-auto pt-4">
         <DailyReflection />
      </div>
    </div>
  );
}
