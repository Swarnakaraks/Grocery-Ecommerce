import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Package,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

import { orderApi } from "@/api/order.api";
import { OrderStatusBadge } from "@/components/common/OrderStatusBadge";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  formatCurrency,
  formatDate,
  getImageUrl,
} from "@/lib/utils";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // load orders
  useEffect(() => {
    orderApi
      .getMyOrders()
      .then(({ data }) => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-background px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-5xl">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                My Orders
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                View and track your recent purchases
              </p>
            </div>
          </div>
        </motion.div>

        {/* loading */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />

                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>

                  <Skeleton className="hidden h-5 w-20 sm:block" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* empty orders */}
        {!loading && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 px-6 text-center"
          >
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <ShoppingBag className="h-9 w-9 text-primary" />
            </div>

            <h2 className="text-xl font-bold">No orders yet</h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              You haven't placed any orders yet. Start shopping and your
              purchases will appear here.
            </p>

            <Button
              onClick={() => navigate("/")}
              className="mt-6 rounded-xl px-6 shadow-sm"
            >
              Start Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* orders */}
        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.05,
                  duration: 0.3,
                }}
              >
                <Link
                  to={`/orders/${order._id}`}
                  className="group block rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-5"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    {/* product images */}
                    <div className="flex shrink-0 -space-x-3">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="relative h-16 w-16 overflow-hidden rounded-xl border-2 border-background bg-muted shadow-sm"
                        >
                          <img
                            src={getImageUrl(
                              item.product?.images || item.image
                            )}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src =
                                "/placeholder-product.svg";
                            }}
                          />
                        </div>
                      ))}

                      {order.items.length > 3 && (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-background bg-muted text-xs font-bold text-muted-foreground shadow-sm">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>

                    {/* order info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-bold tracking-tight">
                          #{order.orderNumber}
                        </p>

                        <OrderStatusBadge status={order.status} />
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                        <span>{formatDate(order.createdAt)}</span>

                        <span className="text-border">•</span>

                        <span>
                          {order.items.length} item
                          {order.items.length !== 1 && "s"}
                        </span>
                      </div>
                    </div>

                    {/* total */}
                    <div className="flex items-center justify-between border-t border-border/60 pt-4 sm:min-w-32 sm:justify-end sm:border-t-0 sm:pt-0">
                      <div className="sm:text-right">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          Total
                        </p>

                        <p className="mt-0.5 text-base font-bold text-primary">
                          {formatCurrency(order.total)}
                        </p>
                      </div>

                      <div className="ml-4 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-200 group-hover:bg-primary/10 group-hover:text-primary">
                        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
