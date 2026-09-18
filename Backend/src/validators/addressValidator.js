import { body } from "express-validator";

const phoneRegex = /^(?:\+977[-\s]?)?(?:98|97)\d{8}$/;

// create address
export const createAddressValidator = [
    body("fullName")
        .trim()
        .isString()
        .withMessage("Full name must be a string")
        .isLength({ min: 2, max: 50 })
        .withMessage("Full name must be between 2 and 50 characters"),

    body("phone")
        .trim()
        .matches(phoneRegex)
        .withMessage("Enter a valid Nepal phone number"),

    body("addressLine")
        .trim()
        .isString()
        .withMessage("Address must be a string")
        .isLength({ min: 3, max: 200 })
        .withMessage("Address must be between 3 and 200 characters"),

    body("city")
        .trim()
        .isString()
        .withMessage("City must be a string")
        .isLength({ min: 2, max: 50 })
        .withMessage("City must be between 2 and 50 characters"),

    body("district")
        .trim()
        .isString()
        .withMessage("District must be a string")
        .isLength({ min: 2, max: 50 })
        .withMessage("District must be between 2 and 50 characters"),

    body("province")
        .trim()
        .isString()
        .withMessage("Province must be a string")
        .isLength({ min: 2, max: 50 })
        .withMessage("Province must be between 2 and 50 characters"),

    body("postalCode")
        .optional({ nullable: true })
        .trim()
        .isString()
        .withMessage("Postal code must be a string")
        .isLength({ max: 20 })
        .withMessage("Postal code cannot exceed 20 characters"),

    body("landmark")
        .optional({ nullable: true })
        .trim()
        .isString()
        .withMessage("Landmark must be a string")
        .isLength({ max: 100 })
        .withMessage("Landmark cannot exceed 100 characters"),

    body("isDefault")
        .optional()
        .isBoolean()
        .withMessage("isDefault must be a boolean")
];

// update address
export const updateAddressValidator = [
    body("fullName")
        .optional()
        .trim()
        .isString()
        .withMessage("Full name must be a string")
        .isLength({ min: 2, max: 50 })
        .withMessage("Full name must be between 2 and 50 characters"),

    body("phone")
        .optional()
        .trim()
        .matches(phoneRegex)
        .withMessage("Enter a valid Nepal phone number"),

    body("addressLine")
        .optional()
        .trim()
        .isString()
        .withMessage("Address must be a string")
        .isLength({ min: 3, max: 200 })
        .withMessage("Address must be between 3 and 200 characters"),

    body("city")
        .optional()
        .trim()
        .isString()
        .withMessage("City must be a string")
        .isLength({ min: 2, max: 50 })
        .withMessage("City must be between 2 and 50 characters"),

    body("district")
        .optional()
        .trim()
        .isString()
        .withMessage("District must be a string")
        .isLength({ min: 2, max: 50 })
        .withMessage("District must be between 2 and 50 characters"),

    body("province")
        .optional()
        .trim()
        .isString()
        .withMessage("Province must be a string")
        .isLength({ min: 2, max: 50 })
        .withMessage("Province must be between 2 and 50 characters"),

    body("postalCode")
        .optional({ nullable: true })
        .trim()
        .isString()
        .withMessage("Postal code must be a string")
        .isLength({ max: 20 })
        .withMessage("Postal code cannot exceed 20 characters"),

    body("landmark")
        .optional({ nullable: true })
        .trim()
        .isString()
        .withMessage("Landmark must be a string")
        .isLength({ max: 100 })
        .withMessage("Landmark cannot exceed 100 characters"),

    body("isDefault")
        .optional()
        .isBoolean()
        .withMessage("isDefault must be a boolean")
];