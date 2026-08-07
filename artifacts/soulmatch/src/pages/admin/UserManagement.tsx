import { API_URL } from '../../config/api';
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/auth-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, ShieldAlert, ShieldCheck, MoreVertical, Edit, Download, Users, TrendingUp, Crown, 
  Hourglass, X, ChevronDown, CheckCircle2, User, Ban, MessageSquare, Trash2
} from "lucide-react";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fetchUsers = async (search: string, page: number, filters: any) => {
  const params = new URLSearchParams({ search, page: page.toString(), limit: "10" });
  if (filters.gender && filters.gender !== "all") params.append("gender", filters.gender);
  if (filters.ageRange && filters.ageRange !== "all") params.append("ageRange", filters.ageRange);
  if (filters.location && filters.location !== "all") params.append("location", filters.location);
  if (filters.premium && filters.premium !== "all") params.append("premium", filters.premium);
  if (filters.verification && filters.verification !== "all") params.append("verification", filters.verification);
  if (filters.progress && filters.progress !== "all") params.append("progress", filters.progress);
  if (filters.insights && filters.insights !== "all") params.append("insights", filters.insights);

  const res = await fetch(`${API_URL}/api/admin/users?${params.toString()}`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

const fetchStats = async () => {
  const res = await fetch(`${API_URL}/api/admin/users/stats`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
};

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    gender: "all",
    ageRange: "all",
    location: "all",
    premium: "all",
    verification: "all",
    progress: "all",
    insights: "all"
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const { data: stats } = useQuery({
    queryKey: ["adminUserStats"],
    queryFn: fetchStats,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["adminUsers", search, page, appliedFilters],
    queryFn: () => fetchUsers(search, page, appliedFilters),
  });

  const actionMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: number, action: string }) => {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/action`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}` 
        },
        body: JSON.stringify({ action })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to perform action");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminUserStats"] });
      if (selectedUser) {
        // Optimistically close or reload, for now just close to show it worked
        setSelectedUser(null);
      }
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const handleAction = (userId: number, action: string) => {
    actionMutation.mutate({ userId, action });
    toast({ title: "Action Initiated", description: `Executing ${action}...` });
  };

  const handleSoon = (feature: string) => {
    toast({ title: "Coming Soon", description: `${feature} functionality will be available in a future update.` });
  };

  return (
    <div className="space-y-6 relative flex w-full">
      
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${selectedUser ? 'mr-[clamp(340px,101.78vw,460px)]' : ''}`}>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#111827]">User Management</h1>
            <p className="text-[#6B7280] mt-1">Manage users, verify profiles and monitor user activity.</p>
          </div>
          <Button onClick={() => handleSoon('Export Users')} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-[#111827] h-10 border-0">
            <Download className="w-4 h-4 mr-2" /> Export Users
          </Button>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <StatCard icon={<Users className="w-5 h-5 text-[#F6A8B7]" />} bg="bg-[#F6A8B7]/10" title="Total Users" data={stats?.totalUsers} />
          <StatCard icon={<TrendingUp className="w-5 h-5 text-green-400" />} bg="bg-green-500/10" title="Active Users" data={stats?.activeUsers} />
          <StatCard icon={<Crown className="w-5 h-5 text-[#F6A8B7]" />} bg="bg-[#F6A8B7]/10" title="Premium Users" data={stats?.premiumUsers} />
          <StatCard icon={<ShieldCheck className="w-5 h-5 text-blue-400" />} bg="bg-blue-500/10" title="Verified Users" data={stats?.verifiedUsers} />
          <StatCard icon={<Hourglass className="w-5 h-5 text-[#F6A8B7]" />} bg="bg-[#F6A8B7]/10" title="Pending Verification" data={stats?.pendingVerification} />
        </div>

        {/* Filters */}
        <div className="bg-[#FFFFFF] shadow-sm rounded-2xl border border-[#E5E7EB] p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[clamp(170px,50.89vw,230px)]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <Input 
              placeholder="Search by name, email or phone..." 
              className="pl-10 bg-[#FFFFFF] border-[#E5E7EB] text-[#111827] w-full placeholder:text-[#6B7280]"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <FilterSelect label="Gender" value={filters.gender} onChange={(v) => setFilters(prev => ({...prev, gender: v}))} options={[{label: 'Male', value: 'male'}, {label: 'Female', value: 'female'}]} />
          <FilterSelect label="Age Range" value={filters.ageRange} onChange={(v) => setFilters(prev => ({...prev, ageRange: v}))} options={[{label: '18-24', value: '18-24'}, {label: '25-34', value: '25-34'}, {label: '35-44', value: '35-44'}, {label: '45+', value: '45+'}]} />
          <FilterSelect label="Location" value={filters.location} onChange={(v) => setFilters(prev => ({...prev, location: v}))} options={[{label: 'Local', value: 'local'}, {label: 'International', value: 'international'}]} />
          <FilterSelect label="Premium" value={filters.premium} onChange={(v) => setFilters(prev => ({...prev, premium: v}))} options={[{label: 'Premium', value: 'true'}, {label: 'Free', value: 'false'}]} />
          <FilterSelect label="Verification" value={filters.verification} onChange={(v) => setFilters(prev => ({...prev, verification: v}))} options={[{label: 'Verified', value: 'verified'}, {label: 'Pending', value: 'pending'}, {label: 'Unverified', value: 'unverified'}]} />
          <FilterSelect label="30-Day Progress" value={filters.progress} onChange={(v) => setFilters(prev => ({...prev, progress: v}))} options={[{label: 'Completed', value: 'completed'}, {label: 'In Progress', value: 'in_progress'}, {label: 'Not Started', value: 'not_started'}]} />
          <FilterSelect label="Profile Insights" value={filters.insights} onChange={(v) => setFilters(prev => ({...prev, insights: v}))} options={[{label: 'High Compatibility', value: 'high'}, {label: 'Medium Compatibility', value: 'medium'}, {label: 'Low Compatibility', value: 'low'}]} />
          <Button variant="ghost" className="text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]" onClick={() => {
            const defaultFilters = { gender: "all", ageRange: "all", location: "all", premium: "all", verification: "all", progress: "all", insights: "all" };
            setFilters(defaultFilters);
            setAppliedFilters(defaultFilters);
            setPage(1);
          }}>Reset</Button>
          <Button className="w-full text-[#111827] bg-[#2563EB] hover:bg-[#1D4ED8] rounded-full border-0 transition-all text-white" onClick={() => {
            setAppliedFilters(filters);
            setPage(1);
          }}>
            Apply Filters
          </Button>
        </div>

        {/* Data Table */}
        <div className="bg-[#FFFFFF] shadow-sm rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#E5E7EB] bg-[#F9FAFB] hover:bg-[#F9FAFB]">
                <TableHead className="text-[#374151] font-medium h-12">User</TableHead>
                <TableHead className="text-[#374151] font-medium">Age</TableHead>
                <TableHead className="text-[#374151] font-medium">Gender</TableHead>
                <TableHead className="text-[#374151] font-medium">Location</TableHead>
                <TableHead className="text-[#374151] font-medium">30-Day Progress</TableHead>
                <TableHead className="text-[#374151] font-medium">Profile Insights</TableHead>
                <TableHead className="text-[#374151] font-medium">Status</TableHead>
                <TableHead className="text-[#374151] font-medium">Premium</TableHead>
                <TableHead className="text-[#374151] font-medium">Verification</TableHead>
                <TableHead className="text-[#374151] font-medium">Join Date</TableHead>
                <TableHead className="text-[#374151] font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersLoading ? (
                <TableRow><TableCell colSpan={11} className="text-center py-8 text-[#6B7280] animate-pulse">Loading users...</TableCell></TableRow>
              ) : usersData?.users.length === 0 ? (
                <TableRow><TableCell colSpan={11} className="text-center py-8 text-[#6B7280]">No users found.</TableCell></TableRow>
              ) : (
                usersData?.users.map((u: any) => (
                  <TableRow 
                    key={u.id} 
                    className="border-b border-[#E5E7EB] hover:bg-[#F3F4F6] cursor-pointer"
                    onClick={() => setSelectedUser(u)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-[#E5E7EB]">
                          {u.avatar && <AvatarImage src={u.avatar} className="object-cover" />}
                          <AvatarFallback className="bg-[#F3F4F6] text-[#6B7280]">{u.firstName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-[#111827]">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-[#6B7280]">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{u.age || '-'}</TableCell>
                    <TableCell className="text-sm">
                      <span className={u.gender === 'female' ? 'text-[#F6A8B7]' : u.gender === 'male' ? 'text-blue-400' : 'text-[#F6A8B7]'}>
                        {u.gender ? u.gender.charAt(0).toUpperCase() + u.gender.slice(1) : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{u.location !== 'Unknown' ? u.location.split(',')[0] : '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 w-24">
                        <div className="text-xs text-[#6B7280]">{Math.floor((u.journeyProgress / 150) * 30)}/30</div>
                        <div className="h-1.5 flex-1 rounded-full bg-[#F3F4F6] overflow-hidden">
                          <div className="h-full bg-[#F6A8B7]" style={{ width: `${Math.min(100, (u.journeyProgress / 150) * 100)}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <CircularProgress value={u.journeyProgress ? Math.min(100, Math.floor((u.journeyProgress / 150) * 100)) : 0} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`bg-transparent border-none px-0 font-normal ${
                        u.status === "active" ? "text-[#16A34A]" :
                        u.status === "suspended" ? "text-[#DC2626]" : "text-[#F59E0B]"
                      }`}>
                        {u.status === 'active' ? 'Active' : u.status === 'suspended' ? 'Suspended' : 'Banned'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.isPremium ? (
                        <span className="flex items-center text-sm text-[#F59E0B]"><Crown className="w-3 h-3 mr-1"/> Yes</span>
                      ) : (
                        <span className="flex items-center text-sm text-[#6B7280]">- No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.verificationStatus === "verified" ? (
                        <span className="flex items-center text-sm text-[#16A34A]"><ShieldCheck className="w-3 h-3 mr-1"/> Verified</span>
                      ) : (
                        <span className="flex items-center text-sm text-[#F59E0B]"><Hourglass className="w-3 h-3 mr-1"/> Pending</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-[#6B7280]">
                      {format(new Date(u.createdAt), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-[#F3F4F6] h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="w-4 h-4 text-[#6B7280]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[#FFFFFF] border-[#E5E7EB]">
                          <DropdownMenuItem className="hover:bg-[#F3F4F6] cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedUser(u); }}>
                            <Edit className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-[#F3F4F6] cursor-pointer text-[#DC2626]" onClick={(e) => { e.stopPropagation(); handleAction(u.id, 'suspend'); }}>
                            <Ban className="w-4 h-4 mr-2" /> Suspend Account
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-[#F3F4F6] cursor-pointer text-[#DC2626]" onClick={(e) => { e.stopPropagation(); handleAction(u.id, 'delete'); }}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {usersData?.totalPages > 1 && (
            <div className="p-4 border-t border-[#E5E7EB] flex items-center justify-between text-sm text-[#6B7280] bg-[#FFFFFF]">
              <div>Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, usersData.total)} of {usersData.total} users</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 hover:bg-[#F3F4F6]" disabled={page === 1} onClick={() => setPage(p => p - 1)}>&lt;</Button>
                <span className="w-8 text-center flex items-center justify-center bg-[#EEF4FF] text-[#2563EB] rounded h-8">{page}</span>
                <span className="px-2">...</span>
                <span className="w-8 text-center">{usersData.totalPages}</span>
                <Button variant="ghost" size="sm" className="h-8 hover:bg-[#F3F4F6]" disabled={page === usersData.totalPages} onClick={() => setPage(p => p + 1)}>&gt;</Button>
                <div className="ml-4 flex items-center gap-2">
                  <span>Rows per page</span>
                  <div className="bg-[#F3F4F6] px-2 py-1 rounded text-[#111827] flex items-center border border-[#E5E7EB]">10 <ChevronDown className="w-3 h-3 ml-2" /></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side Panel */}
      {selectedUser && (
        <div className="fixed top-[clamp(51px,15.27vw,69px)] right-0 bottom-0 w-[clamp(340px,101.78vw,460px)] bg-[#FFFFFF] border-l border-[#E5E7EB] shadow-2xl z-40 overflow-y-auto custom-scrollbar flex flex-col transform transition-transform duration-300">
          
          <div className="p-6 border-b border-[#E5E7EB] relative">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-[#111827]">User Details</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]" onClick={() => setSelectedUser(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-2 border-[#E5E7EB]">
                 {selectedUser.avatar && <AvatarImage src={selectedUser.avatar} className="object-cover" />}
                 <AvatarFallback className="bg-[#F3F4F6] text-[#6B7280] text-xl">{selectedUser.firstName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#111827]">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <Badge className="bg-[#DCFCE7] text-[#16A34A] hover:bg-[#DCFCE7] border-none px-2 py-0 h-5 text-[clamp(9px,2.54vw,12px)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mr-1.5"></span> {selectedUser.status}
                  </Badge>
                </div>
                <div className="text-sm text-[#6B7280] mt-1 flex items-center gap-2">
                  <div className="truncate w-[clamp(170px,50.89vw,230px)]">{selectedUser.email}</div>
                </div>
                <div className="text-sm text-[#6B7280] mt-1">
                  {selectedUser.phone || '+91 98765 43210'}
                </div>
                <div className="text-sm text-[#6B7280] mt-1">
                  {selectedUser.location}
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="flex-1 flex flex-col">
            <div className="px-6 pt-4 border-b border-[#E5E7EB]">
              <TabsList className="bg-transparent h-auto p-0 flex gap-6 w-full justify-start overflow-x-auto no-scrollbar">
                <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#2563EB] data-[state=active]:border-b-2 data-[state=active]:border-[#2563EB] rounded-none px-0 pb-3 text-[#6B7280]">Overview</TabsTrigger>
                <TabsTrigger value="verification" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#2563EB] data-[state=active]:border-b-2 data-[state=active]:border-[#2563EB] rounded-none px-0 pb-3 text-[#6B7280]">Verification</TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#2563EB] data-[state=active]:border-b-2 data-[state=active]:border-[#2563EB] rounded-none px-0 pb-3 text-[#6B7280]">Activity</TabsTrigger>
                <TabsTrigger value="safety" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#2563EB] data-[state=active]:border-b-2 data-[state=active]:border-[#2563EB] rounded-none px-0 pb-3 text-[#6B7280]">Safety</TabsTrigger>
                <TabsTrigger value="notes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#2563EB] data-[state=active]:border-b-2 data-[state=active]:border-[#2563EB] rounded-none px-0 pb-3 text-[#6B7280]">Notes</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <TabsContent value="overview" className="m-0 space-y-6">
                
                {/* Visual Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-4 border border-[#E5E7EB]">
                    <div className="text-xs text-[#6B7280] mb-4">Profile Completion</div>
                    <div className="flex justify-center">
                      <CircularProgress value={92} size={80} strokeWidth={6} color="stroke-[#16A34A]" showText className="text-2xl text-[#111827]" />
                    </div>
                  </div>
                  <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-4 border border-[#E5E7EB] flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-[#6B7280] mb-2">30-Day Journey</div>
                      <div className="flex items-center gap-2 text-sm text-[#111827]">
                        <CalendarIcon /> Day {Math.floor((selectedUser.journeyProgress / 150) * 30) || 28} / 30
                      </div>
                      <div className="mt-3 h-1.5 w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                        <div className="h-full bg-[#16A34A]" style={{ width: `${Math.min(100, (selectedUser.journeyProgress / 150) * 100) || 92}%` }} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-xs text-[#6B7280] mb-2">Insight Confidence</div>
                      <div className="flex items-center justify-between text-xs text-[#16A34A] font-medium mb-1">
                        <span>87%</span>
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                        <div className="h-full bg-[#16A34A]" style={{ width: '87%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personality Traits */}
                <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-5 border border-[#E5E7EB]">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-[#111827]">Personality Traits</h4>
                    <span className="text-[clamp(9px,2.54vw,12px)] text-[#2563EB] cursor-pointer hover:underline" onClick={() => handleSoon('Full Profile Insights')}>View Full Analysis</span>
                  </div>
                  <div className="space-y-4">
                    <TraitBar label="Connection Oriented" percent={35} color="bg-[#8B5CF6]" />
                    <TraitBar label="Growth Oriented" percent={20} color="bg-[#2563EB]" />
                    <TraitBar label="Stability Oriented" percent={30} color="bg-[#16A34A]" />
                    <TraitBar label="Exploration Oriented" percent={15} color="bg-[#F59E0B]" />
                  </div>
                </div>

                {/* Basic Information */}
                <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-5 border border-[#E5E7EB]">
                  <h4 className="text-sm font-medium text-[#111827] mb-4">Basic Information</h4>
                  <div className="grid grid-cols-3 gap-y-4 text-xs">
                    <div>
                      <div className="text-[#6B7280] mb-1">Age</div>
                      <div className="text-[#111827]">{selectedUser.age || '-'}</div>
                    </div>
                    <div>
                      <div className="text-[#6B7280] mb-1">Gender</div>
                      <div className="capitalize text-[#111827]">{selectedUser.gender || '-'}</div>
                    </div>
                    <div>
                      <div className="text-[#6B7280] mb-1">Joined On</div>
                      <div className="text-[#111827]">{format(new Date(selectedUser.createdAt), "dd MMM yyyy")}</div>
                    </div>
                    <div className="col-span-3">
                      <div className="text-[#6B7280] mb-1">Last Login</div>
                      <div className="text-[#111827]">{selectedUser.lastActive ? format(new Date(selectedUser.lastActive), "dd MMM yyyy, hh:mm a") : 'Today, 09:45 AM'}</div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Grid */}
                <div>
                  <h4 className="text-sm font-medium text-[#111827] mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <ActionBtn icon={<User />} label="View Profile" onClick={() => handleSoon('View User Profile')} />
                    <ActionBtn icon={<Edit />} label="Edit User" onClick={() => handleSoon('Edit User')} />
                    <ActionBtn icon={<ShieldCheck className="text-[#16A34A]" />} label="Verify User" onClick={() => handleAction(selectedUser.id, 'verify')} />
                    <ActionBtn icon={<Crown className="text-[#F59E0B]" />} label="Grant Premium" onClick={() => handleAction(selectedUser.id, 'grant_premium')} />
                    <ActionBtn icon={<Ban className="text-[#DC2626]" />} label="Suspend User" onClick={() => handleAction(selectedUser.id, 'suspend')} />
                    <ActionBtn icon={<X className="text-[#DC2626]" />} label="Ban User" onClick={() => handleAction(selectedUser.id, 'ban')} />
                    <ActionBtn icon={<MessageSquare className="text-[#2563EB]" />} label="Send Message" onClick={() => handleSoon('Send Message')} />
                    <ActionBtn icon={<Trash2 className="text-[#DC2626]" />} label="Delete User" onClick={() => handleAction(selectedUser.id, 'delete')} />
                  </div>
                </div>

              </TabsContent>
              <TabsContent value="verification" className="m-0 text-sm text-[#6B7280] text-center py-10">Verification details coming soon.</TabsContent>
              <TabsContent value="activity" className="m-0 text-sm text-[#6B7280] text-center py-10">Activity logs coming soon.</TabsContent>
              <TabsContent value="safety" className="m-0 text-sm text-[#6B7280] text-center py-10">Safety reports coming soon.</TabsContent>
              <TabsContent value="notes" className="m-0 text-sm text-[#6B7280] text-center py-10">Admin notes coming soon.</TabsContent>
            </div>
          </Tabs>
        </div>
      )}

    </div>
  );
}

// Subcomponents

function StatCard({ icon, bg, title, data }: any) {
  return (
    <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-4 border border-[#E5E7EB] flex flex-col justify-between">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${bg}`}>{icon}</div>
      </div>
      <div>
        <div className="text-xs text-[#6B7280]">{title}</div>
        <div className="text-2xl font-bold text-[#111827] mt-0.5">{data?.value ? data.value.toLocaleString() : '...'}</div>
        <div className={`text-[clamp(9px,2.54vw,12px)] mt-2 ${data?.trend?.includes('+') ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
          {data?.trend || '...'}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options = [] }: { label: string, value: string, onChange: (val: string) => void, options?: {label: string, value: string}[] }) {
  return (
    <div className="flex-shrink-0">
      <div className="text-[clamp(9px,2.54vw,12px)] text-[#6B7280] mb-1 ml-1">{label}</div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[clamp(102px,30.53vw,138px)] h-8 bg-[#FFFFFF] border-[#E5E7EB] text-[#111827] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#FFFFFF] border-[#E5E7EB]">
          <SelectItem value="all">All</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function CircularProgress({ value, size = 32, strokeWidth = 3, color = "stroke-[#16A34A]", showText = true, className = "text-[clamp(9px,2.54vw,12px)]" }: any) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-[#E5E7EB]" />
        <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} className={`${color} transition-all duration-500 ease-in-out`} />
      </svg>
      {showText && <span className={`absolute ${className} font-medium`}>{value}%</span>}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6B7280]">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}

function TraitBar({ label, percent, color }: any) {
  return (
    <div>
      <div className="flex justify-between text-[clamp(9px,2.54vw,12px)] mb-1.5">
        <span className="text-[#6B7280]">{label}</span>
        <span className="text-[#111827]">{percent}%</span>
      </div>
      <div className="h-1 w-full bg-[#F3F4F6] rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-[#FFFFFF] shadow-sm hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg flex flex-col items-center justify-center p-3 gap-2 cursor-pointer transition-colors"
    >
      <div className="w-5 h-5 flex items-center justify-center text-[#6B7280]">{icon}</div>
      <span className="text-[clamp(8px,2.29vw,10px)] text-center text-[#6B7280] leading-tight">{label}</span>
    </div>
  );
}
