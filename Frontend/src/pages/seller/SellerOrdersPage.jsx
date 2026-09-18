import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  PackageSearch,
  ShoppingBag,
  Clock3,
  CheckCircle2,
  Truck,
  ChevronRight,
  RefreshCw,
  Package,
} from "lucide-react";
import { orderManagementApi } from "@/api/orderManagement.api";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate, getImageUrl } from "@/lib/utils";

const NEXT_STATUS = {
  pending: ["confirmed"],
  confirmed: ["processing"],
  processing: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const statusConfig = {
  pending: { label: "Pending", icon: Clock3, bg: "bg-amber-50", text: "text-amber-600" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, bg: "bg-blue-50", text: "text-blue-600" },
  processing: { label: "Processing", icon: RefreshCw, bg: "bg-violet-50", text: "text-violet-600" },
  shipped: { label: "Shipped", icon: Truck, bg: "bg-indigo-50", text: "text-indigo-600" },
  delivered: { label: "Delivered", icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
  cancelled: { label: "Cancelled", icon: Package, bg: "bg-red-50", text: "text-red-600" },
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // load orders
  const load = () => {
    setLoading(true);

    orderManagementApi
      .getSellerOrders()
      .then(({ data }) => setOrders(data.orders || []))
      .catch((err) => toast.error(err?.response?.data?.message || "Could not load orders"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  // update status
  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);

    try {
      const { data } = await orderManagementApi.updateStatus(orderId, status);
      toast.success(data.message);

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? {
                ...o,
                status: data.order.status,
              }
            : o
        )
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  // order stats
  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      processing: orders.filter((o) => o.status === "confirmed" || o.status === "processing").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    };
  }, [orders]);

  return (
    <div className="min-h-screen space-y-6 bg-slate-50/40 pb-10">
      {/* summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard icon={ShoppingBag} label="Total Orders" value={stats.total} iconClass="bg-emerald-100 text-emerald-600" delay={0} />
        <SummaryCard icon={Clock3} label="Pending" value={stats.pending} iconClass="bg-amber-100 text-amber-600" delay={0.05} />
        <SummaryCard icon={RefreshCw} label="In Progress" value={stats.processing} iconClass="bg-violet-100 text-violet-600" delay={0.1} />
        <SummaryCard icon={CheckCircle2} label="Delivered" value={stats.delivered} iconClass="bg-blue-100 text-blue-600" delay={0.15} />
      </div>

      {/* orders */}
      <div className="space-y-4">
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <EmptyState icon={PackageSearch} title="No orders yet" description="Orders containing your products will show up here" />
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {!loading &&
            orders.map((order, i) => {
              const options = NEXT_STATUS[order.status] || [];
              const currentStatus = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = currentStatus.icon;

              return (
                <motion.div
                  key={order._id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                  className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-md"
                >
                  {/* order header */}
                  <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                          <PackageSearch className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-bold text-slate-900">#{order.orderNumber}</h2>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Order</span>
                          </div>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(order.createdAt)}
                            {order.buyer?.fullName ? ` · ${order.buyer.fullName}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${currentStatus.bg} ${currentStatus.text}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          <span className="capitalize">{currentStatus.label}</span>
                        </div>

                        {options.length > 0 && (
                          <Select value="" onValueChange={(value) => handleStatusChange(order._id, value)} disabled={updatingId === order._id}>
                            <SelectTrigger className="h-9 w-[160px] rounded-xl border-slate-200 bg-white text-xs font-medium shadow-none focus:ring-emerald-500">
                              <SelectValue placeholder={updatingId === order._id ? "Updating..." : "Update status"} />
                            </SelectTrigger>

                            <SelectContent>
                              {options.map((status) => (
                                <SelectItem key={status} value={status} className="capitalize">
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* products */}
                  <div className="px-5 py-4 sm:px-6">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Order Items</p>
                      <span className="text-xs font-medium text-slate-400">
                        {order.items.length} {order.items.length === 1 ? "item" : "items"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-slate-50">
                          {/* product image */}
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                            <img
                              src={getImageUrl(item.product?.images)}
                              alt={item.name || "Product"}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder-product.svg";
                              }}
                            />
                          </div>

                          {/* product details */}
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 text-sm font-semibold text-slate-800">{item.name}</p>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                              <span>
                                Qty: <span className="font-semibold text-slate-600">{item.quantity}</span>
                              </span>

                              {item.price && (
                                <>
                                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                                  <span>{formatCurrency(item.price)} each</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* price */}
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">{formatCurrency(item.subtotal)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* order footer */}
                  <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <ShoppingBag className="h-4 w-4" />
                      <span>
                        Customer: <span className="font-semibold text-slate-600">{order.buyer?.fullName || "Customer"}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="text-xs font-medium text-slate-400">Order Total</span>
                      <span className="text-lg font-bold text-emerald-600">{formatCurrency(order.total)}</span>
                      <ChevronRight className="hidden h-4 w-4 text-slate-300 sm:block" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// summary card
function SummaryCard({ icon: Icon, label, value, iconClass, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3 }}
      className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-md sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="hidden h-7 w-7 items-center justify-center rounded-full bg-slate-50 sm:flex">
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-slate-400 sm:text-sm">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      </div>
    </motion.div>
  );
}

// order skeleton
function OrderSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-2xl" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>

        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      <div className="mt-5 space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-14 w-14 rounded-xl" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>

            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}