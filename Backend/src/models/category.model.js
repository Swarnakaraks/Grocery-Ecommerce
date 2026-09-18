import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true
        },

        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
            index: true
        },

        image: {
            url: {
                type: String,
                default: null
            },

            publicId: {
                type: String,
                default: null
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

export const Category = mongoose.model("Category", categorySchema);
