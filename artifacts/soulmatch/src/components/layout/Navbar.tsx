import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Heart, MessageCircle, Search, Menu, X, LogOut, User, Settings, Crown, BookOpen } from "lucide-react";
import { useState } from "react";
import { useAuth, getAccessToken } from "@/lib/auth-context";
import { getInitials } from "@/lib/utils";
import { useGetNotifications } from "@workspace/api-client-react";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const photo = user?.photos?.find((p) => p.isPrimary) ?? user?.photos?.[0];

  const { data: notifData } = useGetNotifications(
    { page: 1 },
    { 
      query: { enabled: !!user, refetchInterval: 15000 }, 
      request: { headers: { Authorization: `Bearer ${getAccessToken()}` } } 
    } as any
  );
  const unreadCount = (notifData as any)?.unreadCount ?? 0;

  return (
    <nav className="fixed top-0 left-0 right-0 md:top-3 md:left-4 md:right-4 z-50 h-[calc(3.5rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] md:h-16 bg-white/55 backdrop-blur-[24px] border-b md:border border-white/35 rounded-none md:rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.08)] px-4 flex items-center justify-between transition-all duration-300">
      {dropdownOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-40 transition-opacity duration-200"
          onClick={() => setDropdownOpen(false)}
        />
      )}

      {/* Logo */}
      <Link href="/dashboard">
        <span className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FFB8B0] to-[#FFC9BF] flex items-center justify-center shadow-sm">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-[#FF9F9F] hidden sm:block">SoulMatch</span>
        </span>
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              location === href
                ? "bg-[#FF9F9F]/10 text-[#FF9F9F]"
                : "text-[#707070] hover:text-[#252525] hover:bg-black/5"
            }`}>
              <Icon className="w-4 h-4" />
              {label}
            </span>
          </Link>
        ))}
        {isAdmin && (
          <Link href="/admin">
            <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              location.startsWith("/admin") ? "bg-[#FF9F9F]/10 text-[#FF9F9F]" : "text-[#707070] hover:text-[#252525] hover:bg-black/5"
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
          <Button variant="ghost" size="icon" className="relative text-[#707070] hover:text-[#252525] hover:bg-black/5">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF9F9F] animate-pulse" />
            )}
          </Button>
        </Link>

        <Button variant="ghost" size="icon" className="w-7 h-7 rounded-full hover:bg-black/5 shrink-0" onClick={() => navigate('/activity')}>
          <MoreVertical className="w-4 h-4 text-[#707070]" />
        </Button>

        <DropdownMenu onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full focus:outline-none">
              <Avatar className="w-8 h-8 ring-2 ring-primary/30">
                <AvatarImage src={photo?.url} />
                <AvatarFallback className="bg-gradient-to-r from-[#FFB8B0] to-[#FFC9BF] text-[#242424] text-xs font-semibold">
                  {user ? getInitials(user.firstName, user.lastName) : "?"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            sideOffset={12}
            className="w-[210px] p-[6px] z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-95 !duration-[220ms] origin-top-right mx-4 sm:mx-0"
            style={{ 
              background: 'rgba(255,255,255,0.48)', 
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: '18px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
            }}
          >
            <div className="px-[12px] pt-[6px] pb-[10px]">
              <p className="text-[16px] font-bold text-[#252525] truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[12px] text-[#707070] mt-0.5 truncate">{user?.email}</p>
            </div>
            
            <DropdownMenuSeparator className="!bg-[rgba(255,255,255,0.25)] mx-1 my-1" />
            
            <DropdownMenuItem asChild className="h-[40px] rounded-[12px] px-[10px] py-0 cursor-pointer transition-all duration-[220ms] focus:!bg-[rgba(246,168,183,0.12)] hover:!bg-[rgba(246,168,183,0.12)] focus:!text-[#252525]">
              <Link href="/profile"><span className="flex items-center gap-2.5 w-full text-[14px] font-medium text-[#252525]"><User className="w-[18px] h-[18px] text-[#F6A8B7]" />My Profile</span></Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild className="h-[40px] rounded-[12px] px-[10px] py-0 cursor-pointer transition-all duration-[220ms] focus:!bg-[rgba(246,168,183,0.12)] hover:!bg-[rgba(246,168,183,0.12)] focus:!text-[#252525]">
              <Link href="/settings"><span className="flex items-center gap-2.5 w-full text-[14px] font-medium text-[#252525]"><Settings className="w-[18px] h-[18px] text-[#F6A8B7]" />Settings</span></Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild className="h-[40px] rounded-[12px] px-[10px] py-0 cursor-pointer transition-all duration-[220ms] focus:!bg-[rgba(246,168,183,0.12)] hover:!bg-[rgba(246,168,183,0.12)] focus:!text-[#252525]">
              <Link href="/subscription"><span className="flex items-center gap-2.5 w-full text-[14px] font-medium text-[#252525]"><Crown className="w-[18px] h-[18px] text-[#F6A8B7]" />Subscription</span></Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="!bg-[rgba(255,255,255,0.25)] mx-1 my-1" />
            
            <DropdownMenuItem onClick={logout} className="h-[40px] rounded-[12px] px-[10px] py-0 cursor-pointer transition-all duration-[220ms] focus:!bg-[rgba(246,168,183,0.12)] hover:!bg-[rgba(246,168,183,0.12)] focus:!text-[#252525] [&>svg]:!hidden">
              <span className="flex items-center gap-2.5 w-full text-[14px] font-medium text-[#252525]"><LogOut className="w-[18px] h-[18px] text-[#F6A8B7]" />Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                    location === href ? "bg-primary/20 text-primary" : "text-[#707070] hover:text-[#252525] hover:bg-background/5"
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
