import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Heart, MessageCircle, Search, Menu, X, LogOut, User, Settings, Crown, BookOpen } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical } from "lucide-react";

const navLinks = [
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/my-story", label: "Story", icon: BookOpen },
];

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const photo = user?.photos?.find((p) => p.isPrimary) ?? user?.photos?.[0];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16">
      <div className="glass-strong h-full border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard">
            <span className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center glow-primary">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text hidden sm:block">SoulMatch</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <span className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  location === href
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/5"
                }`}>
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin">
                <span className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  location.startsWith("/admin") ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-background/5"
                }`}>
                  <Crown className="w-4 h-4" />
                  Admin
                </span>
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
              </Button>
            </Link>

            <Button variant="ghost" size="icon" className="w-7 h-7 rounded-full hover:bg-background/10 shrink-0" onClick={() => navigate('/activity')}>
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full focus:outline-none">
                  <Avatar className="w-8 h-8 ring-2 ring-primary/30">
                    <AvatarImage src={photo?.url} />
                    <AvatarFallback className="gradient-primary text-white text-xs font-semibold">
                      {user ? getInitials(user.firstName, user.lastName) : "?"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass border-white/10">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-background/10" />
                <DropdownMenuItem asChild>
                  <Link href="/profile"><span className="flex items-center gap-2 cursor-pointer w-full"><User className="w-4 h-4" />My Profile</span></Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings"><span className="flex items-center gap-2 cursor-pointer w-full"><Settings className="w-4 h-4" />Settings</span></Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/subscription"><span className="flex items-center gap-2 cursor-pointer w-full"><Crown className="w-4 h-4 text-yellow-500" />Subscription</span></Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-background/10" />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>


          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden glass-strong border-b border-white/5 px-4 py-4 flex flex-col gap-1"
          >
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <span
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    location === href ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-background/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
