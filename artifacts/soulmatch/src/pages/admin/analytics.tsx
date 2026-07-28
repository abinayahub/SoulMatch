import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  useGetUserAnalytics, useGetRevenueAnalytics, useGetMatchAnalytics, useGetAnalyticsOverview,
} from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useState } from "react";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

const CHART_COLORS = ["hsl(340 80% 55%)", "hsl(260 60% 55%)", "hsl(35 90% 55%)", "hsl(170 60% 45%)"];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border shadow-md rounded-2xl rounded-xl px-3 py-2 text-xs border border-white/10">
      <p className="text-[#707070] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState("30d");

  const { data: overview } = useGetAnalyticsOverview({ query: { enabled: true }, request: { headers: authHeaders() } } as any);
  const { data: users, isLoading: loadingU } = useGetUserAnalytics({ period: period as any }, { query: { enabled: true }, request: { headers: authHeaders() } } as any);
  const { data: revenue, isLoading: loadingR } = useGetRevenueAnalytics({ period: period as any }, { query: { enabled: true }, request: { headers: authHeaders() } } as any);
  const { data: matches, isLoading: loadingM } = useGetMatchAnalytics({ query: { enabled: true }, request: { headers: authHeaders() } } as any);

  const o = overview as any;
  const u = users as any;
  const r = revenue as any;
  const m = matches as any;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
              <TrendingUp className="w-7 h-7 text-primary" />Analytics
            </h1>
            <p className="text-[#707070]">Platform performance metrics.</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-28 bg-card/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border shadow-md rounded-2xl border-white/10">
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: o?.totalUsers ?? 0, icon: Users, color: "text-blue-400" },
            { label: "Monthly Revenue", value: `$${(o?.monthlyRevenue ?? 0).toFixed(0)}`, icon: DollarSign, color: "text-green-400" },
            { label: "Total Matches", value: o?.totalMatches ?? 0, icon: Heart, color: "text-primary" },
            { label: "Premium Users", value: o?.premiumUsers ?? 0, icon: TrendingUp, color: "text-accent" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border shadow-md rounded-2xl rounded-2xl p-4">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-[#707070]">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User growth */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border shadow-md rounded-2xl rounded-2xl p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" />User Growth</h2>
            {loadingU ? <Skeleton className="h-48 rounded-xl bg-card/5" /> : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={u?.data ?? []}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--card))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(240 5% 55%)" }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(240 5% 55%)" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke={CHART_COLORS[0]} fill="url(#userGrad)" name="Users" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Revenue */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border shadow-md rounded-2xl rounded-2xl p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-400" />Revenue</h2>
            {loadingR ? <Skeleton className="h-48 rounded-xl bg-card/5" /> : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={r?.data ?? []}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS[2]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS[2]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--card))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(240 5% 55%)" }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(240 5% 55%)" }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke={CHART_COLORS[2]} fill="url(#revGrad)" name="Revenue ($)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Match analytics */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border shadow-md rounded-2xl rounded-2xl p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-primary" />Daily Matches</h2>
            {loadingM ? <Skeleton className="h-48 rounded-xl bg-card/5" /> : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={m?.dailyMatches ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--card))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(240 5% 55%)" }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(240 5% 55%)" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Matches" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Plan breakdown */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card border border-border shadow-md rounded-2xl rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Revenue by Plan</h2>
            {loadingR ? <Skeleton className="h-48 rounded-xl bg-card/5" /> : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={r?.planBreakdown ?? []} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="revenue">
                      {(r?.planBreakdown ?? []).map((_: any, i: number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {(r?.planBreakdown ?? []).map((p: any, i: number) => (
                    <div key={p.planId} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-[#707070]">{p.planName}</span>
                      <span className="font-semibold ml-auto">${p.revenue?.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
