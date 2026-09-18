import express from "express";

import {
  createAddress,
  deleteAddress,
  getAddressById,
  getMyAddresses,
  updateAddress,
} from "../controllers/address.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  createAddressValidator,
  updateAddressValidator,
} from "../validators/addressValidator.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// create address
router.post("/", isAuthenticated, authorizeRoles("buyer"), createAddressValidator, validateRequest, createAddress);

// get all addresses
router.get("/", isAuthenticated, authorizeRoles("buyer"), getMyAddresses);

// get address by id
router.get("/:id", isAuthenticated, authorizeRoles("buyer"), getAddressById);

// update address
router.patch("/:id", isAuthenticated, authorizeRoles("buyer"), updateAddressValidator, validateRequest, updateAddress);

// delete address
router.delete("/:id", isAuthenticated, authorizeRoles("buyer"), deleteAddress);

export default router;