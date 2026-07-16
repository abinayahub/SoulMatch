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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
          
          return (
            <Link key={item.href} href={item.href}>
              <div className="flex flex-col items-center justify-center w-full h-full cursor-pointer group">
                <div className={`relative flex items-center justify-center w-12 h-8 rounded-full transition-all duration-300 ${
                  isActive ? "bg-primary/10 text-primary scale-110" : "text-muted-foreground hover:bg-background/5"
                }`}>
                  <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : ""}`} />
                </div>
                <span className={`text-[10px] font-medium mt-1 transition-colors duration-300 ${
                  isActive ? "text-primary font-bold" : "text-muted-foreground"
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
