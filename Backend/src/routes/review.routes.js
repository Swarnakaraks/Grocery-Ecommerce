import express from "express";
import {
    createReview,
    deleteReview,
    getMyReview,
    getProductReviews,
    updateReview
} from "../controllers/review.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";
import {
    createReviewValidator,
    updateReviewValidator
} from "../validators/reviewValidator.js";

const router = express.Router();

router.post(
    "/",
    isAuthenticated,
    authorizeRoles("buyer"),
    createReviewValidator,
    validateRequest,
    createReview
);

router.get(
    "/product/:productId",
    getProductReviews
);

router.get(
    "/my/:productId",
    isAuthenticated,
    authorizeRoles("buyer"),
    getMyReview
);

router.patch(
    "/:reviewId",
    isAuthenticated,
    authorizeRoles("buyer"),
    updateReviewValidator,
    validateRequest,
    updateReview
);

router.delete(
    "/:reviewId",
    isAuthenticated,
    authorizeRoles("buyer"),
    deleteReview
);

export default router;