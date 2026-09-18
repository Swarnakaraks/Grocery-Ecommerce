import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ShoppingBag } from "lucide-react";
import { adminApi } from "@/api/admin.api";
import { OrderStatusBadge } from "@/components/common/OrderStatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";

const TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    adminApi.getAllOrders().then(({ data }) => setOrders(data.orders || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    setBusyId(id);
    try {
      const { data } = await adminApi.updateOrderStatus(id, status);
      toast.success(data.message);
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: data.order.status } : o)));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update status");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold"><ShoppingBag /> Orders ({orders.length})</h1>

      {loading && <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>}
      {!loading && orders.length === 0 && <EmptyState icon={ShoppingBag} title="No orders found" />}

      <div className="space-y-2">
        {orders.map((order) => {
          const options = TRANSITIONS[order.status] || [];
          return (
            <div key={order._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4">
              <div>
                <p className="font-semibold">#{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground">{order.buyer?.fullName} · {formatDate(order.createdAt)}</p>
              </div>
              <span className="font-semibold text-primary">{formatCurrency(order.total)}</span>
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.status} />
                {options.length > 0 && (
                  <Select value="" onValueChange={(v) => handleStatusChange(order._id, v)} disabled={busyId === order._id}>
                    <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Change status" /></SelectTrigger>
                    <SelectContent>{options.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
