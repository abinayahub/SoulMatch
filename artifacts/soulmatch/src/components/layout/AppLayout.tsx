import { type ReactNode, useState, useEffect } from "react";
import { Link } from "wouter";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/lib/auth-context";
import { Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(true);

  // If user is premium, or not logged in, we don't need to show the banner
  const shouldShowUpgrade = user && !user.isPremium && showBanner;

  return (
    <div className="w-full min-h-screen relative flex flex-col font-sans" style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 100%)' }}>
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, #F4F1FF 0%, transparent 50%), radial-gradient(circle at 100% 100%, #FFFDFC 0%, transparent 50%)' }} />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <Navbar />
      <main className="pt-[calc(4rem+env(safe-area-inset-top,0px))] pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] flex-1 relative z-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
