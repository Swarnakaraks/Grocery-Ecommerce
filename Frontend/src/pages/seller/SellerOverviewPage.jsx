import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingBag,
  DollarSign,
  Store,
  ArrowRight,
  TrendingUp,
  Clock3,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { storeApi } from "@/api/store.api";
import { orderManagementApi } from "@/api/orderManagement.api";
import { productApi } from "@/api/product.api";
import { useAuth } from "@/context/AuthContext";
import { OrderStatusBadge } from "@/components/common/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function SellerOverviewPage() {
  const { user } = useAuth();

  const [store, setStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // load dashboard data
  useEffect(() => {
    Promise.allSettled([
      storeApi.getMyStore(),
      orderManagementApi.getSellerOrders(),
      productApi.getAllProducts({ limit: 50 }),
    ])
      .then(([storeRes, ordersRes, productsRes]) => {
        if (storeRes.status === "fulfilled") {
          setStore(storeRes.value.data.store);
        }

        if (ordersRes.status === "fulfilled") {
          setOrders(ordersRes.value.data.orders || []);
        }

        if (productsRes.status === "fulfilled") {
          const mine = (productsRes.value.data.products || []).filter(
            (p) =>
              String(p.seller) === String(user._id) ||
              String(p.seller?._id) === String(user._id)
          );

          setProductCount(mine.length);
        }
      })
      .finally(() => setLoading(false));

    // eslint-disable-next-line
  }, []);

  if (loading) return <Spinner />;

  const revenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const fullName = user?.fullName|| "Seller";

  const stats = [
    {
      label: "Products Listed",
      value: productCount,
      icon: Package,
      description: "Active products",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      valueColor: "text-slate-900",
    },
    {
      label: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
      description: "Orders received",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      valueColor: "text-slate-900",
    },
    {
      label: "Revenue",
      value: formatCurrency(revenue),
      icon: DollarSign,
      description: "From delivered orders",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      valueColor: "text-slate-900",
    },
    {
      label: "Pending Orders",
      value: pendingCount,
      icon: Clock3,
      description: "Need your attention",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      valueColor: "text-slate-900",
    },
  ];

  return (
    <div className="min-h-screen space-y-6 bg-slate-50/50 pb-10">
      {/* welcome */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 px-6 py-7 text-white shadow-lg sm:px-8"
      >
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-sm" />
        <div className="absolute -bottom-24 right-20 h-44 w-44 rounded-full bg-white/10" />
        <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-emerald-400/10 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Seller Dashboard
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {fullName}! 👋
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50 sm:text-base">
              Here's what's happening with your store today. Keep growing,
              serving customers, and turning your products into success.
            </p>
          </div>
        </div>
      </motion.div>

      {/* store setup */}
      {!store && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm"
        >
          <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-emerald-50" />

          <div className="relative flex flex-col gap-5 p-6 sm:p-7 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <Store className="h-7 w-7" />
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Set up your store
                  </h2>

                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                    Action needed
                  </span>
                </div>

                <p className="max-w-xl text-sm leading-6 text-slate-500">
                  Create your store profile to start adding products and
                  receiving orders from customers.
                </p>
              </div>
            </div>

            <Button
              asChild
              className="group shrink-0 rounded-xl bg-emerald-600 px-5 shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
            >
              <Link to="/seller/store">
                Set Up Store
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </motion.div>
      )}

      {/* stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 * index }}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconBg} ${stat.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  Live
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <h3 className={`mt-1 truncate text-2xl font-bold tracking-tight ${stat.valueColor}`}>{stat.value}</h3>
                <p className="mt-1 text-xs text-slate-400">{stat.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* recent orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm"
      >
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
            <p className="mt-1 text-sm text-slate-400">
              Keep track of your latest customer orders.
            </p>
          </div>

          <Link
            to="/seller/orders"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {orders.slice(0, 5).map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="group flex flex-col gap-4 p-5 transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                  <ShoppingBag className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    #{order.orderNumber}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-400">
                    {formatDate(order.createdAt)}
                    {order.buyer?.fullName ? ` · ${order.buyer.fullName}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="text-sm font-bold text-slate-900">
                  {formatCurrency(order.total)}
                </span>

                <OrderStatusBadge status={order.status} />

                <ChevronRight className="hidden h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 sm:block" />
              </div>
            </motion.div>
          ))}

          {orders.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <ShoppingBag className="h-7 w-7 text-slate-400" />
              </div>

              <h4 className="mt-4 font-semibold text-slate-900">No orders yet</h4>

              <p className="mt-1 max-w-sm text-sm text-slate-400">
                Your customer orders will appear here once someone purchases
                your products.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}