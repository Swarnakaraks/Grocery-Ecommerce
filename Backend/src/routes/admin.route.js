import express from "express";

import {
    approveSellerRequest,
    getSellerRequests,
    rejectSellerRequest
} from "../controllers/adminSeller.controller.js";

import {
    getAdminDashboard,
    getAllUsers,
    getUserById,
    blockUser,
    unblockUser,
    activateUser,
    deactivateUser,
    getAllSellers,
    getSellerById,
    activateStore,
    deactivateStore,
    getAllProducts,
    getProductById,
    activateProduct,
    deactivateProduct,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    getAllPayments,
    getPaymentById
} from "../controllers/admin.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(isAuthenticated, authorizeRoles("admin"));

// Dashboard
router.get("/dashboard", getAdminDashboard);

// Seller Requests
router.get("/seller-requests", getSellerRequests);
router.get("/seller-requests/:id", getSellerRequests);
router.patch("/seller-requests/:id/approve", approveSellerRequest);
router.patch("/seller-requests/:id/reject", rejectSellerRequest);

// User Management
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserById);
router.patch("/users/:userId/block", blockUser);
router.patch("/users/:userId/unblock", unblockUser);
router.patch("/users/:userId/activate", activateUser);
router.patch("/users/:userId/deactivate", deactivateUser);

// Seller Management
router.get("/sellers", getAllSellers);
router.get("/sellers/:sellerId", getSellerById);

// Store Management
router.patch("/stores/:storeId/activate", activateStore);
router.patch("/stores/:storeId/deactivate", deactivateStore);

// Product Management
router.get("/products", getAllProducts);
router.get("/products/:productId", getProductById);
router.patch("/products/:productId/activate", activateProduct);
router.patch("/products/:productId/deactivate", deactivateProduct);

// Order Management
router.get("/orders", getAllOrders);
router.get("/orders/:orderId", getOrderById);
router.patch("/orders/:orderId/status", updateOrderStatus);

// Payment Management
router.get("/payments", getAllPayments);
router.get("/payments/:paymentId", getPaymentById);

export default router;