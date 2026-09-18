import express from "express";

import {
  createCategory,
  deleteCategory,
  getCategories,
  getSubcategories,
  updateCategory,
} from "../controllers/category.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { uploadCategoryImage } from "../middlewares/upload.middleware.js";

const router = express.Router();

// get categories
router.get("/", getCategories);

// get subcategories
router.get("/:id/subcategories", getSubcategories);

// create category
router.post("/", isAuthenticated, authorizeRoles("admin"), uploadCategoryImage.single("image"), createCategory);

// update category
router.put("/:id", isAuthenticated, authorizeRoles("admin"), uploadCategoryImage.single("image"), updateCategory);

// delete category
router.delete("/:id", isAuthenticated, authorizeRoles("admin"), deleteCategory);

export default router;