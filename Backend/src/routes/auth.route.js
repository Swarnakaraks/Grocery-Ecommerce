import express from "express";
import { changePassword, forgotPassword, loginUser, logoutUser, refreshAccessToken, registerUser, resendVerificationEmail, resetPassword, verifyEmail, verifyResetOtp } from "../controllers/auth.controller.js";
import { forgotPasswordValidator, loginValidator, registerValidator, resetPasswordValidator, verifyResetOtpValidator } from "../validators/authValidator.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";
import { forgotPasswordRateLimiter, loginRateLimiter, verifyotpRateLimiter } from "../middlewares/rateLimitMiddleware.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register",registerValidator,validateRequest, registerUser);
router.post("/login",loginRateLimiter, loginValidator, validateRequest, loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);
router.post("/forgot-password",forgotPasswordRateLimiter, forgotPasswordValidator, validateRequest, forgotPassword);
router.post("/verify-reset-otp",verifyotpRateLimiter,verifyResetOtpValidator, validateRequest, verifyResetOtp);
router.post("/reset-password",resetPasswordValidator, validateRequest, resetPassword);
router.patch("/change-password", isAuthenticated, changePassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification-email", resendVerificationEmail)

export default router;