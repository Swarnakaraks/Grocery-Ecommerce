import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

export const createReview = async (req, res) => {
    try {
        const { productId, orderId, rating, comment } =
            req.body;

        if (
            !mongoose.Types.ObjectId.isValid(productId) ||
            !mongoose.Types.ObjectId.isValid(orderId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID or order ID"
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            buyer: req.user.id,
            status: "delivered"
        });

        if (!order) {
            return res.status(400).json({
                success: false,
                message:
                    "You can review a product only from a delivered order"
            });
        }

        const orderItem = order.items.find(
            (item) =>
                item.product.toString() === productId
        );

        if (!orderItem) {
            return res.status(400).json({
                success: false,
                message:
                    "You did not purchase this product in this order"
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

        const existingReview = await Review.findOne({
            product: productId,
            buyer: req.user.id
        });

        if (existingReview) {
            return res.status(409).json({
                success: false,
                message:
                    "You have already reviewed this product"
            });
        }

        const review = await Review.create({
            product: productId,
            buyer: req.user.id,
            order: orderId,
            rating,
            comment: comment || null
        });

        const reviews = await Review.find({
            product: productId
        }).select("rating");

        const totalRating = reviews.reduce(
            (sum, review) => sum + review.rating,
            0
        );

        const averageRating =
            reviews.length > 0
                ? Number(
                      (
                          totalRating /
                          reviews.length
                      ).toFixed(2)
                  )
                : 0;

        await Product.findByIdAndUpdate(
            productId,
            {
                $set: {
                    "rating.average": averageRating,
                    "rating.count": reviews.length,
                    totalReviews: reviews.length
                }
            }
        );

        return res.status(201).json({
            success: true,
            message: "Review created successfully",
            review
        });
    } catch (error) {
        console.error(
            "Create review error:",
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "You have already reviewed this product"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Could not create review"
        });
    }
};

export const getProductReviews = async (
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

        const reviews = await Review.find({
            product: productId
        })
            .populate("buyer", "fullName profileImage")
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        console.error(
            "Get product reviews error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Could not fetch reviews"
        });
    }
};

export const getMyReview = async (
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

        const review = await Review.findOne({
            product: productId,
            buyer: req.user.id
        }).populate(
            "product",
            "name slug images rating"
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "You have not reviewed this product"
            });
        }

        return res.status(200).json({
            success: true,
            review
        });
    } catch (error) {
        console.error(
            "Get my review error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Could not fetch your review"
        });
    }
};

export const updateReview = async (
    req,
    res
) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(
                reviewId
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID"
            });
        }

        const review = await Review.findOne({
            _id: reviewId,
            buyer: req.user.id
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        if (rating !== undefined) {
            review.rating = rating;
        }

        if (comment !== undefined) {
            review.comment = comment || null;
        }

        await review.save();

        const reviews = await Review.find({
            product: review.product
        }).select("rating");

        const totalRating = reviews.reduce(
            (sum, item) => sum + item.rating,
            0
        );

        const averageRating =
            reviews.length > 0
                ? Number(
                      (
                          totalRating /
                          reviews.length
                      ).toFixed(2)
                  )
                : 0;

        await Product.findByIdAndUpdate(
            review.product,
            {
                $set: {
                    "rating.average": averageRating,
                    "rating.count": reviews.length,
                    totalReviews: reviews.length
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: "Review updated successfully",
            review
        });
    } catch (error) {
        console.error(
            "Update review error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Could not update review"
        });
    }
};

export const deleteReview = async (
    req,
    res
) => {
    try {
        const { reviewId } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                reviewId
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID"
            });
        }

        const review = await Review.findOne({
            _id: reviewId,
            buyer: req.user.id
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        const productId = review.product;

        await Review.findByIdAndDelete(
            reviewId
        );

        const reviews = await Review.find({
            product: productId
        }).select("rating");

        const totalRating = reviews.reduce(
            (sum, item) => sum + item.rating,
            0
        );

        const averageRating =
            reviews.length > 0
                ? Number(
                      (
                          totalRating /
                          reviews.length
                      ).toFixed(2)
                  )
                : 0;

        await Product.findByIdAndUpdate(
            productId,
            {
                $set: {
                    "rating.average": averageRating,
                    "rating.count": reviews.length,
                    totalReviews: reviews.length
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (error) {
        console.error(
            "Delete review error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Could not delete review"
        });
    }
};