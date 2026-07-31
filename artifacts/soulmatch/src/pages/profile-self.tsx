import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useAuth, getAccessToken } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useGetMe, useUpdateMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { User, Briefcase, MapPin, Coffee, Heart, Camera, ShieldCheck, ChevronLeft } from "lucide-react";
import { getMandatoryCompletion } from "@/lib/profile-utils";
import { useLocation } from "wouter";

import { PersonalDetailsForm } from "@/components/profile/PersonalDetailsForm";
import { ProfessionalDetailsForm } from "@/components/profile/ProfessionalDetailsForm";
import { LocationForm } from "@/components/profile/LocationForm";
import { LifestyleForm } from "@/components/profile/LifestyleForm";
import { PreferencesForm } from "@/components/profile/PreferencesForm";
import { MediaForm } from "@/components/profile/MediaForm";
import { VerificationForm } from "@/components/profile/VerificationForm";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

const SECTIONS = [
  { id: "personal", label: "Personal", icon: User, component: PersonalDetailsForm },
  { id: "professional", label: "Professional", icon: Briefcase, component: ProfessionalDetailsForm },
  { id: "location", label: "Location", icon: MapPin, component: LocationForm },
  { id: "lifestyle", label: "Lifestyle", icon: Coffee, component: LifestyleForm },
  { id: "preferences", label: "Preferences", icon: Heart, component: PreferencesForm },
  { id: "media", label: "Photos & video", icon: Camera, component: MediaForm },
  { id: "verification", label: "Verification", icon: ShieldCheck, component: VerificationForm },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  const [activeSection, setActiveSection] = useState("personal");
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const { data: profile, isLoading } = useGetMe({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const updateMe = useUpdateMe({ request: { headers: authHeaders() } });
  const p = (profile as any) ?? user;

  const mandatoryCompletion = useMemo(() => getMandatoryCompletion(p), [p]);

  useEffect(() => {
    if (mandatoryCompletion.percentage === 100) {
      const hasSeen = localStorage.getItem("hasSeenProfileSuccess");
      if (!hasSeen) {
        setShowSuccessOverlay(true);
        localStorage.setItem("hasSeenProfileSuccess", "true");
      }
    }
  }, [mandatoryCompletion.percentage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSection]);

  const onSaveSection = (data: any, advance: boolean = true) => {
    updateMe.mutate(
      { data },
      {
        onSuccess: (updated: any) => {
          updateUser(updated);
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          toast({ title: "Section updated!" });
          
          const currentIdx = SECTIONS.findIndex(s => s.id === activeSection);
          if (currentIdx !== -1 && currentIdx < SECTIONS.length - 1) {
            if (advance) {
              setTimeout(() => setActiveSection(SECTIONS[currentIdx + 1].id), 500);
            }
          } else if (currentIdx === SECTIONS.length - 1 && advance) {
            window.scrollTo(0,0);
            if (mandatoryCompletion.percentage === 100 && !localStorage.getItem("hasSeenProfileSuccess")) {
              setShowSuccessOverlay(true);
              localStorage.setItem("hasSeenProfileSuccess", "true");
            } else {
              navigate('/dashboard');
            }
          }
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  };

  const handlePrevious = () => {
    const currentIdx = SECTIONS.findIndex(s => s.id === activeSection);
    if (currentIdx > 0) setActiveSection(SECTIONS[currentIdx - 1].id);
  };

  const activeComponent = SECTIONS.find(s => s.id === activeSection)?.component;
  const ActiveComponent = activeComponent || PersonalDetailsForm;

  const currentStepNum = SECTIONS.findIndex(s => s.id === activeSection) + 1;
  const wizardProgress = Math.round((currentStepNum / SECTIONS.length) * 100);

  return (
    <AppLayout>
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[32px] p-8 text-center max-w-sm w-full shadow-2xl border border-[#F8D6DD] bg-white">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,143,168,0.4)] bg-gradient-to-r from-[#FF9CB3] to-[#FF7E9C]">
                    <Heart className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-[#1E1E1E] mb-2">Profile Completed!</h2>
              <p className="text-[#6D6D6D] text-sm mb-8 leading-relaxed">You have unlocked priority matching and detailed compatibility insights.</p>
              <button className="w-full h-14 font-bold text-white bg-gradient-to-r from-[#FF9CB3] to-[#FF7E9C] rounded-full shadow-[0_8px_24px_rgba(255,126,156,0.35)] transition-transform active:scale-[0.98]" onClick={() => { setShowSuccessOverlay(false); navigate('/dashboard'); }}>
                Go to Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen relative bg-[#FFF8F8] pb-12">
        <div className="max-w-xl mx-auto px-4 pt-4 pb-8">

          {/* Top Bar: Back & Logo */}
          <div className="flex items-center justify-between mb-5">
            <button 
              type="button" 
              onClick={() => {
                if (currentStepNum > 1) {
                  handlePrevious();
                } else {
                  navigate('/dashboard');
                }
              }}
              className="flex items-center gap-1.5 text-[#6D6D6D] hover:text-[#1E1E1E] text-sm font-semibold transition-colors py-1 px-2 -ml-2"
            >
              <ChevronLeft className="w-5 h-5 text-[#FF8FA8]" />
              Back
            </button>

            {/* SoulMatch Logo */}
            <div className="flex items-center gap-1.5 font-black text-lg text-[#1E1E1E] tracking-tight">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#FF9CB3] to-[#FF7E9C] flex items-center justify-center shadow-xs">
                <Heart className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span>Soul<span className="text-[#FF7E9C]">Match</span></span>
            </div>

            <div className="w-12" /> {/* Spacer for symmetry */}
          </div>

          {/* Header Step & Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-bold text-[#6D6D6D] tracking-wide">
                Step {currentStepNum} of {SECTIONS.length}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-[#FF7E9C] bg-[#FFE6EC] px-2.5 py-0.5 rounded-full">
                {mandatoryCompletion.percentage}% Complete
              </span>
            </div>
            
            {/* Thin rounded progress bar */}
            <div className="h-1.5 w-full bg-[#FFE6EC] rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#FF9CB3] to-[#FF7E9C] rounded-full" 
                initial={{ width: 0 }} 
                animate={{ width: `${mandatoryCompletion.percentage}%` }} 
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="relative">
            {isLoading ? (
              <Skeleton className="h-[520px] rounded-[28px] bg-white border border-[#F8D6DD] shadow-[0_12px_40px_rgba(255,143,168,0.12)]" />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: "easeInOut" }}>
                  <ActiveComponent p={p} onSave={onSaveSection} onCancel={handlePrevious} hasPrevious={SECTIONS.findIndex(s => s.id === activeSection) > 0} isPending={updateMe.isPending} />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
