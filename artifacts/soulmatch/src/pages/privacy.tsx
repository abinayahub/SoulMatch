import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function PrivacyPage() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation("/register");
    }
  };

  return (
    <div className="w-full min-h-screen relative flex flex-col font-sans text-[#252525] relative pb-16" style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 100%)' }}>
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, #F4F1FF 0%, transparent 50%), radial-gradient(circle at 100% 100%, #FFFDFC 0%, transparent 50%)' }} />
      {/* Background Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="max-w-2xl mx-auto px-4 pt-8 relative z-10">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="mb-6 -ml-3 text-[#707070] hover:text-[#252525] flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-8">
          <div className="w-12 h-12 bg-[#F6A8B7]/10 rounded-2xl flex items-center justify-center border border-[#F6A8B7]/20">
            <Lock className="w-6 h-6 text-[#F6A8B7]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-[#707070] mt-0.5">Last updated: July 20, 2026</p>
          </div>
        </div>

        {/* Content Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/40 border border-border/40 backdrop-blur-md rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-xl"
        >
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#252525]">1. Information We Collect</h2>
            <p className="text-sm text-[#707070] leading-relaxed">
              We collect information to help customize your matching profile and evaluate relationship compatibility. This includes registration details (name, email, age), gender, location details, profile pictures, and answers to questionnaire prompts.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#252525]">2. How We Use Your Data</h2>
            <p className="text-sm text-[#707070] leading-relaxed">
              Your data is processed locally and securely by our algorithms to present you with compatible matches, analyze relationship goals, allow messaging connection, and verify account authenticity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#252525]">3. Sharing Information</h2>
            <p className="text-sm text-[#707070] leading-relaxed">
              Your profile contents, lifestyle summaries, and personality characteristics are visible only to compatible users that you match with. We never sell, rent, or distribute your private database records to third-party tracking or advertising corporations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#252525]">4. Encryption & Retention</h2>
            <p className="text-sm text-[#707070] leading-relaxed">
              All active chats and personal profile configurations are protected with secure SSL transmission and standard database encryption. We retain your information as long as your account remains active.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#252525]">5. Your Control & Account Deletion</h2>
            <p className="text-sm text-[#707070] leading-relaxed">
              You maintain full control of your shared interests and visibility status. You may modify your personal details, hide your matching profile, or permanently delete your account and all associated messages at any time.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
