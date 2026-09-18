import { body, param } from "express-validator";

export const createReviewValidator = [
    body("productId")
        .trim()
        .notEmpty()
        .withMessage("Product ID is required")
        .isMongoId()
        .withMessage("Invalid product ID"),

    body("orderId")
        .trim()
        .notEmpty()
        .withMessage("Order ID is required")
        .isMongoId()
        .withMessage("Invalid order ID"),

    body("rating")
        .notEmpty()
        .withMessage("Rating is required")
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be a whole number between 1 and 5"),

    body("comment")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 1000 })
        .withMessage(
            "Comment cannot exceed 1000 characters"
        )
];

export const updateReviewValidator = [
    param("reviewId")
        .isMongoId()
        .withMessage("Invalid review ID"),

    body("rating")
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage(
            "Rating must be a whole number between 1 and 5"
        ),

    body("comment")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 1000 })
        .withMessage(
            "Comment cannot exceed 1000 characters"
        )
];