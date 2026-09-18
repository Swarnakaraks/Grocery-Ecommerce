import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Users, Search, Ban, CheckCircle2, Power, PowerOff } from "lucide-react";
import { adminApi } from "@/api/admin.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    adminApi.getAllUsers().then(({ data }) => setUsers(data.users || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const runAction = async (id, action) => {
    setBusyId(id);
    try {
      const fn = { block: adminApi.blockUser, unblock: adminApi.unblockUser, activate: adminApi.activateUser, deactivate: adminApi.deactivateUser }[action];
      const { data } = await fn(id);
      toast.success(data.message);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = users.filter((u) => u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Users /> Users ({users.length})</h1>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading && <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>}

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Joined</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u._id} className="border-t border-border">
                <td className="flex items-center gap-3 p-3">
                  <Avatar className="h-9 w-9"><AvatarImage src={u.profilePicture?.url} /><AvatarFallback>{u.fullName?.[0]}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-medium">{u.fullName}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </td>
                <td className="p-3"><Badge variant="secondary" className="capitalize">{u.role}</Badge></td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={u.isBlocked ? "destructive" : "success"}>{u.isBlocked ? "Blocked" : "OK"}</Badge>
                    <Badge variant={u.isActive ? "secondary" : "warning"}>{u.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-1.5">
                    {u.role !== "admin" && (
                      <>
                        <Button size="sm" variant="outline" disabled={busyId === u._id} onClick={() => runAction(u._id, u.isBlocked ? "unblock" : "block")}>
                          {u.isBlocked ? <CheckCircle2 size={13} /> : <Ban size={13} />}
                        </Button>
                        <Button size="sm" variant="outline" disabled={busyId === u._id} onClick={() => runAction(u._id, u.isActive ? "deactivate" : "activate")}>
                          {u.isActive ? <PowerOff size={13} /> : <Power size={13} />}
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
