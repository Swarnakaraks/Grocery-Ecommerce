import mongoose from "mongoose";

const sellerRequestSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },

        storeName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        storeDescription: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: null
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true
        },

        rejectionReason: {
            type: String,
            trim: true,
            maxlength: 500,
            default: null
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        reviewedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

export const SellerRequest = mongoose.model("SellerRequest", sellerRequestSchema);