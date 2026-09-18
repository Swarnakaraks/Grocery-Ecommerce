import axiosClient from "./axiosClient";

export const productRatingApi = {
  rate: (productId, rating) => axiosClient.post(`/product-ratings/${productId}`, { rating }),
  getMyRating: (productId) => axiosClient.get(`/product-ratings/${productId}/my-rating`),
  deleteMyRating: (productId) => axiosClient.delete(`/product-ratings/${productId}/my-rating`),
  getSummary: (productId) => axiosClient.get(`/product-ratings/${productId}/summary`),
  getRatings: (productId, params) =>
    axiosClient.get(`/product-ratings/${productId}`, { params }),
};
