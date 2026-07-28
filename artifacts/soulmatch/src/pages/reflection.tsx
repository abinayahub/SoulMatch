import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { DailyReflection } from "@/components/dashboard/DailyReflection";

export default function ReflectionPage() {
  const [, navigate] = useLocation();

  return (
    <div 
      className="w-full min-h-screen pb-safe font-sans relative overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 100%)' }}
    >
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, #F4F1FF 0%, transparent 50%), radial-gradient(circle at 100% 100%, #FFFDFC 0%, transparent 50%)' }} />
      <div className="w-full max-w-md mx-auto relative z-10 flex-1 flex flex-col">
        <style>{`
          .premium-glass-card {
            background: rgba(255, 255, 255, 0.48) !important;
            backdrop-filter: blur(28px) !important;
            -webkit-backdrop-filter: blur(28px) !important;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08) !important;
          }
        `}</style>
        <div className="flex items-center justify-between px-4 pt-[calc(0.5rem+env(safe-area-inset-top,0px))] pb-2 shrink-0 z-10 sticky top-0 h-[calc(3rem+env(safe-area-inset-top,0px))]">
          <button onClick={() => navigate("/dashboard")} className="p-2 -ml-2 rounded-full hover:bg-black/5 active:scale-95 transition-all text-[#252525]">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col px-4 pb-6 overflow-y-auto">
           <DailyReflection />
        </div>
      </div>
    </div>
  );
}
