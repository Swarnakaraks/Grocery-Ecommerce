import { body } from "express-validator";

// create order
export const createOrderValidator = [
    body("addressId")
        .trim()
        .notEmpty()
        .withMessage("Address ID is required"),

    body("paymentMethod")
        .isIn(["cod", "esewa"])
        .withMessage("Payment method must be cod or esewa")
];

// cancel order
export const cancelOrderValidator = [
    body("reason")
        .optional()
        .trim()
        .isLength({ min: 3, max: 500 })
        .withMessage(
            "Cancellation reason must be between 3 and 500 characters"
        )
];