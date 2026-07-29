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
            {/* Theme Toggle Icon */}
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.08 }}
              aria-label="Toggle theme"
              className="relative w-9 h-9 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.45)] bg-white/40 backdrop-blur-sm shadow-sm overflow-hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === 'dark' ? (
                  <motion.span
                    key="moon"
                    initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.22 }}
                    className="absolute flex items-center justify-center"
                  >
                    <Moon className="w-4 h-4 text-[#FF8F8F]" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="sun"
                    initial={{ rotate: 30, opacity: 0, scale: 0.7 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -30, opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.22 }}
                    className="absolute flex items-center justify-center"
                  >
                    <Sun className="w-4 h-4 text-[#FFB6A5]" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

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
        <section className="px-6 pt-14 pb-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center w-full"
          >
            <Badge variant="outline" className="mb-6 bg-white/40 backdrop-blur-sm text-[#FF8F8F] border-[rgba(255,255,255,0.5)] px-4 py-1.5 rounded-full text-[clamp(9px,2.80vw,13px)] font-bold flex items-center shadow-sm">
              <Heart className="w-3 h-3 mr-2 text-[#FF8F8F] fill-[#FF8F8F]" /> Discover Meaningful Connections
            </Badge>
            
            <h1 className="text-[clamp(29px,8.65vw,39px)] font-extrabold leading-[1.1] mb-5 tracking-tight text-[#1E1E1E]">
              Find your partner <br/>
              <span className="text-gradient-coral">
                the right way
              </span>
            </h1>
            
            <p className="text-[clamp(13px,3.82vw,17px)] text-[#6D6D6D] mb-8 leading-relaxed px-1 font-medium">
              30 days of honest conversations with yourself — and we'll find someone who truly matches you.
            </p>
          </motion.div>
        </section>

        {/* Hero Image Component */}
        <section className="px-6 pb-16">
          <motion.div 
            className="relative w-full aspect-[1.6] mx-auto rounded-[28px] overflow-hidden gradient-compatibility border border-white/40 shadow-sm flex items-center justify-center p-6"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {/* Glass Overlay Card with increased contrast */}
            <div className="absolute inset-0 card-compatibility-glass pointer-events-none" />
            
            {/* Face illustrations - dark pink outlines on white card using inverted multiply-screen stack */}
            <div className="absolute inset-0 mix-blend-multiply opacity-90 pointer-events-none">
              {/* Inverted image: black lines on white background */}
              <div className="absolute inset-0 bg-[url('/hero-faces.png')] bg-cover bg-center invert" />
              {/* Screen overlay to turn black lines to pink, keeping white background white */}
              <div className="absolute inset-0 bg-[#FF8F8F] mix-blend-screen" />
            </div>
            
            {/* Center Circle with stronger shadow and blur */}
            <motion.div 
              animate={{ scale: [1, 1.02, 1] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
              className="relative z-10 w-[clamp(119px,35.62vw,161px)] h-[clamp(119px,35.62vw,161px)] rounded-full circle-compatibility-glass flex flex-col items-center justify-center"
            >
              <Heart className="w-6 h-6 text-[#FF6B81] fill-[#FF6B81] mb-1" />
              <span className="text-[clamp(31px,9.16vw,41px)] font-extrabold text-[#1E1E1E] leading-none tracking-tight mb-1">92%</span>
              <span className="text-[clamp(8px,2.29vw,10px)] text-[#5E5E5E] font-bold tracking-wide uppercase">Match Score</span>
            </motion.div>
          </motion.div>
        </section>

        {/* How It Works */}
        <section className="px-6 py-16">
          <div className="text-center mb-12">
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
        <section className="py-16 px-6">
          <h2 className="text-[clamp(24px,7.12vw,32px)] font-extrabold mb-10 text-center text-[#1E1E1E]">Built <span className="text-gradient-coral">differently</span></h2>
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
        <section className="px-6 pt-8 pb-16 flex flex-col gap-5">
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
