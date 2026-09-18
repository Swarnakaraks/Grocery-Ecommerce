import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        addressLine: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },

        city: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },

        district: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },

        province: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },

        postalCode: {
            type: String,
            trim: true,
            maxlength: 20,
            default: null
        },

        landmark: {
            type: String,
            trim: true,
            maxlength: 100,
            default: null
        },

        isDefault: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

addressSchema.index({
    buyer: 1,
    isDefault: 1
});

export const Address = mongoose.model("Address", addressSchema);