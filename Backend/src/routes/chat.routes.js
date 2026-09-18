import express from "express";

import {
  createConversation,
  deleteConversation,
  getConversationMessages,
  getMyConversations,
  markMessagesAsRead,
  sendMessage,
} from "../controllers/chat.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// create conversation
router.post("/conversations", isAuthenticated, authorizeRoles("buyer"), createConversation);

// get my conversations
router.get("/conversations", isAuthenticated, authorizeRoles("buyer", "seller"), getMyConversations);

// get conversation messages
router.get("/conversations/:conversationId/messages", isAuthenticated, authorizeRoles("buyer", "seller"), getConversationMessages);

// send message
router.post("/conversations/:conversationId/messages", isAuthenticated, authorizeRoles("buyer", "seller"), sendMessage);

// mark messages as read
router.patch("/conversations/:conversationId/read", isAuthenticated, authorizeRoles("buyer", "seller"), markMessagesAsRead);

// delete conversation
router.delete("/conversations/:conversationId", isAuthenticated, authorizeRoles("buyer", "seller"), deleteConversation);

export default router;