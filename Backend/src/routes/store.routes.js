import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { createStore, followStore, getMyStore, getStoreById, unfollowStore, updateMyStore, uploadStoreBanner, uploadStoreLogo } from "../controllers/store.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, authorizeRoles("seller"), createStore);
router.get("/my-store", isAuthenticated, authorizeRoles("seller"), getMyStore);
router.patch("/my-store", isAuthenticated, authorizeRoles("seller"), updateMyStore);
router.patch("/my-store/logo", isAuthenticated, authorizeRoles("seller"), upload.single("logo"), uploadStoreLogo);
router.patch("/my-store/banner", isAuthenticated, authorizeRoles("seller"), upload.single("banner"), uploadStoreBanner);
router.post("/:id/follow", isAuthenticated, followStore);
router.delete("/:id/unfollow", isAuthenticated, unfollowStore);
router.get("/:id", getStoreById);

export default router;