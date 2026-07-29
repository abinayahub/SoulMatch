import { Link, useLocation } from "wouter";
import { LayoutGrid, Search, MessageCircle, BookOpen, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function BottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { href: "/dashboard", icon: LayoutGrid, label: "Home" },
    { href: "/discover", icon: Search, label: "Discover" },
    { href: "/chat", icon: MessageCircle, label: "Chat" },
    { href: "/my-story", icon: BookOpen, label: "Story" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  // Don't show bottom nav on non-authenticated pages like landing, login, register
  if (!user || ["/", "/login", "/register", "/complete-profile"].includes(location)) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/55 backdrop-blur-[24px] border-t border-white/35 rounded-t-[28px] rounded-b-none shadow-[0_-10px_35px_rgba(255,190,180,0.15)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
          
          return (
            <Link key={item.href} href={item.href}>
              <div className="flex flex-col items-center justify-center cursor-pointer group">
                <div className={`relative flex items-center justify-center w-12 h-9 rounded-full transition-all duration-300 ${
                  isActive ? "bg-[#FF9F9F]/10 text-[#FF9F9F] scale-110" : "text-[#757575] hover:bg-black/5"
                }`}>
                  <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : ""}`} />
                </div>
                <span className={`text-[clamp(9px,2.54vw,12px)] font-semibold mt-0.5 transition-colors duration-300 ${
                  isActive ? "text-[#FF9F9F] font-bold" : "text-[#757575]"
                }`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
