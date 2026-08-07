import { API_URL } from '../../config/api';
import { useQuery } from "@tanstack/react-query";
import { Users, Crown, Heart, UserCheck, DollarSign, Calendar, Download, ChevronDown, Lightbulb } from "lucide-react";
import { getAccessToken } from "@/lib/auth-context";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const fetchOverview = async () => {
  const res = await fetch(`${API_URL}/api/admin/overview`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch overview");
  return res.json();
};

const CHART_COLORS = {
  blue: "#3B82F6",
  purple: "#8B5CF6",
  pink: "#EC4899",
  green: "#10B981",
  yellow: "#F59E0B",
  red: "#EF4444",
  orange: "#F97316"
};

export default function AdminOverview() {
  const { toast } = useToast();
  const { data, isLoading } = useQuery({
    queryKey: ["adminOverview"],
    queryFn: fetchOverview,
  });

  const handleSoon = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `${feature} functionality will be available in a future update.`,
    });
  };

  if (isLoading) {
    return <div className="text-[#6B7280] animate-pulse flex h-[80vh] items-center justify-center text-xl">Loading dashboard...</div>;
  }

  if (!data || !data.topMetrics) {
    return <div className="text-[#6B7280] animate-pulse flex h-[80vh] items-center justify-center text-xl">Updating data structure...</div>;
  }

  return (
    <div className="space-y-6 max-w-[clamp(1360px,407.12vw,1840px)] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Overview</h1>
          <p className="text-[#6B7280] mt-1">Welcome back, Admin! Here's what's happening with SoulMatch.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => handleSoon('Date filtering')} variant="outline" className="bg-[#FFFFFF] border-[#E5E7EB] text-[#6B7280] h-10 px-4 hover:bg-[#F3F4F6] hover:text-[#374151]">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
            <Calendar className="w-4 h-4 ml-2 opacity-50" />
          </Button>
          <Button onClick={() => handleSoon('Report Export')} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-[#111827] h-10 border-0">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard icon={<Users className="text-[#8B5CF6]" />} title="Total Users" value={data.topMetrics.totalUsers.value.toLocaleString()} trend={data.topMetrics.totalUsers.trend} trendColor="text-[#16A34A]" />
        <MetricCard icon={<Crown className="text-[#F59E0B]" />} title="Premium Users" value={data.topMetrics.premiumUsers.value.toLocaleString()} trend={data.topMetrics.premiumUsers.trend} trendColor="text-[#16A34A]" />
        <MetricCard icon={<Heart className="text-[#2563EB]" />} title="Matches Generated" value={data.topMetrics.matchesGenerated.value.toLocaleString()} trend={data.topMetrics.matchesGenerated.trend} trendColor="text-[#16A34A]" />
        <MetricCard icon={<Lightbulb className="text-[#3B82F6]" />} title="Insights Completed" value={data.topMetrics.aiAnalysisCompleted.value.toLocaleString()} trend={data.topMetrics.aiAnalysisCompleted.trend} trendColor="text-[#16A34A]" />
        <MetricCard icon={<UserCheck className="text-[#10B981]" />} title="Daily Active Users" value={data.topMetrics.dailyActiveUsers.value.toLocaleString()} trend={data.topMetrics.dailyActiveUsers.trend} trendColor="text-[#16A34A]" />
        <MetricCard icon={<DollarSign className="text-[#10B981]" />} title="Monthly Revenue" value={`${data.topMetrics.monthlyRevenue.prefix}${data.topMetrics.monthlyRevenue.value.toLocaleString()}`} trend={data.topMetrics.monthlyRevenue.trend} trendColor="text-[#16A34A]" />
      </div>

      {/* Second Row: User Growth & Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#FFFFFF] shadow-sm rounded-2xl p-5 border border-[#E5E7EB]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[#374151]">User Growth</h3>
            <Button onClick={() => handleSoon('Chart Timeline Filter')} variant="ghost" size="sm" className="h-8 text-xs text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]">
              Last 30 Days <ChevronDown className="ml-1 w-3 h-3" />
            </Button>
          </div>
          <div className="h-[clamp(213px,63.61vw,288px)]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.userGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.purple} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CHART_COLORS.purple} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.pink} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CHART_COLORS.pink} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${v/1000}K` : v} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', color: '#111827' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', top: -10, color: '#6B7280' }} />
                <Area type="monotone" dataKey="totalUsers" name="Total Users" stroke={CHART_COLORS.purple} strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="newUsers" name="New Users" stroke={CHART_COLORS.pink} strokeWidth={2} fillOpacity={1} fill="url(#colorNew)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-5 border border-[#E5E7EB] flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-[#374151]">User Demographics</h3>
            <span onClick={() => handleSoon('Demographics Detailed View')} className="text-xs text-[#2563EB] cursor-pointer hover:underline">View All</span>
          </div>
          <div className="flex-1 flex gap-4 h-[clamp(213px,63.61vw,288px)]">
            <div className="flex-1 flex flex-col">
              <span className="text-xs text-[#6B7280] mb-2">Gender Distribution</span>
              <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.charts.genderDistribution} cx="40%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                      <Cell fill={CHART_COLORS.pink} />
                      <Cell fill={CHART_COLORS.blue} />
                      <Cell fill={CHART_COLORS.purple} />
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', color: '#111827' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 text-xs">
                  {data.charts.genderDistribution.map((item: any, i: number) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: [CHART_COLORS.pink, CHART_COLORS.blue, CHART_COLORS.purple][i] }} />
                      <span className="w-12 text-[#6B7280]">{item.name}</span>
                      <span>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <span className="text-xs text-[#6B7280] mb-2">Age Distribution</span>
              <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.charts.ageDistribution} cx="35%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                      <Cell fill={CHART_COLORS.green} />
                      <Cell fill={CHART_COLORS.blue} />
                      <Cell fill={CHART_COLORS.orange} />
                      <Cell fill={CHART_COLORS.purple} />
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', color: '#111827' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 text-xs">
                  {data.charts.ageDistribution.map((item: any, i: number) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: [CHART_COLORS.green, CHART_COLORS.blue, CHART_COLORS.orange, CHART_COLORS.purple][i] }} />
                      <span className="w-10 text-[#6B7280]">{item.name}</span>
                      <span>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row: 3 Donut/Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Insights Overview */}
        <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-5 border border-[#E5E7EB]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[#374151]">Insights Overview</h3>
            <span onClick={() => handleSoon('Insights Detailed View')} className="text-xs text-[#2563EB] cursor-pointer hover:underline">View Details</span>
          </div>
          <div className="flex items-center h-[clamp(153px,45.80vw,207px)]">
            <div className="w-[clamp(119px,35.62vw,161px)] h-[clamp(119px,35.62vw,161px)] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.charts.aiAnalysis.breakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                    {data.charts.aiAnalysis.breakdown.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', color: '#111827' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">{data.charts.aiAnalysis.averageScore}%</span>
                <span className="text-[clamp(8px,2.29vw,10px)] text-[#6B7280] text-center leading-tight">Average Confidence<br/>Score</span>
              </div>
            </div>
            <div className="flex-1 ml-4 flex flex-col gap-3 text-xs">
              {data.charts.aiAnalysis.breakdown.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#6B7280]">{item.name}</span>
                  </div>
                  <span className="tabular-nums">{item.value.toLocaleString()} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Trends */}
        <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-5 border border-[#E5E7EB]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[#374151]">Activity Trends</h3>
            <Button onClick={() => handleSoon('Activity Detailed View')} variant="ghost" size="sm" className="h-8 text-xs text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]">
              7 Days <ChevronDown className="ml-1 w-3 h-3" />
            </Button>
          </div>
          <div className="h-[clamp(85px,25.45vw,115px)]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.charts.activityTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', color: '#111827' }} />
                  <Line type="monotone" dataKey="rate" stroke={CHART_COLORS.green} strokeWidth={2} dot={false} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Questionnaire Progress */}
        <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-5 border border-[#E5E7EB]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[#374151]">Questionnaire Progress</h3>
            <span onClick={() => handleSoon('Questionnaire Progress Details')} className="text-xs text-[#2563EB] cursor-pointer hover:underline">View Details</span>
          </div>
          <div className="flex items-center h-[clamp(153px,45.80vw,207px)]">
            <div className="w-[clamp(119px,35.62vw,161px)] h-[clamp(119px,35.62vw,161px)] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.charts.questionnaireProgress.breakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                    {data.charts.questionnaireProgress.breakdown.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', color: '#111827' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">{data.charts.questionnaireProgress.averageCompletion}%</span>
                <span className="text-[clamp(8px,2.29vw,10px)] text-[#6B7280] text-center">Avg. Completion</span>
              </div>
            </div>
            <div className="flex-1 ml-6 flex flex-col gap-4 text-xs">
              {data.charts.questionnaireProgress.breakdown.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#6B7280]">{item.name}</span>
                  </div>
                  <span className="tabular-nums">{item.value.toLocaleString()} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fourth Row: Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Most Active Today */}
        <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-5 border border-[#E5E7EB] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[#374151]">Most Active Today</h3>
            <span onClick={() => handleSoon('Active Users List')} className="text-xs text-[#2563EB] cursor-pointer hover:underline">View All</span>
          </div>
          <div className="space-y-4 mt-4">
            {data.lists.recentRegistrations.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {user.avatar && <AvatarImage src={user.avatar} className="object-cover" />}
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-[#111827]">{user.name}</div>
                    <div className="text-[#6B7280] mt-0.5">{user.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#6B7280]">{user.time}</div>
                  <div className="text-[#6B7280] mt-0.5">{user.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Matches */}
        <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-5 border border-[#E5E7EB]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[#374151]">Recent Matches</h3>
            <span onClick={() => handleSoon('Recent Matches List')} className="text-xs text-[#2563EB] cursor-pointer hover:underline">View All</span>
          </div>
          <div className="space-y-4 mt-4">
            {data.lists.recentMatches.map((match: any) => (
              <div key={match.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <Avatar className="h-8 w-8 border-2 border-[#FFFFFF]">
                       {match.p1Avatar && <AvatarImage src={match.p1Avatar} className="object-cover" />}
                       <AvatarFallback>{match.p1.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-8 w-8 border-2 border-[#FFFFFF]">
                       {match.p2Avatar && <AvatarImage src={match.p2Avatar} className="object-cover" />}
                       <AvatarFallback>{match.p2.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="ml-2 text-[#111827] font-medium">{match.p1} & {match.p2}</span>
                </div>
                <div className="text-[#6B7280]">{match.compatibility}% Compatible</div>
                <div className="text-[#6B7280]">{match.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-5 border border-[#E5E7EB]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[#374151]">System Health</h3>
            <span onClick={() => handleSoon('System Health Dashboard')} className="text-xs text-[#2563EB] cursor-pointer hover:underline">View All</span>
          </div>
          <div className="space-y-5 mt-6">
            {data.lists.systemHealth.map((sys: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#F3F4F6] flex items-center justify-center">
                    {sys.name.includes("API") && <Lightbulb className="w-4 h-4 text-[#16A34A]" />}
                    {sys.name.includes("Database") && <Lightbulb className="w-4 h-4 text-[#16A34A]" />}
                    {sys.name.includes("AI") && <Lightbulb className="w-4 h-4 text-[#16A34A]" />}
                    {sys.name.includes("Storage") && <div className="w-4 h-4 bg-[#16A34A]/20 border border-[#16A34A] rounded-sm" />}
                    {sys.name.includes("Email") && <div className="w-4 h-4 border border-[#F59E0B] rounded-sm" />}
                  </div>
                  <span className="text-[#111827]">{sys.name}</span>
                </div>
                <div className={`flex items-center gap-2 ${sys.status === 'Operational' ? 'text-[#16A34A]' : 'text-[#F59E0B]'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${sys.status === 'Operational' ? 'bg-[#16A34A]' : 'bg-[#F59E0B]'}`} />
                  {sys.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

function MetricCard({ icon, title, value, trend, trendColor }: any) {
  return (
    <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-4 border border-[#E5E7EB] flex flex-col justify-between min-h-[clamp(94px,27.99vw,126px)]">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-[#F3F4F6] rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-xs text-[#6B7280] font-medium">{title}</div>
          <div className="text-4xl font-bold mt-1 text-[#111827] tracking-tight">{value}</div>
        </div>
      </div>
      <div className={`text-[clamp(9px,2.54vw,12px)] mt-3 ${trendColor}`}>
        {trend}
      </div>
    </div>
  );
}
