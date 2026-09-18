import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        refreshTokenHash: {
            type: String,
            required: true
        },

        userAgent: {
            type: String,
            default: null
        },

        ipAddress: {
            type: String,
            default: null
        },

        expiredAt: {
            type: Date,
            default: true
        },

        isRevoked: {
            type: Boolean,
            default: false
        },

        revokedAt: {
            type: Date,
            default: null
        },
    },

    {
        timestamps: true
    }
)


export const Session = mongoose.model("Session", sessionSchema);