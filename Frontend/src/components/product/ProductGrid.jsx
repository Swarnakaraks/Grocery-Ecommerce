import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { PackageSearch, Loader2 } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import { Button } from "@/components/ui/button";

export function ProductGrid({
  products = [],
  loading,
  columns = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
}) {
  // Randomize product order on each page load
  const shuffledProducts = useMemo(() => {
    return [...products].sort(() => Math.random() - 0.5);
  }, [products]);

  if (!loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <PackageSearch className="h-12 w-12 text-muted-foreground/50" />
        <p className="font-medium text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-3 sm:gap-4 ${columns}`}>
      {shuffledProducts.map((p, i) => (
        <motion.div
          key={p._id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: Math.min(i, 10) * 0.03,
          }}
        >
          <ProductCard product={p} />
        </motion.div>
      ))}

      {/* loading skeletons */}
      {loading &&
        Array.from({ length: 10 }).map((_, i) => (
          <ProductCardSkeleton key={`s-${i}`} />
        ))}
    </div>
  );
}

export function LoadMoreButton({ onClick, loading, hasMore }) {
  if (!hasMore) return null;

  return (
    <div className="mt-8 flex justify-center">
      <Button
        variant="outline"
        size="lg"
        onClick={onClick}
        disabled={loading}
        className="min-w-[180px] border-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Load More"
        )}
      </Button>
    </div>
  );
}