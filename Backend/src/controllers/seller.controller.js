import { SellerRequest } from "../models/sellerRequest.model.js";
import { User } from "../models/user.model.js";

export const createSellerRequest = async (req, res) => {
  try {
    const { storeName, storeDescription } = req.body;

    if (!storeName) {
      return res.status(400).json({
        success: false,
        message: "Store name is required",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before becoming a seller",
      });
    }

    if (user.role === "seller") {
      return res.status(400).json({
        success: false,
        message: "You are already a seller",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Admin cannot create a seller request",
      });
    }

    const existingRequest = await SellerRequest.findOne({
      user: user._id,
    });

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return res.status(409).json({
          success: false,
          message: "Your seller request is already pending",
        });
      }

      if (existingRequest.status === "approved") {
        return res.status(409).json({
          success: false,
          message: "Your seller request has already been approved",
        });
      }

      existingRequest.storeName = storeName;
      existingRequest.storeDescription = storeDescription || null;
      existingRequest.status = "pending";
      existingRequest.rejectionReason = null;
      existingRequest.reviewedBy = null;
      existingRequest.reviewedAt = null;

      await existingRequest.save();

      return res.status(200).json({
        success: true,
        message: "Seller request submitted successfully",
        sellerRequest: existingRequest,
      });
    }

    const sellerRequest = await SellerRequest.create({
      user: user._id,
      storeName,
      storeDescription: storeDescription || null,
    });

    return res.status(201).json({
      success: true,
      message: "Seller request submitted successfully",
      sellerRequest,
    });
  } catch (error) {
    console.error("Create seller request error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not create seller request",
    });
  }
};
