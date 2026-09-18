import axiosClient from "./axiosClient";

export const orderApi = {
  createOrder: (payload) => axiosClient.post("/orders", payload),
  getMyOrders: () => axiosClient.get("/orders"),
  getOrderById: (id) => axiosClient.get(`/orders/${id}`),
  cancelOrder: (id, reason) => axiosClient.patch(`/orders/${id}/cancel`, { reason }),
};
