import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, ArrowRight, Loader2, Wallet } from "lucide-react";
import { paymentApi } from "@/api/payment.api";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("orderId");
  const method = searchParams.get("method") || "esewa";

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");

  // verify payment
  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }

      // COD
      if (method === "cod") {
        setLoading(false);
        setPayment({ method: "cod", status: "pending" });
        return;
      }

      // eSewa
      try {
        const { data } = await paymentApi.getEsewaStatus(orderId);

        if (data?.success) {
          setPayment(data);
        } else {
          setError(data?.message || "Could not verify payment.");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setError(err?.response?.data?.message || "Could not verify your payment status.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderId, method]);

  // loading
  if (loading) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-600" />
          <p className="mt-4 text-sm font-medium text-gray-600">
            {method === "cod" ? "Confirming your order..." : "Verifying your payment..."}
          </p>
        </div>
      </div>
    );
  }

  // error
  if (error) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <CheckCircle2 className="h-8 w-8 text-red-500" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">Payment Verification Failed</h1>
          <p className="mt-3 text-gray-600">{error}</p>

          <div className="mt-6 flex justify-center gap-3">
            <Link to="/my-orders" className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
              My Orders
            </Link>

            <Link to="/" className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
              Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // COD success
  if (method === "cod") {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50 px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
          >
            <CheckCircle2 className="h-11 w-11 text-emerald-600" />
          </motion.div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">Order Placed Successfully!</h1>

          <p className="mt-3 text-gray-600">
            Your Cash on Delivery order has been confirmed. Please pay when you receive your order.
          </p>

          <div className="mt-6 rounded-2xl bg-emerald-50 p-4">
            <div className="flex items-center justify-center gap-2 text-emerald-600">
              <Wallet className="h-4 w-4" />
              <p className="text-xs font-medium uppercase tracking-wide">Cash on Delivery</p>
            </div>

            <p className="mt-2 text-sm font-semibold text-gray-800">
              Payment will be collected when your order is delivered.
            </p>
          </div>

          <div className="mt-4 rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Order ID</p>
            <p className="mt-1 break-all text-sm font-semibold text-gray-800">{orderId}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/orders/${orderId}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              <ShoppingBag className="h-5 w-5" /> View Order
            </Link>

            <Link
              to="/"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Continue Shopping
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // eSewa success
  return (
    <div className="flex min-h-[75vh] items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
        >
          <CheckCircle2 className="h-11 w-11 text-emerald-600" />
        </motion.div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">Payment Successful!</h1>

        <p className="mt-3 text-gray-600">Your eSewa payment has been successfully completed.</p>

        <div className="mt-6 rounded-2xl bg-emerald-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Order ID</p>
          <p className="mt-1 break-all text-sm font-semibold text-gray-800">{orderId}</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to={`/orders/${orderId}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            <ShoppingBag className="h-5 w-5" /> View Order
          </Link>

          <Link
            to="/"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Continue Shopping
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}