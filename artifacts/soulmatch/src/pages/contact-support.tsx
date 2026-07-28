import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Heart, ArrowLeft, HeadphonesIcon, Mail, Clock, HelpCircle, Send, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useCreateSupportMessage } from "@workspace/api-client-react";

export default function ContactSupportPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { mutateAsync: createMessage } = useCreateSupportMessage();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject) {
      toast({ title: "Error", description: "Please choose a subject", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createMessage({ data: formData });
      toast({ title: "Message sent!", description: "Our support team will get back to you shortly." });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen relative flex flex-col font-sans relative flex flex-col items-center" style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 100%)' }}>
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, #F4F1FF 0%, transparent 50%), radial-gradient(circle at 100% 100%, #FFFDFC 0%, transparent 50%)' }} />
      <nav className="w-full max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/">
          <span className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-primary">SoulMatch</span>
          </span>
        </Link>
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="text-[#707070] hover:bg-card/5">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </nav>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-10 flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <HeadphonesIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">We're Here to Help</h1>
          <p className="text-[#707070]">
            Our support team is ready to assist you.
            <br />
            How can we help you today?
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full bg-card border border-border shadow-md rounded-2xl p-8 mb-12 border-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Enter your name" required className="bg-card/5 border-white/10 h-12" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Enter your email" required className="bg-card/5 border-white/10 h-12" />
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Select required value={formData.subject} onValueChange={(val) => setFormData({...formData, subject: val})}>
                <SelectTrigger className="bg-card/5 border-white/10 h-12">
                  <SelectValue placeholder="Choose a topic" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  <SelectItem value="account">Account & Profile</SelectItem>
                  <SelectItem value="billing">Billing & Subscription</SelectItem>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="safety">Safety & Reporting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                placeholder="Tell us how we can help you..." 
                required 
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="min-h-[150px] bg-card/5 border-white/10 resize-y"
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base font-semibold shadow-lg shadow-primary/25 rounded-xl transition-all">
              <Send className="w-4 h-4 mr-2" /> {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full space-y-6">
          <h2 className="text-xl font-bold text-center mb-6">Other Ways to Reach Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border shadow-md rounded-2xl p-6 flex items-center justify-between border-white/5 cursor-pointer hover:bg-card/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">Email Support</h3>
                  <p className="text-[#707070] text-xs">support@soulmatch.com</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#707070] group-hover:text-primary transition-colors" />
            </div>

            <div className="bg-card border border-border shadow-md rounded-2xl p-6 flex items-center justify-between border-white/5 cursor-pointer hover:bg-card/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">Response Time</h3>
                  <p className="text-[#707070] text-xs">Within 24 hours</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#707070] group-hover:text-primary transition-colors" />
            </div>
          </div>

          <div className="bg-card border border-border shadow-md rounded-2xl p-6 flex items-center justify-between border-white/5 cursor-pointer hover:bg-card/5 transition-colors group mt-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Looking for quick answers?</h3>
                <p className="text-[#707070] text-xs">Visit our Help Center for common questions and guides.</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#707070] group-hover:text-primary transition-colors" />
          </div>
        </motion.div>

        <footer className="mt-16 mb-8 text-center opacity-80">
          <p className="text-sm text-[#707070] mb-1">Thank you for being part of SoulMatch.</p>
          <p className="text-sm text-[#707070] mb-6">We're here to support your journey to meaningful connections.</p>
          <Heart className="w-6 h-6 text-primary mx-auto opacity-50" />
        </footer>
      </main>
    </div>
  );
}
