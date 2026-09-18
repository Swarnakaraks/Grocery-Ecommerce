import mongoose from "mongoose";
import { Address } from "../models/address.model.js";

// create address
export const createAddress = async (req, res) => {
    try {
        const {
            fullName,
            phone,
            addressLine,
            city,
            district,
            province,
            postalCode,
            landmark,
            isDefault
        } = req.body;

        const addressCount = await Address.countDocuments({ buyer: req.user.id });
        const shouldBeDefault = addressCount === 0 || isDefault === true;

        if (shouldBeDefault) {
            await Address.updateMany(
                { buyer: req.user.id, isDefault: true },
                { $set: { isDefault: false } }
            );
        }

        const address = await Address.create({
            buyer: req.user.id,
            fullName,
            phone,
            addressLine,
            city,
            district,
            province,
            postalCode: postalCode || null,
            landmark: landmark || null,
            isDefault: shouldBeDefault
        });

        return res.status(201).json({
            success: true,
            message: "Address created successfully",
            address
        });
    } catch (error) {
        console.error("Create address error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not create address"
        });
    }
};

// get my addresses
export const getMyAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ buyer: req.user.id }).sort({
            isDefault: -1,
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            count: addresses.length,
            addresses
        });
    } catch (error) {
        console.error("Get addresses error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch addresses"
        });
    }
};

// get address by id
export const getAddressById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID"
            });
        }

        const address = await Address.findOne({
            _id: id,
            buyer: req.user.id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        return res.status(200).json({
            success: true,
            address
        });
    } catch (error) {
        console.error("Get address error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch address"
        });
    }
};

// update address
export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID"
            });
        }

        const address = await Address.findOne({
            _id: id,
            buyer: req.user.id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        const {
            fullName,
            phone,
            addressLine,
            city,
            district,
            province,
            postalCode,
            landmark,
            isDefault
        } = req.body;

        if (isDefault === true) {
            await Address.updateMany(
                {
                    buyer: req.user.id,
                    _id: { $ne: address._id },
                    isDefault: true
                },
                { $set: { isDefault: false } }
            );

            address.isDefault = true;
        }

        if (fullName !== undefined) address.fullName = fullName;
        if (phone !== undefined) address.phone = phone;
        if (addressLine !== undefined) address.addressLine = addressLine;
        if (city !== undefined) address.city = city;
        if (district !== undefined) address.district = district;
        if (province !== undefined) address.province = province;
        if (postalCode !== undefined) address.postalCode = postalCode;
        if (landmark !== undefined) address.landmark = landmark;

        if (isDefault === false && address.isDefault) {
            const anotherAddress = await Address.findOne({
                buyer: req.user.id,
                _id: { $ne: address._id }
            }).sort({ createdAt: -1 });

            address.isDefault = false;

            if (anotherAddress) {
                anotherAddress.isDefault = true;
                await anotherAddress.save();
            }
        }

        await address.save();

        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            address
        });
    } catch (error) {
        console.error("Update address error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not update address"
        });
    }
};

// delete address
export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID"
            });
        }

        const address = await Address.findOne({
            _id: id,
            buyer: req.user.id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        const wasDefault = address.isDefault;

        await Address.deleteOne({ _id: address._id });

        if (wasDefault) {
            const anotherAddress = await Address.findOne({
                buyer: req.user.id
            }).sort({ createdAt: -1 });

            if (anotherAddress) {
                anotherAddress.isDefault = true;
                await anotherAddress.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        });
    } catch (error) {
        console.error("Delete address error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not delete address"
        });
    }
};