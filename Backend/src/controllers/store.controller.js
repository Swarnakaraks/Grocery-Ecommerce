import { Store } from "../models/store.model.js";
import { User } from "../models/user.model.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.util.js";
import mongoose from "mongoose";

export const createStore = async (req, res) => {
    try {
        const {
            storeName,
            storeDescription,
            address,
            phone
        } = req.body;

        if (!storeName) {
            return res.status(400).json({
                success: false,
                message: "Store name is required"
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role !== "seller") {
            return res.status(403).json({
                success: false,
                message: "Only sellers can create a store"
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

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email first"
            });
        }

        const existingStore = await Store.findOne({
            seller: user._id
        });

        if (existingStore) {
            return res.status(409).json({
                success: false,
                message: "You already have a store"
            });
        }

        const store = await Store.create({
            seller: user._id,
            storeName,
            storeDescription: storeDescription || null,
            address: address || null,
            phone: phone || null
        });

        return res.status(201).json({
            success: true,
            message: "Store created successfully",
            store
        });
    } catch (error) {
        console.error("Create store error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not create store"
        });
    }
};

export const getMyStore = async (req, res) => {
    try {
        const store = await Store.findOne({
            seller: req.user.id
        }).populate(
            "seller",
            "fullName email profileImage"
        );

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        return res.status(200).json({
            success: true,
            store
        });
    } catch (error) {
        console.error("Get my store error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch your store"
        });
    }
};


export const updateMyStore = async (req, res) => {
    try {
        const {
            storeName,
            storeDescription,
            address,
            phone
        } = req.body;

        const store = await Store.findOne({
            seller: req.user.id
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        if (storeName !== undefined) {
            store.storeName = storeName;
        }

        if (storeDescription !== undefined) {
            store.storeDescription = storeDescription;
        }

        if (address !== undefined) {
            store.address = address;
        }

        if (phone !== undefined) {
            store.phone = phone;
        }

        await store.save();

        return res.status(200).json({
            success: true,
            message: "Store updated successfully",
            store
        });
    } catch (error) {
        console.error("Update my store error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not update your store"
        });
    }
};

export const uploadStoreLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Store logo is required"
            });
        }

        const store = await Store.findOne({
            seller: req.user.id
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        const result = await uploadToCloudinary(
            req.file.buffer,
            "freshmart/stores/logos"
        );

        if (store.logo?.publicId) {
            await deleteFromCloudinary(store.logo.publicId);
        }

        store.logo = {
            url: result.secure_url,
            publicId: result.public_id
        };

        await store.save();

        return res.status(200).json({
            success: true,
            message: "Store logo uploaded successfully",
            logo: store.logo
        });
    } catch (error) {
        console.error("Upload store logo error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not upload store logo"
        });
    }
};

export const uploadStoreBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Store banner is required"
            });
        }

        const store = await Store.findOne({
            seller: req.user.id
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        const result = await uploadToCloudinary(
            req.file.buffer,
            "freshmart/stores/banners"
        );

        if (store.banner?.publicId) {
            await deleteFromCloudinary(store.banner.publicId);
        }

        store.banner = {
            url: result.secure_url,
            publicId: result.public_id
        };

        await store.save();

        return res.status(200).json({
            success: true,
            message: "Store banner uploaded successfully",
            banner: store.banner
        });
    } catch (error) {
        console.error("Upload store banner error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not upload store banner"
        });
    }
};

export const getStoreById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
        success: false,
        message: "Invalid store ID"
    });
}

        const store = await Store.findOne({
            _id: id,
            isActive: true
        })
            .populate(
                "seller",
                "fullName profileImage"
            )
            .select(
                "seller storeName storeDescription logo banner address phone followers rating isActive createdAt"
            );

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        return res.status(200).json({
            success: true,
            store: {
                id: store._id,
                seller: store.seller,
                storeName: store.storeName,
                storeDescription: store.storeDescription,
                logo: store.logo,
                banner: store.banner,
                address: store.address,
                phone: store.phone,
                followerCount: store.followers.length,
                rating: store.rating,
                isActive: store.isActive,
                createdAt: store.createdAt
            }
        });
    } catch (error) {
        console.error("Get store by id error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch store"
        });
    }
};

export const followStore = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID"
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
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

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email first"
            });
        }

        const store = await Store.findOne({
            _id: id,
            isActive: true
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        if (store.seller.toString() === user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot follow your own store"
            });
        }

        const alreadyFollowing = store.followers.some(
            (followerId) =>
                followerId.toString() === user._id.toString()
        );

        if (alreadyFollowing) {
            return res.status(409).json({
                success: false,
                message: "You are already following this store"
            });
        }

        store.followers.push(user._id);

        await store.save();

        return res.status(200).json({
            success: true,
            message: "Store followed successfully",
            isFollowing: true,
            followerCount: store.followers.length
        });
    } catch (error) {
        console.error("Follow store error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not follow store"
        });
    }
};

export const unfollowStore = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID"
            });
        }

        const store = await Store.findOne({
            _id: id,
            isActive: true
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        const followerIndex = store.followers.findIndex(
            (followerId) =>
                followerId.toString() === req.user.id.toString()
        );

        if (followerIndex === -1) {
            return res.status(409).json({
                success: false,
                message: "You are not following this store"
            });
        }

        store.followers.splice(followerIndex, 1);

        await store.save();

        return res.status(200).json({
            success: true,
            message: "Store unfollowed successfully",
            isFollowing: false,
            followerCount: store.followers.length
        });
    } catch (error) {
        console.error("Unfollow store error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not unfollow store"
        });
    }
};