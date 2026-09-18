import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true,
            index: true
        },

        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 150
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true
        },

        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 5000
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
            index: true
        },

        subcategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
            index: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        discountPrice: {
            type: Number,
            default: null,
            min: 0
        },

        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        unit: {
            type: String,
            required: true,
            trim: true
        },

        images: [
            {
                url: {
                    type: String,
                    required: true
                },

                publicId: {
                    type: String,
                    required: true
                }
            }
        ],

        brand: {
            type: String,
            trim: true,
            default: null
        },

        rating: {
            average: {
                type: Number,
                default: 0,
                min: 0,
                max: 5
            },

            count: {
                type: Number,
                default: 0,
                min: 0
            }
        },

        totalReviews: {
            type: Number,
            default: 0,
            min: 0
        },

        totalSold: {
            type: Number,
            default: 0,
            min: 0
        },

        viewCount: {
            type: Number,
            default: 0,
            min: 0
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export const Product = mongoose.model("Product", productSchema);

