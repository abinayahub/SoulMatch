import { API_URL } from '../../config/api';
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, Calendar, Download, Eye, MoreVertical, 
  BookOpen, Users, AlertTriangle, ShieldAlert,
  ChevronDown, ChevronLeft, ChevronRight, XCircle, Heart, MessageCircle,
  Globe, Lock, EyeOff, Star, Send, Clock, CheckCircle2
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
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const sparklineData = [
  { value: 10 }, { value: 20 }, { value: 15 }, { value: 25 }, { value: 30 }, { value: 45 }, { value: 40 }
];

const fetchStats = async () => {
  const res = await fetch(`${API_URL}/api/admin/journals/stats`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
};

const fetchJournals = async (page: number, search: string, status: string, type: string, vis: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: "10",
    ...(search && { search }),
    ...(status && status !== "All" && { status }),
    ...(type && type !== "All" && { type }),
    ...(vis && vis !== "All" && { vis })
  });
  const res = await fetch(`${API_URL}/api/admin/journals?${params.toString()}`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch journals");
  return res.json();
};

export default function JournalsManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [visFilter, setVisFilter] = useState("All");
  
  const [selectedJournal, setSelectedJournal] = useState<any | null>(null);

  const { data: statsData } = useQuery({
    queryKey: ["adminJournalsStats"],
    queryFn: fetchStats,
    refetchInterval: 30000,
  });

  const { data: journalsData, isLoading } = useQuery({
    queryKey: ["adminJournals", page, search, statusFilter, typeFilter, visFilter],
    queryFn: () => fetchJournals(page, search, statusFilter, typeFilter, visFilter),
    refetchInterval: 30000,
  });

  const StatCard = ({ title, value, trend, trendUp, icon: Icon, color, lineData }: any) => (
    <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-5 border border-[#E5E7EB] relative overflow-hidden flex flex-col justify-between min-h-[130px]">
      <div className="flex items-center gap-3 mb-2 relative z-10">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color.bg}`}>
          <Icon className={`w-4 h-4 ${color.text}`} />
        </div>
        <h3 className="text-sm font-medium text-[#6B7280]">{title}</h3>
      </div>
      <div className="relative z-10 mt-1">
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className={`text-[11px] font-medium ${trendUp ? "text-green-500" : "text-red-500"}`}>{trend}</div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-12 opacity-30 z-0 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={lineData || sparklineData}>
            <Line type="monotone" dataKey="value" stroke={color.hex} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Stories & Journals</h1>
            <p className="text-sm text-[#6B7280]">Monitor, moderate and manage community stories and daily journal entries.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-[#E5E7EB] bg-[#F3F4F6]">
              <Calendar className="w-4 h-4 mr-2" /> May 7 - Jun 7, 2024 <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" className="border-[#E5E7EB] bg-[#F3F4F6] text-[#F6A8B7] hover:text-[#F6A8B7]">
              <Download className="w-4 h-4 mr-2" /> Export Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard title="Total Stories" value={statsData?.totalStories?.value || 0} trend={statsData?.totalStories?.trend || "+0%"} trendUp={true} icon={BookOpen} color={{ bg: "bg-[#F6A8B7]/20", text: "text-[#F6A8B7]", hex: "#A855F7" }} />
          <StatCard title="Total Journals" value={statsData?.totalJournals?.value || 0} trend={statsData?.totalJournals?.trend || "+0%"} trendUp={true} icon={BookOpen} color={{ bg: "bg-green-500/20", text: "text-green-400", hex: "#22C55E" }} />
          <StatCard title="Active Contributors" value={statsData?.activeContributors?.value || 0} trend={statsData?.activeContributors?.trend || "+0%"} trendUp={true} icon={Users} color={{ bg: "bg-blue-500/20", text: "text-blue-400", hex: "#3B82F6" }} />
          <StatCard title="Total Reactions" value={statsData?.totalReactions?.value || 0} trend={statsData?.totalReactions?.trend || "+0%"} trendUp={true} icon={Heart} color={{ bg: "bg-[#F6A8B7]/20", text: "text-[#F6A8B7]", hex: "#EC4899" }} />
          <StatCard title="Reports" value={statsData?.reports?.value || 0} trend={statsData?.reports?.trend || "+0%"} trendUp={false} icon={AlertTriangle} color={{ bg: "bg-[#F6A8B7]/20", text: "text-[#F6A8B7]", hex: "#F97316" }} />
          <StatCard title="Hidden Content" value={statsData?.hiddenContent?.value || 0} trend={statsData?.hiddenContent?.trend || "+0%"} trendUp={false} icon={ShieldAlert} color={{ bg: "bg-red-500/20", text: "text-red-400", hex: "#EF4444" }} />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0 space-y-6">
            
            {/* Tabs */}
            <div className="flex border-b border-[#E5E7EB] gap-8">
              <button className="text-[#F6A8B7] border-b-2 border-[#F6A8B7] pb-3 font-medium text-sm">Stories</button>
              <button className="text-[#6B7280] pb-3 font-medium text-sm hover:text-[#111827] transition-colors">Journals</button>
              <button className="text-[#6B7280] pb-3 font-medium text-sm hover:text-[#111827] transition-colors flex items-center gap-2">
                Moderation Queue <Badge className="bg-[#F6A8B7]/20 text-[#F6A8B7] hover:bg-[#F6A8B7]/30">23</Badge>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-4 border border-[#E5E7EB] flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[clamp(170px,50.89vw,230px)]">
                <Search className="absolute z-10 left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <Input 
                  placeholder="Search stories by title or user..." 
                  className="pl-9 bg-[#F3F4F6] border-[#E5E7EB] rounded-xl"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[clamp(102px,30.53vw,138px)] bg-[#F3F4F6] border-[#E5E7EB] rounded-xl text-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Success Story">Success Story</SelectItem>
                  <SelectItem value="Personal Growth">Personal Growth</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[clamp(102px,30.53vw,138px)] bg-[#F3F4F6] border-[#E5E7EB] rounded-xl text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={visFilter} onValueChange={(v) => { setVisFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[clamp(102px,30.53vw,138px)] bg-[#F3F4F6] border-[#E5E7EB] rounded-xl text-sm">
                  <SelectValue placeholder="All Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Visibility</SelectItem>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="border-[#E5E7EB] bg-[#F3F4F6] rounded-xl">
                <Calendar className="w-4 h-4 mr-2" /> Date Range
              </Button>
              <Button variant="outline" className="border-[#E5E7EB] bg-[#F3F4F6] rounded-xl">
                Filters
              </Button>
              <Button className="w-full text-[#111827] gradient-coral-pill rounded-full border border-white/40 transition-all hover:bg-[#F6A8B7]  rounded-xl ml-auto" >
                + Add Story (Admin)
              </Button>
            </div>

            {/* Table */}
            <div className="bg-card border border-border shadow-md rounded-2xl rounded-2xl border border-[#E5E7EB] overflow-hidden relative">
              <Table>
                <TableHeader className="bg-card/[0.02]">
                  <TableRow className="border-[#E5E7EB]">
                    <TableHead>Story</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Reactions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
                  ) : !journalsData ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-red-400">Failed to load data. Please refresh the page.</TableCell></TableRow>
                  ) : journalsData?.journals?.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-[#6B7280]">No content found.</TableCell></TableRow>
                  ) : (
                    journalsData?.journals?.map((journal: any) => (
                      <TableRow 
                        key={journal.id} 
                        className={`border-b border-[#E5E7EB] cursor-pointer hover:bg-card/[0.02] transition-colors`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] shrink-0">
                              {journal.imageUrl ? (
                                <img src={journal.imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#F6A8B7]/20"><BookOpen className="w-4 h-4 text-[#F6A8B7]" /></div>
                              )}
                            </div>
                            <div className="max-w-[clamp(170px,50.89vw,230px)]">
                              <div className="text-sm font-medium truncate">{journal.content.split('\n')[0] || "Untitled Story"}</div>
                              <div className="text-xs text-[#6B7280] truncate">{journal.content.length > 50 ? journal.content.substring(0, 50) + "..." : journal.content}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={journal.author.avatar} />
                              <AvatarFallback>{journal.author.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium leading-none">{journal.author.name}</div>
                              <div className="text-[clamp(9px,2.54vw,12px)] text-[#6B7280] mt-1">{journal.author.location}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`bg-transparent border-[#E5E7EB] text-[clamp(9px,2.54vw,12px)] font-normal px-2 ${journal.type === 'Success Story' ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-[#F6A8B7] border-[#F6A8B7]/30 bg-[#F6A8B7]/10'}`}>
                            {journal.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                            {journal.visibility === 'Public' ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            {journal.visibility}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                              <Heart className="w-3.5 h-3.5 text-[#F6A8B7] fill-[#F6A8B7]/20" /> {journal.reactions}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                              <MessageCircle className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" /> {journal.comments}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs font-medium ${journal.status === 'Active' ? 'text-green-400' : journal.status === 'Under Review' ? 'text-[#F6A8B7]' : 'text-red-400'}`}>
                            {journal.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-[#6B7280]">
                          <div>{format(new Date(journal.date), 'MMM d, yyyy')}</div>
                          <div>{format(new Date(journal.date), 'hh:mm a')}</div>
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <div className="flex justify-end items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#F3F4F6]">
                              <Eye className="w-4 h-4 text-[#6B7280]" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#F3F4F6]">
                                  <MoreVertical className="w-4 h-4 text-[#6B7280]" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border border-border shadow-md rounded-2xl border-[#E5E7EB]">
                                <DropdownMenuItem>Edit Story</DropdownMenuItem>
                                <DropdownMenuItem>Hide Content</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-400">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              <div className="p-4 border-t border-[#E5E7EB] flex items-center justify-between">
                <span className="text-xs text-[#6B7280]">
                  Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, journalsData?.total || 0)} of {journalsData?.total || 0} entries
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {[...Array(journalsData?.totalPages || 0)].map((_, i) => (
                    <Button 
                      key={i} 
                      variant={page === i + 1 ? "default" : "ghost"} 
                      className={`w-8 h-8 rounded-full ${page === i + 1 ? 'bg-[#F6A8B7] hover:bg-[#F6A8B7] text-[#111827]' : ''}`}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  )).slice(Math.max(0, page - 3), Math.min(journalsData?.totalPages || 0, page + 2))}
                  {journalsData?.totalPages > 5 && page < journalsData?.totalPages - 2 && <span className="px-2 text-[#6B7280]">...</span>}
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" disabled={page === journalsData?.totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  Rows per page <Select defaultValue="10"><SelectTrigger className="w-[clamp(51px,15.27vw,69px)] h-8 bg-transparent border-[#E5E7EB]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="10">10</SelectItem></SelectContent></Select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-[350px] space-y-6">
            
            {/* Moderation Overview */}
            <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-5 border border-[#E5E7EB]">
              <h3 className="font-semibold text-sm mb-4">Moderation Overview</h3>
              <div className="space-y-4 mb-5 text-sm">
                <div className="flex justify-between items-center text-[#6B7280]">
                  <span className="flex items-center gap-2 text-[#F6A8B7]"><Clock className="w-4 h-4" /> Pending Review</span>
                  <span className="font-medium text-[#111827]">23</span>
                </div>
                <div className="flex justify-between items-center text-[#6B7280]">
                  <span className="flex items-center gap-2 text-[#F6A8B7]"><AlertTriangle className="w-4 h-4" /> Reported Stories</span>
                  <span className="font-medium text-[#111827]">18</span>
                </div>
                <div className="flex justify-between items-center text-[#6B7280]">
                  <span className="flex items-center gap-2 text-[#F6A8B7]"><AlertTriangle className="w-4 h-4" /> Reported Journals</span>
                  <span className="font-medium text-[#111827]">27</span>
                </div>
                <div className="flex justify-between items-center text-[#6B7280]">
                  <span className="flex items-center gap-2 text-[#6B7280]"><EyeOff className="w-4 h-4" /> Hidden by Admin</span>
                  <span className="font-medium text-[#111827]">92</span>
                </div>
              </div>
              <Button className="w-full bg-[#F6A8B7]/10 text-[#F6A8B7] hover:bg-[#F6A8B7]/20 border border-[#F6A8B7]/20">
                Go to Moderation Queue
              </Button>
            </div>

            {/* Recent Journals */}
            <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-5 border border-[#E5E7EB]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Recent Journals</h3>
                <span className="text-xs text-[#F6A8B7] cursor-pointer">View All</span>
              </div>
              <div className="space-y-4 mb-5">
                {journalsData?.journals?.slice(0, 3).map((journal: any) => (
                  <div key={journal.id} className="relative pb-4 border-b border-[#E5E7EB] last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8 border border-[#E5E7EB] shrink-0">
                        <AvatarImage src={journal.author.avatar} />
                        <AvatarFallback>{journal.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium truncate">{journal.author.name}</span>
                          <span className="text-[clamp(9px,2.54vw,12px)] text-[#6B7280]">2 mins ago</span>
                        </div>
                        <p className="text-xs text-[#6B7280] line-clamp-2 mb-2">
                          {journal.content}
                        </p>
                        <div className="flex items-center gap-3 text-[clamp(9px,2.54vw,12px)] text-[#6B7280]">
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-[#F6A8B7]" /> {journal.reactions}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-blue-400" /> {journal.comments}</span>
                        </div>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 mt-1.5"></div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full bg-[#F3F4F6] border-[#E5E7EB] text-sm">
                View All Journals
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#FFFFFF] shadow-sm rounded-2xl p-5 border border-[#E5E7EB]">
              <h3 className="font-semibold text-sm mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="bg-[#F3F4F6] border-[#E5E7EB] text-xs h-10 justify-start px-3"><Star className="w-3.5 h-3.5 mr-2 text-yellow-400" /> Feature Story</Button>
                <Button variant="outline" size="sm" className="bg-[#F3F4F6] border-[#E5E7EB] text-xs h-10 justify-start px-3"><EyeOff className="w-3.5 h-3.5 mr-2 text-red-400" /> Hide Content</Button>
                <Button variant="outline" size="sm" className="bg-[#F3F4F6] border-[#E5E7EB] text-xs h-10 justify-start px-3"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-green-400" /> Bulk Approve</Button>
                <Button variant="outline" size="sm" className="bg-[#F3F4F6] border-[#E5E7EB] text-xs h-10 justify-start px-3"><Send className="w-3.5 h-3.5 mr-2 text-[#F6A8B7]" /> Send Announcement</Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
