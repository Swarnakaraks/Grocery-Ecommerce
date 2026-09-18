import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true,
            index: true
        },

        lastMessage: {
            type: String,
            trim: true,
            default: null
        },

        lastMessageAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

conversationSchema.index(
    {
        buyer: 1,
        seller: 1
    },
    {
        unique: true
    }
);

export const Conversation = mongoose.model("Conversation",conversationSchema);