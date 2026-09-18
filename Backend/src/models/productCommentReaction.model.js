import mongoose from "mongoose";

const productCommentReactionSchema =
    new mongoose.Schema(
        {
            comment: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "ProductComment",
                required: true,
                index: true
            },

            buyer: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true
            },

            reaction: {
                type: String,
                enum: [
                    "like",
                    "love",
                    "helpful",
                    "funny"
                ],
                required: true
            }
        },
        {
            timestamps: true
        }
    );

productCommentReactionSchema.index(
    {
        comment: 1,
        buyer: 1
    },
    {
        unique: true
    }
);

export const ProductCommentReaction = mongoose.model("ProductCommentReaction",productCommentReactionSchema);