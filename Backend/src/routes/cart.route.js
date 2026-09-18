import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { addToCart, clearCart, getMyCart, removeFromCart, updateCartItem } from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, authorizeRoles("buyer"), addToCart);
router.get("/", isAuthenticated, authorizeRoles("buyer"), getMyCart);
router.patch("/:productId", isAuthenticated, authorizeRoles("buyer"), updateCartItem);
router.delete("/:productId", isAuthenticated, authorizeRoles("buyer"), removeFromCart);
router.delete("/", isAuthenticated, authorizeRoles("buyer"), clearCart);



export default router;