import mongoose from "mongoose";
import {Product} from "../models/product.model.js";
import {Store} from "../models/store.model.js";
import {Category} from "../models/category.model.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.util.js";

export const createProduct = async (req, res) => {
    try {
        const {
            name,
            slug,
            description,
            category,
            subcategory,
            price,
            discountPrice,
            stock,
            unit,
            brand
        } = req.body;

        if (
            !name ||
            !slug ||
            !description ||
            !category ||
            price === undefined ||
            stock === undefined ||
            !unit
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, slug, description, category, price, stock and unit are required"
            });
        }

        const seller = req.user.id;

        const store = await Store.findOne({
            seller,
            isActive: true
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "You must have an active store before creating products"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        const categoryExists = await Category.findOne({
            _id: category,
            parent: null,
            isActive: true
        });

        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        let validSubcategory = null;

        if (subcategory) {
            if (!mongoose.Types.ObjectId.isValid(subcategory)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid subcategory ID"
                });
            }

            validSubcategory = await Category.findOne({
                _id: subcategory,
                parent: category,
                isActive: true
            });

            if (!validSubcategory) {
                return res.status(400).json({
                    success: false,
                    message: "Subcategory does not belong to the selected category"
                });
            }
        }

        const existingProduct = await Product.findOne({
            slug: slug.trim().toLowerCase()
        });

        if (existingProduct) {
            return res.status(409).json({
                success: false,
                message: "Product with this slug already exists"
            });
        }

        if (discountPrice !== undefined && discountPrice !== null) {
            if (Number(discountPrice) >= Number(price)) {
                return res.status(400).json({
                    success: false,
                    message: "Discount price must be less than the original price"
                });
            }
        }

        if (Number(price) < 0) {
            return res.status(400).json({
                success: false,
                message: "Price cannot be negative"
            });
        }

        if (Number(stock) < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock cannot be negative"
            });
        }

        const product = await Product.create({
            store: store._id,
            seller,
            name: name.trim(),
            slug: slug.trim().toLowerCase(),
            description: description.trim(),
            category,
            subcategory: validSubcategory
                ? validSubcategory._id
                : null,
            price: Number(price),
            discountPrice:
                discountPrice !== undefined &&
                discountPrice !== null &&
                discountPrice !== ""
                    ? Number(discountPrice)
                    : null,
            stock: Number(stock),
            unit: unit.trim(),
            brand: brand ? brand.trim() : null
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });
    } catch (error) {
        console.error("Create product error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not create product"
        });
    }
};

export const uploadProductImages = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one product image is required"
            });
        }

        if (req.files.length > 6) {
            return res.status(400).json({
                success: false,
                message: "You can upload a maximum of 6 images"
            });
        }

        const product = await Product.findOne({
            _id: id,
            seller: req.user.id
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.images.length + req.files.length > 6) {
            return res.status(400).json({
                success: false,
                message: "A product can have a maximum of 6 images"
            });
        }

        const uploadedImages = [];

        for (const file of req.files) {
            const result = await uploadToCloudinary(
                file.buffer,
                "freshmart/products"
            );

            uploadedImages.push({
                url: result.secure_url,
                publicId: result.public_id
            });
        }

        product.images.push(...uploadedImages);

        await product.save();

        return res.status(200).json({
            success: true,
            message: "Product images uploaded successfully",
            images: product.images
        });
    } catch (error) {
        console.error("Upload product images error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not upload product images"
        });
    }
};

