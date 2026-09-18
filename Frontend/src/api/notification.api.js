import axiosClient from "./axiosClient";

export const notificationApi = {
  getMyNotifications: () => axiosClient.get("/notifications"),
  markAsRead: (id) => axiosClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => axiosClient.patch("/notifications/read-all"),
  deleteNotification: (id) => axiosClient.delete(`/notifications/${id}`),
};
