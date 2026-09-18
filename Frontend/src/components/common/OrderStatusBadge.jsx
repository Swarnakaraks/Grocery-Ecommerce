import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, PackageCheck, Truck, XCircle, Package } from "lucide-react";

const CONFIG = {
  pending: { variant: "warning", icon: Clock, label: "Pending" },
  confirmed: { variant: "secondary", icon: CheckCircle2, label: "Confirmed" },
  processing: { variant: "secondary", icon: Package, label: "Processing" },
  shipped: { variant: "default", icon: Truck, label: "Shipped" },
  delivered: { variant: "success", icon: PackageCheck, label: "Delivered" },
  cancelled: { variant: "destructive", icon: XCircle, label: "Cancelled" },
};

export function OrderStatusBadge({ status }) {
  // status config
  const conf = CONFIG[status] || CONFIG.pending;
  const Icon = conf.icon;

  return (
    <Badge variant={conf.variant} className="gap-1">
      <Icon size={12} /> {conf.label}
    </Badge>
  );
}