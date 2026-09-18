import mongoose from "mongoose";

import { Category } from "../models/category.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.util.js";


const CATEGORY_FOLDER = "FreshMart/categories";

export const createCategory = async (req, res) => {
    try {
        const { name, slug, parent } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                message: "Name and slug are required"
            });
        }

        const normalizedName = name.trim();
        const normalizedSlug = slug.trim().toLowerCase();

        const existingCategory = await Category.findOne({
            slug: normalizedSlug
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category with this slug already exists"
            });
        }

        if (parent) {
            if (!mongoose.Types.ObjectId.isValid(parent)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid parent category ID"
                });
            }

            const parentCategory = await Category.findOne({
                _id: parent,
                isActive: true
            });

            if (!parentCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Parent category not found"
                });
            }

            if (parentCategory.parent) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Subcategory cannot have another parent category"
                });
            }
        }

        let image = {
            url: null,
            publicId: null
        };

        if (req.file) {
            const uploadedImage = await uploadToCloudinary(
                req.file.buffer,
                CATEGORY_FOLDER
            );

            image = {
                url: uploadedImage.secure_url,
                publicId: uploadedImage.public_id
            };
        }

        const category = await Category.create({
            name: normalizedName,
            slug: normalizedSlug,
            parent: parent || null,
            image
        });

        return res.status(201).json({
            success: true,
            message: parent
                ? "Subcategory created successfully"
                : "Category created successfully",
            category
        });
    } catch (error) {
        console.error("Create category error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not create category"
        });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({
            isActive: true,
            parent: null
        }).sort({
            name: 1
        });

        return res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        console.error("Get categories error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch categories"
        });
    }
};

export const getSubcategories = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        const parentCategory = await Category.findOne({
            _id: id,
            parent: null,
            isActive: true
        });

        if (!parentCategory) {
            return res.status(404).json({
                success: false,
                message: "Parent category not found"
            });
        }

        const subcategories = await Category.find({
            parent: id,
            isActive: true
        }).sort({
            name: 1
        });

        return res.status(200).json({
            success: true,
            category: parentCategory,
            subcategories
        });
    } catch (error) {
        console.error("Get subcategories error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch subcategories"
        });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, parent, removeImage } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        if (name !== undefined) {
            const normalizedName = name.trim();

            if (!normalizedName) {
                return res.status(400).json({
                    success: false,
                    message: "Category name cannot be empty"
                });
            }

            category.name = normalizedName;
        }

        if (slug !== undefined) {
            const normalizedSlug = slug.trim().toLowerCase();

            if (!normalizedSlug) {
                return res.status(400).json({
                    success: false,
                    message: "Category slug cannot be empty"
                });
            }

            const existingCategory = await Category.findOne({
                slug: normalizedSlug,
                _id: { $ne: id }
            });

            if (existingCategory) {
                return res.status(409).json({
                    success: false,
                    message: "Category with this slug already exists"
                });
            }

            category.slug = normalizedSlug;
        }

        if (parent !== undefined) {
            if (parent === "" || parent === null) {
                category.parent = null;
            } else {
                if (!mongoose.Types.ObjectId.isValid(parent)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid parent category ID"
                    });
                }

                if (parent.toString() === id.toString()) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Category cannot be its own parent"
                    });
                }

                const parentCategory = await Category.findOne({
                    _id: parent,
                    isActive: true
                });

                if (!parentCategory) {
                    return res.status(404).json({
                        success: false,
                        message: "Parent category not found"
                    });
                }

                if (parentCategory.parent) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Subcategory cannot have another parent category"
                    });
                }

                category.parent = parent;
            }
        }

    

        if (removeImage === "true" || removeImage === true) {
            if (category.image?.publicId) {
                await deleteFromCloudinary(
                    category.image.publicId
                );
            }

            category.image = {
                url: null,
                publicId: null
            };
        }


        if (req.file) {
            if (category.image?.publicId) {
                await deleteFromCloudinary(
                    category.image.publicId
                );
            }

            const uploadedImage = await uploadToCloudinary(
                req.file.buffer,
                CATEGORY_FOLDER
            );

            category.image = {
                url: uploadedImage.secure_url,
                publicId: uploadedImage.public_id
            };
        }

        await category.save();

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category
        });
    } catch (error) {
        console.error("Update category error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not update category"
        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const subcategoryExists = await Category.exists({
            parent: id,
            isActive: true
        });

        if (subcategoryExists) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot delete category with active subcategories"
            });
        }


        if (category.image?.publicId) {
            await deleteFromCloudinary(
                category.image.publicId
            );
        }

        await Category.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        console.error("Delete category error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not delete category"
        });
    }
};
