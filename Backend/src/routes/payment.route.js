import express from "express";
import {
  getEsewaPaymentStatus,
  getPaymentByOrder,
  handleEsewaFailure,
  initiateCodPayment,
  initiateEsewaPayment,
  verifyEsewaPayment,
} from "../controllers/payment.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/order/:orderId",
  isAuthenticated,
  authorizeRoles("buyer"),
  getPaymentByOrder,
);

router.post(
    "/cod",
    isAuthenticated,
    authorizeRoles("buyer"),
    initiateCodPayment
);

router.post(
  "/esewa/initiate",
  isAuthenticated,
  authorizeRoles("buyer"),
  initiateEsewaPayment,
);

router.get("/esewa/success", verifyEsewaPayment);

router.get("/esewa/failure", handleEsewaFailure);

router.get(
  "/esewa/status/:orderId",
  isAuthenticated,
  authorizeRoles("buyer"),
  getEsewaPaymentStatus,
);

export default router;
