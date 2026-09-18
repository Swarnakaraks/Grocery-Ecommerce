import axiosClient from "./axiosClient";

export const addressApi = {
  getMyAddresses: () => axiosClient.get("/addresses"),
  getAddressById: (id) => axiosClient.get(`/addresses/${id}`),
  createAddress: (payload) => axiosClient.post("/addresses", payload),
  updateAddress: (id, payload) => axiosClient.patch(`/addresses/${id}`, payload),
  deleteAddress: (id) => axiosClient.delete(`/addresses/${id}`),
};
