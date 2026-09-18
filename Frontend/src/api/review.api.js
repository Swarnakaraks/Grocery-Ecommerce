import axiosClient from "./axiosClient";

export const reviewApi = {
  createReview: (payload) => axiosClient.post("/reviews", payload),
  getProductReviews: (productId, params) =>
    axiosClient.get(`/reviews/product/${productId}`, { params }),
  getMyReview: (productId) => axiosClient.get(`/reviews/my/${productId}`),
  updateReview: (reviewId, payload) => axiosClient.patch(`/reviews/${reviewId}`, payload),
  deleteReview: (reviewId) => axiosClient.delete(`/reviews/${reviewId}`),
};
