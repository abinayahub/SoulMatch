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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-[32px] p-8 text-center max-w-sm w-full shadow-2xl">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute inset-0 flex items-center justify-center" />
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-primary shadow-[0_0_30px_rgba(236,72,153,0.5)]">
                    <Heart className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-foreground mb-2">Profile Completed!</h2>
              <p className="text-muted-foreground text-sm mb-8 leading-relaxed">You have unlocked priority matching and detailed compatibility insights.</p>
              <Button className="w-full h-14 font-bold bg-primary text-white rounded-2xl shadow-lg" onClick={() => { setShowSuccessOverlay(false); navigate('/dashboard'); }}>
                Go to Dashboard
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-background relative pb-28">
        <div className="max-w-md mx-auto px-5 py-6">

          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[13px] font-extrabold tracking-wider text-muted-foreground uppercase">
                Step {currentStepNum} of {SECTIONS.length}
              </span>
              <span className="text-[13px] font-extrabold text-primary">{wizardProgress}% Complete</span>
            </div>
            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary" 
                initial={{ width: 0 }} 
                animate={{ width: `${wizardProgress}%` }} 
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="relative">
            {isLoading ? (
              <Skeleton className="h-[600px] rounded-[32px] bg-foreground/5" />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={activeSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
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
