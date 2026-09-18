import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        type: {
            type: String,
            enum: [
                "order",
                "payment",
                "chat",
                "review",
                "system"
            ],
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },

        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },

        isRead: {
            type: Boolean,
            default: false,
            index: true
        },

        readAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

notificationSchema.index({
    recipient: 1,
    createdAt: -1
});

export const Notification = mongoose.model("Notification",notificationSchema);