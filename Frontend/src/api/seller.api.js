import axiosClient from "./axiosClient";

export const sellerApi = {
  requestSeller: (payload) => axiosClient.post("/seller/request", payload),
};
