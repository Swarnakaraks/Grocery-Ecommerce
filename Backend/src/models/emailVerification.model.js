import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        tokenHash: {
            type: String,
            required: true
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true
        },

        isUsed: {
            type: Boolean,
            default: false
        },

        verifiedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

export const EmailVerification = mongoose.model("EmailVerification", emailVerificationSchema);
