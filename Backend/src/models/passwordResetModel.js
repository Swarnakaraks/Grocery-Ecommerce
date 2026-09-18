import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        otpHash: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true
        },
        attempts: {
            type: Number, 
            default: 0,
        },

        isUsed: {
            type: Boolean,
            default: false
        },

        isVerified: {
            type:Boolean,
            default: false
        },

        verifiedAt:{
            type: Date,
            default: null
        },

        resetTokenHash: {
            type: String,
            default: null
        },

        resetTokenExpiresAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);


export const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);