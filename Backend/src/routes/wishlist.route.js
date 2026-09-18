import express from "express";
import {
    addToWishlist,
    clearWishlist,
    getMyWishlist,
    removeFromWishlist
} from "../controllers/wishlist.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
    "/",
    isAuthenticated,
    authorizeRoles("buyer"),
    addToWishlist
);

router.get(
    "/",
    isAuthenticated,
    authorizeRoles("buyer"),
    getMyWishlist
);

router.delete(
    "/:productId",
    isAuthenticated,
    authorizeRoles("buyer"),
    removeFromWishlist
);

router.delete(
    "/",
    isAuthenticated,
    authorizeRoles("buyer"),
    clearWishlist
);

export default router;