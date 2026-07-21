import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Heart, Shield, Brain, ArrowRight, Sun, Moon } from "lucide-react";
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
    <div className="min-h-screen bg-background relative overflow-x-hidden font-sans pb-12">
      {/* Mobile Navbar */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border pt-[env(safe-area-inset-top,0px)] h-[calc(4rem+env(safe-area-inset-top,0px))]">
        <div className="px-5 h-16 flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-[17px] font-extrabold text-primary tracking-tight">SoulMatch</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle Icon */}
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.08 }}
              aria-label="Toggle theme"
              className="relative w-9 h-9 rounded-2xl flex items-center justify-center border border-border/40 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden"
              style={{ boxShadow: theme === 'dark' ? '0 0 12px rgba(219,68,120,0.25)' : '0 0 12px rgba(255,180,0,0.2)' }}
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
                    <Moon className="w-4 h-4" style={{ color: 'hsl(340 82% 65%)' }} />
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
                    <Sun className="w-4 h-4" style={{ color: 'hsl(42 95% 55%)' }} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <Link href="/login">
              <Button variant="outline" size="sm" className="font-semibold text-primary border-primary/30 bg-card rounded-xl shadow-sm h-8 px-4 text-xs">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto pb-12">
        {/* Hero Section */}
        <section className="px-6 pt-10 pb-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center w-full"
          >
            <Badge variant="outline" className="mb-6 bg-primary/5 text-primary border-primary/20 px-4 py-1.5 rounded-full text-[11px] font-bold flex items-center">
              <Heart className="w-3 h-3 mr-2" /> Discover Meaningful Connections
            </Badge>
            
            <h1 className="text-[34px] font-extrabold leading-[1.1] mb-5 tracking-tight text-foreground">
              Find your partner <br/>
              <span className="text-primary">
                the right way
              </span>
            </h1>
            
            <p className="text-[15px] text-muted-foreground mb-8 leading-relaxed px-1 font-medium">
              30 days of honest conversations with yourself — and we'll find someone who truly matches you.
            </p>
          </motion.div>
        </section>

        {/* Hero Image Component */}
        <section className="px-6 pb-12">
          <motion.div 
            className="relative w-full aspect-[1.6] mx-auto rounded-[28px] overflow-hidden shadow-lg shadow-primary/20 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              background: "linear-gradient(135deg, hsl(340 82% 75%), hsl(340 82% 65%))"
            }}
          >
            <div className="absolute inset-0 bg-[url('/hero-faces.png')] bg-cover bg-center mix-blend-overlay opacity-30" />
            
            <motion.div 
              animate={{ scale: [1, 1.03, 1] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
              className="relative z-10 w-[140px] h-[140px] rounded-full bg-card shadow-2xl flex flex-col items-center justify-center"
            >
              <Heart className="w-7 h-7 text-primary fill-primary mb-1" />
              <span className="text-[38px] font-extrabold text-foreground leading-none tracking-tight mb-1">92%</span>
              <span className="text-[10px] text-muted-foreground font-bold tracking-wide">Match Score</span>
            </motion.div>
          </motion.div>
        </section>

        {/* How It Works */}
        <section className="px-6 py-8">
          <div className="text-center mb-10">
            <h3 className="text-primary font-bold tracking-[0.15em] text-[10px] uppercase mb-3">How It Works</h3>
            <h2 className="text-[28px] font-extrabold text-foreground">Perfect <span className="text-primary">matches.</span></h2>
          </div>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.35rem] before:-translate-x-px before:h-full before:w-[1px] before:bg-primary/20">
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
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-white font-bold text-sm shadow-md shrink-0 z-10 border-4 border-background">
                  {step.num}
                </div>
                <div className="w-full bg-card border border-border shadow-sm p-4 rounded-[20px] ml-4">
                  <h4 className="text-[15px] font-bold text-foreground mb-1">{step.title}</h4>
                  <p className="text-[13px] text-muted-foreground leading-snug">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Why SoulMatch */}
        <section className="py-12 px-6">
          <h2 className="text-[28px] font-extrabold mb-8 text-center text-foreground">Built <span className="text-primary">differently</span></h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Brain, title: "Compatibility Matching", desc: "Values, not expectations, find real bonds." },
              { icon: Shield, title: "100% Private", desc: "Answers used only for matching." }
            ].map((feature, i) => (
              <div key={i} className="bg-card border border-border rounded-[24px] p-5 flex items-start gap-4 shadow-sm">
                <div className="p-3 bg-primary/10 rounded-[18px] shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[15px] font-bold mb-1 text-foreground">{feature.title}</h4>
                  <p className="text-[13px] text-muted-foreground leading-snug">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action Buttons Section */}
        <section className="px-6 py-6 flex flex-col gap-4">
          <Link href="/register">
            <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 h-[60px] rounded-[20px] text-[17px] font-bold transition-transform active:scale-[0.98]">
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          
          <Link href="/pricing">
            <Button variant="outline" size="lg" className="w-full bg-card border-border hover:bg-foreground/5 text-foreground h-[60px] rounded-[20px] text-[16px] font-bold shadow-sm transition-transform active:scale-[0.98]">
              Unlock Premium
            </Button>
          </Link>
          
          <p className="text-center text-[13px] text-muted-foreground mt-4 font-medium">
            Already have an account?{" "}
            <Link href="/login">
              <span className="text-primary font-bold cursor-pointer hover:underline">
                Login
              </span>
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