export const deleteProductImage = async (req, res) => {
    try {
        const { id, imageId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findOne({
            _id: id,
            seller: req.user.id
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const image = product.images.id(imageId);

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Product image not found"
            });
        }

        if (image.publicId) {
            await deleteFromCloudinary(
                image.publicId
            );
        }

        image.deleteOne();

        await product.save();

        return res.status(200).json({
            success: true,
            message: "Product image deleted successfully",
            images: product.images
        });
    } catch (error) {
        console.error(
            "Delete product image error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Could not delete product image"
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const {
            search,
            store,
            category,
            subcategory,
            minPrice,
            maxPrice,
            sort = "newest",
            page = 1,
            limit = 12
        } = req.query;

        const filter = {
            isActive: true
        };

        // Search
        if (search) {
            filter.name = {
                $regex: search.trim(),
                $options: "i"
            };
        }

        // Store filter
        if (store) {
            if (!mongoose.Types.ObjectId.isValid(store)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid store ID"
                });
            }

            filter.store = store;
        }

        // Category filter
        if (category) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID"
                });
            }

            filter.category = category;
        }

        // Subcategory filter
        if (subcategory) {
            if (!mongoose.Types.ObjectId.isValid(subcategory)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid subcategory ID"
                });
            }

            filter.subcategory = subcategory;
        }

        // Price filter
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};

            if (minPrice !== undefined) {
                filter.price.$gte = Number(minPrice);
            }

            if (maxPrice !== undefined) {
                filter.price.$lte = Number(maxPrice);
            }
        }

        // Pagination
        const pageNumber = Math.max(Number(page), 1);
        const limitNumber = Math.min(
            Math.max(Number(limit), 1),
            50
        );

        const skip = (pageNumber - 1) * limitNumber;

        // Sorting
        let sortOption = {
            createdAt: -1
        };

        if (sort === "price-low") {
            sortOption = {
                price: 1
            };
        }

        if (sort === "price-high") {
            sortOption = {
                price: -1
            };
        }

        if (sort === "rating") {
            sortOption = {
                "rating.average": -1
            };
        }

        if (sort === "popular") {
            sortOption = {
                viewCount: -1
            };
        }

        const [products, totalProducts] = await Promise.all([
            Product.find(filter)
                .populate(
                    "category",
                    "name slug image"
                )
                .populate(
                    "subcategory",
                    "name slug image parent"
                )
                .populate(
                    "store",
                    "name slug"
                )
                .select("-__v")
                .sort(sortOption)
                .skip(skip)
                .limit(limitNumber),

            Product.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(
            totalProducts / limitNumber
        );

        return res.status(200).json({
            success: true,
            products,
            pagination: {
                currentPage: pageNumber,
                limit: limitNumber,
                totalProducts,
                totalPages,
                hasNextPage:
                    pageNumber < totalPages,
                hasPreviousPage:
                    pageNumber > 1
            }
        });
    } catch (error) {
        console.error(
            "Get products error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Could not fetch products"
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findOne({
            _id: id,
            isActive: true
        })
            .populate(
                "category",
                "name slug"
            )
            .populate(
                "subcategory",
                "name slug"
            )
            .populate(
                "store",
                "name slug"
            )
            .populate(
                "seller",
                "fullName profileImage"
            );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        product.viewCount += 1;

        await product.save();

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.error(
            "Get product by ID error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Could not get product"
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findOne({
            _id: id,
            seller: req.user.id
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const {
            name,
            slug,
            description,
            category,
            subcategory,
            price,
            discountPrice,
            stock,
            unit,
            brand,
            isActive
        } = req.body;

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Product name cannot be empty"
                });
            }

            product.name = name.trim();
        }

        if (slug !== undefined) {
            const normalizedSlug =
                slug.trim().toLowerCase();

            if (!normalizedSlug) {
                return res.status(400).json({
                    success: false,
                    message: "Slug cannot be empty"
                });
            }

            const existingProduct =
                await Product.findOne({
                    slug: normalizedSlug,
                    _id: { $ne: id }
                });

            if (existingProduct) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Product with this slug already exists"
                });
            }

            product.slug = normalizedSlug;
        }

        if (description !== undefined) {
            if (!description.trim()) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Description cannot be empty"
                });
            }

            product.description =
                description.trim();
        }

        if (category !== undefined) {
            if (
                !mongoose.Types.ObjectId.isValid(
                    category
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID"
                });
            }

            const categoryExists =
                await Category.findOne({
                    _id: category,
                    parent: null,
                    isActive: true
                });

            if (!categoryExists) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found"
                });
            }

            product.category = category;

            if (subcategory === undefined) {
                product.subcategory = null;
            }
        }

        if (subcategory !== undefined) {
            if (subcategory === null || subcategory === "") {
                product.subcategory = null;
            } else {
                if (
                    !mongoose.Types.ObjectId.isValid(
                        subcategory
                    )
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Invalid subcategory ID"
                    });
                }

                const validSubcategory =
                    await Category.findOne({
                        _id: subcategory,
                        parent: product.category,
                        isActive: true
                    });

                if (!validSubcategory) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Subcategory does not belong to the selected category"
                    });
                }

                product.subcategory =
                    validSubcategory._id;
            }
        }

        if (price !== undefined) {
            if (Number.isNaN(Number(price))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid price"
                });
            }

            if (Number(price) < 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Price cannot be negative"
                });
            }

            product.price = Number(price);
        }

        if (discountPrice !== undefined) {
            if (
                discountPrice === null ||
                discountPrice === ""
            ) {
                product.discountPrice = null;
            } else {
                if (
                    Number.isNaN(
                        Number(discountPrice)
                    )
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Invalid discount price"
                    });
                }

                if (
                    Number(discountPrice) >=
                    product.price
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Discount price must be less than the original price"
                    });
                }

                if (Number(discountPrice) < 0) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Discount price cannot be negative"
                    });
                }

                product.discountPrice =
                    Number(discountPrice);
            }
        }

        if (stock !== undefined) {
            if (Number.isNaN(Number(stock))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid stock"
                });
            }

            if (Number(stock) < 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Stock cannot be negative"
                });
            }

            product.stock = Number(stock);
        }

        if (unit !== undefined) {
            if (!unit.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Unit cannot be empty"
                });
            }

            product.unit = unit.trim();
        }

        if (brand !== undefined) {
            product.brand =
                brand?.trim() || null;
        }

        if (isActive !== undefined) {
            product.isActive =
                isActive === true ||
                isActive === "true";
        }

        if (
            product.discountPrice !== null &&
            product.discountPrice >= product.price
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Discount price must be less than the original price"
            });
        }

        await product.save();

        return res.status(200).json({
            success: true,
            message:
                "Product updated successfully",
            product
        });
    } catch (error) {
        console.error(
            "Update product error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not update product"
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findOne({
            _id: id,
            seller: req.user.id
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        for (const image of product.images) {
            if (image.publicId) {
                try {
                    await deleteFromCloudinary(
                        image.publicId
                    );
                } catch (cloudinaryError) {
                    console.error(
                        "Cloudinary image deletion error:",
                        cloudinaryError
                    );
                }
            }
        }

        await Product.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error(
            "Delete product error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Could not delete product"
        });
    }
};

export const toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findOne({
            _id: id,
            seller: req.user.id
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        product.isActive = !product.isActive;

        await product.save();

        return res.status(200).json({
            success: true,
            message: product.isActive
                ? "Product activated successfully"
                : "Product deactivated successfully",
            isActive: product.isActive
        });
    } catch (error) {
        console.error("Toggle product status error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not update product status"
        });
    }
};

