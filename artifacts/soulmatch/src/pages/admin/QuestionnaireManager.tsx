import { API_URL } from '../../config/api';
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/auth-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Edit, Trash2, CheckCircle2, ChevronRight, X, ChevronDown, ListPlus, ShieldCheck, HelpCircle, 
  Settings, User, Plus, Filter, AlertCircle, Eye, MoreVertical, CalendarDays, ClipboardList, PauseCircle, Clock
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const fetchStats = async () => {
  const res = await fetch(`${API_URL}/api/admin/questions/stats`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
};

const fetchQuestions = async (search: string, category: string, day: string, type: string, status: string, page: number) => {
  const params = new URLSearchParams({ search, page: page.toString(), limit: "10" });
  if (category && category !== 'All Categories') params.append('category', category);
  if (day && day !== 'All Days') params.append('day', day);
  if (type && type !== 'All Types') params.append('type', type);
  if (status && status !== 'Status') params.append('status', status);

  const res = await fetch(`${API_URL}/api/admin/questions?${params.toString()}`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch questions");
  return res.json();
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  choice: <ListPlus className="w-3.5 h-3.5" />,
  multi_choice: <ListPlus className="w-3.5 h-3.5" />,
  text: <HelpCircle className="w-3.5 h-3.5" />,
  scale: <Settings className="w-3.5 h-3.5" />
};

const TYPE_LABELS: Record<string, string> = {
  choice: "Single Choice",
  multi_choice: "Multiple Choice",
  text: "Short Answer", // We map text to Short Answer/Paragraph
  scale: "Rating Scale"
};

const CATEGORY_COLORS: Record<string, string> = {
  "Lifestyle": "bg-[#9B4DFF]/10 text-[#9B4DFF] border-[#9B4DFF]/20",
  "Relationship": "bg-pink-500/10 text-pink-500 border-pink-500/20",
  "Personality": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Career": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "Family Values": "bg-teal-500/10 text-teal-500 border-teal-500/20",
  "Communication": "bg-pink-400/10 text-pink-400 border-pink-400/20",
};

export default function QuestionnaireManager() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [dayFilter, setDayFilter] = useState("All Days");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("Status");
  const [page, setPage] = useState(1);
  
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["adminQuestionStats"],
    queryFn: fetchStats,
  });

  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ["adminQuestions", search, categoryFilter, dayFilter, typeFilter, statusFilter, page],
    queryFn: () => fetchQuestions(search, categoryFilter, dayFilter, typeFilter, statusFilter, page),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_URL}/api/admin/questions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      if (!res.ok) throw new Error("Failed to delete question");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminQuestions"] });
      queryClient.invalidateQueries({ queryKey: ["adminQuestionStats"] });
      toast({ title: "Question deleted successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editingQuestion ? `/api/admin/questions/${editingQuestion.id}` : `/api/admin/questions`;
      const method = editingQuestion ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}` 
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to save question");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminQuestions"] });
      queryClient.invalidateQueries({ queryKey: ["adminQuestionStats"] });
      toast({ title: `Question ${editingQuestion ? 'updated' : 'added'} successfully` });
      closeSidePanel();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      deleteMutation.mutate(id);
    }
  };

  const openSidePanel = (question?: any) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        category: question.category,
        day: question.day.toString(),
        type: question.type,
        text: question.question,
        options: question.options || [],
        isActive: question.isActive
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        category: "",
        day: "",
        type: "choice",
        text: "",
        options: ["Option 1", "Option 2"],
        isActive: true
      });
    }
    setIsSidePanelOpen(true);
  };

  const closeSidePanel = () => {
    setIsSidePanelOpen(false);
    setEditingQuestion(null);
  };

  // Form State for Side Panel
  const [formData, setFormData] = useState({
    category: "",
    day: "",
    type: "choice",
    text: "",
    options: ["Option 1", "Option 2"],
    isActive: true
  });

  const handleSave = () => {
    if (!formData.category || !formData.day || !formData.type || !formData.text) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    saveMutation.mutate({
      category: formData.category,
      day: formData.day,
      type: formData.type,
      question: formData.text,
      options: ['choice', 'multi_choice'].includes(formData.type) ? formData.options : [],
      isActive: formData.isActive
    });
  };

  return (
    <div className="space-y-6 relative flex w-full">
      
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${isSidePanelOpen ? 'mr-[450px]' : ''}`}>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Questionnaire Management</h1>
            <p className="text-muted-foreground mt-1">Manage all questions in the 30-day assessment journey.</p>
          </div>
          <Button onClick={() => openSidePanel()} className="bg-pink-600 hover:bg-pink-700 text-white border-0">
            <Plus className="w-4 h-4 mr-2" /> Add Question
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1A1A24] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#9B4DFF]/10 flex items-center justify-center shrink-0">
              <ClipboardList className="w-6 h-6 text-[#9B4DFF]" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Questions</div>
              <div className="text-2xl font-bold">{stats?.totalQuestions?.value || 0}</div>
              <div className="text-xs text-muted-foreground">Across {stats?.totalQuestions?.acrossCategories || 0} Categories</div>
            </div>
          </div>
          <div className="bg-[#1A1A24] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Active Questions</div>
              <div className="text-2xl font-bold">{stats?.activeQuestions?.value || 0}</div>
              <div className="text-xs text-muted-foreground">{stats?.activeQuestions?.percentage || 0}% of total</div>
            </div>
          </div>
          <div className="bg-[#1A1A24] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
              <PauseCircle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Inactive Questions</div>
              <div className="text-2xl font-bold">{stats?.inactiveQuestions?.value || 0}</div>
              <div className="text-xs text-muted-foreground">{stats?.inactiveQuestions?.percentage || 0}% of total</div>
            </div>
          </div>
          <div className="bg-[#1A1A24] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
              <CalendarDays className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Days</div>
              <div className="text-2xl font-bold">{stats?.totalDays?.value || 30}</div>
              <div className="text-xs text-muted-foreground">Assessment Journey</div>
            </div>
          </div>
        </div>

        {/* Tabs Row */}
        <div className="flex gap-6 border-b border-white/10 mb-6">
          {['All Questions', 'By Category', 'By Day', 'Question Analytics'].map((tab) => (
            <button 
              key={tab}
              className={`pb-3 text-sm font-medium transition-colors ${tab === 'All Questions' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-muted-foreground hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search questions..." 
              className="pl-9 bg-[#1A1A24] border-white/10 w-full"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[160px] bg-[#1A1A24] border-white/10">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Categories">All Categories</SelectItem>
              <SelectItem value="Lifestyle">Lifestyle</SelectItem>
              <SelectItem value="Relationship">Relationship</SelectItem>
              <SelectItem value="Personality">Personality</SelectItem>
              <SelectItem value="Career">Career Goals</SelectItem>
              <SelectItem value="Family Values">Family Values</SelectItem>
              <SelectItem value="Communication">Communication</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dayFilter} onValueChange={(v) => { setDayFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[120px] bg-[#1A1A24] border-white/10">
              <SelectValue placeholder="All Days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Days">All Days</SelectItem>
              {Array.from({length: 30}).map((_, i) => (
                <SelectItem key={i} value={`Day ${i+1}`}>Day {i+1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px] bg-[#1A1A24] border-white/10">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Types">All Types</SelectItem>
              <SelectItem value="choice">Single Choice</SelectItem>
              <SelectItem value="multi_choice">Multiple Choice</SelectItem>
              <SelectItem value="text">Short Answer</SelectItem>
              <SelectItem value="scale">Rating Scale</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[120px] bg-[#1A1A24] border-white/10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Status">Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-[#1A1A24] border-white/10 gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
        </div>

        {/* Table */}
        <div className="bg-[#1A1A24] rounded-2xl border border-white/5 overflow-hidden">
          <Table>
            <TableHeader className="bg-[#13131A]">
              <TableRow className="border-b border-white/5 hover:bg-transparent">
                <TableHead className="w-[50px] font-medium text-muted-foreground">#</TableHead>
                <TableHead className="font-medium text-muted-foreground">Question</TableHead>
                <TableHead className="font-medium text-muted-foreground">Category</TableHead>
                <TableHead className="font-medium text-muted-foreground">Day</TableHead>
                <TableHead className="font-medium text-muted-foreground">Type</TableHead>
                <TableHead className="font-medium text-muted-foreground">Status</TableHead>
                <TableHead className="text-right font-medium text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questionsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading questions...</TableCell>
                </TableRow>
              ) : questionsData?.questions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No questions found matching criteria.</TableCell>
                </TableRow>
              ) : (
                questionsData?.questions?.map((q: any) => (
                  <TableRow key={q.id} className="border-b border-white/5 border-dashed hover:bg-card/[0.02] cursor-pointer" onClick={() => openSidePanel(q)}>
                    <TableCell className="font-medium text-muted-foreground">{q.index}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{q.question}</TableCell>
                    <TableCell>
                      <Badge className={`${CATEGORY_COLORS[q.category] || "bg-card/10 text-white"} border hover:${CATEGORY_COLORS[q.category] || "bg-card/10"}`}>
                        {q.category}
                      </Badge>
                    </TableCell>
                    <TableCell>Day {q.day}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {TYPE_ICONS[q.type]}
                        {TYPE_LABELS[q.type] || q.type}
                      </div>
                    </TableCell>
                    <TableCell>
                      {q.isActive ? (
                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-0">Active</Badge>
                      ) : (
                        <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-0">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => openSidePanel(q)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => openSidePanel(q)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px] bg-[#1A1A24] border-white/10">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleDelete(q.id)}>
                              <Trash2 className="w-4 h-4 mr-2 text-red-500" /> <span className="text-red-500">Delete Question</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-[#13131A]/50">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * 10 + 1} to Math.min(page * 10, questionsData?.total || 0) of {questionsData?.total || 0} questions
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="bg-[#1A1A24] border-white/10 px-3" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                &lt;
              </Button>
              {Array.from({ length: Math.min(5, questionsData?.totalPages || 1) }).map((_, i) => {
                const p = i + 1;
                return (
                  <Button 
                    key={p} 
                    variant="outline" 
                    className={`${page === p ? 'bg-pink-600 border-pink-600 text-white' : 'bg-[#1A1A24] border-white/10'}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                );
              })}
              {questionsData?.totalPages > 5 && <span className="px-2 text-muted-foreground">...</span>}
              {questionsData?.totalPages > 5 && (
                <Button 
                  variant="outline" 
                  className={`bg-[#1A1A24] border-white/10`}
                  onClick={() => setPage(questionsData.totalPages)}
                >
                  {questionsData.totalPages}
                </Button>
              )}
              <Button 
                variant="outline" 
                className="bg-[#1A1A24] border-white/10 px-3"
                disabled={!questionsData || page >= questionsData.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                &gt;
              </Button>
              
              <Select defaultValue="10">
                <SelectTrigger className="w-[100px] bg-[#1A1A24] border-white/10 ml-4">
                  <SelectValue placeholder="10 / page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

      </div>

      {/* Side Panel for Add/Edit Question */}
      {isSidePanelOpen && (
        <>
          <div className="fixed inset-0 bg-background/40 z-40 backdrop-blur-sm lg:hidden" onClick={closeSidePanel} />
          <div className="fixed top-0 right-0 h-screen w-full sm:w-[450px] bg-[#13131A] border-l border-white/10 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#1A1A24]">
              <h2 className="text-xl font-bold">{editingQuestion ? 'Edit Question' : 'Add Question'}</h2>
              <Button variant="ghost" size="icon" onClick={closeSidePanel} className="text-muted-foreground hover:text-white hover:bg-card/5 rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Question Category <span className="text-red-500">*</span></label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger className="bg-[#1A1A24] border-white/10">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                      <SelectItem value="Relationship">Relationship</SelectItem>
                      <SelectItem value="Personality">Personality</SelectItem>
                      <SelectItem value="Career">Career Goals</SelectItem>
                      <SelectItem value="Family Values">Family Values</SelectItem>
                      <SelectItem value="Communication">Communication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Assign to Day <span className="text-red-500">*</span></label>
                  <Select value={formData.day} onValueChange={(v) => setFormData({...formData, day: v})}>
                    <SelectTrigger className="bg-[#1A1A24] border-white/10">
                      <SelectValue placeholder="Select Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 30}).map((_, i) => (
                        <SelectItem key={i} value={`${i+1}`}>Day {i+1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Question Type <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setFormData({...formData, type: 'choice'})}
                      className={`justify-start ${formData.type === 'choice' ? 'border-pink-500 bg-pink-500/10 text-pink-500' : 'border-white/10 bg-[#1A1A24]'}`}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Single Choice
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setFormData({...formData, type: 'multi_choice'})}
                      className={`justify-start ${formData.type === 'multi_choice' ? 'border-pink-500 bg-pink-500/10 text-pink-500' : 'border-white/10 bg-[#1A1A24]'}`}
                    >
                      <ListPlus className="w-4 h-4 mr-2" /> Multiple Choice
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setFormData({...formData, type: 'text'})}
                      className={`justify-start ${formData.type === 'text' ? 'border-pink-500 bg-pink-500/10 text-pink-500' : 'border-white/10 bg-[#1A1A24]'}`}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" /> Short Answer
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setFormData({...formData, type: 'text'})} // Mapping paragraph to text
                      className={`justify-start ${formData.type === 'text' ? 'border-white/10 bg-[#1A1A24]' : 'border-white/10 bg-[#1A1A24]'}`}
                    >
                      <ClipboardList className="w-4 h-4 mr-2" /> Paragraph
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setFormData({...formData, type: 'scale'})}
                      className={`justify-start col-span-2 sm:col-span-1 ${formData.type === 'scale' ? 'border-pink-500 bg-pink-500/10 text-pink-500' : 'border-white/10 bg-[#1A1A24]'}`}
                    >
                      <Settings className="w-4 h-4 mr-2" /> Rating Scale
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Question Text <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <textarea 
                      placeholder="Enter your question here..." 
                      className="w-full bg-[#1A1A24] border border-white/10 rounded-xl p-3 min-h-[120px] text-sm focus:outline-none focus:border-pink-500 custom-scrollbar"
                      value={formData.text}
                      onChange={(e) => setFormData({...formData, text: e.target.value})}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">{formData.text.length} / 500</div>
                  </div>
                </div>

                {['choice', 'multi_choice'].includes(formData.type) && (
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Options <span className="text-red-500">*</span> <span className="text-muted-foreground text-xs font-normal">({TYPE_LABELS[formData.type]})</span></label>
                    <div className="space-y-3">
                      {formData.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-white/30 shrink-0" />
                          <Input 
                            value={opt} 
                            onChange={(e) => {
                              const newOpts = [...formData.options];
                              newOpts[i] = e.target.value;
                              setFormData({...formData, options: newOpts});
                            }}
                            className="bg-[#1A1A24] border-white/10 h-10" 
                          />
                          <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0 h-10 w-10 border border-white/5 bg-[#1A1A24]" onClick={() => {
                            const newOpts = formData.options.filter((_, idx) => idx !== i);
                            setFormData({...formData, options: newOpts});
                          }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="ghost" className="text-pink-500 hover:text-pink-400 hover:bg-pink-500/10 p-0 h-auto font-medium" onClick={() => {
                        setFormData({...formData, options: [...formData.options, `Option ${formData.options.length + 1}`]});
                      }}>
                        <Plus className="w-4 h-4 mr-1" /> Add Option
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="text-sm font-medium text-white">Is Mandatory?</div>
                  <Switch defaultChecked />
                </div>

                <div className="pt-2">
                  <label className="text-sm font-medium text-white mb-2 block">Status</label>
                  <Select value={formData.isActive ? "Active" : "Inactive"} onValueChange={(v) => setFormData({...formData, isActive: v === "Active"})}>
                    <SelectTrigger className="bg-[#1A1A24] border-white/10">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-[#1A1A24] flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent border-white/10" onClick={closeSidePanel}>
                Cancel
              </Button>
              <Button className="flex-1 bg-pink-600 hover:bg-pink-700 text-white border-0" onClick={handleSave} disabled={saveMutation.isPending}>
                <Plus className="w-4 h-4 mr-2" /> {editingQuestion ? 'Update Question' : 'Save Question'}
              </Button>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
