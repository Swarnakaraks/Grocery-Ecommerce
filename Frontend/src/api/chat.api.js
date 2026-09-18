import axiosClient from "./axiosClient";

export const chatApi = {
  createConversation: (payload) => axiosClient.post("/chat/conversations", payload),
  getMyConversations: () => axiosClient.get("/chat/conversations"),
  getMessages: (conversationId) =>
    axiosClient.get(`/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, text) =>
    axiosClient.post(`/chat/conversations/${conversationId}/messages`, { text }),
  markAsRead: (conversationId) =>
    axiosClient.patch(`/chat/conversations/${conversationId}/read`),
  deleteConversation: (conversationId) =>
    axiosClient.delete(`/chat/conversations/${conversationId}`),
};
