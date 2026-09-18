import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

import {
  formatCurrency,
  getImageUrl,
  getSellingPrice,
} from "@/lib/utils";

export default function CartPage() {
  const {
    cart,
    loading,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const navigate = useNavigate();
  const items = cart.items || [];

  // empty cart
  if (!loading && items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] w-full bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative mb-7"
          >
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />

            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-primary/10 bg-card shadow-xl">
              <ShoppingCart className="h-14 w-14 text-primary/70" />

              <motion.div
                animate={{
                  y: [-3, 3, -3],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -right-2 -top-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
              >
                <ShoppingBag className="h-4 w-4" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
              Looks like you haven't added anything yet. Start exploring our
              products and find something you'll love.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="mt-7"
          >
            <Button
              onClick={() => navigate("/")}
              className="h-11 rounded-xl px-6 font-semibold shadow-lg shadow-primary/20"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Start Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-background px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-6xl">
        {/* back */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </button>

        {/* gradient header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative mb-2 overflow-hidden text-gray-900 "
        >
     

          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
                <ShoppingCart className="h-4 w-4" />
                Shopping Cart
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                My Cart
              </h1>

              <p className="mt-1.5 text-sm text-white/75">
                Review your items before proceeding to checkout.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>

              <div>
                <p className="text-xs font-medium text-white/70">
                  Cart Items
                </p>
                <p className="text-sm font-bold text-white">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* left */}
          <div className="space-y-6 lg:col-span-2">
            {/* items */}
            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border/70 px-5 py-4 sm:px-6">
                <div>
                  <h3 className="flex items-center gap-2 font-bold">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ShoppingBag className="h-4 w-4" />
                    </span>
                    Cart Items
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {items.length} item
                    {items.length !== 1 && "s"} ready for checkout
                  </p>
                </div>

                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear Cart
                  </button>
                )}
              </div>

              <div className="divide-y divide-border/60">
                <AnimatePresence initial={false}>
                  {items.map((item) => {
                    const product = item.product;

                    if (!product) return null;

                    const price = getSellingPrice(product);

                    return (
                      <motion.div
                        key={product._id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          x: -50,
                          transition: { duration: 0.2 },
                        }}
                        className="p-5 transition-colors hover:bg-muted/20 sm:px-6"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          {/* image */}
                          <Link
                            to={`/products/${product.slug || product._id}`}
                            className="group shrink-0"
                          >
                            <div className="h-24 w-24 overflow-hidden rounded-2xl border border-border/70 bg-muted shadow-sm">
                              <img
                                src={getImageUrl(product.images)}
                                alt={product.name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/placeholder-product.svg";
                                }}
                              />
                            </div>
                          </Link>

                          {/* information */}
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/products/${
                                product.slug || product._id
                              }`}
                              className="line-clamp-1 text-sm font-bold transition-colors hover:text-primary"
                            >
                              {product.name}
                            </Link>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {product.brand || "Grocery Product"}
                            </p>

                            <div className="mt-2 inline-flex items-center rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                              {formatCurrency(price)}
                              <span className="ml-1 font-normal text-primary/70">
                                /{product.unit}
                              </span>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                              {/* quantity */}
                              <div className="flex h-9 items-center overflow-hidden rounded-xl border border-border/70 bg-background shadow-sm">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      product._id,
                                      Math.max(1, item.quantity - 1),
                                    )
                                  }
                                  className="flex h-full w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>

                                <span className="flex w-9 justify-center text-sm font-bold">
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      product._id,
                                      Math.min(
                                        product.stock,
                                        item.quantity + 1,
                                      ),
                                    )
                                  }
                                  className="flex h-full w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removeFromCart(product._id)
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                              </button>
                            </div>
                          </div>

                          {/* price */}
                          <div className="flex items-center justify-between gap-4 border-t border-border/50 pt-3 sm:block sm:border-0 sm:pt-0 sm:text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Item Total
                            </p>

                            <p className="mt-1 text-lg font-bold text-foreground">
                              {formatCurrency(price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </section>

          
          </div>

          {/* right */}
          <div className="h-fit space-y-6">
            {/* order summary */}
            <section className="overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary via-primary/90 to-emerald-700 text-primary-foreground shadow-lg lg:sticky lg:top-24">
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
                      <h3 className="font-bold text-white">
                        Order Summary
                      </h3>

                      <p className="mt-0.5 text-xs text-white/70">
                        Your cart payment details
                      </p>
                    </div>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                    <ShoppingCart className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>

              {/* summary details */}
              <div className="bg-background px-5 py-5 text-foreground sm:px-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Subtotal
                    </span>

                    <span className="font-medium">
                      {formatCurrency(cart.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Discount
                    </span>

                    <span className="font-semibold text-emerald-600">
                      -{formatCurrency(cart.discount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Delivery
                    </span>

                    <span className="font-semibold text-emerald-600">
                      Free
                    </span>
                  </div>
                </div>

                <div className="my-5 border-t border-dashed border-border" />

                {/* total */}
                <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Total Amount
                      </p>

                      <p className="mt-1 text-2xl font-bold text-primary">
                        {formatCurrency(cart.total)}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* checkout */}
                <Button
                  size="lg"
                  className="mt-5 h-12 w-full rounded-xl font-semibold shadow-md shadow-primary/20"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Secure checkout • Multiple payment options
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}