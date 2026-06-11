import { motion } from "framer-motion";
import { Link } from "wouter";
import { Heart, Shield, Sparkles, Star, ArrowRight, CheckCircle2, Users, MessageCircle, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  { icon: Brain, title: "AI Personality Engine", description: "30-day guided journey reveals your authentic self, powering precise compatibility matching." },
  { icon: Shield, title: "Verified Profiles", description: "Every profile is document-verified. No fake profiles, no catfishing. Real people, real connections." },
  { icon: Sparkles, title: "Compatibility Scores", description: "Our algorithm analyzes 50+ dimensions of compatibility to surface your most meaningful matches." },
  { icon: MessageCircle, title: "Premium Chat", description: "When interests align, unlock rich conversations with read receipts and photo sharing." },
];

const testimonials = [
  { name: "Priya & Arjun", location: "Mumbai", text: "SoulMatch's AI knew we'd be perfect before we did. Married after 6 months!", score: 94 },
  { name: "Sana & Omar", location: "Dubai", text: "The 30-day journey helped me understand what I truly wanted. Found him on day 15.", score: 87 },
  { name: "Kavya & Rohan", location: "London", text: "Premium was worth every penny. We're now planning our wedding.", score: 91 },
];

const plans = [
  { name: "Basic", price: "$9.99", period: "/month", features: ["Unlimited profile views", "10 interests/day", "Basic matches"] },
  { name: "Premium", price: "$24.99", period: "/month", features: ["Everything in Basic", "AI matching", "Real-time chat", "See who viewed you"], popular: true },
];

const stats = [
  { value: "50K+", label: "Active Members" },
  { value: "8,200+", label: "Couples Matched" },
  { value: "94%", label: "Satisfaction Rate" },
  { value: "30", label: "Day Journey" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center glow-primary">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">SoulMatch AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="gradient-primary border-0 text-white glow-primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-1.5">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            AI-Powered Matchmaking
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Find Your <span className="gradient-text">Soul</span>mate<br />
            With Intelligence
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            SoulMatch AI goes beyond surface-level matching. Our 30-day personality journey and AI engine surface connections that truly resonate — on every level that matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gradient-primary border-0 text-white text-lg px-8 py-6 glow-primary">
                Begin Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/20 bg-white/5 hover:bg-white/10">
                View Plans
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Floating cards */}
        <div className="mt-20 relative max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Ananya", age: 27, city: "Mumbai", score: 94, trait: "Creative" },
              { name: "Ishaan", age: 30, city: "Delhi", score: 88, trait: "Empathetic" },
              { name: "Zara", age: 26, city: "London", score: 91, trait: "Ambitious" },
            ].map((person, i) => (
              <motion.div
                key={person.name}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="glass rounded-2xl overflow-hidden"
              >
                <div className="h-40 gradient-primary opacity-80 flex items-center justify-center">
                  <span className="text-5xl font-bold text-white/30">{person.name[0]}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{person.name}, {person.age}</h3>
                    <div className="flex items-center gap-1 text-primary text-sm font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      {person.score}%
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{person.city}</p>
                  <div className="mt-2 flex gap-1">
                    <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-xs rounded-full">{person.trait}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 text-center"
            >
              <div className="text-3xl font-bold gradient-text">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why <span className="gradient-text">SoulMatch AI</span>?</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">A new standard for meaningful matchmaking — built on intelligence, trust, and depth.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 flex gap-4"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0 glow-primary">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Real <span className="gradient-text">Love Stories</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-accent fill-accent" />)}
                </div>
                <p className="text-sm text-muted-foreground italic mb-4">"{t.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                  <div className="flex items-center gap-1 text-primary text-sm font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t.score}% match
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Simple <span className="gradient-text">Pricing</span></h2>
          <p className="text-muted-foreground mb-12">Invest in your love story</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.name} className={`glass rounded-2xl p-6 relative ${plan.popular ? "border-primary/40 glow-primary" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gradient-primary border-0 text-white px-4">Most Popular</Badge>
                  </div>
                )}
                <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                <div className="text-3xl font-bold gradient-text mb-1">{plan.price}<span className="text-lg text-muted-foreground">{plan.period}</span></div>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" />{f}</li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button className={`w-full mt-6 ${plan.popular ? "gradient-primary border-0 text-white" : "bg-white/10 hover:bg-white/15"}`}>
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto glass rounded-3xl p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 gradient-primary opacity-5" />
          <h2 className="text-4xl font-bold mb-4 relative">Your <span className="gradient-text">Soulmate</span> is Waiting</h2>
          <p className="text-muted-foreground mb-8 relative">Join thousands finding love through intelligence and authenticity.</p>
          <Link href="/register">
            <Button size="lg" className="gradient-primary border-0 text-white text-lg px-10 py-6 glow-primary relative">
              Start Your Journey Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
            <Heart className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold gradient-text">SoulMatch AI</span>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 SoulMatch AI. All rights reserved. Built with intelligence, driven by love.</p>
      </footer>
    </div>
  );
}
