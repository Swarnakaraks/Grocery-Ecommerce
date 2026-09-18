import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { cartApi } from "@/api/cart.api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, discount: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  const itemCount = (cart.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0);

  // fetch cart
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], subtotal: 0, discount: 0, total: 0 });
      return;
    }

    setLoading(true);

    try {
      const { data } = await cartApi.getCart();
      setCart(data.cart);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // load cart
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // add to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast("Please login to add items to cart", { icon: "🔒" });
      openAuthModal("login");
      return false;
    }

    try {
      const { data } = await cartApi.addToCart(productId, quantity);
      await fetchCart();
      toast.success("Added to cart");
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not add to cart");
      return false;
    }
  };

  // update quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await cartApi.updateItem(productId, quantity);
      setCart(data.cart);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update cart");
    }
  };

  // remove from cart
  const removeFromCart = async (productId) => {
    try {
      const { data } = await cartApi.removeItem(productId);
      setCart(data.cart);
      toast.success("Removed from cart");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not remove item");
    }
  };

  // clear cart
  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      setCart({ items: [], subtotal: 0, discount: 0, total: 0 });
    } catch (err) {
      toast.error("Could not clear cart");
    }
  };

  return (
    <CartContext.Provider value={{ cart, itemCount, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) throw new Error("useCart must be used within CartProvider");

  return ctx;
}