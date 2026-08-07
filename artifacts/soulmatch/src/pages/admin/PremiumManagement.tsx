import { API_URL } from '../../config/api';
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, Download, MoreVertical, 
  Crown, CreditCard, Activity, Users,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { getAccessToken } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const fetchStats = async () => {
  const res = await fetch(`${API_URL}/api/admin/premium/stats`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
};

const fetchUsers = async (page: number, search: string, status: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: "10",
    ...(search && { search }),
    ...(status && status !== "All" && { status }),
  });
  const res = await fetch(`${API_URL}/api/admin/premium/users?${params.toString()}`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

export default function PremiumManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const { data: statsData } = useQuery({
    queryKey: ["adminPremiumStats"],
    queryFn: fetchStats,
    refetchInterval: 30000,
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["adminPremiumUsers", page, search, statusFilter],
    queryFn: () => fetchUsers(page, search, statusFilter),
    refetchInterval: 30000,
  });

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-5 border border-[#E5E7EB] relative overflow-hidden flex flex-col justify-between min-h-[130px]">
      <div className="flex items-center gap-3 mb-2 relative z-10">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color.bg}`}>
          <Icon className={`w-4 h-4 ${color.text}`} />
        </div>
        <h3 className="text-sm font-medium text-[#6B7280]">{title}</h3>
      </div>
      <div className="relative z-10 mt-1">
        <div className="text-3xl font-bold mb-1">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Crown className="w-6 h-6 text-[#F6A8B7]" /> Premium Subscriptions</h1>
            <p className="text-sm text-[#6B7280]">Manage premium members and track subscription revenue.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-[#E5E7EB] bg-[#F3F4F6] text-[#F6A8B7] hover:text-[#F6A8B7]">
              <Download className="w-4 h-4 mr-2" /> Export Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Subscriptions" value={statsData?.activeSubscriptions || 0} icon={Crown} color={{ bg: "bg-[#F6A8B7]/20", text: "text-[#F6A8B7]" }} />
          <StatCard title="Monthly Recurring Revenue" value={`$${statsData?.mrr || 0}`} icon={CreditCard} color={{ bg: "bg-green-500/20", text: "text-green-500" }} />
          <StatCard title="New This Week" value={statsData?.newThisWeek || 0} icon={Users} color={{ bg: "bg-blue-500/20", text: "text-blue-500" }} />
          <StatCard title="Churn Rate" value={`${statsData?.churnRate || 0}%`} icon={Activity} color={{ bg: "bg-red-500/20", text: "text-red-500" }} />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0 space-y-6">
            
            {/* Filters */}
            <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-4 border border-[#E5E7EB] flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[clamp(170px,50.89vw,230px)]">
                <Search className="absolute z-10 left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <Input 
                  placeholder="Search by name or email..." 
                  className="pl-9 bg-[#F3F4F6] border-[#E5E7EB] rounded-xl"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[clamp(102px,30.53vw,138px)] bg-[#F3F4F6] border-[#E5E7EB] rounded-xl text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="bg-card border border-border shadow-md rounded-2xl border-[#E5E7EB] overflow-hidden relative">
              <Table>
                <TableHeader className="bg-card/[0.02]">
                  <TableRow className="border-[#E5E7EB]">
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Period</TableHead>
                    <TableHead className="text-right pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                  ) : !usersData ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-red-400">Failed to load data.</TableCell></TableRow>
                  ) : usersData?.subscriptions?.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-[#6B7280]">No subscriptions found.</TableCell></TableRow>
                  ) : (
                    usersData?.subscriptions?.map((sub: any) => (
                      <TableRow 
                        key={sub.id} 
                        className="border-b border-[#E5E7EB] hover:bg-card/[0.02] transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={sub.user?.selfieUrl} />
                              <AvatarFallback>{sub.user?.name?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">{sub.user?.displayName || sub.user?.firstName || "Unknown"}</div>
                              <div className="text-xs text-[#6B7280]">{sub.user?.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-[#F6A8B7]/10 text-[#F6A8B7] border-[#F6A8B7]/30">
                            {sub.planId === 'premium_annual' ? 'Annual' : sub.planId === 'basic_monthly' ? 'Basic' : 'Monthly'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs font-medium ${sub.status === 'active' || sub.status === 'trialing' ? 'text-green-500' : 'text-red-500'}`}>
                            {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                            {sub.cancelAtPeriodEnd && " (Canceling)"}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-[#6B7280]">
                          {sub.currentPeriodStart ? format(new Date(sub.currentPeriodStart), 'MMM d, yyyy') : '-'}
                          {" to "}
                          {sub.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), 'MMM d, yyyy') : '-'}
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#F3F4F6]">
                                <MoreVertical className="w-4 h-4 text-[#6B7280]" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border border-[#E5E7EB] shadow-md rounded-2xl">
                              <DropdownMenuItem>View User</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-400">Cancel Subscription</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              <div className="p-4 border-t border-[#E5E7EB] flex items-center justify-between">
                <span className="text-xs text-[#6B7280]">
                  Showing {(page - 1) * 10 + (usersData?.subscriptions?.length ? 1 : 0)} to {Math.min(page * 10, usersData?.total || 0)} of {usersData?.total || 0} entries
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" disabled={page === usersData?.totalPages || !usersData?.totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
