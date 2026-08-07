import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "../../config/api";
import { getAccessToken } from "@/lib/auth-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Check, X, User, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CommunityQuestionsManager() {
  const [activeTab, setActiveTab] = useState<"Pending" | "Approved" | "Rejected" | "Closed">("Pending");
  const [viewingAnswersFor, setViewingAnswersFor] = useState<any | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: questions, isLoading } = useQuery({
    queryKey: ["adminCommunityQuestions", activeTab],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/community-questions?status=${activeTab}`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      });
      if (!res.ok) throw new Error("Failed to fetch questions");
      return res.json();
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: number; status: "Approved" | "Rejected"; reason?: string }) => {
      const res = await fetch(`${API_URL}/api/admin/community-questions/${id}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify({ status, reason })
      });
      if (!res.ok) throw new Error("Failed to review question");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminCommunityQuestions"] });
      toast({ title: "Success", description: `Question ${variables.status.toLowerCase()} successfully.` });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const handleReview = (id: number, status: "Approved" | "Rejected") => {
    let reason = "";
    if (status === "Rejected") {
      reason = window.prompt("Enter a reason for rejection (optional):") || "";
    }
    reviewMutation.mutate({ id, status, reason });
  };

  const { data: currentAnswers, isLoading: isLoadingAnswers } = useQuery({
    queryKey: ["adminCommunityQuestionAnswers", viewingAnswersFor?.id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/community-questions/${viewingAnswersFor.id}/answers`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      });
      if (!res.ok) throw new Error("Failed to fetch answers");
      return res.json();
    },
    enabled: !!viewingAnswersFor
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Community Questions</h1>
          <p className="text-[#6B7280] mt-1">Manage user-submitted questions for the community.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#E5E7EB] mb-6">
        {['Pending', 'Approved', 'Rejected', 'Closed'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 text-sm font-medium transition-colors ${activeTab === tab ? 'border-b-2 border-[#2563EB] text-[#2563EB]' : 'text-[#6B7280] hover:text-[#111827]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="bg-[#FFFFFF] shadow-sm rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#F9FAFB]">
            <TableRow className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
              {activeTab === "Pending" && (
                <>
                  <TableHead className="font-medium text-[#374151]">Submitter</TableHead>
                  <TableHead className="font-medium text-[#374151]">Anon</TableHead>
                  <TableHead className="font-medium text-[#374151]">Date</TableHead>
                  <TableHead className="font-medium text-[#374151] max-w-md">Question</TableHead>
                  <TableHead className="font-medium text-[#374151] text-right">Actions</TableHead>
                </>
              )}
              {activeTab === "Approved" && (
                <>
                  <TableHead className="font-medium text-[#374151]">Submitter</TableHead>
                  <TableHead className="font-medium text-[#374151] max-w-md">Question</TableHead>
                  <TableHead className="font-medium text-[#374151]">Published</TableHead>
                  <TableHead className="font-medium text-[#374151]">Visible To</TableHead>
                  <TableHead className="font-medium text-[#374151] text-center">Answers</TableHead>
                </>
              )}
              {activeTab === "Rejected" && (
                <>
                  <TableHead className="font-medium text-[#374151]">Submitter</TableHead>
                  <TableHead className="font-medium text-[#374151] max-w-md">Question</TableHead>
                  <TableHead className="font-medium text-[#374151]">Reason</TableHead>
                  <TableHead className="font-medium text-[#374151]">Rejected Date</TableHead>
                </>
              )}
              {activeTab === "Closed" && (
                <>
                  <TableHead className="font-medium text-[#374151]">Submitter</TableHead>
                  <TableHead className="font-medium text-[#374151] max-w-md">Question</TableHead>
                  <TableHead className="font-medium text-[#374151]">Closed Date</TableHead>
                  <TableHead className="font-medium text-[#374151] text-center">Answers</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-[#6B7280]">Loading questions...</TableCell>
              </TableRow>
            ) : questions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-[#6B7280]">No {activeTab.toLowerCase()} questions found.</TableCell>
              </TableRow>
            ) : (
              questions?.map((q: any) => (
                <TableRow key={q.id} className="border-b border-[#E5E7EB] hover:bg-[#F3F4F6]">
                  {activeTab === "Pending" && (
                    <>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {q.user?.photoUrl ? (
                            <img src={q.user.photoUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                              <User className="w-4 h-4 text-[#6B7280]" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-[#111827]">
                              {q.user ? (q.user.displayName || `${q.user.firstName || ''} ${q.user.lastName || ''}`.trim() || "Unknown") : "Unknown"}
                            </div>
                            {q.user?.email && <div className="text-xs text-[#6B7280]">{q.user.email}</div>}
                            <div className="text-xs text-[#6B7280] capitalize">{q.userGender}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`border-0 ${q.isAnonymous ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#F3F4F6] text-[#6B7280]"}`}>
                          {q.isAnonymous ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#6B7280]">
                        {q.createdAt ? format(new Date(q.createdAt), "MMM d, yyyy") : "Unknown"}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-[#111827] line-clamp-2">{q.text}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-[#16A34A] text-[#16A34A] hover:bg-[#DCFCE7] hover:text-[#16A34A]"
                            onClick={() => handleReview(q.id, "Approved")}
                            disabled={reviewMutation.isPending}
                          >
                            <Check className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-[#DC2626] text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                            onClick={() => handleReview(q.id, "Rejected")}
                            disabled={reviewMutation.isPending}
                          >
                            <X className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                  {activeTab === "Approved" && (
                    <>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {q.user?.photoUrl ? (
                            <img src={q.user.photoUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                              <User className="w-4 h-4 text-[#6B7280]" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-[#111827]">
                              {q.user ? (q.user.displayName || `${q.user.firstName || ''} ${q.user.lastName || ''}`.trim() || "Unknown") : "Unknown"}
                            </div>
                            {q.user?.email && <div className="text-xs text-[#6B7280]">{q.user.email}</div>}
                            <div className="text-xs text-[#6B7280] capitalize">{q.userGender}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-[#111827] line-clamp-2">{q.text}</p>
                      </TableCell>
                      <TableCell className="text-[#6B7280]">
                        {q.approvedAt ? format(new Date(q.approvedAt), "MMM d, yyyy") : "Unknown"}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-[#EEF4FF] text-[#2563EB] border-0 capitalize">
                          {q.userGender === "male" ? "Female" : q.userGender === "female" ? "Male" : "Everyone"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-[#111827]">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="hover:bg-[#F3F4F6]"
                          onClick={() => setViewingAnswersFor(q)}
                          disabled={!q.totalAnswers}
                        >
                          {q.totalAnswers || 0}
                        </Button>
                      </TableCell>
                    </>
                  )}
                  {activeTab === "Rejected" && (
                    <>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {q.user?.photoUrl ? (
                            <img src={q.user.photoUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                              <User className="w-4 h-4 text-[#6B7280]" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-[#111827]">
                              {q.user ? (q.user.displayName || `${q.user.firstName || ''} ${q.user.lastName || ''}`.trim() || "Unknown") : "Unknown"}
                            </div>
                            {q.user?.email && <div className="text-xs text-[#6B7280]">{q.user.email}</div>}
                            <div className="text-xs text-[#6B7280] capitalize">{q.userGender}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-[#111827] line-clamp-2">{q.text}</p>
                      </TableCell>
                      <TableCell className="text-[#6B7280]">
                        {q.rejectionReason || "No reason provided"}
                      </TableCell>
                      <TableCell className="text-[#6B7280]">
                        {q.rejectedAt ? format(new Date(q.rejectedAt), "MMM d, yyyy") : "Unknown"}
                      </TableCell>
                    </>
                  )}
                  {activeTab === "Closed" && (
                    <>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {q.user?.photoUrl ? (
                            <img src={q.user.photoUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                              <User className="w-4 h-4 text-[#6B7280]" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-[#111827]">
                              {q.user ? (q.user.displayName || `${q.user.firstName || ''} ${q.user.lastName || ''}`.trim() || "Unknown") : "Unknown"}
                            </div>
                            {q.user?.email && <div className="text-xs text-[#6B7280]">{q.user.email}</div>}
                            <div className="text-xs text-[#6B7280] capitalize">{q.userGender}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-[#111827] line-clamp-2">{q.text}</p>
                      </TableCell>
                      <TableCell className="text-[#6B7280]">
                        {q.updatedAt ? format(new Date(q.updatedAt), "MMM d, yyyy") : "Unknown"}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-[#111827]">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="hover:bg-[#F3F4F6]"
                          onClick={() => setViewingAnswersFor(q)}
                          disabled={!q.totalAnswers}
                        >
                          {q.totalAnswers || 0}
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewingAnswersFor} onOpenChange={(open) => !open && setViewingAnswersFor(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Answers to Question</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <p className="text-[#111827] font-medium">{viewingAnswersFor?.text}</p>
            </div>
            
            {isLoadingAnswers ? (
              <div className="text-center py-8 text-[#6B7280]">Loading answers...</div>
            ) : currentAnswers?.length === 0 ? (
              <div className="text-center py-8 text-[#6B7280]">No answers yet.</div>
            ) : (
              <div className="space-y-3">
                {currentAnswers?.map((ans: any) => (
                  <div key={ans.id} className="p-4 bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 mb-1">
                      {ans.user?.photoUrl ? (
                        <img src={ans.user.photoUrl} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                          <User className="w-3 h-3 text-[#6B7280]" />
                        </div>
                      )}
                      <span className="text-sm font-semibold text-[#111827]">
                        {ans.user ? (ans.user.displayName || `${ans.user.firstName || ''} ${ans.user.lastName || ''}`.trim() || "Unknown") : "Unknown"}
                      </span>
                      <span className="text-xs text-[#6B7280] ml-auto">
                        {ans.createdAt ? format(new Date(ans.createdAt), "MMM d, yyyy") : "Unknown"}
                      </span>
                    </div>
                    <p className="text-sm text-[#374151] whitespace-pre-wrap">{ans.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
