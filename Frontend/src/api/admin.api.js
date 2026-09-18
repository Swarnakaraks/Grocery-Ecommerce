import axiosClient from "./axiosClient";

export const adminApi = {
  getDashboard: () => axiosClient.get("/admin/dashboard"),

  getSellerRequests: (params) => axiosClient.get("/admin/seller-requests", { params }),
  approveSellerRequest: (id) => axiosClient.patch(`/admin/seller-requests/${id}/approve`),
  rejectSellerRequest: (id, rejectionReason) =>
    axiosClient.patch(`/admin/seller-requests/${id}/reject`, { rejectionReason }),

  getAllUsers: (params) => axiosClient.get("/admin/users", { params }),
  getUserById: (id) => axiosClient.get(`/admin/users/${id}`),
  blockUser: (id) => axiosClient.patch(`/admin/users/${id}/block`),
  unblockUser: (id) => axiosClient.patch(`/admin/users/${id}/unblock`),
  activateUser: (id) => axiosClient.patch(`/admin/users/${id}/activate`),
  deactivateUser: (id) => axiosClient.patch(`/admin/users/${id}/deactivate`),

  getAllSellers: (params) => axiosClient.get("/admin/sellers", { params }),
  getSellerById: (id) => axiosClient.get(`/admin/sellers/${id}`),

  activateStore: (storeId) => axiosClient.patch(`/admin/stores/${storeId}/activate`),
  deactivateStore: (storeId) => axiosClient.patch(`/admin/stores/${storeId}/deactivate`),

  getAllProducts: (params) => axiosClient.get("/admin/products", { params }),
  getProductById: (id) => axiosClient.get(`/admin/products/${id}`),
  activateProduct: (id) => axiosClient.patch(`/admin/products/${id}/activate`),
  deactivateProduct: (id) => axiosClient.patch(`/admin/products/${id}/deactivate`),

  getAllOrders: (params) => axiosClient.get("/admin/orders", { params }),
  getOrderById: (id) => axiosClient.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => axiosClient.patch(`/admin/orders/${id}/status`, { status }),

  getAllPayments: (params) => axiosClient.get("/admin/payments", { params }),
  getPaymentById: (id) => axiosClient.get(`/admin/payments/${id}`),
};
