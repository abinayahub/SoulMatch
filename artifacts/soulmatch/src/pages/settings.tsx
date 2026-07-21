import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Shield, Bell, Lock, LogOut, Trash2, ChevronRight, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AppLayout } from "@/components/layout/AppLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useGetBlockedUsers } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [profileVisible, setProfileVisible] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [theme, setTheme] = useState(() => {
    return user ? (localStorage.getItem(`theme_${user.id}`) || localStorage.getItem('theme') || 'dark') : (localStorage.getItem('theme') || 'dark');
  });

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark', 'purple');
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else if (theme === 'purple') {
      document.documentElement.classList.add('dark', 'purple');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const { data: blocked = [] } = useGetBlockedUsers({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const sections = [
    {
      title: "Privacy",
      icon: Eye,
      items: [
        {
          label: "Profile Visibility",
          description: "Make your profile visible to potential matches",
          control: <Switch checked={profileVisible} onCheckedChange={setProfileVisible} />,
        },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      items: [
        {
          label: "Push Notifications",
          description: "Receive notifications about interests and matches",
          control: <Switch checked={notifications} onCheckedChange={setNotifications} />,
        },
        {
          label: "Email Notifications",
          description: "Get email updates about your activity",
          control: <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />,
        },
      ],
    },
    {
      title: "Appearance",
      icon: Settings,
      items: [
        {
          label: "Theme",
          description: "Select your preferred theme",
          control: (
            <Select value={theme} onValueChange={(val) => {
              setTheme(val);
              localStorage.setItem('theme', val);
              if (user) {
                localStorage.setItem(`theme_${user.id}`, val);
              }
            }}>
              <SelectTrigger className="w-28 h-9 border border-border/40 bg-transparent rounded-xl text-xs">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          ),
        },
      ],
    },
  ];

  return (
    <AppLayout>
      <div className="w-full relative bg-background font-sans min-h-screen pt-4 pb-28">
        <div className="max-w-md mx-auto w-full px-5">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-6 -ml-4 text-muted-foreground hover:bg-card/5">
          <ChevronLeft className="w-4 h-4 mr-1" />Back
        </Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
            <Settings className="w-7 h-7 text-primary" />Settings
          </h1>
          <p className="text-muted-foreground">Manage your account and preferences.</p>
        </motion.div>

        <div className="space-y-4">
          {/* Account info */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border shadow-md rounded-2xl rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Account</h2>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="text-sm font-medium mt-0.5">{user?.email}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Role</Label>
                <p className="text-sm font-medium mt-0.5 capitalize">{user?.role}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Verification Status</Label>
                <p className="text-sm font-medium mt-0.5 capitalize">{user?.verificationStatus}</p>
              </div>
              <Link href="/verification">
                <Button variant="outline" size="sm" className="border-white/20 bg-card/5 gap-2">
                  <Shield className="w-4 h-4" />Submit Verification
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Toggle sections */}
          {sections.map((section, si) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + si * 0.05 }}
              className="bg-card border border-border shadow-md rounded-2xl rounded-2xl p-5"
            >
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <section.icon className="w-4 h-4 text-primary" />{section.title}
              </h2>
              <div className="space-y-4">
                {section.items.map((item, ii) => (
                  <div key={item.label}>
                    {ii > 0 && <Separator className="bg-card/10 mb-4" />}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      </div>
                      {item.control}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Blocked users */}
          {(blocked as any[]).length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card border border-border shadow-md rounded-2xl rounded-2xl p-5">
              <h2 className="font-semibold mb-4">Blocked Users</h2>
              <div className="space-y-2">
                {(blocked as any[]).map((u: any) => {
                  const photo = u.photos?.find((p: any) => p.isPrimary) ?? u.photos?.[0];
                  return (
                    <div key={u.id} className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={photo?.url} />
                        <AvatarFallback className="text-xs">{getInitials(u.firstName ?? "U")}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{u.firstName}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Danger zone */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border shadow-md rounded-2xl rounded-2xl p-5 border border-destructive/20">
            <h2 className="font-semibold mb-4 text-destructive">Danger Zone</h2>
            <div className="space-y-3">
              <Button onClick={handleLogout} variant="outline" className="w-full border-white/20 bg-card/5 gap-2 justify-start">
                <LogOut className="w-4 h-4" />Sign Out
              </Button>
              <Button variant="outline" className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 gap-2 justify-start" onClick={() => toast({ title: "Contact support to delete your account", variant: "destructive" })}>
                <Trash2 className="w-4 h-4" />Delete Account
              </Button>
            </div>
          </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
