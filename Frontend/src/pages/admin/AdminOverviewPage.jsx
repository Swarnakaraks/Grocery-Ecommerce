import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  DollarSign,
  Package,
  ShoppingBag,
  Store,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { adminApi } from "@/api/admin.api";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

function DashboardCard({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      transition={{ delay }}
      className={`rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] ${className}`}
    >
      {children}
    </motion.div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
  delay = 0,
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/95 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl"
      whileHover={{
        y: -5,
        scale: 1.015,
        transition: { duration: 0.2 },
      }}
      initial="hidden"
      animate="show"
      transition={{ delay }}
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/50 blur-2xl transition-all duration-500 group-hover:scale-150" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <motion.p
            className="mt-2 text-2xl font-bold tracking-tight text-slate-900"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.15 }}
          >
            {value}
          </motion.p>

          {description && (
            <p className="mt-1 text-xs text-slate-400">{description}</p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

function ChartHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-xl">
      <p className="mb-1 text-xs font-medium text-slate-400">{label}</p>

      {payload.map((item, index) => (
        <p key={index} className="text-sm font-semibold text-slate-800">
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

export default function AdminOverviewPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getDashboard()
      .then(({ data }) => setDashboard(data.dashboard))
      .finally(() => setLoading(false));
  }, []);

  const orderData = useMemo(() => {
    if (!dashboard) return [];

    return [
      {
        name: "Pending",
        value: dashboard.orders.pending,
      },
      {
        name: "Delivered",
        value: dashboard.orders.delivered,
      },
      {
        name: "Cancelled",
        value: dashboard.orders.cancelled,
      },
    ];
  }, [dashboard]);

  const userData = useMemo(() => {
    if (!dashboard) return [];

    return [
      {
        name: "Buyers",
        value: dashboard.users.buyers,
      },
      {
        name: "Sellers",
        value: dashboard.users.sellers,
      },
    ];
  }, [dashboard]);

  const storeProductData = useMemo(() => {
    if (!dashboard) return [];

    return [
      {
        name: "Stores",
        active: dashboard.stores.active,
        total: dashboard.stores.total,
      },
      {
        name: "Products",
        active: dashboard.products.active,
        total: dashboard.products.total,
      },
    ];
  }, [dashboard]);

  const revenueData = useMemo(() => {
    if (!dashboard) return [];

    return [
      {
        name: "Revenue",
        value: Number(dashboard.payments.revenue || 0),
      },
      {
        name: "Paid",
        value: Number(dashboard.payments.paid || 0),
      },
      {
        name: "Pending",
        value: Number(dashboard.payments.pending || 0),
      },
      {
        name: "Failed",
        value: Number(dashboard.payments.failed || 0),
      },
    ];
  }, [dashboard]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className="min-h-screen space-y-7 bg-slate-50/60 pb-10"
    >
      {/* hero */}
      <motion.section
        variants={fadeUp}
        className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-7 text-white shadow-[0_20px_50px_rgba(16,185,129,0.22)] md:p-9"
      >
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
              <Activity className="h-3.5 w-3.5" />
              Live Overview
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50 md:text-base">
              Monitor your marketplace, users, products, orders and payment
              activity from one clean overview.
            </p>
          </div>

          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="hidden h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-md md:flex"
          >
            <TrendingUp className="h-11 w-11 text-white" />
          </motion.div>
        </div>
      </motion.section>

      {/* main metrics */}
      <motion.section
        variants={stagger}
        className="grid grid-cols-2 gap-4 xl:grid-cols-4"
      >
        <MetricCard
          icon={Users}
          label="Total Users"
          value={dashboard.users.total}
          description={`${dashboard.users.buyers} buyers · ${dashboard.users.sellers} sellers`}
          iconClass="bg-emerald-50 text-emerald-600"
          delay={0.05}
        />

        <MetricCard
          icon={Package}
          label="Products"
          value={dashboard.products.total}
          description={`${dashboard.products.active} currently active`}
          iconClass="bg-violet-50 text-violet-600"
          delay={0.1}
        />

        <MetricCard
          icon={ShoppingBag}
          label="Total Orders"
          value={dashboard.orders.total}
          description={`${dashboard.orders.delivered} delivered`}
          iconClass="bg-blue-50 text-blue-600"
          delay={0.15}
        />

        <MetricCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(dashboard.payments.revenue)}
          description={`${dashboard.payments.paid} paid payments`}
          iconClass="bg-amber-50 text-amber-600"
          delay={0.2}
        />
      </motion.section>

      {/* charts */}
      <div className="grid gap-6 xl:grid-cols-3">
        <DashboardCard className="p-6 xl:col-span-2">
          <ChartHeader
            icon={DollarSign}
            title="Payment Overview"
            subtitle="Current payment activity"
          />

          <div className="h-[310px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="value"
                  name="Amount"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                  dot={{
                    r: 4,
                    fill: "#10b981",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{
                    r: 7,
                    strokeWidth: 3,
                    stroke: "#fff",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        <DashboardCard className="p-6">
          <ChartHeader
            icon={ShoppingBag}
            title="Order Status"
            subtitle="Order distribution"
          />

          <div className="relative h-[310px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="46%"
                  innerRadius={72}
                  outerRadius={105}
                  paddingAngle={5}
                  stroke="none"
                >
                  {orderData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={["#f59e0b", "#10b981", "#ef4444"][index]}
                    />
                  ))}
                </Pie>

                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {dashboard.orders.total}
                </p>
                <p className="text-xs text-slate-400">Total Orders</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: "Pending",
                value: dashboard.orders.pending,
                icon: Clock3,
                className: "text-amber-600 bg-amber-50",
              },
              {
                label: "Delivered",
                value: dashboard.orders.delivered,
                icon: CheckCircle2,
                className: "text-emerald-600 bg-emerald-50",
              },
              {
                label: "Cancelled",
                value: dashboard.orders.cancelled,
                icon: XCircle,
                className: "text-red-600 bg-red-50",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-xl bg-slate-50 p-2.5 text-center"
                >
                  <div
                    className={`mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg ${item.className}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  <p className="text-sm font-bold text-slate-800">
                    {item.value}
                  </p>

                  <p className="text-[10px] text-slate-400">{item.label}</p>
                </div>
              );
            })}
          </div>
        </DashboardCard>
      </div>

      {/* second analytics row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard className="p-6">
          <ChartHeader
            icon={Users}
            title="User Distribution"
            subtitle="Buyers and sellers"
          />

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={userData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Bar
                  dataKey="value"
                  name="Users"
                  radius={[10, 10, 0, 0]}
                  barSize={55}
                >
                  {userData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={["#10b981", "#8b5cf6"][index]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        <DashboardCard className="p-6">
          <ChartHeader
            icon={Store}
            title="Stores & Products"
            subtitle="Total versus active"
          />

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={storeProductData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barGap={8}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Bar
                  dataKey="total"
                  name="Total"
                  fill="#cbd5e1"
                  radius={[8, 8, 0, 0]}
                  barSize={35}
                />

                <Bar
                  dataKey="active"
                  name="Active"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                  barSize={35}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              Total
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Active
            </div>
          </div>
        </DashboardCard>
      </div>
      
{/* summary */}
<DashboardCard className="overflow-hidden border-0 bg-transparent shadow-none">
  <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
    <div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
          Overview
        </span>
      </div>

      <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
        Marketplace Summary
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        A quick look at your platform activity
      </p>
    </div>

    <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-600 shadow-sm">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      System Active
    </div>
  </div>

  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {/* stores */}
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/60 to-emerald-100/80 p-5 shadow-[0_12px_35px_rgba(16,185,129,0.10)]"
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-200/40 blur-2xl transition-transform duration-500 group-hover:scale-150" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200">
            <Store className="h-5 w-5" />
          </div>

          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
            ACTIVE
          </span>
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium text-slate-500">Stores</p>

          <div className="mt-1 flex items-baseline gap-1">
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              {dashboard.stores.active}
            </p>

            <span className="text-sm font-medium text-slate-400">
              / {dashboard.stores.total}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-400">Active stores</p>
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-emerald-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${
                dashboard.stores.total
                  ? (dashboard.stores.active / dashboard.stores.total) * 100
                  : 0
              }%`,
            }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
          />
        </div>
      </div>
    </motion.div>

    {/* products */}
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/60 to-emerald-100/80 p-5 shadow-[0_12px_35px_rgba(16,185,129,0.10)]"
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-200/40 blur-2xl transition-transform duration-500 group-hover:scale-150" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200">
            <Package className="h-5 w-5" />
          </div>

          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
            PRODUCTS
          </span>
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium text-slate-500">Products</p>

          <div className="mt-1 flex items-baseline gap-1">
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              {dashboard.products.active}
            </p>

            <span className="text-sm font-medium text-slate-400">
              / {dashboard.products.total}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-400">Active products</p>
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-emerald-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${
                dashboard.products.total
                  ? (dashboard.products.active / dashboard.products.total) * 100
                  : 0
              }%`,
            }}
            transition={{ duration: 1, delay: 0.4 }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
          />
        </div>
      </div>
    </motion.div>

    {/* users */}
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/60 to-emerald-100/80 p-5 shadow-[0_12px_35px_rgba(16,185,129,0.10)]"
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-200/40 blur-2xl transition-transform duration-500 group-hover:scale-150" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200">
            <UserCheck className="h-5 w-5" />
          </div>

          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
            USERS
          </span>
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium text-slate-500">Buyers</p>

          <div className="mt-1 flex items-baseline gap-1">
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              {dashboard.users.buyers}
            </p>
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Buyers · {dashboard.users.sellers} sellers
          </p>
        </div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-emerald-100">
  <motion.div
    initial={{ width: 0 }}
    animate={{
      width: `${
        dashboard.users.buyers + dashboard.users.sellers
          ? (dashboard.users.buyers /
              (dashboard.users.buyers + dashboard.users.sellers)) *
            100
          : 0
      }%`,
    }}
    transition={{ duration: 1, delay: 0.4 }}
    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
  />
</div>
      </div>
    </motion.div>

    {/* payments */}
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/60 to-emerald-100/80 p-5 shadow-[0_12px_35px_rgba(16,185,129,0.10)]"
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-200/40 blur-2xl transition-transform duration-500 group-hover:scale-150" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200">
            <DollarSign className="h-5 w-5" />
          </div>

          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
            PAYMENTS
          </span>
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium text-slate-500">
            Paid Payments
          </p>

          <div className="mt-1 flex items-baseline gap-1">
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              {dashboard.payments.paid}
            </p>
          </div>

          <p className="mt-1 text-xs text-slate-400">
            {dashboard.payments.pending} payments pending
          </p>
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-emerald-100">
  <motion.div
    initial={{ width: 0 }}
    animate={{
      width: `${
        dashboard.payments.paid +
          dashboard.payments.pending +
          dashboard.payments.failed
          ? (dashboard.payments.paid /
              (dashboard.payments.paid +
                dashboard.payments.pending +
                dashboard.payments.failed)) *
            100
          : 0
      }%`,
    }}
    transition={{ duration: 1, delay: 0.5 }}
    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
  />
</div>
      </div>
    </motion.div>
  </div>
</DashboardCard>
    </motion.div>
  );
}