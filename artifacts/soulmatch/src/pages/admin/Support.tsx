import { useState } from "react";
import { useGetAdminSupportMessages, useUpdateSupportMessage } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Inbox, MailOpen, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function AdminSupport() {
  const { data: messages, isLoading, refetch } = useGetAdminSupportMessages({
    request: { headers: { Authorization: `Bearer ${getAccessToken()}` } }
  });
  const { mutateAsync: updateMessage } = useUpdateSupportMessage({
    request: { headers: { Authorization: `Bearer ${getAccessToken()}` } }
  });
  const { toast } = useToast();
  
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  
  const handleResolve = async (id: number) => {
    try {
      await updateMessage({ id, data: { status: "resolved" } });
      toast({ title: "Success", description: "Message marked as resolved" });
      refetch();
      setSelectedMessage(null);
    } catch (err) {
      toast({ title: "Error", description: "Failed to update message", variant: "destructive" });
    }
  };

  const openMessages = messages?.filter((m: any) => m.status === "open") || [];
  const resolvedMessages = messages?.filter((m: any) => m.status === "resolved") || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Support Tickets</h2>
          <p className="text-[#6B7280]">
            Manage user inquiries and support messages.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <Inbox className="h-4 w-4 text-[#6B7280]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <MailOpen className="h-4 w-4 text-[#F6A8B7]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openMessages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Tickets</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedMessages.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Support Messages</CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages?.map((msg: any) => (
                  <TableRow key={msg.id}>
                    <TableCell>{format(new Date(msg.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <div className="font-medium">{msg.name}</div>
                      <div className="text-sm text-[#6B7280]">{msg.email}</div>
                    </TableCell>
                    <TableCell className="font-medium">{msg.subject}</TableCell>
                    <TableCell>
                      <Badge variant={msg.status === "open" ? "default" : "secondary"}>
                        {msg.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" onClick={() => setSelectedMessage(msg)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!messages || messages.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-[#6B7280]">
                      No support messages found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={selectedMessage !== null} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              From: {selectedMessage?.name} ({selectedMessage?.email})
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-6 space-y-4">
            <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
              {selectedMessage?.message}
            </div>
            {selectedMessage?.status === "resolved" && (
              <div className="text-sm text-[#6B7280] flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                Resolved on {selectedMessage?.resolvedAt ? format(new Date(selectedMessage.resolvedAt), "PPP p") : "Unknown"}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMessage(null)}>Close</Button>
            {selectedMessage?.status === "open" && (
              <>
                <Button variant="default" onClick={() => {
                  window.open(`mailto:${selectedMessage.email}?subject=RE: ${selectedMessage.subject}`);
                }}>
                  Reply via Email
                </Button>
                <Button variant="default" onClick={() => handleResolve(selectedMessage.id)}>
                  Mark as Resolved
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
