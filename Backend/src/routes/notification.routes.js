import express from "express";

import {
  deleteNotification,
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// get my notifications
router.get("/", isAuthenticated, authorizeRoles("buyer", "seller", "admin"), getMyNotifications);

// mark all notifications as read
router.patch("/read-all", isAuthenticated, authorizeRoles("buyer", "seller", "admin"), markAllNotificationsAsRead);

// mark notification as read
router.patch("/:notificationId/read", isAuthenticated, authorizeRoles("buyer", "seller", "admin"), markNotificationAsRead);

// delete notification
router.delete("/:notificationId", isAuthenticated, authorizeRoles("buyer", "seller", "admin"), deleteNotification);

export default router;