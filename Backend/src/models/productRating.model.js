import mongoose from "mongoose";

const productRatingSchema = new mongoose.Schema(
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

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        }
    },
    {
        timestamps: true
    }
);

productRatingSchema.index(
    {
        product: 1,
        buyer: 1
    },
    {
        unique: true
    }
);

export const ProductRating = mongoose.model("ProductRating",productRatingSchema);