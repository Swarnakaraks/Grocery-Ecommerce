import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Package,
  Receipt,
  ShieldCheck,
  Star,
  XCircle,
} from "lucide-react";

import { orderApi } from "@/api/order.api";
import { reviewApi } from "@/api/review.api";
import { OrderStatusBadge } from "@/components/common/OrderStatusBadge";
import { RatingInput } from "@/components/product/RatingStars";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

import { cn, formatCurrency, formatDate, getImageUrl } from "@/lib/utils";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // load order
  const load = () => {
    setLoading(true);

    orderApi
      .getOrderById(id)
      .then(({ data }) => setOrder(data.order))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  // cancel order
  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setCancelling(true);

    try {
      const { data } = await orderApi.cancelOrder(id, "Cancelled by customer");

      toast.success(data.message);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not cancel order");
    } finally {
      setCancelling(false);
    }
  };

  // open review
  const openReview = (item) => {
    setReviewProduct(item);
    setReviewForm({
      rating: 0,
      comment: "",
    });
  };

  // submit review
  const submitReview = async () => {
    if (!reviewForm.rating) {
      toast.error("Please select a rating");
      return;
    }

    setSubmittingReview(true);

    try {
      await reviewApi.createReview({
        productId: reviewProduct.product?._id || reviewProduct.product,
        orderId: order._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });

      toast.success("Review submitted. Thank you!");
      setReviewProduct(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Spinner />;

  if (!order) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Package className="h-7 w-7" />
          </div>

          <h2 className="mt-5 text-2xl font-bold">Order not found</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            The order you're looking for could not be found.
          </p>

          <Button
            className="mt-5 rounded-xl"
            onClick={() => navigate("/orders")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const canCancel = ["pending", "confirmed"].includes(order.status);

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-background px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-6xl">
        {/* back */}
        <button
          type="button"
          onClick={() => navigate("/orders")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>

        {/* gradient header */}
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary via-primary/90 to-emerald-700 p-6 text-primary-foreground shadow-lg sm:p-8">
          {/* decorative circles */}
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 right-24 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
                <Package className="h-4 w-4" />
                Order Details
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                #{order.orderNumber}
              </h1>

              <p className="mt-1.5 text-sm text-white/75">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-2 backdrop-blur-sm">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* left */}
          <div className="space-y-6 lg:col-span-2">
            {/* items */}
            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border/70 px-5 py-4 sm:px-6">
                <div>
                  <h3 className="flex items-center gap-2 font-bold">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Package className="h-4 w-4" />
                    </span>
                    Ordered Items
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.items.length} item
                    {order.items.length !== 1 && "s"} in this order
                  </p>
                </div>
              </div>

              <div className="divide-y divide-border/60">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-4 p-5 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:px-6"
                  >
                    {/* image */}
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-muted shadow-sm">
                      <img
                        src={getImageUrl(item.product?.images || item.image)}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-product.svg";
                        }}
                      />
                    </div>

                    {/* information */}
                    <div className="min-w-0 flex-1">
                      <Link
                        to={
                          item.product?.slug
                            ? `/products/${item.product.slug}`
                            : "#"
                        }
                        className="line-clamp-1 text-sm font-bold transition-colors hover:text-primary"
                      >
                        {item.name}
                      </Link>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.store?.storeName || item.store?.name}
                      </p>

                      <div className="mt-2 inline-flex rounded-lg bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        Qty {item.quantity} × {formatCurrency(item.price)}
                      </div>
                    </div>

                    {/* price / review */}
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <p className="font-bold">
                        {formatCurrency(item.subtotal)}
                      </p>

                      {order.status === "delivered" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openReview(item)}
                          className="rounded-xl border-primary/20 text-primary hover:bg-primary/5"
                        >
                          <Star className="mr-1.5 h-3.5 w-3.5" />
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* shipping address */}
            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
              <div className="border-b border-border/70 px-5 py-4 sm:px-6">
                <h3 className="flex items-center gap-2 font-bold">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MapPin className="h-4 w-4" />
                  </span>
                  Shipping Address
                </h3>
              </div>

              <div className="p-5 sm:p-6">
                <div className="rounded-2xl bg-gradient-to-br from-muted/60 to-muted/20 p-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
                      <MapPin className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold">
                        {order.shippingAddress.fullName}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {order.shippingAddress.phone}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {order.shippingAddress.addressLine},{" "}
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.district},{" "}
                        {order.shippingAddress.province}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* right */}
          <div className="h-fit space-y-6">
            {/* payment summary */}
            <section className="overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary via-primary/90 to-emerald-700 text-primary-foreground shadow-lg">
              {/* banner header */}
              <div className="relative overflow-hidden px-5 py-6 sm:px-6">
                <div className="absolute -right-10 -top-14 h-36 w-36 rounded-full bg-white/10" />
                <div className="absolute -bottom-16 right-20 h-28 w-28 rounded-full bg-white/5" />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 shadow-sm backdrop-blur-sm">
                      <Receipt className="h-5 w-5 text-white" />
                    </div>

                    <div>
                      <h3 className="font-bold text-white">Payment Summary</h3>

                      <p className="mt-0.5 text-xs text-white/70">
                        Your order payment details
                      </p>
                    </div>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>

              {/* payment details */}
              <div className="bg-background px-5 py-5 text-foreground sm:px-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>

                    <span className="font-medium">
                      {formatCurrency(order.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Discount</span>

                    <span className="font-semibold text-emerald-600">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shipping</span>

                    <span className="font-medium">
                      {order.shippingFee === 0
                        ? "Free"
                        : formatCurrency(order.shippingFee)}
                    </span>
                  </div>
                </div>

                <div className="my-5 border-t border-dashed border-border" />

                {/* total banner */}
                <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Total Amount
                      </p>

                      <p className="mt-1 text-2xl font-bold text-primary">
                        {formatCurrency(order.total)}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* payment method */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Payment
                    </p>

                    <p className="mt-1 truncate text-xs font-bold uppercase">
                      {order.paymentMethod}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </p>

                    <p
                      className={cn(
                        "mt-1 text-xs font-bold capitalize",
                        order.paymentStatus === "paid"
                          ? "text-emerald-600"
                          : "text-amber-600",
                      )}
                    >
                      {order.paymentStatus}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* cancel order */}
            {canCancel && (
              <Button
                variant="destructive"
                className="h-11 w-full rounded-xl shadow-sm"
                onClick={handleCancel}
                disabled={cancelling}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* review dialog */}
      <Dialog
        open={!!reviewProduct}
        onOpenChange={(open) => !open && setReviewProduct(null)}
      >
        <DialogContent className="overflow-hidden rounded-2xl p-0 sm:max-w-md">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background px-6 py-5">
            <DialogHeader>
              <DialogTitle className="text-xl">Review Product</DialogTitle>

              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                {reviewProduct?.name}
              </p>
            </DialogHeader>
          </div>

          <div className="space-y-5 px-6 py-5">
            <div className="rounded-2xl border border-border/70 bg-muted/20 py-5">
              <p className="mb-3 text-center text-sm font-medium">
                How was your experience?
              </p>

              <div className="flex justify-center">
                <RatingInput
                  value={reviewForm.rating}
                  onChange={(value) =>
                    setReviewForm({
                      ...reviewForm,
                      rating: value,
                    })
                  }
                  size={30}
                />
              </div>
            </div>

            <Textarea
              placeholder="Share details about your experience..."
              rows={4}
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({
                  ...reviewForm,
                  comment: e.target.value,
                })
              }
              className="resize-none rounded-xl"
            />
          </div>

          <DialogFooter className="border-t border-border/60 bg-muted/10 px-6 py-4">
            <Button
              className="w-full rounded-xl"
              onClick={submitReview}
              disabled={submittingReview}
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
