import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function TermsPage() {
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
            <ShieldCheck className="w-6 h-6 text-[#F6A8B7]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Terms of Service</h1>
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
            <h2 className="text-lg font-bold text-[#252525]">1. Acceptance of Terms</h2>
            <p className="text-sm text-[#707070] leading-relaxed">
              By accessing and using SoulMatch App, you agree to comply with and be bound by these Terms of Service. If you do not agree with any of these terms, you are prohibited from using or accessing this application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#252525]">2. Eligibility & Accounts</h2>
            <p className="text-sm text-[#707070] leading-relaxed">
              You must be at least 18 years of age to create an account and use this matchmaking service. You agree to provide true, accurate, and complete information during registration and keep your credentials secure.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#252525]">3. Member Conduct & Profile Safety</h2>
            <p className="text-sm text-[#707070] leading-relaxed">
              SoulMatch is built on trust and respect. Harassment, abusive behavior, creation of fake profiles, or distribution of unauthorized promotional material is strictly prohibited. We reserve the right to suspend or permanently delete accounts that violate community rules.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#252525]">4. Premium Subscription & Purchases</h2>
            <p className="text-sm text-[#707070] leading-relaxed">
              Subscription billing is managed securely. You may manage or cancel your subscriptions through your profile settings or standard app store configurations. Refunds are issued in accordance with respective platform billing policies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[#252525]">5. Disclaimers & Limitation of Liability</h2>
            <p className="text-sm text-[#707070] leading-relaxed">
              SoulMatch is provided "as is" without warranty of any kind. While we utilize state-of-the-art personality algorithms to match compatible users, we do not guarantee matching outcomes or relationship success.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
