import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import crypto from "crypto";
import { Session } from "../models/session.model.js";
import { generateAccessToken, generateRefreshToken, hashToken } from "../utils/tokenUtils.js";
import { PasswordReset } from "../models/passwordResetModel.js";
import { sendOtpEmail, sendVerificationEmail } from "../utils/mailer.js";
import { EmailVerification} from "../models/emailVerification.model.js";

export const registerUser = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "FullName, email, password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        // Generate verification token
        const verificationToken = crypto
            .randomBytes(32)
            .toString("hex");

        const verificationTokenHash = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        // Save verification token
        await EmailVerification.create({
            user: user._id,
            tokenHash: verificationTokenHash,
            expiresAt: new Date(
                Date.now() + 24 * 60 * 60 * 1000
            )
        });

        const verificationUrl =
            `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

        // Send response immediately
        res.status(201).json({
            success: true,
            message:
                "Registration successful. Please check your email to verify your account.",
            data: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                isEmailVerified: user.isEmailVerified
            }
        });

        // Send email after response
        sendVerificationEmail(
            user.email,
            user.fullName,
            verificationUrl
        ).catch((error) => {
            console.error(
                "Verification email sending error:",
                error
            );
        });

    } catch (error) {
        console.error("Register error:", error);

        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message:
                    "Something went wrong while creating the account"
            });
        }
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email and password"
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email and password"
            });
        }

        // Check email verification
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in"
            });
        }

        user.lastLoginAt = new Date();
        await user.save();

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        const refreshTokenHash = hashToken(refreshToken);

        const session = await Session.create({
            user: user._id,
            refreshTokenHash,
            userAgent: req.get("user-agent") || null,
            ipAddress: req.ip,
            expiredAt: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            )
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "Login successfully",
            accessToken,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                isEmailVerified: user.isEmailVerified,
                lastLoginAt: user.lastLoginAt
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};



export const refreshAccessToken = async (req, res) => {
    try{
        const refreshToken = req.cookies.refreshToken;

        if(!refreshToken){
            return res.status(401).json({
                success: false,
                message: "No active session found"
            })
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        )

        const refreshTokenHash = hashToken(refreshToken);

        const session = await Session.findOne({
            user: decoded.userId,
            refreshTokenHash,
            isRevoked: false,
            expiredAt: { $gt: new Date()}
        })

        if (!session){
            return res.status(401).json({
                success: false,
                message: "Invalid or expired session"
            })
        }

        const user = await User.findById(decoded.userId);

        if(!user){
            return res.status(401).json({
                success: false,
                message: "User no longer exists"
            })
        }

        if(user.isBlocked){
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked"
            })
        }

        if(!user.isActive){
            return res.status(403).json({
                success: false,
                message: "Your account is inactive"
            })
        }

        const accessToken = generateAccessToken(user);

        return res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            accessToken
        })
    }

    catch(error){
        if(
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError"
        ){
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token"
            })

            console.error("Refresh token error:" , error)

            return res.status(500).json({
                success: false,
                message: "Could not refresh access token"
            })
        }
    }
}

export const logoutUser = async (req, res) => {
    try{
        const refreshToken = req.cookies.refreshToken;

        if(refreshToken){
            const refreshTokenHash = hashToken(refreshToken);
            await Session.findOneAndUpdate(
                {
                    refreshTokenHash,
                    isRevoked: false
                },

                {
                    isRevoked: true,
                    revokedAt: new Date()
                }
            )
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        })
    }

    catch(error){
        console.error("Logout error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not logout"
        })
    }
}

export const forgotPassword = async (req, res) => {
    try{
        const {email} = req.body;

        if(!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({email});

       if(!user){
        return res.status(200).json({
            success: true,
            message: "If an account exists with this email, a password reset OTP has been sent",
        });
       }

       if(user.isBlocked){
        return res.status(200).json({
            success: true,
            message: "If an account exists with this email, an OTP has been sent"
        })
       }

        if(!user.isActive){
        return res.status(200).json({
            success: true,
            message: "If an account exists with this email, an OTP has been sent"
        })
       }

       //prevent requesting otp repeatedly
       const recentReset = await PasswordReset.findOne({
        user: user._id,
        createdAt: {
            $gt: new Date(Date.now() - 60 * 1000)
        }
       })

       if(recentReset){
        return res.status(429).json({
            success: false,
            message: "Please wait 60 seconds before requesting another OTP"
        })
       }

       //invalidate previous unused reset records
       await PasswordReset.updateMany(
        {
            user: user._id,
            isUsed: false
        },
        {
            $set: {
                isUsed: true
            }
        }
       );

     //generate a 6 digit otp
     const otp = Math.floor(100000 + Math.random() * 900000).toString();

     //hash otp before storing it 
        const otpHash = crypto
       .createHash("sha256")
       .update(otp)
       .digest("hex");
       
       await PasswordReset.create({
           user: user._id,
           otpHash,
           attempts: 0,
           isVerified: false,
           isUsed: false,
           expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        //send otp through nodemailer
        await sendOtpEmail(user.email, otp);

        return res.status(200).json({
            success: true,
            message: "If an account exists with this email, a password reset OTP has been sent"
        });


    }

    catch(error){
        console.error("Forgot password error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not process password reset request"
        });
    }
}

export const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const user = await User.findOne({email});

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        const passwordReset = await PasswordReset.findOne({
            user: user._id,
            isUsed: false,
            isVerified: false,
            expiresAt: {
                $gt: new Date()
            }
        }).sort({
            createdAt: -1
        });

        if (!passwordReset) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        if (passwordReset.attempts >= 5) {
            return res.status(429).json({
                success: false,
                message: "Too many incorrect OTP attempts. Please request a new OTP"
            });
        }

        const otpHash = crypto
            .createHash("sha256")
            .update(otp.toString())
            .digest("hex");

        if (otpHash !== passwordReset.otpHash) {
            passwordReset.attempts += 1;

            if (passwordReset.attempts >= 5) {
                passwordReset.isUsed = true;
            }

            await passwordReset.save();

            if (passwordReset.attempts >= 5) {
                return res.status(429).json({
                    success: false,
                    message: "Too many incorrect OTP attempts. Please request a new OTP"
                });
            }

            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
                attemptsRemaining: 5 - passwordReset.attempts
            });
        }

        const resetToken = crypto
            .randomBytes(32)
            .toString("hex");

        const resetTokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        passwordReset.isVerified = true;
        passwordReset.verifiedAt = new Date();
        passwordReset.resetTokenHash = resetTokenHash;
        passwordReset.resetTokenExpiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        await passwordReset.save();

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            resetToken
        });
    } catch (error) {
        console.error("Verify OTP error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not verify OTP"
        });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const {
            resetToken,
            newPassword,
            confirmPassword
        } = req.body;

        if (!resetToken || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Reset token, new password and confirm password are required"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            });
        }

        const resetTokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        const passwordReset = await PasswordReset.findOne({
            resetTokenHash,
            isVerified: true,
            isUsed: false,
            resetTokenExpiresAt: {
                $gt: new Date()
            }
        });

        if (!passwordReset) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        const user = await User.findById(passwordReset.user);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Unable to reset password"
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive"
            });
        }

        user.password = await bcrypt.hash(newPassword, 12);

        await user.save();

        // Revoke all existing login sessions
        await Session.updateMany(
            {
                user: user._id,
                isRevoked: false
            },
            {
                $set: {
                    isRevoked: true,
                    revokedAt: new Date()
                }
            }
        );

        // Mark password reset request as used
        passwordReset.isUsed = true;

        await passwordReset.save();

        // Clear refresh token cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. Please login with your new password."
        });
    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not reset password"
        });
    }
};

export const changePassword = async (req, res) => {
    try{
        const {currentPassword, newPassword, confirmPassword} = req.body;

        if(!currentPassword || !newPassword || !confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Current password, new password and confirm password are required"
            })
        }

        if(newPassword != confirmPassword){
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match"
            })
        }

        if(currentPassword === newPassword){
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password"
            })
        }

        const user = await User.findById(req.user.id).select("+password");

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        if(user.isBlocked){
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked"
            })
        }

        if(!user.isActive){
            return res.status(403).json({
                success: false,
                message: "Your account is inactive"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(
            currentPassword,
            user.password
        )

        if(!isPasswordCorrect){
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            })
        }

        user.password = await bcrypt.hash(newPassword, 12);

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })
    }

    catch(error){
        console.error("Change password error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not change password"
        })
    }
}


export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Verification token is required"
            });
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const emailVerification = await EmailVerification.findOne({
            tokenHash,
            isUsed: false,
            expiresAt: {
                $gt: new Date()
            }
        });

        if (!emailVerification) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification link"
            });
        }

        const user = await User.findById(emailVerification.user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        user.isEmailVerified = true;

        await user.save();

        emailVerification.isUsed = true;
        emailVerification.verifiedAt = new Date();

        await emailVerification.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });
    } catch (error) {
        console.error("Verify email error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not verify email"
        });
    }
};


export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        await EmailVerification.updateMany(
            {
                user: user._id,
                isUsed: false
            },
            {
                isUsed: true
            }
        );

        const verificationToken = crypto
            .randomBytes(32)
            .toString("hex");

        const verificationTokenHash = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        await EmailVerification.create({
            user: user._id,
            tokenHash: verificationTokenHash,
            expiresAt: new Date(
                Date.now() + 24 * 60 * 60 * 1000
            )
        });

        const verificationUrl =
            `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

        await sendVerificationEmail(
            user.email,
            user.fullName,
            verificationUrl
        );

        return res.status(200).json({
            success: true,
            message: "Verification email sent successfully"
        });
    } catch (error) {
        console.error("Resend verification email error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not resend verification email"
        });
    }
};