import mongoose from "mongoose";

const productCommentSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },

        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        comment: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 1000
        },

        reactions: {
            like: {
                type: Number,
                default: 0,
                min: 0
            },

            love: {
                type: Number,
                default: 0,
                min: 0
            },

            helpful: {
                type: Number,
                default: 0,
                min: 0
            },

            funny: {
                type: Number,
                default: 0,
                min: 0
            }
        },

        reactionCount: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

productCommentSchema.index({
    product: 1,
    createdAt: -1
});

export const ProductComment =mongoose.model("ProductComment",productCommentSchema);