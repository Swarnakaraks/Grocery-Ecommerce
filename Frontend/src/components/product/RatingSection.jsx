import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Star,
  MessageSquareQuote,
  Send,
  Pencil,
  Trash2,
  X,
  Loader2,
  UserRound,
  ShoppingBag,
  BarChart3,
} from "lucide-react";
import { RatingStars, RatingInput } from "./RatingStars";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { reviewApi } from "@/api/review.api";
import { orderApi } from "@/api/order.api";
import { useAuth } from "@/context/AuthContext";
import { timeAgo } from "@/lib/utils";

export function RatingSection({ productId }) {
  const { user, isAuthenticated, role, openAuthModal } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [eligibleOrder, setEligibleOrder] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // load reviews
  const loadReviews = async () => {
    setLoading(true);

    try {
      const { data } = await reviewApi.getProductReviews(productId);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Review load error:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // find eligible order
  const findEligibleOrder = async () => {
    if (!isAuthenticated || role !== "buyer") {
      setEligibleOrder(null);
      return;
    }

    setOrdersLoading(true);

    try {
      const { data } = await orderApi.getMyOrders();
      const orders = data.orders || [];

      const deliveredOrder = orders.find((order) => {
        if (order.status !== "delivered") return false;

        return order.items?.some((item) => {
          const itemProductId = item.product?._id || item.product;
          return itemProductId?.toString() === productId?.toString();
        });
      });

      setEligibleOrder(deliveredOrder || null);
    } catch (err) {
      console.error("Could not load orders:", err);
      setEligibleOrder(null);
    } finally {
      setOrdersLoading(false);
    }
  };

  // load my review
  const loadMyReview = async () => {
    if (!isAuthenticated || role !== "buyer") {
      setMyReview(null);
      setReviewRating(0);
      setComment("");
      return;
    }

    try {
      const { data } = await reviewApi.getMyReview(productId);
      const review = data.review || null;

      setMyReview(review);
      setReviewRating(review?.rating || 0);
      setComment(review?.comment || "");
    } catch (err) {
      if (err?.response?.status !== 404) {
        console.error("Could not load my review:", err);
      }

      setMyReview(null);
      setReviewRating(0);
      setComment("");
    }
  };

  // initial load
  useEffect(() => {
    loadReviews();

    if (isAuthenticated && role === "buyer") {
      loadMyReview();
      findEligibleOrder();
    } else {
      setMyReview(null);
      setEligibleOrder(null);
      setReviewRating(0);
      setComment("");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, isAuthenticated, role]);

  // review summary
  const ratingSummary = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach((review) => {
      const rating = Number(review.rating);

      if (rating >= 1 && rating <= 5) {
        distribution[rating] += 1;
      }
    });

    const total = reviews.length;
    const ratingTotal = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    const average = total > 0 ? ratingTotal / total : 0;

    return { average, total, distribution };
  }, [reviews]);

  // submit review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    if (role !== "buyer") {
      toast.error("Only buyers can write reviews");
      return;
    }

    if (!eligibleOrder && !myReview) {
      toast.error("You can review this product only after a delivered order");
      return;
    }

    if (!reviewRating) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write your review");
      return;
    }

    setSubmitting(true);

    try {
      if (myReview) {
        const { data } = await reviewApi.updateReview(myReview._id, {
          rating: reviewRating,
          comment: comment.trim(),
        });

        toast.success(data.message || "Review updated successfully");
        setIsEditing(false);
      } else {
        const { data } = await reviewApi.createReview({
          productId,
          orderId: eligibleOrder._id,
          rating: reviewRating,
          comment: comment.trim(),
        });

        toast.success(data.message || "Review submitted successfully");
      }

      await Promise.all([loadReviews(), loadMyReview()]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not save review");
    } finally {
      setSubmitting(false);
    }
  };

  // delete review
  const handleDelete = async () => {
    if (!myReview?._id) return;

    const confirmed = window.confirm("Are you sure you want to delete your review?");
    if (!confirmed) return;

    setSubmitting(true);

    try {
      const { data } = await reviewApi.deleteReview(myReview._id);

      setReviews((prev) => prev.filter((review) => review._id !== myReview._id));
      setMyReview(null);
      setReviewRating(0);
      setComment("");
      setIsEditing(false);

      toast.success(data.message || "Review deleted successfully");

      await loadReviews();
      await findEligibleOrder();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not delete review");
    } finally {
      setSubmitting(false);
    }
  };

  // reset review
  const handleReset = () => {
    if (myReview) {
      setReviewRating(myReview.rating || 0);
      setComment(myReview.comment || "");
      toast.success("Changes reset successfully");
    } else {
      setReviewRating(0);
      setComment("");
      toast.success("Review form reset");
    }

    setIsEditing(false);
  };

  // check own review
  const isOwnReview = (review) => {
    const buyerId = review?.buyer?._id || review?.buyer?.id || review?.buyer;
    const userId = user?._id || user?.id;

    return buyerId && userId && buyerId.toString() === userId.toString();
  };

  const hasReviewed = !!myReview;
  const canReview = isAuthenticated && role === "buyer" && !!eligibleOrder;

  // rating label
  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4) return "Very Good";
    if (rating >= 3) return "Good";
    if (rating >= 2) return "Average";
    if (rating >= 1) return "Poor";
    return "No ratings yet";
  };

  return (
    <section className="w-full space-y-8">
      {/* review summary */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <MessageSquareQuote size={23} />
            </div>

            <div>
              <h2 className="text-xl font-bold">Ratings & Reviews</h2>
              <p className="text-sm text-muted-foreground">See what customers think about this product</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[220px_1fr]">
          {/* average rating */}
          <div className="flex flex-col items-center justify-center rounded-2xl p-5 text-center">
            <div className="flex items-center gap-1">
              <Star size={25} className="fill-amber-500 text-amber-500" />
              <span className="text-4xl font-extrabold tracking-tight">{ratingSummary.average.toFixed(1)}</span>
            </div>

            <div className="mt-2">
              <RatingStars rating={ratingSummary.average} size={17} />
            </div>

            <p className="mt-2 text-sm font-semibold text-emerald-700">{getRatingLabel(ratingSummary.average)}</p>

            <p className="mt-1 text-xs text-muted-foreground">
              Based on {ratingSummary.total} review
              {ratingSummary.total !== 1 && "s"}
            </p>
          </div>

          {/* rating distribution */}
          <div className="flex flex-col justify-center">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-emerald-600" />
              <h3 className="font-semibold">Rating Distribution</h3>
            </div>

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingSummary.distribution[rating] || 0;
                const percentage = ratingSummary.total > 0 ? (count / ratingSummary.total) * 100 : 0;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex w-10 shrink-0 items-center justify-end gap-1 text-sm font-medium">
                      <span>{rating}</span>
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                    </div>

                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.7, ease: "easeOut" }} className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400" />
                    </div>

                    <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* write / edit review */}
      <div id="review-editor" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">{hasReviewed ? "Your Review" : "Write a Review"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">Share your experience with this product</p>
          </div>

          <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 sm:flex">
            <Pencil size={18} />
          </div>
        </div>

        {/* not logged in */}
        {!isAuthenticated ? (
          <div className="rounded-xl bg-secondary/40 p-6 text-center">
            <UserRound size={30} className="mx-auto mb-3 text-muted-foreground" />
            <p className="mb-4 text-sm text-muted-foreground">Login to share your experience and write a review.</p>
            <Button onClick={() => openAuthModal("login")} className="bg-emerald-600 hover:bg-emerald-700">Login to Review</Button>
          </div>
        ) : role !== "buyer" ? (
          <div className="rounded-xl bg-secondary/40 p-5">
            <p className="text-sm text-muted-foreground">Only buyers can write product reviews.</p>
          </div>
        ) : ordersLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-emerald-600" />
          </div>
        ) : !eligibleOrder && !myReview ? (
          <div className="rounded-xl bg-secondary/40 p-6 text-center">
            <ShoppingBag size={30} className="mx-auto mb-3 text-muted-foreground" />
            <h4 className="font-semibold">Purchase required</h4>
            <p className="mt-1 text-sm text-muted-foreground">You can review this product after purchasing it and receiving your order.</p>
          </div>
        ) : myReview && !isEditing ? (
          <div className="rounded-xl bg-secondary/30 p-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <MessageSquareQuote size={22} />
            </div>

            <p className="text-sm font-medium">You have already reviewed this product.</p>
            <p className="mt-1 text-xs text-muted-foreground">Click the pencil icon on your review to edit it.</p>
          </div>
        ) : (
          <form onSubmit={handleReviewSubmit} className="space-y-5">
            {/* rating */}
            <div>
              <label className="mb-2 block text-sm font-semibold">Your Rating</label>
              <RatingInput value={reviewRating} onChange={setReviewRating} size={30} />

              {reviewRating > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {reviewRating === 5 ? "Excellent!" : reviewRating === 4 ? "Very Good!" : reviewRating === 3 ? "Good" : reviewRating === 2 ? "Could be better" : "Poor"}
                </p>
              )}
            </div>

            {/* comment */}
            <div>
              <label className="mb-2 block text-sm font-semibold">Your Review</label>

              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us about your experience with this product..." rows={4} maxLength={1000} className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />

              <p className="mt-1 text-right text-xs text-muted-foreground">{comment.length}/1000</p>
            </div>

            {/* buttons */}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={submitting || !reviewRating || !comment.trim()} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                {submitting ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                {myReview ? "Update Review" : "Submit Review"}
              </Button>

              {myReview && (
                <Button type="button" variant="outline" disabled={submitting} onClick={handleReset} className="gap-2">
                  <X size={16} />
                  Reset
                </Button>
              )}

              {myReview && (
                <Button type="button" variant="outline" disabled={submitting} onClick={handleDelete} className="gap-2 border-red-200 text-red-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Delete Review
                </Button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* customer reviews */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <MessageSquareQuote size={20} />
            Customer Reviews
          </h3>

          <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-muted-foreground">
            {reviews.length} review
            {reviews.length !== 1 && "s"}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-emerald-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <MessageSquareQuote size={36} className="mx-auto mb-3 text-muted-foreground" />
            <h4 className="font-semibold">No written reviews yet</h4>
            <p className="mt-1 text-sm text-muted-foreground">Be the first to review this product after your purchase!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => {
              const ownReview = isOwnReview(review);

              return (
                <motion.div key={review._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="group rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:p-5">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 shrink-0 ring-2 ring-emerald-100">
                      <AvatarImage src={review.buyer?.profileImage?.url} />
                      <AvatarFallback className="bg-emerald-100 font-semibold text-emerald-700">
                        {review.buyer?.fullName?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-semibold">{review.buyer?.fullName || "Buyer"}</h4>

                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <RatingStars rating={review.rating} size={13} />
                            <span className="text-xs text-muted-foreground">{timeAgo(review.createdAt)}</span>
                          </div>
                        </div>

                        {ownReview && (
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="hidden rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 sm:inline-flex">Your review</span>

                            <button
                              type="button"
                              onClick={() => {
                                setIsEditing(true);
                                setReviewRating(review.rating || 0);
                                setComment(review.comment || "");

                                setTimeout(() => {
                                  document.getElementById("review-editor")?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                  });
                                }, 50);
                              }}
                              disabled={submitting}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
                              title="Edit review"
                            >
                              <Pencil size={15} />
                            </button>
                          </div>
                        )}
                      </div>

                      {review.comment && <p className="mt-3 text-sm leading-6 text-foreground/80">{review.comment}</p>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}