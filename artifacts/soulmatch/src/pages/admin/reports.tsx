import { motion } from "framer-motion";
import { Flag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLayout } from "@/components/layout/AppLayout";
import { getInitials, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAdminGetReports, useAdminResolveReport, getAdminGetReportsQueryKey } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  reviewed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  resolved: "bg-green-500/20 text-green-400 border-green-500/30",
  dismissed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default function AdminReportsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminGetReports(
    { page },
    { query: { enabled: true }, request: { headers: authHeaders() } } as any,
  );

  const resolve = useAdminResolveReport({ request: { headers: authHeaders() } });

  function handleResolve(id: number, status: string) {
    resolve.mutate(
      { reportId: id, data: { status: status as any, resolution: `Marked as ${status} by admin` } },
      {
        onSuccess: () => {
          toast({ title: `Report ${status}` });
          queryClient.invalidateQueries({ queryKey: getAdminGetReportsQueryKey() });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  }

  const reports = (data as any)?.reports ?? [];
  const totalPages = (data as any)?.totalPages ?? 1;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
            <Flag className="w-7 h-7 text-red-400" />Reports Queue
          </h1>
          <p className="text-[#6B7280]">Review and resolve user reports.</p>
        </motion.div>

        <div className="space-y-3">
          {isLoading ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl bg-[#F3F4F6]" />)
          ) : reports.length === 0 ? (
            <div className="text-center py-16 text-[#6B7280]">
              <Flag className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No reports</p>
            </div>
          ) : (
            reports.map((r: any, i: number) => {
              const reporterPhoto = r.reporter?.photos?.find((p: any) => p.isPrimary);
              const reportedPhoto = r.reported?.photos?.find((p: any) => p.isPrimary);
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-[#FFFFFF] shadow-sm rounded-2xl p- border border-[#E5E7EB]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={reporterPhoto?.url} />
                          <AvatarFallback className="text-xs">{getInitials(r.reporter?.firstName ?? "U")}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-[#6B7280]">reported</span>
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={reportedPhoto?.url} />
                          <AvatarFallback className="text-xs">{getInitials(r.reported?.firstName ?? "U")}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sm">{r.reporter?.firstName}</span>
                          <span className="text-[#6B7280] text-xs">reported</span>
                          <span className="font-semibold text-sm">{r.reported?.firstName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">{r.reason?.replace(/_/g, " ")}</Badge>
                          <Badge className={`text-xs border ${statusColors[r.status] ?? ""}`}>{r.status}</Badge>
                          <span className="text-xs text-[#6B7280]">{formatDate(r.createdAt)}</span>
                        </div>
                        {r.description && <p className="text-xs text-[#6B7280] mt-1 max-w-md">{r.description}</p>}
                      </div>
                    </div>
                    {r.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" onClick={() => handleResolve(r.id, "resolved")} className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30" variant="outline" disabled={resolve.isPending}>Resolve</Button>
                        <Button size="sm" onClick={() => handleResolve(r.id, "dismissed")} className="border-white/20 bg-[#F3F4F6]" variant="outline" disabled={resolve.isPending}>Dismiss</Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="border-white/20 bg-[#F3F4F6]">Previous</Button>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="border-white/20 bg-[#F3F4F6]">Next</Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
