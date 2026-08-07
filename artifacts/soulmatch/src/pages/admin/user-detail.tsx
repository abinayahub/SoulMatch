import { motion } from "framer-motion";
import { Users, ChevronLeft, Crown, Ban, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { getInitials, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAdminGetUser, useAdminUpdateUser, getAdminGetUserQueryKey } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

interface Props { userId: string }

export default function AdminUserDetailPage({ userId }: Props) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const uid = parseInt(userId);
  const { data: user, isLoading } = useAdminGetUser(uid, {
    query: { enabled: !!uid } as any,
    request: { headers: authHeaders() },
  });

  const update = useAdminUpdateUser({ request: { headers: authHeaders() } });

  const u = user as any;

  function handleUpdate() {
    const data: any = {};
    if (role) data.role = role;
    if (status) data.status = status;
    if (!Object.keys(data).length) return;

    update.mutate(
      { userId: uid, data },
      {
        onSuccess: () => {
          toast({ title: "User updated!" });
          queryClient.invalidateQueries({ queryKey: getAdminGetUserQueryKey(uid) });
          setRole(""); setStatus("");
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      },
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/admin/users")} className="mb-4 text-[#6B7280]">
          <ChevronLeft className="w-4 h-4 mr-1" />Back to Users
        </Button>

        {isLoading ? (
          <Skeleton className="h-96 rounded-2xl bg-[#F3F4F6]" />
        ) : !u ? (
          <div className="text-center py-16 text-[#6B7280]">User not found</div>
        ) : (
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#FFFFFF] shadow-sm rounded-2xl p- border border-[#E5E7EB]">
              <div className="flex items-start gap-5">
                <Avatar className="w-16 h-16 ring-2 ring-primary/30">
                  <AvatarFallback className="bg-primary text-primary-foreground shadow-md text-[#111827] text-xl font-bold">
                    {getInitials(u.firstName, u.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{u.firstName} {u.lastName}</h1>
                  <p className="text-[#6B7280] text-sm mt-0.5">{u.email}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className="text-xs border">{u.role}</Badge>
                    <Badge className={`text-xs border ${u.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>
                      {u.status}
                    </Badge>
                    <Badge className="text-xs border">{u.verificationStatus}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                <div><p className="text-xs text-[#6B7280]">Journey Progress</p><p className="font-semibold">{u.journeyProgress}/30</p></div>
                <div><p className="text-xs text-[#6B7280]">Joined</p><p className="font-semibold">{formatDate(u.createdAt)}</p></div>
                <div><p className="text-xs text-[#6B7280]">Premium</p><p className="font-semibold">{u.isPremium ? "Yes" : "No"}</p></div>
                <div><p className="text-xs text-[#6B7280]">Reports</p><p className="font-semibold">{u.reportCount ?? 0}</p></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#FFFFFF] shadow-sm rounded-2xl p- border border-[#E5E7EB]">
              <h2 className="font-semibold mb-4">Admin Actions</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#6B7280]">Change Role</label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="bg-[#F3F4F6] border-[#E5E7EB]">
                      <SelectValue placeholder={u.role} />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border shadow-md rounded-2xl border-[#E5E7EB]">
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#6B7280]">Change Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-[#F3F4F6] border-[#E5E7EB]">
                      <SelectValue placeholder={u.status} />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border shadow-md rounded-2xl border-[#E5E7EB]">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleUpdate} className="bg-primary text-primary-foreground shadow-md border-0 text-[#111827]" disabled={update.isPending || (!role && !status)}>
                {update.isPending ? "Updating..." : "Apply Changes"}
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
