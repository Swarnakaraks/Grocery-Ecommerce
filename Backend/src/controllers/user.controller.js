import { User } from "../models/user.model.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.util.js";

export const getMyProfile = async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select("-password");
        
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });
    }

    catch(error){
        console.error("Get profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch profile"
        })
    }
}


export const updateMyProfile = async(req, res) => {
    try{
        const {fullName} = req.body;

        const user = await User.findById(req.user.id);

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if(fullName !== undefined){
            user.fullName = fullName;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                isEmailVerified: user.isEmailVerified,
                isActive: user.isActive,
                isBlocked: user.isBlocked,
                lastLoginAt: user.lastLoginAt
            }
        });
    }

    catch(error){
        console.error("Update profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not update profile"
        });
    }
}

export const uploadMyProfilePicture = async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).json({
                success: false,
                message: "Profile picture is required"
            })
        }

        const user = await User.findById(req.user.id);

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }


        const oldPublicId = user.profilePicture?.publicId;

        const result = await uploadToCloudinary(
            req.file.buffer,
            "freshmart/profile-pictures"
        );

        if(oldPublicId){
            try{
                await deleteFromCloudinary(oldPublicId);
            }

            catch(error){
                console.error("Old profile picture deletion error:", error)
            }
        }

        user.profilePicture = {
            url: result.secure_url,
            publicId: result.public_id
        };

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile picture uploaded successfully",
            profilePicture: user.profilePicture
        })
    }

    catch(error){
        console.error("Upload profile picture error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not upload profile picture"
        });
    }
}

export const deleteMyProfilePicture = async (req, res) => {
    try{
        const user = await User.findById(req.user.id);

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        if(!user.profilePicture?.publicId){
            return res.status(404).json({
                success: false,
                message: "Profile picture not found"
            })
        }

        await deleteFromCloudinary(user.profilePicture.publicId);

        user.profilePicture = {
            url: null,
            publicId: null
        };

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile picture deleted successfully",
            profilePicture: user.profilePicture
        })
    }

    catch(error){
        console.error("Delete profile picture error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not delete profile picture"
        })
    }
}


