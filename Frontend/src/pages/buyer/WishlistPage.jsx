
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Sparkles } from "lucide-react";

import { useWishlist } from "@/context/WishlistContext";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { wishlist, loading } = useWishlist();
  const navigate = useNavigate();
  const products = wishlist.products || [];

  // empty wishlist
  if (!loading && products.length === 0) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-b from-green-50/60 via-white to-white px-4 py-16 sm:py-24">
        <div className="mx-auto flex max-w-xl flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative mb-7"
          >
            <div className="absolute inset-0 rounded-full bg-red-100 blur-2xl" />

            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-red-100 bg-white shadow-xl shadow-red-100/40">
              <Heart className="h-14 w-14 fill-red-50 text-red-500" strokeWidth={1.5} />

              <motion.div
                animate={{ y: [-3, 3, -3], rotate: [0, 8, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-2 -top-1 rounded-full bg-green-500 p-2 text-white shadow-lg"
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
              Save your favorite grocery items here and easily find them again
              whenever you're ready to shop.
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
              className="h-11 rounded-xl bg-green-600 px-6 font-semibold shadow-lg shadow-green-600/20 transition-all hover:bg-green-700 hover:shadow-green-600/30"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Discover Products
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/40 via-white to-white px-4 py-8 sm:py-10 md:px-8 lg:px-12 xl:px-20">
      <div className="mx-auto max-w-[1600px]">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-red-500 shadow-sm">
                <Heart className="h-3.5 w-3.5 fill-red-500" />
                Saved Items
              </div>

              <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
                My Wishlist
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700 sm:text-base">
                  {products.length} {products.length === 1 ? "item" : "items"}
                </span>
              </h1>

              <p className="mt-2 max-w-xl text-sm text-gray-500 sm:text-base">
                Keep the products you love close and ready for your next order.
              </p>
            </div>

    
          </div>

          <div className="mt-6 h-px bg-gradient-to-r from-green-200 via-gray-100 to-transparent" />
        </motion.div>

        {/* products */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
        >
          <ProductGrid products={products} loading={loading} />
        </motion.div>
      </div>
    </div>
  );
}