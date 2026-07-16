import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, ChevronRight, Crown, Shield, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { getInitials, formatDate } from "@/lib/utils";
import { useLocation } from "wouter";
import { useAdminGetUsers } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";

function authHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

const roleColors: Record<string, string> = {
  user: "bg-card/10 text-muted-foreground",
  premium: "bg-accent/20 text-accent border-accent/30",
  admin: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  superadmin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};
const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  suspended: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  banned: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AdminUsersPage() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminGetUsers(
    { page, limit: 20, search: search || undefined },
    { query: { enabled: true }, request: { headers: authHeaders() } } as any,
  );

  const users = (data as any)?.users ?? [];
  const totalPages = (data as any)?.totalPages ?? 1;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
              <Users className="w-7 h-7 text-primary" />User Management
            </h1>
            <p className="text-muted-foreground">{(data as any)?.total ?? 0} total users</p>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-card/5 border-white/10"
          />
        </div>

        {/* Table */}
        <div className="bg-card border border-border shadow-md rounded-2xl rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl bg-card/5" />)}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">User</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Role</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Status</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Verification</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Journey</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Joined</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any, i: number) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => navigate(`/admin/users/${u.id}`)}
                      className="border-b border-white/5 hover:bg-card/5 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary text-primary-foreground shadow-md text-white text-xs font-semibold">
                              {getInitials(u.firstName, u.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs border ${roleColors[u.role] ?? ""}`}>{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs border ${statusColors[u.status] ?? ""}`}>{u.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground capitalize">{u.verificationStatus}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">{u.journeyProgress}/30</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="border-white/20 bg-card/5">Previous</Button>
            <span className="flex items-center text-sm text-muted-foreground px-4">Page {page} of {totalPages}</span>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="border-white/20 bg-card/5">Next</Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
