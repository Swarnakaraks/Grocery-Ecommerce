import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { createOrUpdateProductRating, deleteMyProductRating, getMyProductRating, getProductRatings, getProductRatingSummary } from "../controllers/productRating.controller.js";

const router = express.Router();

router.post("/:productId", isAuthenticated, authorizeRoles("buyer"), createOrUpdateProductRating);
router.get("/:productId/my-rating", isAuthenticated, authorizeRoles("buyer"), getMyProductRating);
router.delete("/:productId/my-rating", isAuthenticated, authorizeRoles("buyer"), deleteMyProductRating);
router.get("/:productId/summary", getProductRatingSummary);
router.get("/:productId", getProductRatings);

export default router;