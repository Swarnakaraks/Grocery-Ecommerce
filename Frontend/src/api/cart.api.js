import axiosClient from "./axiosClient";

export const cartApi = {
  getCart: () => axiosClient.get("/cart"),
  addToCart: (productId, quantity = 1) => axiosClient.post("/cart", { productId, quantity }),
  updateItem: (productId, quantity) => axiosClient.patch(`/cart/${productId}`, { quantity }),
  removeItem: (productId) => axiosClient.delete(`/cart/${productId}`),
  clearCart: () => axiosClient.delete("/cart"),
};
