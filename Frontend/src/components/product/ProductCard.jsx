import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import {
  cn,
  formatCurrency,
  getImageUrl,
  getDiscountPercent,
  getSellingPrice,
} from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { RatingStars } from "./RatingStars";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product, className }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const discount = getDiscountPercent(product.price, product.discountPrice);
  const sellingPrice = getSellingPrice(product);
  const inWishlist = isInWishlist(product._id);
  const outOfStock = product.stock <= 0;

  // add to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!outOfStock) addToCart(product._id, 1);
  };

  // wishlist
  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn("group relative", className)}
    >
      <Link
        to={`/products/${product.slug || product._id}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-lg hover:shadow-brand-500/10"
      >
        {/* product image */}
        <div className="relative aspect-square overflow-hidden bg-secondary/50">
          <motion.img
            src={getImageUrl(product.images)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => (e.currentTarget.src = "/placeholder-product.svg")}
          />

          {/* product badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {discount > 0 && <Badge variant="accent">-{discount}%</Badge>}
            {outOfStock && <Badge variant="destructive">Out of stock</Badge>}
          </div>

          {/* wishlist */}
          <button
            onClick={handleWishlist}
            className={cn(
              "absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition-all hover:scale-110",
              inWishlist ? "text-red-500" : "text-gray-500",
            )}
          >
            <Heart size={17} className={cn(inWishlist && "fill-red-500")} />
          </button>

          {/* add to cart */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-black/0 p-2 transition-all duration-300 group-hover:translate-y-0">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <ShoppingCart size={15} />
              {outOfStock ? "Unavailable" : "Add to Cart"}
            </button>
          </div>
        </div>

        {/* product details */}
        <div className="flex flex-1 flex-col gap-1 p-3">
          {product.brand && (
            <span className="text-[11px] font-medium uppercase tracking-wide text-primary/70">
              {product.brand}
            </span>
          )}

          <h3 className="line-clamp-2 h-10 text-sm font-semibold text-foreground">
            {product.name}
          </h3>

          <RatingStars
            rating={product.rating?.average || 0}
            count={product.rating?.count || 0}
            size={13}
          />

          <div className="mt-auto flex items-baseline gap-2 pt-1">
            <span className="text-[14px] font-bold text-foreground md:text-[18px]">
              {formatCurrency(sellingPrice)}
            </span>

            {discount > 0 && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(product.price)}
              </span>
            )}

            <span className="text-[11px] text-muted-foreground">
              /{product.unit}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      <div className="shimmer aspect-square w-full" />
      <div className="space-y-2 p-3">
        <div className="shimmer h-3 w-1/2 rounded" />
        <div className="shimmer h-4 w-3/4 rounded" />
        <div className="shimmer h-4 w-1/3 rounded" />
      </div>
    </div>
  );
}
