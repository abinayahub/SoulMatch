import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard, Users, FileQuestion, Brain, HeartHandshake,
  BookOpen, Crown, ShieldCheck, AlertTriangle, LineChart,
  Bell, FileText, Settings, Key, Heart, HeadphonesIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "../layout/Navbar";

interface AdminLayoutProps {
  children: ReactNode;
}

const adminModules = [
  { name: "Overview", path: "/admin", icon: LayoutDashboard },
  { name: "User Management", path: "/admin/users", icon: Users },
  { name: "Questionnaires", path: "/admin/questions", icon: FileQuestion },
  { name: "Profile Insights", path: "/admin/ai", icon: Brain },
  { name: "Matches", path: "/admin/matches", icon: Heart },
  { name: "Stories & Journals", path: "/admin/journals", icon: BookOpen },
  { name: "Subscriptions", path: "/admin/premium", icon: Crown },
  { name: "Verification", path: "/admin/verifications", icon: ShieldCheck },
  { name: "Reports & Safety", path: "/admin/reports", icon: AlertTriangle },
  { name: "Support Tickets", path: "/admin/support", icon: HeadphonesIcon },
  { name: "Analytics", path: "/admin/analytics", icon: LineChart },
  { name: "Notifications", path: "/admin/notifications", icon: Bell },
  { name: "Content", path: "/admin/content", icon: FileText },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const isSuperAdmin = user?.role === "superadmin";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden pt-[calc(4rem+env(safe-area-inset-top,0px))]">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-background/50 backdrop-blur-md hidden md:flex flex-col h-[calc(100vh-4rem-env(safe-area-inset-top,0px))] sticky top-[calc(4rem+env(safe-area-inset-top,0px))] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              Admin Console
            </h2>
            <nav className="space-y-1">
              {adminModules.map((module) => {
                const isActive = location === module.path || (location.startsWith(module.path) && module.path !== "/admin");
                return (
                  <Link key={module.path} href={module.path} className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}>
                    <module.icon className="w-4 h-4 shrink-0" />
                    {module.name}
                  </Link>
                );
              })}
              
              <div className="my-4 border-t border-white/5 pt-4"></div>
              <h2 className="text-xs font-semibold text-destructive uppercase tracking-wider mb-2 px-3">
                Super Admin
              </h2>
              <Link href="/admin/super" className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                location.startsWith("/admin/super")
                  ? "bg-destructive/10 text-destructive" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}>
                <Key className="w-4 h-4 shrink-0" />
                System Controls
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-black/20 p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
