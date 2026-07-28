import { motion } from "framer-motion";
import { Crown, Users, Heart, MessageCircle, DollarSign, TrendingUp, Shield, Flag } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetAnalyticsOverview } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

export default function AdminDashboard() {
  const { data: overview, isLoading } = useGetAnalyticsOverview({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const o = overview as any;

  const stats = [
    { label: "Total Users", value: o?.totalUsers ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Premium Users", value: o?.premiumUsers ?? 0, icon: Crown, color: "text-accent", bg: "bg-accent/10" },
    { label: "Total Matches", value: o?.totalMatches ?? 0, icon: Heart, color: "text-primary", bg: "bg-primary/10" },
    { label: "Messages", value: o?.totalMessages ?? 0, icon: MessageCircle, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Monthly Revenue", value: `$${(o?.monthlyRevenue ?? 0).toFixed(0)}`, icon: DollarSign, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Active Today", value: o?.activeToday ?? 0, icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Pending Verif.", value: o?.pendingVerifications ?? 0, icon: Shield, color: "text-[#F6A8B7]", bg: "bg-[#F6A8B7]/10" },
    { label: "Pending Reports", value: o?.pendingReports ?? 0, icon: Flag, color: "text-red-400", bg: "bg-red-500/10" },
  ];

  const quickLinks = [
    { href: "/admin/users", label: "Manage Users", icon: Users, description: "View, edit, and moderate user accounts" },
    { href: "/admin/reports", label: "Reports Queue", icon: Flag, description: "Review and resolve user reports" },
    { href: "/admin/verifications", label: "Verifications", icon: Shield, description: "Approve identity verification requests" },
    { href: "/admin/analytics", label: "Analytics", icon: TrendingUp, description: "Platform metrics and revenue data" },
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
            <Crown className="w-7 h-7 text-accent" />Admin Dashboard
          </h1>
          <p className="text-[#707070]">Platform overview and management tools.</p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border shadow-md rounded-2xl rounded-2xl p-4"
            >
              {isLoading ? (
                <Skeleton className="h-16 rounded-xl bg-card/5" />
              ) : (
                <>
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-[#707070] mt-0.5">{stat.label}</div>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map((link, i) => (
            <motion.div key={link.href} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
              <Link href={link.href}>
                <div className="bg-card border border-border shadow-md rounded-2xl rounded-2xl p-5 cursor-pointer hover:bg-card/5 transition-colors group flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <link.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{link.label}</h3>
                    <p className="text-sm text-[#707070] mt-0.5">{link.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
