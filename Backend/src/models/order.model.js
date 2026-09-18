import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true
        },

        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        image: {
            type: String,
            default: null
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        unit: {
            type: String,
            required: true,
            trim: true
        },

        originalPrice: {
            type: Number,
            required: true,
            min: 0
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        _id: false
    }
);

const shippingAddressSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        addressLine: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        district: {
            type: String,
            required: true,
            trim: true
        },

        province: {
            type: String,
            required: true,
            trim: true
        },

        postalCode: {
            type: String,
            default: null
        },

        landmark: {
            type: String,
            default: null
        }
    },
    {
        _id: false
    }
);

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: "Order must contain at least one item"
            }
        },

        shippingAddress: {
            type: shippingAddressSchema,
            required: true
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0
        },

        discount: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        shippingFee: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        total: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled"
            ],
            default: "pending",
            index: true
        },

        paymentMethod: {
            type: String,
            enum: [
                "esewa",
                "cod"
            ],
            default: null
        },

        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed",
                "refunded"
            ],
            default: "pending"
        },

        cancelledAt: {
            type: Date,
            default: null
        },

        cancelReason: {
            type: String,
            trim: true,
            maxlength: 500,
            default: null
        }
    },
    {
        timestamps: true
    }
);

export const Order = mongoose.model("Order", orderSchema);