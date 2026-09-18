import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { createProduct, deleteProduct, deleteProductImage, getAllProducts, getBestSellingProducts, getMostViewedProducts, getProductById, getProductBySlug, getProducts, getRelatedProducts, toggleProductStatus, updateProduct, uploadProductImages } from "../controllers/product.controller.js";
import { uploadProductImageFiles} from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, authorizeRoles("seller"), createProduct);
router.patch("/:id/images", isAuthenticated, authorizeRoles("seller"), uploadProductImageFiles.array("images", 6), uploadProductImages);
router.get("/", getProducts);
router.get("/most-viewed", getMostViewedProducts);
router.get("/:id/related", getRelatedProducts);
router.get("/all", getAllProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/featured/most-viewed", getMostViewedProducts);
router.get("/featured/best-selling", getBestSellingProducts);
router.get("/:id", getProductById);
router.patch("/:id/status", isAuthenticated, authorizeRoles("seller"), toggleProductStatus);
router.patch("/:id", isAuthenticated, authorizeRoles("seller"), updateProduct);
router.delete("/:id/images/:imageId", isAuthenticated, authorizeRoles("seller"), deleteProductImage);
router.delete("/:id", isAuthenticated, authorizeRoles("seller"), deleteProduct);

export default router;