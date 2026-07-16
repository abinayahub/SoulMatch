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
    return <div className="text-muted-foreground animate-pulse flex h-[80vh] items-center justify-center text-xl">Loading dashboard...</div>;
  }

  if (!data || !data.topMetrics) {
    return <div className="text-muted-foreground animate-pulse flex h-[80vh] items-center justify-center text-xl">Updating data structure...</div>;
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Admin! Here's what's happening with SoulMatch.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => handleSoon('Date filtering')} variant="outline" className="bg-[#1A1A24] border-white/10 text-muted-foreground h-10 px-4 hover:text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
            <Calendar className="w-4 h-4 ml-2 opacity-50" />
          </Button>
          <Button onClick={() => handleSoon('Report Export')} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-10">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard icon={<Users className="text-[#8B5CF6]" />} title="Total Users" value={data.topMetrics.totalUsers.value.toLocaleString()} trend={data.topMetrics.totalUsers.trend} trendColor="text-green-400" />
        <MetricCard icon={<Crown className="text-[#F59E0B]" />} title="Premium Users" value={data.topMetrics.premiumUsers.value.toLocaleString()} trend={data.topMetrics.premiumUsers.trend} trendColor="text-green-400" />
        <MetricCard icon={<Heart className="text-[#EC4899]" />} title="Matches Generated" value={data.topMetrics.matchesGenerated.value.toLocaleString()} trend={data.topMetrics.matchesGenerated.trend} trendColor="text-pink-400" />
        <MetricCard icon={<Lightbulb className="text-[#3B82F6]" />} title="Insights Completed" value={data.topMetrics.aiAnalysisCompleted.value.toLocaleString()} trend={data.topMetrics.aiAnalysisCompleted.trend} trendColor="text-green-400" />
        <MetricCard icon={<UserCheck className="text-[#10B981]" />} title="Daily Active Users" value={data.topMetrics.dailyActiveUsers.value.toLocaleString()} trend={data.topMetrics.dailyActiveUsers.trend} trendColor="text-green-400" />
        <MetricCard icon={<DollarSign className="text-[#10B981]" />} title="Monthly Revenue" value={`${data.topMetrics.monthlyRevenue.prefix}${data.topMetrics.monthlyRevenue.value.toLocaleString()}`} trend={data.topMetrics.monthlyRevenue.trend} trendColor="text-green-400" />
      </div>

      {/* Second Row: User Growth & Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border shadow-md rounded-2xl bg-[#13131A] p-5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">User Growth</h3>
            <Button onClick={() => handleSoon('Chart Timeline Filter')} variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-white">
              Last 30 Days <ChevronDown className="ml-1 w-3 h-3" />
            </Button>
          </div>
          <div className="h-[250px]">
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${v/1000}K` : v} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A24', borderColor: '#ffffff10', borderRadius: '8px' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', top: -10 }} />
                <Area type="monotone" dataKey="totalUsers" name="Total Users" stroke={CHART_COLORS.purple} strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="newUsers" name="New Users" stroke={CHART_COLORS.pink} strokeWidth={2} fillOpacity={1} fill="url(#colorNew)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border shadow-md rounded-2xl bg-[#13131A] p-5 rounded-2xl border border-white/5 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">User Demographics</h3>
            <span onClick={() => handleSoon('Demographics Detailed View')} className="text-xs text-purple-400 cursor-pointer hover:underline">View All</span>
          </div>
          <div className="flex-1 flex gap-4 h-[250px]">
            <div className="flex-1 flex flex-col">
              <span className="text-xs text-muted-foreground mb-2">Gender Distribution</span>
              <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.charts.genderDistribution} cx="40%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                      <Cell fill={CHART_COLORS.pink} />
                      <Cell fill={CHART_COLORS.blue} />
                      <Cell fill={CHART_COLORS.purple} />
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A24', borderColor: '#ffffff10', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 text-xs">
                  {data.charts.genderDistribution.map((item: any, i: number) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: [CHART_COLORS.pink, CHART_COLORS.blue, CHART_COLORS.purple][i] }} />
                      <span className="w-12 text-muted-foreground">{item.name}</span>
                      <span>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <span className="text-xs text-muted-foreground mb-2">Age Distribution</span>
              <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.charts.ageDistribution} cx="35%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                      <Cell fill={CHART_COLORS.green} />
                      <Cell fill={CHART_COLORS.blue} />
                      <Cell fill={CHART_COLORS.orange} />
                      <Cell fill={CHART_COLORS.purple} />
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A24', borderColor: '#ffffff10', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 text-xs">
                  {data.charts.ageDistribution.map((item: any, i: number) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: [CHART_COLORS.green, CHART_COLORS.blue, CHART_COLORS.orange, CHART_COLORS.purple][i] }} />
                      <span className="w-10 text-muted-foreground">{item.name}</span>
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
        <div className="bg-card border border-border shadow-md rounded-2xl bg-[#13131A] p-5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Insights Overview</h3>
            <span onClick={() => handleSoon('Insights Detailed View')} className="text-xs text-purple-400 cursor-pointer hover:underline">View Details</span>
          </div>
          <div className="flex items-center h-[180px]">
            <div className="w-[140px] h-[140px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.charts.aiAnalysis.breakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                    {data.charts.aiAnalysis.breakdown.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A24', borderColor: '#ffffff10', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">{data.charts.aiAnalysis.averageScore}%</span>
                <span className="text-[9px] text-muted-foreground text-center leading-tight">Average Confidence<br/>Score</span>
              </div>
            </div>
            <div className="flex-1 ml-4 flex flex-col gap-3 text-xs">
              {data.charts.aiAnalysis.breakdown.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="tabular-nums">{item.value.toLocaleString()} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Match Performance */}
        <div className="bg-card border border-border shadow-md rounded-2xl bg-[#13131A] p-5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Match Performance</h3>
            <span onClick={() => handleSoon('Match Performance Detailed View')} className="text-xs text-purple-400 cursor-pointer hover:underline">View Details</span>
          </div>
          <div className="flex justify-between text-center mb-4 text-sm">
             <div>
               <div className="text-muted-foreground text-xs">Matches Generated</div>
               <div className="font-semibold mt-1">{data.charts.matchPerformance.generated.toLocaleString()}</div>
             </div>
             <div>
               <div className="text-muted-foreground text-xs">Matches Accepted</div>
               <div className="font-semibold mt-1 text-blue-400">{data.charts.matchPerformance.accepted.toLocaleString()}</div>
             </div>
             <div>
               <div className="text-muted-foreground text-xs">Matches Rejected</div>
               <div className="font-semibold mt-1 text-pink-400">{data.charts.matchPerformance.rejected.toLocaleString()}</div>
             </div>
             <div>
               <div className="text-muted-foreground text-xs">Success Rate</div>
               <div className="font-semibold mt-1 text-green-400">{data.charts.matchPerformance.successRate}%</div>
             </div>
          </div>
          <div className="h-[100px]">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={data.charts.matchPerformance.trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A24', borderColor: '#ffffff10', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="rate" stroke={CHART_COLORS.green} strokeWidth={2} dot={false} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Questionnaire Progress */}
        <div className="bg-card border border-border shadow-md rounded-2xl bg-[#13131A] p-5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Questionnaire Progress</h3>
            <span onClick={() => handleSoon('Questionnaire Progress Details')} className="text-xs text-purple-400 cursor-pointer hover:underline">View Details</span>
          </div>
          <div className="flex items-center h-[180px]">
            <div className="w-[140px] h-[140px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.charts.questionnaireProgress.breakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                    {data.charts.questionnaireProgress.breakdown.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A24', borderColor: '#ffffff10', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">{data.charts.questionnaireProgress.averageCompletion}%</span>
                <span className="text-[9px] text-muted-foreground text-center">Avg. Completion</span>
              </div>
            </div>
            <div className="flex-1 ml-6 flex flex-col gap-4 text-xs">
              {data.charts.questionnaireProgress.breakdown.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
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
        {/* Recent Registrations */}
        <div className="bg-card border border-border shadow-md rounded-2xl bg-[#13131A] p-5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Recent Registrations</h3>
            <span onClick={() => handleSoon('Recent Registrations List')} className="text-xs text-purple-400 cursor-pointer hover:underline">View All</span>
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
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-muted-foreground mt-0.5">{user.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground">{user.time}</div>
                  <div className="text-muted-foreground mt-0.5">{user.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Matches */}
        <div className="bg-card border border-border shadow-md rounded-2xl bg-[#13131A] p-5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Recent Matches</h3>
            <span onClick={() => handleSoon('Recent Matches List')} className="text-xs text-purple-400 cursor-pointer hover:underline">View All</span>
          </div>
          <div className="space-y-4 mt-4">
            {data.lists.recentMatches.map((match: any) => (
              <div key={match.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <Avatar className="h-8 w-8 border-2 border-[#13131A]">
                       {match.p1Avatar && <AvatarImage src={match.p1Avatar} className="object-cover" />}
                       <AvatarFallback>{match.p1.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-8 w-8 border-2 border-[#13131A]">
                       {match.p2Avatar && <AvatarImage src={match.p2Avatar} className="object-cover" />}
                       <AvatarFallback>{match.p2.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="ml-2 text-white font-medium">{match.p1} & {match.p2}</span>
                </div>
                <div className="text-muted-foreground">{match.compatibility}% Compatible</div>
                <div className="text-muted-foreground">{match.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-card border border-border shadow-md rounded-2xl bg-[#13131A] p-5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">System Health</h3>
            <span onClick={() => handleSoon('System Health Dashboard')} className="text-xs text-purple-400 cursor-pointer hover:underline">View All</span>
          </div>
          <div className="space-y-5 mt-6">
            {data.lists.systemHealth.map((sys: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#1A1A24] flex items-center justify-center">
                    {sys.name.includes("API") && <Lightbulb className="w-4 h-4 text-green-400" />}
                    {sys.name.includes("Database") && <Lightbulb className="w-4 h-4 text-green-400" />}
                    {sys.name.includes("AI") && <Lightbulb className="w-4 h-4 text-green-400" />}
                    {sys.name.includes("Storage") && <div className="w-4 h-4 bg-green-400/20 border border-green-400 rounded-sm" />}
                    {sys.name.includes("Email") && <div className="w-4 h-4 border border-yellow-400 rounded-sm" />}
                  </div>
                  <span className="text-white">{sys.name}</span>
                </div>
                <div className={`flex items-center gap-2 ${sys.color}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${sys.status === 'Operational' ? 'bg-green-500' : 'bg-yellow-500'}`} />
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
    <div className="bg-card border border-border shadow-md rounded-2xl bg-[#13131A] p-4 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[110px]">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-[#1A1A24] rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground font-medium">{title}</div>
          <div className="text-2xl font-bold mt-1 text-white">{value}</div>
        </div>
      </div>
      <div className={`text-[10px] mt-3 ${trendColor}`}>
        {trend}
      </div>
    </div>
  );
}
