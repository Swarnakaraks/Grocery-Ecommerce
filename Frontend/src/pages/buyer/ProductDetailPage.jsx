import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  Store as StoreIcon,
} from "lucide-react";
import { productApi } from "@/api/product.api";
import { chatApi } from "@/api/chat.api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RatingStars } from "@/components/product/RatingStars";
import { RatingSection } from "@/components/product/RatingSection";
import { ProductGrid } from "@/components/product/ProductGrid";
import { cn, formatCurrency, getDiscountPercent, getSellingPrice } from "@/lib/utils";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [startingChat, setStartingChat] = useState(false);

  // load product
  useEffect(() => {
    let active = true;

    setLoading(true);
    setActiveImage(0);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const isObjectId = /^[a-f\d]{24}$/i.test(slug);
    const fetcher = isObjectId ? productApi.getProductById(slug) : productApi.getProductBySlug(slug);

    fetcher
      .then(({ data }) => {
        if (!active) return;

        setProduct(data.product);
        return productApi.getRelatedProducts(data.product._id);
      })
      .then((res) => {
        if (res && active) setRelated(res.data.products || []);
      })
      .catch(() => {
        if (active) toast.error("Product not found");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [slug]);

  // loading
  if (loading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // product not found
  if (!product) {
    return (
      <div className="container flex flex-col items-center justify-center gap-4 py-24 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [{ url: "/placeholder-product.svg" }];
  const discount = getDiscountPercent(product.price, product.discountPrice);
  const sellingPrice = getSellingPrice(product);
  const inWishlist = isInWishlist(product._id);
  const outOfStock = product.stock <= 0;

  // add to cart
  const handleAddToCart = () => addToCart(product._id, quantity);

  // buy now
  const handleBuyNow = async () => {
    const ok = await addToCart(product._id, quantity);

    if (ok) navigate("/checkout");
  };

  // chat seller
  const handleChatSeller = async () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    setStartingChat(true);

    try {
      const { data } = await chatApi.createConversation({
        sellerId: product.seller?._id,
        productId: product._id,
      });

      navigate(`/chat?conversation=${data.conversation._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not start chat");
    } finally {
      setStartingChat(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* breadcrumb */}
      <div className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />

        {product.category && (
          <>
            <Link to={`/category/${product.category.slug}`} className="hover:text-primary">
              {product.category.name}
            </Link>
            <ChevronRight size={12} />
          </>
        )}

        <span className="truncate text-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* gallery */}
        <div>
          <motion.div
            key={activeImage}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className="relative mx-auto h-[350px] w-full max-w-[350px] overflow-hidden rounded-2xl border border-border bg-secondary/40 md:h-[420px] md:max-w-[420px]"
          >
            <img
              src={images[activeImage]?.url}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.src = "/placeholder-product.svg")}
            />

            {discount > 0 && (
              <Badge variant="accent" className="absolute left-3 top-3 text-sm">
                -{discount}% OFF
              </Badge>
            )}
          </motion.div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn("h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2", i === activeImage ? "border-primary" : "border-border")}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* buy box */}
        <div>
          {product.brand && (
            <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-primary">
              {product.brand}
            </p>
          )}

          <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>

          <div className="mt-2 flex items-center gap-3">
            <RatingStars rating={product.rating?.average || 0} count={product.rating?.count || 0} showValue size={17} />

            {product.store && (
              <a href={`/store/${product.store._id}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                <StoreIcon size={13} /> {product.store.storeName || product.store.name || "Visit Store"}
              </a>
            )}
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-foreground">{formatCurrency(sellingPrice)}</span>

            {discount > 0 && (
              <span className="text-lg text-muted-foreground line-through">
                {formatCurrency(product.price)}
              </span>
            )}

            <span className="text-sm text-muted-foreground">/ {product.unit}</span>
          </div>

          <div className="mt-3">
            {outOfStock ? (
              <Badge variant="destructive">Out of Stock</Badge>
            ) : product.stock <= 10 ? (
              <Badge variant="warning">Only {product.stock} left in stock</Badge>
            ) : (
              <Badge variant="success">In Stock</Badge>
            )}
          </div>

          {!outOfStock && (
            <div className="mt-5 flex items-center gap-3">
              <span className="text-sm font-medium">Quantity</span>

              <div className="flex items-center rounded-xl border border-border">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-secondary">
                  <Minus size={14} />
                </button>

                <span className="w-10 text-center text-sm font-semibold">{quantity}</span>

                <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-secondary">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" className="flex-1" disabled={outOfStock} onClick={handleAddToCart}>
              <ShoppingCart size={17} /> Add to Cart
            </Button>

            <Button size="lg" variant="accent" className="flex-1" disabled={outOfStock} onClick={handleBuyNow}>
              Buy Now
            </Button>

            <Button size="lg" variant="outline" onClick={() => toggleWishlist(product._id)} className={cn(inWishlist && "border-red-300 text-red-500")}>
              <Heart size={17} className={cn(inWishlist && "fill-red-500")} />
            </Button>
          </div>

          {product.seller && (
            <Button variant="ghost" className="mt-3 w-full justify-start gap-2 text-muted-foreground" onClick={handleChatSeller} disabled={startingChat}>
              <MessageCircle size={16} /> {startingChat ? "Starting chat..." : "Chat with Seller"}
            </Button>
          )}

          {/* service features */}
          <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-secondary/50 p-4 text-center text-xs">
            <div className="flex flex-col items-center gap-1"><Truck size={18} className="text-primary" /> Fast Delivery</div>
            <div className="flex flex-col items-center gap-1"><ShieldCheck size={18} className="text-primary" /> Secure Payment</div>
            <div className="flex flex-col items-center gap-1"><RotateCcw size={18} className="text-primary" /> Easy Returns</div>
          </div>
        </div>
      </div>

      {/* product details */}
      <div className="mt-12 space-y-10">
        {/* description */}
        <section className="border-t border-border pt-8">
          <h2 className="mb-4 text-xl font-bold sm:text-2xl">Description</h2>
          <div className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-foreground/80">
            {product.description || "No description available for this product."}
          </div>
        </section>

        {/* ratings */}
        <section className="border-t border-border pt-8">
          <h2 className="mb-5 text-xl font-bold sm:text-2xl">Ratings & Reviews</h2>
          <RatingSection productId={product._id} />
        </section>
      </div>

      {/* related products */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-5 text-xl font-bold sm:text-2xl">You might also like</h2>
          <ProductGrid products={related} columns="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" />
        </div>
      )}
    </div>
  );
}