import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, CheckCircle2, XCircle } from "lucide-react";
import { adminApi } from "@/api/admin.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

export default function AdminSellerRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [busyId, setBusyId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState("");

  const load = (status) => {
    setLoading(true);
    adminApi.getSellerRequests(status && status !== "all" ? { status } : {})
      .then(({ data }) => setRequests(data.sellerRequests || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(statusFilter); }, [statusFilter]);

  const handleApprove = async (id) => {
    setBusyId(id);
    try {
      const { data } = await adminApi.approveSellerRequest(id);
      toast.success(data.message);
      load(statusFilter);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not approve");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setBusyId(rejectTarget);
    try {
      const { data } = await adminApi.rejectSellerRequest(rejectTarget, reason.trim());
      toast.success(data.message);
      setRejectTarget(null);
      setReason("");
      load(statusFilter);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not reject");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold"><UserPlus /> Seller Requests</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}

      {!loading && requests.length === 0 && <EmptyState icon={UserPlus} title="No seller requests found" />}

      <div className="space-y-3">
        <AnimatePresence>
          {requests.map((req) => (
            <motion.div key={req._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:flex-row sm:items-center">
              <Avatar className="h-11 w-11"><AvatarImage src={req.user?.profilePicture?.url} /><AvatarFallback>{req.user?.fullName?.[0]}</AvatarFallback></Avatar>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{req.storeName}</p>
                  <Badge variant={req.status === "pending" ? "warning" : req.status === "approved" ? "success" : "destructive"} className="capitalize">{req.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{req.user?.fullName} · {req.user?.email}</p>
                <p className="mt-1 text-sm text-foreground/80">{req.storeDescription}</p>
                <p className="mt-1 text-xs text-muted-foreground">Requested {formatDate(req.createdAt)}</p>
                {req.status === "rejected" && req.rejectionReason && <p className="mt-1 text-xs text-red-500">Reason: {req.rejectionReason}</p>}
              </div>
              {req.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(req._id)} disabled={busyId === req._id}><CheckCircle2 size={13} /> Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => setRejectTarget(req._id)} disabled={busyId === req._id}><XCircle size={13} /> Reject</Button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Seller Request</DialogTitle></DialogHeader>
          <Textarea placeholder="Reason for rejection..." rows={4} value={reason} onChange={(e) => setReason(e.target.value)} />
          <DialogFooter>
            <Button variant="destructive" className="w-full" onClick={handleReject} disabled={busyId === rejectTarget}>Confirm Rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
