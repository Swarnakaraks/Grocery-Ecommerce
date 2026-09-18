import axiosClient from "./axiosClient";

export const productApi = {
  getProducts: (params) => axiosClient.get("/products", { params }),
  getAllProducts: (params) => axiosClient.get("/products/all", { params }),
  getProductById: (id) => axiosClient.get(`/products/${id}`),
  getProductBySlug: (slug) => axiosClient.get(`/products/slug/${slug}`),
  getRelatedProducts: (id) => axiosClient.get(`/products/${id}/related`),
  getMostViewed: (limit = 10) =>
    axiosClient.get("/products/featured/most-viewed", { params: { limit } }),
  getBestSelling: (limit = 10) =>
    axiosClient.get("/products/featured/best-selling", { params: { limit } }),
  createProduct: (payload) => axiosClient.post("/products", payload),
  updateProduct: (id, payload) => axiosClient.patch(`/products/${id}`, payload),
  deleteProduct: (id) => axiosClient.delete(`/products/${id}`),
  toggleStatus: (id) => axiosClient.patch(`/products/${id}/status`),
  uploadImages: (id, files) => {
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("images", f));
    return axiosClient.patch(`/products/${id}/images`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteImage: (id, imageId) => axiosClient.delete(`/products/${id}/images/${imageId}`),
};
