import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { wishlistApi } from "@/api/wishlist.api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(false);

  const count = (wishlist.products || []).length;

  // fetch wishlist
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist({ products: [] });
      return;
    }

    setLoading(true);

    try {
      const { data } = await wishlistApi.getWishlist();
      setWishlist(data.wishlist);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // load wishlist
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId) => (wishlist.products || []).some((p) => (p._id || p) === productId);

  // toggle wishlist
  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast("Please login to use wishlist", { icon: "🔒" });
      openAuthModal("login");
      return;
    }

    try {
      if (isInWishlist(productId)) {
        await wishlistApi.removeFromWishlist(productId);

        setWishlist((prev) => ({
          products: prev.products.filter((p) => (p._id || p) !== productId),
        }));

        toast.success("Removed from wishlist");
      } else {
        const { data } = await wishlistApi.addToWishlist(productId);
        setWishlist(data.wishlist);
        toast.success("Added to wishlist");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update wishlist");
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, count, loading, isInWishlist, toggleWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);

  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");

  return ctx;
}