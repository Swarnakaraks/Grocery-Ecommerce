import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    const allowedExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    ];

    if (allowedExtensions.includes(extension)) {
        console.log("Image accepted:", extension);
        cb(null, true);
    } else {
        console.log("Image rejected:", extension);
        cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed"), false);
    }
};

export const uploadProfilePicture = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter
});

export const uploadProductImageFiles = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 6
    },
    fileFilter
});

export const uploadCategoryImage = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 6
    },
    fileFilter
});

export const uploadPaymentProof = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter
});

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter
});