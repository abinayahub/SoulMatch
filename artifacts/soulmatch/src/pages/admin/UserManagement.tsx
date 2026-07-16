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

const fetchUsers = async (search: string, page: number) => {
  const params = new URLSearchParams({ search, page: page.toString(), limit: "10" });
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

  const { data: stats } = useQuery({
    queryKey: ["adminUserStats"],
    queryFn: fetchStats,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["adminUsers", search, page],
    queryFn: () => fetchUsers(search, page),
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
      if (!res.ok) throw new Error("Failed to perform action");
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
      <div className={`flex-1 transition-all duration-300 ${selectedUser ? 'mr-[400px]' : ''}`}>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">Manage users, verify profiles and monitor user activity.</p>
          </div>
          <Button onClick={() => handleSoon('Export Users')} className="bg-[#13131A] border border-white/10 hover:bg-card/5 text-white h-10">
            <Download className="w-4 h-4 mr-2" /> Export Users
          </Button>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <StatCard icon={<Users className="w-5 h-5 text-purple-400" />} bg="bg-purple-500/10" title="Total Users" data={stats?.totalUsers} />
          <StatCard icon={<TrendingUp className="w-5 h-5 text-green-400" />} bg="bg-green-500/10" title="Active Users" data={stats?.activeUsers} />
          <StatCard icon={<Crown className="w-5 h-5 text-pink-400" />} bg="bg-pink-500/10" title="Premium Users" data={stats?.premiumUsers} />
          <StatCard icon={<ShieldCheck className="w-5 h-5 text-blue-400" />} bg="bg-blue-500/10" title="Verified Users" data={stats?.verifiedUsers} />
          <StatCard icon={<Hourglass className="w-5 h-5 text-orange-400" />} bg="bg-orange-500/10" title="Pending Verification" data={stats?.pendingVerification} />
        </div>

        {/* Filters */}
        <div className="bg-card border border-border shadow-md rounded-2xl rounded-2xl border border-white/10 p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email or phone..." 
              className="pl-10 bg-[#1A1A24] border-white/5 w-full"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <FilterSelect label="Gender" />
          <FilterSelect label="Age Range" />
          <FilterSelect label="Location" />
          <FilterSelect label="Premium" />
          <FilterSelect label="Verification" />
          <FilterSelect label="30-Day Progress" />
          <FilterSelect label="Profile Insights" />
          <Button variant="ghost" className="text-white/60 hover:text-white" onClick={() => handleSoon('Reset Filters')}>Reset</Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => handleSoon('Apply Filters')}>
            Apply Filters
          </Button>
        </div>

        {/* Data Table */}
        <div className="bg-card border border-border shadow-md rounded-2xl rounded-2xl border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead className="text-white/60 font-medium h-12">User</TableHead>
                <TableHead className="text-white/60 font-medium">Age</TableHead>
                <TableHead className="text-white/60 font-medium">Gender</TableHead>
                <TableHead className="text-white/60 font-medium">Location</TableHead>
                <TableHead className="text-white/60 font-medium">30-Day Progress</TableHead>
                <TableHead className="text-white/60 font-medium">Profile Insights</TableHead>
                <TableHead className="text-white/60 font-medium">Status</TableHead>
                <TableHead className="text-white/60 font-medium">Premium</TableHead>
                <TableHead className="text-white/60 font-medium">Verification</TableHead>
                <TableHead className="text-white/60 font-medium">Join Date</TableHead>
                <TableHead className="text-white/60 font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersLoading ? (
                <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground animate-pulse">Loading users...</TableCell></TableRow>
              ) : usersData?.users.length === 0 ? (
                <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">No users found.</TableCell></TableRow>
              ) : (
                usersData?.users.map((u: any) => (
                  <TableRow 
                    key={u.id} 
                    className="border-b border-white/5 hover:bg-card/5 cursor-pointer"
                    onClick={() => setSelectedUser(u)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-white/10">
                          {u.avatar && <AvatarImage src={u.avatar} className="object-cover" />}
                          <AvatarFallback className="bg-[#1A1A24]">{u.firstName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-white">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{u.age || '-'}</TableCell>
                    <TableCell className="text-sm">
                      <span className={u.gender === 'female' ? 'text-pink-400' : u.gender === 'male' ? 'text-blue-400' : 'text-purple-400'}>
                        {u.gender ? u.gender.charAt(0).toUpperCase() + u.gender.slice(1) : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{u.location !== 'Unknown' ? u.location.split(',')[0] : '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 w-24">
                        <div className="text-xs text-muted-foreground">{Math.floor((u.journeyProgress / 150) * 30)}/30</div>
                        <div className="h-1.5 flex-1 rounded-full bg-card/10 overflow-hidden">
                          <div className="h-full bg-pink-500" style={{ width: `${Math.min(100, (u.journeyProgress / 150) * 100)}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <CircularProgress value={u.journeyProgress ? Math.min(100, Math.floor((u.journeyProgress / 150) * 100)) : 0} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`bg-transparent border-none px-0 font-normal ${
                        u.status === "active" ? "text-green-400" :
                        u.status === "suspended" ? "text-red-400" : "text-yellow-400"
                      }`}>
                        {u.status === 'active' ? 'Active' : u.status === 'suspended' ? 'Suspended' : 'Banned'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.isPremium ? (
                        <span className="flex items-center text-sm text-yellow-400"><Crown className="w-3 h-3 mr-1"/> Yes</span>
                      ) : (
                        <span className="flex items-center text-sm text-muted-foreground">- No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.verificationStatus === "verified" ? (
                        <span className="flex items-center text-sm text-green-400"><ShieldCheck className="w-3 h-3 mr-1"/> Verified</span>
                      ) : (
                        <span className="flex items-center text-sm text-orange-400"><Hourglass className="w-3 h-3 mr-1"/> Pending</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(u.createdAt), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-card/10 h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[#1A1A24] border border-white/10">
                          <DropdownMenuItem className="hover:bg-card/10 cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedUser(u); }}>
                            <Edit className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-card/10 cursor-pointer text-yellow-400" onClick={(e) => { e.stopPropagation(); handleAction(u.id, 'suspend'); }}>
                            <Ban className="w-4 h-4 mr-2" /> Suspend Account
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-card/10 cursor-pointer text-red-400" onClick={(e) => { e.stopPropagation(); handleAction(u.id, 'delete'); }}>
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
            <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm text-muted-foreground bg-[#13131A]">
              <div>Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, usersData.total)} of {usersData.total} users</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>&lt;</Button>
                <span className="w-8 text-center flex items-center justify-center bg-purple-600/20 text-purple-400 rounded h-8">{page}</span>
                <span className="px-2">...</span>
                <span className="w-8 text-center">{usersData.totalPages}</span>
                <Button variant="ghost" size="sm" className="h-8" disabled={page === usersData.totalPages} onClick={() => setPage(p => p + 1)}>&gt;</Button>
                <div className="ml-4 flex items-center gap-2">
                  <span>Rows per page</span>
                  <div className="bg-[#1A1A24] px-2 py-1 rounded text-white flex items-center">10 <ChevronDown className="w-3 h-3 ml-2" /></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side Panel */}
      {selectedUser && (
        <div className="fixed top-[60px] right-0 bottom-0 w-[400px] bg-[#0B0B10] border-l border-white/10 z-40 overflow-y-auto custom-scrollbar flex flex-col transform transition-transform duration-300">
          
          <div className="p-6 border-b border-white/10 relative">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold">User Details</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => setSelectedUser(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-2 border-white/10">
                 {selectedUser.avatar && <AvatarImage src={selectedUser.avatar} className="object-cover" />}
                 <AvatarFallback className="bg-[#1A1A24] text-xl">{selectedUser.firstName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <Badge className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border-none px-2 py-0 h-5 text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span> {selectedUser.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <div className="truncate w-[200px]">{selectedUser.email}</div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {selectedUser.phone || '+91 98765 43210'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {selectedUser.location}
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="flex-1 flex flex-col">
            <div className="px-6 pt-4 border-b border-white/10">
              <TabsList className="bg-transparent h-auto p-0 flex gap-6 w-full justify-start overflow-x-auto no-scrollbar">
                <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-pink-500 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none px-0 pb-3 text-muted-foreground">Overview</TabsTrigger>
                <TabsTrigger value="verification" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-pink-500 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none px-0 pb-3 text-muted-foreground">Verification</TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-pink-500 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none px-0 pb-3 text-muted-foreground">Activity</TabsTrigger>
                <TabsTrigger value="safety" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-pink-500 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none px-0 pb-3 text-muted-foreground">Safety</TabsTrigger>
                <TabsTrigger value="notes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-pink-500 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none px-0 pb-3 text-muted-foreground">Notes</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <TabsContent value="overview" className="m-0 space-y-6">
                
                {/* Visual Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-border shadow-md rounded-2xl bg-[#13131A] p-4 rounded-xl border border-white/5">
                    <div className="text-xs text-muted-foreground mb-4">Profile Completion</div>
                    <div className="flex justify-center">
                      <CircularProgress value={92} size={80} strokeWidth={6} color="stroke-pink-500" showText className="text-2xl" />
                    </div>
                  </div>
                  <div className="bg-card border border-border shadow-md rounded-2xl bg-[#13131A] p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">30-Day Journey</div>
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon /> Day {Math.floor((selectedUser.journeyProgress / 150) * 30) || 28} / 30
                      </div>
                      <div className="mt-3 h-1.5 w-full rounded-full bg-card/10 overflow-hidden">
                        <div className="h-full bg-pink-500" style={{ width: `${Math.min(100, (selectedUser.journeyProgress / 150) * 100) || 92}%` }} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-xs text-muted-foreground mb-2">Insight Confidence</div>
                      <div className="flex items-center justify-between text-xs text-green-400 font-medium mb-1">
                        <span>87%</span>
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-card/10 overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: '87%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personality Traits */}
                <div className="bg-card border border-border shadow-md rounded-2xl bg-[#13131A] p-5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium">Personality Traits</h4>
                    <span className="text-[10px] text-purple-400 cursor-pointer hover:underline" onClick={() => handleSoon('Full Profile Insights')}>View Full Analysis</span>
                  </div>
                  <div className="space-y-4">
                    <TraitBar label="Connection Oriented" percent={35} color="bg-pink-500" />
                    <TraitBar label="Growth Oriented" percent={20} color="bg-blue-500" />
                    <TraitBar label="Stability Oriented" percent={30} color="bg-green-500" />
                    <TraitBar label="Exploration Oriented" percent={15} color="bg-purple-500" />
                  </div>
                </div>

                {/* Basic Information */}
                <div className="bg-card border border-border shadow-md rounded-2xl bg-[#13131A] p-5 rounded-xl border border-white/5">
                  <h4 className="text-sm font-medium mb-4">Basic Information</h4>
                  <div className="grid grid-cols-3 gap-y-4 text-xs">
                    <div>
                      <div className="text-muted-foreground mb-1">Age</div>
                      <div>{selectedUser.age || '-'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Gender</div>
                      <div className="capitalize">{selectedUser.gender || '-'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Joined On</div>
                      <div>{format(new Date(selectedUser.createdAt), "dd MMM yyyy")}</div>
                    </div>
                    <div className="col-span-3">
                      <div className="text-muted-foreground mb-1">Last Login</div>
                      <div>{selectedUser.lastActive ? format(new Date(selectedUser.lastActive), "dd MMM yyyy, hh:mm a") : 'Today, 09:45 AM'}</div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Grid */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <ActionBtn icon={<User />} label="View Profile" onClick={() => handleSoon('View User Profile')} />
                    <ActionBtn icon={<Edit />} label="Edit User" onClick={() => handleSoon('Edit User')} />
                    <ActionBtn icon={<ShieldCheck className="text-green-400" />} label="Verify User" onClick={() => handleAction(selectedUser.id, 'verify')} />
                    <ActionBtn icon={<Crown className="text-yellow-400" />} label="Grant Premium" onClick={() => handleAction(selectedUser.id, 'grant_premium')} />
                    <ActionBtn icon={<Ban className="text-orange-400" />} label="Suspend User" onClick={() => handleAction(selectedUser.id, 'suspend')} />
                    <ActionBtn icon={<X className="text-red-400" />} label="Ban User" onClick={() => handleAction(selectedUser.id, 'ban')} />
                    <ActionBtn icon={<MessageSquare className="text-blue-400" />} label="Send Message" onClick={() => handleSoon('Send Message')} />
                    <ActionBtn icon={<Trash2 className="text-red-500" />} label="Delete User" onClick={() => handleAction(selectedUser.id, 'delete')} />
                  </div>
                </div>

              </TabsContent>
              <TabsContent value="verification" className="m-0 text-sm text-muted-foreground text-center py-10">Verification details coming soon.</TabsContent>
              <TabsContent value="activity" className="m-0 text-sm text-muted-foreground text-center py-10">Activity logs coming soon.</TabsContent>
              <TabsContent value="safety" className="m-0 text-sm text-muted-foreground text-center py-10">Safety reports coming soon.</TabsContent>
              <TabsContent value="notes" className="m-0 text-sm text-muted-foreground text-center py-10">Admin notes coming soon.</TabsContent>
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
    <div className="bg-card border border-border shadow-md rounded-2xl bg-[#13131A] p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${bg}`}>{icon}</div>
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className="text-2xl font-bold text-white mt-0.5">{data?.value ? data.value.toLocaleString() : '...'}</div>
        <div className={`text-[10px] mt-2 ${data?.trend?.includes('+') ? 'text-green-400' : 'text-red-400'}`}>
          {data?.trend || '...'}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label }: { label: string }) {
  return (
    <div className="flex-shrink-0">
      <div className="text-[10px] text-muted-foreground mb-1 ml-1">{label}</div>
      <Select defaultValue="all">
        <SelectTrigger className="w-[120px] h-8 bg-transparent border-white/10 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#1A1A24] border-white/10">
          <SelectItem value="all">All</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function CircularProgress({ value, size = 32, strokeWidth = 3, color = "stroke-green-400", showText = true, className = "text-[10px]" }: any) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-white/10" />
        <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} className={`${color} transition-all duration-500 ease-in-out`} />
      </svg>
      {showText && <span className={`absolute ${className} font-medium`}>{value}%</span>}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
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
      <div className="flex justify-between text-[10px] mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-white">{percent}%</span>
      </div>
      <div className="h-1 w-full bg-card/10 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-card border border-border shadow-md rounded-2xl bg-[#1A1A24] hover:bg-card/5 border border-white/5 rounded-lg flex flex-col items-center justify-center p-3 gap-2 cursor-pointer transition-colors"
    >
      <div className="w-5 h-5 flex items-center justify-center text-muted-foreground">{icon}</div>
      <span className="text-[9px] text-center text-muted-foreground leading-tight">{label}</span>
    </div>
  );
}
