import express from "express";
import {
    cancelOrder,
    createOrder,
    getMyOrders,
    getOrderById
} from "../controllers/order.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
    cancelOrderValidator,
    createOrderValidator
} from "../validators/orderValidator.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post(
    "/",
    isAuthenticated,
    authorizeRoles("buyer"),
    createOrderValidator,
    validateRequest,
    createOrder
);

router.get(
    "/",
    isAuthenticated,
    authorizeRoles("buyer"),
    getMyOrders
);

router.get(
    "/:id",
    isAuthenticated,
    authorizeRoles("buyer"),
    getOrderById
);

router.patch(
    "/:id/cancel",
    isAuthenticated,
    authorizeRoles("buyer"),
    cancelOrderValidator,
    validateRequest,
    cancelOrder
);

export default router;