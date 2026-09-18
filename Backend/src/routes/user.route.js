import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { deleteMyProfilePicture, getMyProfile, updateMyProfile, uploadMyProfilePicture } from "../controllers/user.controller.js";
import { updateProfileValidator } from "../validators/userValidator.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";
import { uploadProfilePicture } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/me", isAuthenticated, getMyProfile);
router.patch("/me", isAuthenticated, updateProfileValidator,validateRequest, updateMyProfile);
router.patch("/me/profile-picture", isAuthenticated, uploadProfilePicture.single("profilePicture"), uploadMyProfilePicture);
router.delete("/me/profile-picture", isAuthenticated, deleteMyProfilePicture)

export default router;