import express from "express";
import { createProductComment, deleteProductComment, getProductComments, reactToProductComment, removeProductCommentReaction, updateProductComment } from "../controllers/productComment.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/:productId", getProductComments);
router.post("/:productId", isAuthenticated, authorizeRoles("buyer"), createProductComment);
router.patch("/:productId/:commentId", isAuthenticated, authorizeRoles("buyer"), updateProductComment);
router.delete("/:productId/:commentId", isAuthenticated, authorizeRoles("buyer"), deleteProductComment);
router.post("/:productId/:commentId/reaction", isAuthenticated, authorizeRoles("buyer"), reactToProductComment);
router.delete("/:productId/:commentId/reaction", isAuthenticated, authorizeRoles("buyer"), removeProductCommentReaction);

export default router;