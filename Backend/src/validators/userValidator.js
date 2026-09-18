import { body } from "express-validator";

export const updateProfileValidator = [
    body("fullName")
    .optional()
    .trim()
    .isLength({min: 3, max: 50})
    .withMessage("FullName must be at between 3 and 50 characters")
];