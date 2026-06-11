import { motion } from "framer-motion";
import { Shield, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { getInitials, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminGetVerifications, useAdminProcessVerification,
  getAdminGetVerificationsQueryKey,
} from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

export default function AdminVerificationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: verifications = [], isLoading } = useAdminGetVerifications({
    query: { enabled: true } as any,
    request: { headers: authHeaders() },
  });

  const process = useAdminProcessVerification({ request: { headers: authHeaders() } });

  function handleProcess(id: number, status: "approved" | "rejected", reason?: string) {
    process.mutate(
      { verificationId: id, data: { status, rejectionReason: reason } },
      {
        onSuccess: () => {
          toast({ title: `Verification ${status}` });
          queryClient.invalidateQueries({ queryKey: getAdminGetVerificationsQueryKey() });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
            <Shield className="w-7 h-7 text-yellow-400" />Verification Queue
          </h1>
          <p className="text-muted-foreground">Review and process identity verification requests.</p>
        </motion.div>

        <div className="space-y-4">
          {isLoading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl bg-white/5" />)
          ) : (verifications as any[]).length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No pending verifications</p>
            </div>
          ) : (
            (verifications as any[]).map((v: any, i: number) => {
              const photo = v.user?.photos?.find((p: any) => p.isPrimary) ?? v.user?.photos?.[0];
              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass rounded-2xl p-5"
                >
                  <div className="flex items-start gap-5">
                    <Avatar className="w-12 h-12 shrink-0">
                      <AvatarImage src={photo?.url} />
                      <AvatarFallback className="gradient-primary text-white font-semibold">
                        {getInitials(v.user?.firstName ?? "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{v.user?.firstName}</h3>
                        <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{v.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Document: <span className="text-foreground">{v.documentType?.replace(/_/g, " ")}</span></p>
                      <p className="text-xs text-muted-foreground mt-0.5">Submitted {formatDate(v.createdAt)}</p>
                      <div className="mt-3 flex gap-2">
                        <a href={v.documentUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="border-white/20 bg-white/5 text-xs">View Document</Button>
                        </a>
                        {v.selfieUrl && (
                          <a href={v.selfieUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="border-white/20 bg-white/5 text-xs">View Selfie</Button>
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleProcess(v.id, "approved")}
                        className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 gap-1"
                        variant="outline"
                        disabled={process.isPending}
                      >
                        <Check className="w-3.5 h-3.5" />Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleProcess(v.id, "rejected", "Documents unclear")}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1"
                        variant="outline"
                        disabled={process.isPending}
                      >
                        <X className="w-3.5 h-3.5" />Reject
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
