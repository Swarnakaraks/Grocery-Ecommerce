import axiosClient from "./axiosClient";

export const storeApi = {
  createStore: (payload) => axiosClient.post("/stores", payload),
  getMyStore: () => axiosClient.get("/stores/my-store"),
  updateMyStore: (payload) => axiosClient.patch("/stores/my-store", payload),
  uploadLogo: (file) => {
    const fd = new FormData();
    fd.append("logo", file);
    return axiosClient.patch("/stores/my-store/logo", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadBanner: (file) => {
    const fd = new FormData();
    fd.append("banner", file);
    return axiosClient.patch("/stores/my-store/banner", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getStoreById: (id) => axiosClient.get(`/stores/${id}`),
  followStore: (id) => axiosClient.post(`/stores/${id}/follow`),
  unfollowStore: (id) => axiosClient.delete(`/stores/${id}/unfollow`),
};
