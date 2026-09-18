import axiosClient from "./axiosClient";

export const paymentApi = {
  getByOrder: (orderId) => axiosClient.get(`/payments/order/${orderId}`),

  initiateCod: (payload) => axiosClient.post("/payments/cod", payload),

  initiateEsewa: (payload) =>
    axiosClient.post("/payments/esewa/initiate", payload),

  getEsewaStatus: (orderId) =>
    axiosClient.get(`/payments/esewa/status/${orderId}`),
};