export const getRelatedProducts = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findOne({
            _id: id,
            isActive: true
        }).select(
            "category subcategory brand"
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const filter = {
            _id: { $ne: product._id },
            category: product.category,
            isActive: true
        };

        if (product.subcategory) {
            filter.subcategory =
                product.subcategory;
        }

        const products = await Product.find(filter)
            .populate(
                "category",
                "name slug"
            )
            .populate(
                "subcategory",
                "name slug"
            )
            .populate(
                "store",
                "name slug"
            )
            .sort({
                totalSold: -1,
                "rating.average": -1
            })
            .limit(8)
            .lean();

        return res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        console.error(
            "Get related products error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not get related products"
        });
    }
};

export const getMostViewedProducts = async (
    req,
    res
) => {
    try {
        const limit = Math.min(
            Math.max(Number(req.query.limit) || 10, 1),
            50
        );

        const products = await Product.find({
            isActive: true
        })
            .populate(
                "category",
                "name slug"
            )
            .populate(
                "subcategory",
                "name slug"
            )
            .populate(
                "store",
                "name slug"
            )
            .sort({
                viewCount: -1
            })
            .limit(limit)
            .lean();

        return res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        console.error(
            "Get most viewed products error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not get most viewed products"
        });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            subcategory,
            brand,
            minPrice,
            maxPrice,
            sort = "newest",
            page = 1,
            limit = 12
        } = req.query;

        const filter = {};

        if (search?.trim()) {
            filter.$or = [
                {
                    name: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                },
                {
                    brand: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                }
            ];
        }

        if (category) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID"
                });
            }

            filter.category = category;
        }

        if (subcategory) {
            if (!mongoose.Types.ObjectId.isValid(subcategory)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid subcategory ID"
                });
            }

            filter.subcategory = subcategory;
        }

        if (brand?.trim()) {
            filter.brand = {
                $regex: brand.trim(),
                $options: "i"
            };
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.$expr = {
                $and: [
                    ...(minPrice !== undefined
                        ? [
                              {
                                  $gte: [
                                      {
                                          $ifNull: [
                                              "$discountPrice",
                                              "$price"
                                          ]
                                      },
                                      Number(minPrice)
                                  ]
                              }
                          ]
                        : []),
                    ...(maxPrice !== undefined
                        ? [
                              {
                                  $lte: [
                                      {
                                          $ifNull: [
                                              "$discountPrice",
                                              "$price"
                                          ]
                                      },
                                      Number(maxPrice)
                                  ]
                              }
                          ]
                        : [])
                ]
            };
        }

        filter.isActive = true;

        const pageNumber = Math.max(
            Number(page),
            1
        );

        const limitNumber = Math.min(
            Math.max(Number(limit), 1),
            50
        );

        const skip =
            (pageNumber - 1) * limitNumber;

        let sortOption = {
            createdAt: -1
        };

        if (sort === "price-low") {
            sortOption = {
                price: 1
            };
        }

        if (sort === "price-high") {
            sortOption = {
                price: -1
            };
        }

        if (sort === "name-asc") {
            sortOption = {
                name: 1
            };
        }

        if (sort === "name-desc") {
            sortOption = {
                name: -1
            };
        }

        if (sort === "popular") {
            sortOption = {
                viewCount: -1
            };
        }

        if (sort === "rating") {
            sortOption = {
                "rating.average": -1
            };
        }

        const [products, totalProducts] =
            await Promise.all([
                Product.find(filter)
                    .populate(
                        "category",
                        "name slug"
                    )
                    .populate(
                        "subcategory",
                        "name slug"
                    )
                    .populate(
                        "store",
                        "name slug"
                    )
                    .sort(sortOption)
                    .skip(skip)
                    .limit(limitNumber)
                    .lean(),

                Product.countDocuments(filter)
            ]);

        const totalPages = Math.ceil(
            totalProducts / limitNumber
        );

        return res.status(200).json({
            success: true,
            products,
            pagination: {
                currentPage: pageNumber,
                limit: limitNumber,
                totalProducts,
                totalPages,
                hasNextPage:
                    pageNumber < totalPages,
                hasPreviousPage:
                    pageNumber > 1
            }
        });
    } catch (error) {
        console.error(
            "Get all products error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Could not get products"
        });
    }
};

export const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        if (!slug?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Product slug is required"
            });
        }

        const product = await Product.findOne({
            slug: slug.trim().toLowerCase(),
            isActive: true
        })
            .populate(
                "category",
                "name slug"
            )
            .populate(
                "subcategory",
                "name slug"
            )
            .populate(
                "store",
                "name slug"
            )
            .populate(
                "seller",
                "fullName profileImage"
            );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        product.viewCount += 1;

        await product.save();

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.error(
            "Get product by slug error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Could not get product"
        });
    }
};

export const getBestSellingProducts = async (
    req,
    res
) => {
    try {
        const limit = Math.min(
            Math.max(Number(req.query.limit) || 10, 1),
            50
        );

        const products = await Product.find({
            isActive: true
        })
            .populate(
                "category",
                "name slug"
            )
            .populate(
                "subcategory",
                "name slug"
            )
            .populate(
                "store",
                "name slug"
            )
            .sort({
                totalSold: -1
            })
            .limit(limit)
            .lean();

        return res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        console.error(
            "Get best selling products error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not get best selling products"
        });
    }
};