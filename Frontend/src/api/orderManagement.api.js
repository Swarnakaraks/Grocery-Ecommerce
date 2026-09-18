import axiosClient from "./axiosClient";

export const orderManagementApi = {
  getSellerOrders: () => axiosClient.get("/order-management/seller"),
  getSellerOrderById: (id) => axiosClient.get(`/order-management/seller/${id}`),
  updateStatus: (id, status) =>
    axiosClient.patch(`/order-management/seller/${id}/status`, { status }),
};
