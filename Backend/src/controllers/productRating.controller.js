import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { ProductRating } from "../models/productRating.model.js";
import { User } from "../models/user.model.js";

export const createOrUpdateProductRating = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (rating === undefined) {
            return res.status(400).json({
                success: false,
                message: "Rating is required"
            });
        }

        const numericRating = Number(rating);

        if (
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5"
            });
        }

        const buyer = await User.findById(req.user.id);

        if (!buyer) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

       if (buyer.role !== "buyer") {
    return res.status(403).json({
        success: false,
        message: "Only buyers can rate products"
    });
}

/* --------------------------------
   VERIFY PURCHASE
-------------------------------- */

const deliveredOrder = await Order.findOne({
    buyer: req.user.id,
    status: "delivered",
    "items.product": productId,
});

if (!deliveredOrder) {
    return res.status(403).json({
        success: false,
        message:
            "You can rate this product only after purchasing and receiving it",
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

        const existingRating = await ProductRating.findOne({
            product: productId,
            buyer: req.user.id
        });

        if (existingRating) {
            existingRating.rating = numericRating;

            await existingRating.save();
        } else {
            await ProductRating.create({
                product: productId,
                buyer: req.user.id,
                rating: numericRating
            });
        }

        const ratingStats = await ProductRating.aggregate([
            {
                $match: {
                    product: new mongoose.Types.ObjectId(productId)
                }
            },
            {
                $group: {
                    _id: "$product",
                    averageRating: {
                        $avg: "$rating"
                    },
                    ratingCount: {
                        $sum: 1
                    }
                }
            }
        ]);

        const averageRating = ratingStats.length > 0
            ? Number(ratingStats[0].averageRating.toFixed(1))
            : 0;

        const ratingCount = ratingStats.length > 0
            ? ratingStats[0].ratingCount
            : 0;

        product.rating.average = averageRating;
        product.rating.count = ratingCount;
        product.totalReviews = ratingCount;

        await product.save();

        return res.status(200).json({
            success: true,
            message: existingRating
                ? "Product rating updated successfully"
                : "Product rated successfully",
            rating: {
                value: numericRating,
                average: averageRating,
                count: ratingCount
            }
        });
    } catch (error) {
        console.error("Create or update product rating error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not save product rating"
        });
    }
};

export const getProductRatings = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
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

        const ratings = await ProductRating.find({
            product: productId
        })
            .populate("buyer", "fullName profilePicture")
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            rating: {
                average: product.rating.average,
                count: product.rating.count
            },
            ratings
        });
    } catch (error) {
        console.error("Get product ratings error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch product ratings"
        });
    }
};

export const getMyProductRating = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const rating = await ProductRating.findOne({
            product: productId,
            buyer: req.user.id
        });

        return res.status(200).json({
            success: true,
            rating: rating
                ? {
                    id: rating._id,
                    value: rating.rating,
                    createdAt: rating.createdAt,
                    updatedAt: rating.updatedAt
                }
                : null
        });
    } catch (error) {
        console.error("Get my product rating error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch your product rating"
        });
    }
};

export const deleteMyProductRating = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const rating = await ProductRating.findOne({
            product: productId,
            buyer: req.user.id
        });

        if (!rating) {
            return res.status(404).json({
                success: false,
                message: "You have not rated this product"
            });
        }

        await ProductRating.deleteOne({
            _id: rating._id
        });

        const ratingStats = await ProductRating.aggregate([
            {
                $match: {
                    product: new mongoose.Types.ObjectId(productId)
                }
            },
            {
                $group: {
                    _id: "$product",
                    averageRating: {
                        $avg: "$rating"
                    },
                    ratingCount: {
                        $sum: 1
                    }
                }
            }
        ]);

        const averageRating = ratingStats.length > 0
            ? Number(ratingStats[0].averageRating.toFixed(1))
            : 0;

        const ratingCount = ratingStats.length > 0
            ? ratingStats[0].ratingCount
            : 0;

        await Product.findByIdAndUpdate(
            productId,
            {
                "rating.average": averageRating,
                "rating.count": ratingCount,
                totalReviews: ratingCount
            }
        );

        return res.status(200).json({
            success: true,
            message: "Product rating deleted successfully",
            rating: {
                average: averageRating,
                count: ratingCount
            }
        });
    } catch (error) {
        console.error("Delete product rating error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not delete product rating"
        });
    }
};


export const getProductRatingSummary = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findOne({
            _id: productId,
            isActive: true
        }).select("rating totalReviews");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const distribution =
            await ProductRating.aggregate([
                {
                    $match: {
                        product:
                            new mongoose.Types.ObjectId(
                                productId
                            )
                    }
                },
                {
                    $group: {
                        _id: "$rating",
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        _id: -1
                    }
                }
            ]);

        const ratingDistribution = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
        };

        distribution.forEach((item) => {
            ratingDistribution[item._id] =
                item.count;
        });

        return res.status(200).json({
            success: true,
            summary: {
                average: product.rating.average,
                count: product.rating.count,
                totalReviews: product.totalReviews,
                distribution: ratingDistribution
            }
        });
    } catch (error) {
        console.error(
            "Get product rating summary error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not fetch rating summary"
        });
    }
};

