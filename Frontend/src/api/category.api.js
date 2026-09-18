import axiosClient from "./axiosClient";

export const categoryApi = {
  getCategories: () => axiosClient.get("/categories"),

  getSubcategories: (id) => axiosClient.get(`/categories/${id}/subcategories`),

  createCategory: (formData) => axiosClient.post("/categories", formData),

  updateCategory: (id, formData) =>
    axiosClient.put(`/categories/${id}`, formData),

  deleteCategory: (id) => axiosClient.delete(`/categories/${id}`),
};
