import axiosClient from "./axiosClient";

export const wishlistApi = {
  getWishlist: () => axiosClient.get("/wishlist"),
  addToWishlist: (productId) => axiosClient.post("/wishlist", { productId }),
  removeFromWishlist: (productId) => axiosClient.delete(`/wishlist/${productId}`),
  clearWishlist: () => axiosClient.delete("/wishlist"),
};
