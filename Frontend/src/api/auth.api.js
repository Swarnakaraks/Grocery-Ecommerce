import axiosClient from "./axiosClient";

export const authApi = {
  register: (payload) => axiosClient.post("/auth/register", payload),
  login: (payload) => axiosClient.post("/auth/login", payload),
  logout: () => axiosClient.post("/auth/logout"),
  refresh: () => axiosClient.post("/auth/refresh"),
  forgotPassword: (email) => axiosClient.post("/auth/forgot-password", { email }),
  verifyResetOtp: (payload) => axiosClient.post("/auth/verify-reset-otp", payload),
  resetPassword: (payload) => axiosClient.post("/auth/reset-password", payload),
  changePassword: (payload) => axiosClient.patch("/auth/change-password", payload),
  verifyEmail: (token) => axiosClient.get(`/auth/verify-email/${token}`),
  resendVerificationEmail: (email) =>
    axiosClient.post("/auth/resend-verification-email", { email }),
};
