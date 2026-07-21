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
    <div className="min-h-screen bg-background relative flex flex-col pb-16 md:pb-0">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <Navbar />
      <main className="pt-[calc(4rem+env(safe-area-inset-top,0px))] flex-1 relative z-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
