import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
    {
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },

        storeName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        storeDescription: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: null
        },

        logo: {
            url: {
                type: String,
                default: null
            },

            publicId: {
                type: String,
                default: null
            }
        },

        banner: {
            url: {
                type: String,
                default: null
            },

            publicId: {
                type: String,
                default: null
            }
        },

        address: {
            type: String,
            trim: true,
            maxlength: 300,
            default: null
        },

        phone: {
            type: String,
            trim: true,
            maxlength: 20,
            default: null
        },

        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

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

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export const Store = mongoose.model("Store", storeSchema);