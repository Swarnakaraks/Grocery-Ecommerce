import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { ProductComment } from "../models/productComment.model.js";
import { User } from "../models/user.model.js";
import { ProductCommentReaction } from "../models/productCommentReaction.model.js";

export const createProductComment = async (
    req,
    res
) => {
    try {
        const { productId } = req.params;
        const { comment } = req.body;

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

        if (
            !comment ||
            !comment.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Comment is required"
            });
        }

        const buyer = await User.findById(
            req.user.id
        );

        if (!buyer) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (buyer.role !== "buyer") {
            return res.status(403).json({
                success: false,
                message:
                    "Only buyers can comment on products"
            });
        }

        const product =
            await Product.findOne({
                _id: productId,
                isActive: true
            });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const newComment =
            await ProductComment.create({
                product: productId,
                buyer: req.user.id,
                comment: comment.trim()
            });

        await newComment.populate(
            "buyer",
            "fullName profileImage"
        );

        return res.status(201).json({
            success: true,
            message:
                "Comment added successfully",
            comment: newComment
        });
    } catch (error) {
        console.error(
            "Create product comment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not create comment"
        });
    }
};

export const getProductComments = async (
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

        const product =
            await Product.findOne({
                _id: productId,
                isActive: true
            });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const page = Math.max(
            Number(req.query.page) || 1,
            1
        );

        const limit = Math.min(
            Math.max(
                Number(req.query.limit) || 10,
                1
            ),
            50
        );

        const skip =
            (page - 1) * limit;

        const [
            comments,
            totalComments
        ] = await Promise.all([
            ProductComment.find({
                product: productId
            })
                .populate(
                    "buyer",
                    "fullName profileImage"
                )
                .sort({
                    createdAt: -1
                })
                .skip(skip)
                .limit(limit)
                .lean(),

            ProductComment.countDocuments({
                product: productId
            })
        ]);

        return res.status(200).json({
            success: true,
            comments,
            pagination: {
                page,
                limit,
                totalComments,
                totalPages:
                    Math.ceil(
                        totalComments /
                            limit
                    )
            }
        });
    } catch (error) {
        console.error(
            "Get product comments error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not fetch product comments"
        });
    }
};

export const updateProductComment = async (
    req,
    res
) => {
    try {
        const {
            productId,
            commentId
        } = req.params;

        const { comment } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(
                productId
            ) ||
            !mongoose.Types.ObjectId.isValid(
                commentId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid product or comment ID"
            });
        }

        if (
            !comment ||
            !comment.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Comment is required"
            });
        }

        const existingComment =
            await ProductComment.findOne({
                _id: commentId,
                product: productId,
                buyer: req.user.id
            });

        if (!existingComment) {
            return res.status(404).json({
                success: false,
                message:
                    "Comment not found or you are not allowed to edit it"
            });
        }

        existingComment.comment =
            comment.trim();

        await existingComment.save();

        await existingComment.populate(
            "buyer",
            "fullName profileImage"
        );

        return res.status(200).json({
            success: true,
            message:
                "Comment updated successfully",
            comment: existingComment
        });
    } catch (error) {
        console.error(
            "Update product comment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not update comment"
        });
    }
};

export const deleteProductComment = async (
    req,
    res
) => {
    try {
        const {
            productId,
            commentId
        } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                productId
            ) ||
            !mongoose.Types.ObjectId.isValid(
                commentId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid product or comment ID"
            });
        }

        const comment =
            await ProductComment.findOne({
                _id: commentId,
                product: productId,
                buyer: req.user.id
            });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message:
                    "Comment not found or you are not allowed to delete it"
            });
        }

        await ProductComment.deleteOne({
            _id: commentId
        });

        return res.status(200).json({
            success: true,
            message:
                "Comment deleted successfully"
        });
    } catch (error) {
        console.error(
            "Delete product comment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not delete comment"
        });
    }
};

export const reactToProductComment = async (
    req,
    res
) => {
    try {
        const {
            productId,
            commentId
        } = req.params;

        const { reaction } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(
                productId
            ) ||
            !mongoose.Types.ObjectId.isValid(
                commentId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid product or comment ID"
            });
        }

        const allowedReactions = [
            "like",
            "love",
            "helpful",
            "funny"
        ];

        if (
            !allowedReactions.includes(
                reaction
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid reaction"
            });
        }

        const buyer =
            await User.findById(
                req.user.id
            );

        if (!buyer) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        if (buyer.role !== "buyer") {
            return res.status(403).json({
                success: false,
                message:
                    "Only buyers can react to comments"
            });
        }

        const comment =
            await ProductComment.findOne({
                _id: commentId,
                product: productId
            });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message:
                    "Comment not found"
            });
        }

        const existingReaction =
            await ProductCommentReaction.findOne({
                comment: commentId,
                buyer: req.user.id
            });

        if (existingReaction) {
            if (
                existingReaction.reaction ===
                reaction
            ) {
                return res.status(200).json({
                    success: true,
                    message:
                        "Reaction already exists",
                    reaction: existingReaction.reaction,
                    reactions:
                        comment.reactions,
                    reactionCount:
                        comment.reactionCount
                });
            }

            const oldReaction =
                existingReaction.reaction;

            comment.reactions[
                oldReaction
            ] -= 1;

            comment.reactions[
                reaction
            ] += 1;

            existingReaction.reaction =
                reaction;

            await existingReaction.save();
        } else {
            await ProductCommentReaction.create({
                comment: commentId,
                buyer: req.user.id,
                reaction
            });

            comment.reactions[
                reaction
            ] += 1;

            comment.reactionCount += 1;
        }

        await comment.save();

        return res.status(200).json({
            success: true,
            message:
                "Reaction added successfully",
            reaction,
            reactions:
                comment.reactions,
            reactionCount:
                comment.reactionCount
        });
    } catch (error) {
        console.error(
            "React to product comment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not react to comment"
        });
    }
};


export const removeProductCommentReaction = async (req, res) => {
        try {
            const {
                productId,
                commentId
            } = req.params;

            if (
                !mongoose.Types.ObjectId.isValid(
                    productId
                ) ||
                !mongoose.Types.ObjectId.isValid(
                    commentId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid product or comment ID"
                });
            }

            const comment =
                await ProductComment.findOne({
                    _id: commentId,
                    product: productId
                });

            if (!comment) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Comment not found"
                });
            }

            const existingReaction =
                await ProductCommentReaction.findOne({
                    comment: commentId,
                    buyer: req.user.id
                });

            if (!existingReaction) {
                return res.status(404).json({
                    success: false,
                    message:
                        "You have not reacted to this comment"
                });
            }

            const reaction =
                existingReaction.reaction;

            await ProductCommentReaction.deleteOne({
                _id: existingReaction._id
            });

            if (
                comment.reactions[reaction] >
                0
            ) {
                comment.reactions[
                    reaction
                ] -= 1;
            }

            if (
                comment.reactionCount > 0
            ) {
                comment.reactionCount -= 1;
            }

            await comment.save();

            return res.status(200).json({
                success: true,
                message:
                    "Reaction removed successfully",
                reactions:
                    comment.reactions,
                reactionCount:
                    comment.reactionCount
            });
        } catch (error) {
            console.error(
                "Remove comment reaction error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not remove reaction"
            });
        }
};