import express from "express";
import {
    getSellerOrderById,
    getSellerOrders,
    updateOrderStatus
} from "../controllers/orderManagement.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
    "/seller",
    isAuthenticated,
    authorizeRoles("seller"),
    getSellerOrders
);

router.get(
    "/seller/:id",
    isAuthenticated,
    authorizeRoles("seller"),
    getSellerOrderById
);

router.patch(
    "/seller/:id/status",
    isAuthenticated,
    authorizeRoles("seller"),
    updateOrderStatus
);

export default router;