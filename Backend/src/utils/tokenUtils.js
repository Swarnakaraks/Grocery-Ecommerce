import crypto from "crypto";
import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: "1d",
        }
    )
}

export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            userId: user._id.toString(),
        },
        process.env.JWT_REFRESH_SECRET,

        {
            expiresIn: "7d"
        }


    )
}

export const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex")
};