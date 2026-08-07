import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Heart, Shield, Brain, ArrowRight, Sun, Moon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function LandingPage() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.remove('light', 'dark', 'purple');
    document.documentElement.classList.add(next);
  };

  return (
    <div className="min-h-screen soulmatch-landing-bg relative overflow-x-hidden font-sans pb-12">
      {/* Mobile Navbar */}
      <nav className="sticky top-4 z-50 px-4 pt-[env(safe-area-inset-top,0px)]">
        <div className="px-5 h-16 flex items-center justify-between max-w-md mx-auto premium-glass backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-coral-soft flex items-center justify-center shadow-sm">
              <Heart className="w-4 h-4 text-white fill-white/20" />
            </div>
            <span className="text-[clamp(14px,4.33vw,20px)] font-extrabold text-[#1E1E1E] tracking-tight">SoulMatch</span>
          </div>
          <div className="flex items-center gap-3">


            <Link href="/login">
              <Button variant="outline" size="sm" className="font-semibold text-[#1E1E1E] border-[#FF8F8F]/50 hover:border-[#FF8F8F]/80 bg-white/40 backdrop-blur-sm rounded-full shadow-sm h-8 px-4 text-xs hover:bg-white/60 transition-all">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto pb-12">
        {/* Hero Section */}
        <section className="px-6 pt-14 pb-4 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center w-full"
          >

            
            <h1 className="text-[clamp(29px,8.65vw,39px)] font-extrabold leading-[1.1] mb-5 tracking-tight text-[#1E1E1E]">
              Find your partner <br/>
              <span className="text-gradient-coral">
                the right way
              </span>
            </h1>
            
            <p className="text-[clamp(13px,3.82vw,17px)] text-[#6D6D6D] mb-4 leading-relaxed px-1 font-medium">
              30 days of honest conversations with yourself — and we'll find someone who truly matches you.
            </p>
          </motion.div>
        </section>

        {/* Hero Image Component */}
        <section className="px-6 pb-6">
          <motion.div 
            className="relative w-full aspect-[1.6] mx-auto rounded-[28px] overflow-hidden border border-white/40 shadow-sm"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <img 
              src="/hero-couple.jpg?v=4" 
              alt="Couple matching" 
              className="w-full h-full object-cover"
            />
          </motion.div>
        </section>

        {/* How It Works */}
        <section className="px-6 pt-8 pb-8">
          <div className="text-center mb-10">
            <h3 className="text-[#FF8F8F] font-bold tracking-[0.15em] text-[clamp(9px,2.54vw,12px)] uppercase mb-3">How It Works</h3>
            <h2 className="text-[clamp(24px,7.12vw,32px)] font-extrabold text-[#1E1E1E]">Perfect <span className="text-gradient-coral">matches.</span></h2>
          </div>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.35rem] before:-translate-x-px before:h-full before:w-[1px] before:bg-[#FFB6A5]/30">
            {[
              { num: "1", title: "Create Profile", desc: "Basic details and what you seek." },
              { num: "2", title: "Daily Questions", desc: "30 days of thoughtful self-reflection." },
              { num: "3", title: "Earn Rewards", desc: "Unlock 42% off Premium for completing." },
              { num: "4", title: "Meet Matches", desc: "Connect with aligned souls." }
            ].map((step, i) => (
              <motion.div 
                key={step.num}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                className="relative flex items-center group"
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-full gradient-coral-soft text-white font-bold text-sm shadow-sm shrink-0 z-10 border-4 border-white/60">
                  {step.num}
                </div>
                <div className="w-full premium-glass p-5 ml-4 hover:shadow-md transition-all duration-300">
                  <h4 className="text-[clamp(13px,3.82vw,17px)] font-bold text-[#1E1E1E] mb-1">{step.title}</h4>
                  <p className="text-[clamp(11px,3.31vw,15px)] text-[#6D6D6D] leading-snug">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Why SoulMatch */}
        <section className="py-8 px-6">
          <h2 className="text-[clamp(24px,7.12vw,32px)] font-extrabold mb-8 text-center text-[#1E1E1E]">Built <span className="text-gradient-coral">differently</span></h2>
          <div className="grid grid-cols-1 gap-5">
            {[
              { icon: Brain, title: "Smart Matching", desc: "Values, not expectations, find real bonds." },
              { icon: Shield, title: "Secure & Private", desc: "Answers used only for matching." },
              { icon: Users, title: "Trusted Community", desc: "Connect safely with verified profiles." }
            ].map((feature, i) => (
              <div key={i} className="premium-glass p-5 flex items-start gap-4 hover:shadow-md transition-all duration-300">
                <div className="p-3 bg-[#FFB6A5]/20 rounded-[18px] shrink-0">
                  <feature.icon className="w-5 h-5 text-[#FF8F8F]" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[clamp(13px,3.82vw,17px)] font-bold mb-1 text-[#1E1E1E]">{feature.title}</h4>
                  <p className="text-[clamp(11px,3.31vw,15px)] text-[#6D6D6D] leading-snug">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action Buttons Section */}
        <section className="px-6 pt-4 pb-16 flex flex-col gap-5">
          <Link href="/register">
            <Button size="lg" className="w-full gradient-coral-soft hover:opacity-95 text-white h-[clamp(51px,15.27vw,69px)] rounded-full text-[clamp(14px,4.33vw,20px)] font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          
          <Link href="/pricing">
            <Button variant="outline" size="lg" className="w-full bg-white/40 backdrop-blur-sm border-[rgba(255,255,255,0.5)] hover:bg-white/60 text-[#1E1E1E] h-[clamp(51px,15.27vw,69px)] rounded-full text-[clamp(14px,4.07vw,18px)] font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
              Unlock Premium
            </Button>
          </Link>
          
          <p className="text-center text-[clamp(11px,3.31vw,15px)] text-[#6D6D6D] mt-4 font-medium">
            Already have an account?{" "}
            <Link href="/login">
              <span className="text-[#FF8F8F] font-bold cursor-pointer hover:underline">
                Login
              </span>
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
