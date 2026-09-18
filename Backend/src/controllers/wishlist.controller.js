import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { Wishlist } from "../models/wishlist.model.js";

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(
                productId
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findOne({
            _id: productId,
            isActive: true
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        let wishlist = await Wishlist.findOne({
            buyer: req.user.id
        });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                buyer: req.user.id,
                products: [productId]
            });

            await wishlist.populate({
                path: "products",
                select:
                    "name slug price discountPrice images stock unit brand rating"
            });

            return res.status(201).json({
                success: true,
                message:
                    "Product added to wishlist",
                wishlist
            });
        }

        const alreadyExists =
            wishlist.products.some(
                (id) =>
                    id.toString() === productId
            );

        if (alreadyExists) {
            return res.status(409).json({
                success: false,
                message:
                    "Product is already in your wishlist"
            });
        }

        wishlist.products.push(productId);

        await wishlist.save();

        await wishlist.populate({
            path: "products",
            select:
                "name slug price discountPrice images stock unit brand rating"
        });

        return res.status(200).json({
            success: true,
            message:
                "Product added to wishlist",
            wishlist
        });
    } catch (error) {
        console.error(
            "Add to wishlist error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not add product to wishlist"
        });
    }
};

export const getMyWishlist = async (
    req,
    res
) => {
    try {
        const wishlist = await Wishlist.findOne({
            buyer: req.user.id
        }).populate({
            path: "products",
            match: {
                isActive: true
            },
            select:
                "name slug price discountPrice images stock unit brand rating category store"
        });

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                count: 0,
                wishlist: {
                    products: []
                }
            });
        }

        return res.status(200).json({
            success: true,
            count: wishlist.products.length,
            wishlist
        });
    } catch (error) {
        console.error(
            "Get wishlist error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not fetch wishlist"
        });
    }
};

export const removeFromWishlist = async (
    req,
    res
) => {
    try {
        const { productId } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                productId
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const wishlist = await Wishlist.findOne({
            buyer: req.user.id
        });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found"
            });
        }

        const productExists =
            wishlist.products.some(
                (id) =>
                    id.toString() === productId
            );

        if (!productExists) {
            return res.status(404).json({
                success: false,
                message:
                    "Product is not in your wishlist"
            });
        }

        wishlist.products =
            wishlist.products.filter(
                (id) =>
                    id.toString() !== productId
            );

        await wishlist.save();

        return res.status(200).json({
            success: true,
            message:
                "Product removed from wishlist"
        });
    } catch (error) {
        console.error(
            "Remove from wishlist error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not remove product from wishlist"
        });
    }
};

export const clearWishlist = async (
    req,
    res
) => {
    try {
        const wishlist = await Wishlist.findOne({
            buyer: req.user.id
        });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found"
            });
        }

        wishlist.products = [];

        await wishlist.save();

        return res.status(200).json({
            success: true,
            message:
                "Wishlist cleared successfully"
        });
    } catch (error) {
        console.error(
            "Clear wishlist error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not clear wishlist"
        });
    }
};