import React, { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { adminApi } from "@/api/admin.api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_VARIANT = { paid: "success", pending: "warning", failed: "destructive" };

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAllPayments().then(({ data }) => setPayments(data.payments || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold"><CreditCard /> Payments ({payments.length})</h1>

      {loading && <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>}
      {!loading && payments.length === 0 && <EmptyState icon={CreditCard} title="No payments found" />}

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Buyer</th>
              <th className="p-3">Order</th>
              <th className="p-3">Method</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-t border-border">
                <td className="p-3">
                  <p className="font-medium">{p.buyer?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{p.buyer?.email}</p>
                </td>
                <td className="p-3 text-xs">#{p.order?.orderNumber}</td>
                <td className="p-3 uppercase text-xs font-medium">{p.method || p.order?.paymentMethod}</td>
                <td className="p-3 font-semibold">{formatCurrency(p.amount)}</td>
                <td className="p-3"><Badge variant={STATUS_VARIANT[p.status] || "secondary"} className="capitalize">{p.status}</Badge></td>
                <td className="p-3 text-xs text-muted-foreground">{formatDate(p.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
