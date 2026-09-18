import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { createSellerRequest } from "../controllers/seller.controller.js";

const router = express.Router();

router.post("/request", isAuthenticated, createSellerRequest);

export default router;