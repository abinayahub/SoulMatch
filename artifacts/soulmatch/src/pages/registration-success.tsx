import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { User, PenTool, Compass, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function RegistrationSuccessPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !user) {
      window.location.href = "/register";
    }
  }, [isAuthenticated, user]);

  return (
    <div 
      className="w-full min-h-screen relative flex flex-col font-sans overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FFF5F5 0%, #FFF0ED 50%, #FDF0F0 100%)' }}
    >
      {/* Animated Glowing Orbs & Background Elements */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full mix-blend-multiply filter blur-[80px]"
        style={{ background: 'radial-gradient(circle, rgba(255,184,176,0.4) 0%, transparent 70%)' }}
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full mix-blend-multiply filter blur-[80px]"
        style={{ background: 'radial-gradient(circle, rgba(255,201,191,0.5) 0%, transparent 70%)' }}
      />

      {/* Floating Particles overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay" />

      {/* Inner container with overflow-x-hidden to prevent horizontal scrolling */}
      <div className="relative z-10 flex-1 flex flex-col w-full max-w-lg mx-auto px-5 sm:px-6 py-10 md:py-14 h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
        
        {/* Success Hero Illustration */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, duration: 0.8 }}
          className="flex justify-center mb-6 mt-4 relative"
        >
          {/* Subtle glow behind image */}
          <div className="absolute inset-0 bg-white/40 blur-3xl rounded-full scale-150" />
          
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 z-10 flex items-center justify-center">
            {/* Premium Vector SVG Illustration replacing the static image */}
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_15px_30px_rgba(255,122,122,0.2)] z-10 relative">
              <defs>
                <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFB8B0" />
                  <stop offset="100%" stopColor="#FF7A7A" />
                </linearGradient>
                <linearGradient id="envelopeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#FFF0F0" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              {/* Envelope Back */}
              <path d="M40 80 L100 130 L160 80 L160 140 C160 151.046 151.046 160 140 160 L60 160 C48.9543 160 40 151.046 40 140 L40 80Z" fill="url(#envelopeGrad)" stroke="#FFE0E0" strokeWidth="2" />
              
              {/* Glowing Heart floating out */}
              <motion.path 
                initial={{ y: 25, opacity: 0, scale: 0.6 }}
                animate={{ y: -10, opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.5, type: "spring", bounce: 0.4 }}
                d="M100 115 C100 115 65 85 65 60 C65 45 77 35 90 35 C96 35 100 40 100 40 C100 40 104 35 110 35 C123 35 135 45 135 60 C135 85 100 115 100 115Z" 
                fill="url(#heartGrad)" 
                filter="url(#glow)"
              />
              
              {/* Envelope Front Flaps */}
              <path d="M40 80 L100 125 L160 80" stroke="#FFD6D6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M40 160 L90 120" stroke="#FFD6D6" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M160 160 L110 120" stroke="#FFD6D6" strokeWidth="2" strokeLinecap="round" fill="none" />
              
              {/* Floating Sparkles */}
              <motion.circle cx="45" cy="50" r="3" fill="#FFB8B0" animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5], y: [-5, -15] }} transition={{ repeat: Infinity, duration: 2 }} />
              <motion.circle cx="155" cy="40" r="4" fill="#FF9A9A" animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], y: [0, -10] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }} />
              <motion.circle cx="140" cy="15" r="2.5" fill="#FFC2C2" animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5], y: [0, -10] }} transition={{ repeat: Infinity, duration: 1.8, delay: 1 }} />
              <motion.circle cx="70" cy="20" r="2" fill="#FF7A7A" animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5], y: [0, -8] }} transition={{ repeat: Infinity, duration: 2.2, delay: 0.8 }} />
              <motion.path d="M100 15 L103 22 L110 25 L103 28 L100 35 L97 28 L90 25 L97 22 Z" fill="#FF9A9A" animate={{ opacity: [0, 1, 0], rotate: 180, scale: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3, delay: 1.2 }} style={{ transformOrigin: "100px 25px" }} />
            </svg>
          </div>
        </motion.div>

        {/* Title & Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-[#4A3B3B] to-[#7A5A5A]">
            Account Created<br />Successfully!
          </h1>
          <p className="text-[#5A4A4A] text-[15px] sm:text-[16px] font-medium px-4">
            Welcome to SoulMatch, {user?.firstName || 'there'} <span className="text-[#FF9A9A]">🩷</span><br />
            <span className="text-[#8A7A7A] font-normal mt-1 block">Your journey to meaningful connections starts today.</span>
          </p>
        </motion.div>

        {/* Main Success Envelope Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="premium-glass-card rounded-[24px] border border-white/60 relative overflow-hidden p-5 sm:p-6 mb-8 flex items-center gap-4 shadow-[0_15px_40px_rgba(0,0,0,0.05)] bg-white/40"
        >
          {/* Subtle shine effect */}
          <div className="absolute top-0 left-0 w-[200%] h-[100%] bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-45 -translate-x-full animate-[shimmer_3s_infinite]" />
          
          <div className="flex-1">
            <h3 className="text-[16px] text-[#252525] font-bold mb-1">Your account is now ready.</h3>
            <p className="text-[13px] sm:text-[14px] text-[#707070] font-medium leading-relaxed">
              You're fully set to discover meaningful connections, share your unique story, and begin your <span className="text-[#FF7A7A] font-bold">30-day journey!</span>
            </p>
          </div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 relative flex items-center justify-center hidden sm:flex">
            <div className="absolute inset-0 bg-[#FF9A9A]/20 blur-xl rounded-full" />
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#FFD1DC] to-[#F8A3B8] shadow-lg flex items-center justify-center border border-white/50 rotate-3 transform hover:rotate-6 transition-transform">
              <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white/30" />
            </div>
          </div>
        </motion.div>

        {/* Separator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <div className="h-px bg-gradient-to-r from-transparent to-[#F0D4D4] flex-1" />
          <span className="text-[11px] font-bold text-[#C8B8B8] uppercase tracking-[0.15em] shrink-0">What you can do next</span>
          <div className="h-px bg-gradient-to-l from-transparent to-[#F0D4D4] flex-1" />
        </motion.div>

        {/* 3 Horizontal Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-3 gap-2 sm:gap-4 mb-10 w-full"
        >
          {/* Card 1 */}
          <div className="premium-glass-card rounded-[16px] sm:rounded-[20px] border border-white/50 p-2 sm:p-5 flex flex-col items-center text-center hover:-translate-y-1 transition-transform cursor-pointer bg-white/30">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-[#FFE4E1]/80 flex items-center justify-center mb-2 sm:mb-3 border border-white/60">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF7A7A]" />
            </div>
            <h4 className="text-[#252525] font-bold text-[11px] sm:text-[14px] leading-tight mb-1">Complete<br/>Profile</h4>
            <p className="text-[#8A7A7A] text-[10px] sm:text-[11px] mt-1 hidden sm:block">Help us understand you.</p>
          </div>

          {/* Card 2 */}
          <div className="premium-glass-card rounded-[16px] sm:rounded-[20px] border border-white/50 p-2 sm:p-5 flex flex-col items-center text-center hover:-translate-y-1 transition-transform cursor-pointer bg-white/30">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-[#FFF0E6]/80 flex items-center justify-center mb-2 sm:mb-3 border border-white/60">
              <PenTool className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF9A9A]" />
            </div>
            <h4 className="text-[#252525] font-bold text-[11px] sm:text-[14px] leading-tight mb-1">Share Your<br/>Story</h4>
            <p className="text-[#8A7A7A] text-[10px] sm:text-[11px] mt-1 hidden sm:block">Tell it when you're ready.</p>
          </div>

          {/* Card 3 */}
          <div className="premium-glass-card rounded-[16px] sm:rounded-[20px] border border-white/50 p-2 sm:p-5 flex flex-col items-center text-center hover:-translate-y-1 transition-transform cursor-pointer bg-white/30">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-[#FDF0F0]/80 flex items-center justify-center mb-2 sm:mb-3 border border-white/60">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB8B0]" />
            </div>
            <h4 className="text-[#252525] font-bold text-[11px] sm:text-[14px] leading-tight mb-1">Start<br/>Exploring</h4>
            <p className="text-[#8A7A7A] text-[10px] sm:text-[11px] mt-1 hidden sm:block">Discover your dashboard.</p>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-auto pt-4"
        >
          <Button 
            onClick={() => window.location.href = "/dashboard"}
            className="w-full rounded-full flex items-center justify-center gap-2 h-14 relative overflow-hidden gradient-coral-pill"
          >
            {/* Shimmer on button */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite_ease-in-out]" />
            <span className="relative z-10 text-white font-bold text-[17px]">Continue to Home</span>
            <ArrowRight className="w-5 h-5 ml-1 relative z-10 text-white" />
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex items-center justify-center gap-2 mt-6 pb-4"
        >
          <ShieldCheck className="w-4 h-4 text-[#C8B8B8]" />
          <p className="text-[12px] font-medium text-[#8A7A7A]">
            Your privacy is our priority. Your data is <span className="text-[#FF7A7A] font-bold">safe with us.</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
