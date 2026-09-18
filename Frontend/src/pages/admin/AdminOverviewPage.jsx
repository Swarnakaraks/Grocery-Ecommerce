import React, { useEffect, useState } from "react";
import { Users, Store, Package, ShoppingBag, DollarSign, UserCheck } from "lucide-react";
import { adminApi } from "@/api/admin.api";
import { StatCard } from "@/components/common/StatCard";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";

export default function AdminOverviewPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard().then(({ data }) => setDashboard(data.dashboard)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!dashboard) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Users</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard icon={Users} label="Total Users" value={dashboard.users.total} tone="primary" />
          <StatCard icon={UserCheck} label="Buyers" value={dashboard.users.buyers} tone="blue" delay={0.05} />
          <StatCard icon={Store} label="Sellers" value={dashboard.users.sellers} tone="violet" delay={0.1} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Stores & Products</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Store} label="Total Stores" value={dashboard.stores.total} tone="primary" />
          <StatCard icon={Store} label="Active Stores" value={dashboard.stores.active} tone="blue" delay={0.05} />
          <StatCard icon={Package} label="Total Products" value={dashboard.products.total} tone="violet" delay={0.1} />
          <StatCard icon={Package} label="Active Products" value={dashboard.products.active} tone="amber" delay={0.15} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Orders & Revenue</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={ShoppingBag} label="Total Orders" value={dashboard.orders.total} tone="primary" />
          <StatCard icon={ShoppingBag} label="Pending Orders" value={dashboard.orders.pending} tone="amber" delay={0.05} />
          <StatCard icon={ShoppingBag} label="Delivered" value={dashboard.orders.delivered} tone="blue" delay={0.1} />
          <StatCard icon={ShoppingBag} label="Cancelled" value={dashboard.orders.cancelled} tone="red" delay={0.15} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Payments</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(dashboard.payments.revenue)} tone="violet" />
          <StatCard icon={DollarSign} label="Paid" value={dashboard.payments.paid} tone="primary" delay={0.05} />
          <StatCard icon={DollarSign} label="Pending" value={dashboard.payments.pending} tone="amber" delay={0.1} />
          <StatCard icon={DollarSign} label="Failed" value={dashboard.payments.failed} tone="red" delay={0.15} />
        </div>
      </div>
    </div>
  );
}
