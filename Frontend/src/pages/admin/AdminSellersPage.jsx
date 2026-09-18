import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Store, Power, PowerOff } from "lucide-react";
import { adminApi } from "@/api/admin.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDate } from "@/lib/utils";

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    adminApi.getAllSellers().then(({ data }) => setSellers(data.sellers || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleStore = async (storeId, isActive) => {
    setBusyId(storeId);
    try {
      const fn = isActive ? adminApi.deactivateStore : adminApi.activateStore;
      const { data } = await fn(storeId);
      toast.success(data.message);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold"><Store /> Sellers ({sellers.length})</h1>

      {loading && <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}
      {!loading && sellers.length === 0 && <EmptyState icon={Store} title="No sellers yet" />}

      <div className="space-y-3">
        {sellers.map(({ seller, store }) => (
          <div key={seller._id} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:flex-row sm:items-center">
            <Avatar className="h-11 w-11"><AvatarImage src={seller.profilePicture?.url} /><AvatarFallback>{seller.fullName?.[0]}</AvatarFallback></Avatar>
            <div className="flex-1">
              <p className="font-semibold">{seller.fullName}</p>
              <p className="text-xs text-muted-foreground">{seller.email} · Joined {formatDate(seller.createdAt)}</p>
              {store ? (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{store.storeName}</span>
                  <Badge variant={store.isActive ? "success" : "destructive"}>{store.isActive ? "Active" : "Inactive"}</Badge>
                </div>
              ) : (
                <Badge variant="secondary" className="mt-1">No store created</Badge>
              )}
            </div>
            {store && (
              <Button size="sm" variant="outline" disabled={busyId === store._id} onClick={() => toggleStore(store._id, store.isActive)}>
                {store.isActive ? <PowerOff size={13} /> : <Power size={13} />} {store.isActive ? "Deactivate" : "Activate"}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
