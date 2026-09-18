import { SellerRequest } from "../models/sellerRequest.model.js";
import { User } from "../models/user.model.js";

export const getSellerRequests = async (req, res) => {
    try {
        const { status } = req.query;

        const filter = {};

        if (status) {
            if (!["pending", "approved", "rejected"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid seller request status"
                });
            }

            filter.status = status;
        }

        const sellerRequests = await SellerRequest.find(filter)
            .populate(
                "user",
                "fullName email profilePicture isEmailVerified isActive isBlocked"
            )
            .populate(
                "reviewedBy",
                "fullName email"
            )
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: sellerRequests.length,
            sellerRequests
        });
    } catch (error) {
        console.error("Get seller requests error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch seller requests"
        });
    }
};


export const getSellerRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        const sellerRequest = await SellerRequest.findById(id)
            .populate(
                "user",
                "fullName email profilePicture isEmailVerified isActive isBlocked role createdAt"
            )
            .populate(
                "reviewedBy",
                "fullName email"
            );

        if (!sellerRequest) {
            return res.status(404).json({
                success: false,
                message: "Seller request not found"
            });
        }

        return res.status(200).json({
            success: true,
            sellerRequest
        });
    } catch (error) {
        console.error("Get seller request error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch seller request"
        });
    }
};

export const approveSellerRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const sellerRequest = await SellerRequest.findById(id);

        if (!sellerRequest) {
            return res.status(404).json({
                success: false,
                message: "Seller request not found"
            });
        }

        if (sellerRequest.status === "approved") {
            return res.status(400).json({
                success: false,
                message: "Seller request is already approved"
            });
        }

        const user = await User.findById(sellerRequest.user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Blocked user cannot become a seller"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Inactive user cannot become a seller"
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "User email is not verified"
            });
        }

        user.role = "seller";

        await user.save();

        sellerRequest.status = "approved";
        sellerRequest.reviewedBy = req.user.id;
        sellerRequest.reviewedAt = new Date();
        sellerRequest.rejectionReason = null;

        await sellerRequest.save();

        return res.status(200).json({
            success: true,
            message: "Seller request approved successfully",
            sellerRequest
        });
    } catch (error) {
        console.error("Approve seller request error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not approve seller request"
        });
    }
};


export const rejectSellerRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required"
            });
        }

        const sellerRequest = await SellerRequest.findById(id);

        if (!sellerRequest) {
            return res.status(404).json({
                success: false,
                message: "Seller request not found"
            });
        }

        if (sellerRequest.status === "approved") {
            return res.status(400).json({
                success: false,
                message: "Approved seller request cannot be rejected"
            });
        }

        if (sellerRequest.status === "rejected") {
            return res.status(400).json({
                success: false,
                message: "Seller request is already rejected"
            });
        }

        sellerRequest.status = "rejected";
        sellerRequest.rejectionReason = rejectionReason.trim();
        sellerRequest.reviewedBy = req.user.id;
        sellerRequest.reviewedAt = new Date();

        await sellerRequest.save();

        return res.status(200).json({
            success: true,
            message: "Seller request rejected successfully",
            sellerRequest
        });
    } catch (error) {
        console.error("Reject seller request error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not reject seller request"
        });
    }
};


