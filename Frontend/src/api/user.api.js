import axiosClient from "./axiosClient";

export const userApi = {
  getMe: () => axiosClient.get("/users/me"),
  updateMe: (payload) => axiosClient.patch("/users/me", payload),
  uploadProfilePicture: (file) => {
    const fd = new FormData();
    fd.append("profilePicture", file);
    return axiosClient.patch("/users/me/profile-picture", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteProfilePicture: () => axiosClient.delete("/users/me/profile-picture"),
};
