import axiosClient from "./axiosClient";

export const productCommentApi = {
  getComments: (productId, params) =>
    axiosClient.get(`/product-comments/${productId}`, { params }),
  createComment: (productId, comment) =>
    axiosClient.post(`/product-comments/${productId}`, { comment }),
  updateComment: (productId, commentId, comment) =>
    axiosClient.patch(`/product-comments/${productId}/${commentId}`, { comment }),
  deleteComment: (productId, commentId) =>
    axiosClient.delete(`/product-comments/${productId}/${commentId}`),
  react: (productId, commentId, reaction) =>
    axiosClient.post(`/product-comments/${productId}/${commentId}/reaction`, { reaction }),
  removeReaction: (productId, commentId) =>
    axiosClient.delete(`/product-comments/${productId}/${commentId}/reaction`),
};
