import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    },
    {
        _id: false
    }
);

const cartSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },

        items: [cartItemSchema],

        subtotal: {
            type: Number,
            default: 0,
            min: 0
        },

        discount: {
            type: Number,
            default: 0,
            min: 0
        },

        total: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

export const Cart = mongoose.model(
    "Cart",
    cartSchema
);