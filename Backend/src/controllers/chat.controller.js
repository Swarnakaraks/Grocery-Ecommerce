import mongoose from "mongoose";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { Product } from "../models/product.model.js";
import { Store } from "../models/store.model.js";
import { User } from "../models/user.model.js";

export const createConversation = async (req, res) => {
    try {
        const { sellerId, productId } = req.body;

        if (!sellerId) {
            return res.status(400).json({
                success: false,
                message: "Seller ID is required"
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(sellerId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid seller ID"
            });
        }

        if (
            productId &&
            !mongoose.Types.ObjectId.isValid(productId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const seller = await User.findOne({
            _id: sellerId,
            role: "seller",
            isActive: true,
            isBlocked: false
        });

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found"
            });
        }

        const store = await Store.findOne({
            seller: sellerId,
            isActive: true
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Seller store not found"
            });
        }

        if (productId) {
            const product = await Product.findOne({
                _id: productId,
                seller: sellerId,
                store: store._id,
                isActive: true
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Product does not belong to this seller"
                });
            }
        }

        let conversation =
            await Conversation.findOne({
                buyer: req.user.id,
                seller: sellerId
            })
                .populate(
                    "seller",
                    "fullName profileImage"
                )
                .populate(
                    "store",
                    "name logo"
                );

        if (conversation) {
            return res.status(200).json({
                success: true,
                message:
                    "Conversation already exists",
                conversation
            });
        }

        conversation = await Conversation.create({
            buyer: req.user.id,
            seller: sellerId,
            store: store._id
        });

        await conversation.populate([
            {
                path: "seller",
                select: "fullName profileImage"
            },
            {
                path: "store",
                select: "name logo"
            }
        ]);

        return res.status(201).json({
            success: true,
            message:
                "Conversation created successfully",
            conversation
        });
    } catch (error) {
        console.error(
            "Create conversation error:",
            error
        );

        if (error.code === 11000) {
            const conversation =
                await Conversation.findOne({
                    buyer: req.user.id,
                    seller: req.body.sellerId
                })
                    .populate(
                        "seller",
                        "fullName profileImage"
                    )
                    .populate(
                        "store",
                        "name logo"
                    );

            return res.status(200).json({
                success: true,
                message:
                    "Conversation already exists",
                conversation
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Could not create conversation"
        });
    }
};

export const getMyConversations = async (
    req,
    res
) => {
    try {
        const conversations =
            await Conversation.find({
                $or: [
                    {
                        buyer: req.user.id
                    },
                    {
                        seller: req.user.id
                    }
                ]
            })
                .populate(
                    "buyer",
                    "fullName profileImage"
                )
                .populate(
                    "seller",
                    "fullName profileImage"
                )
                .populate(
                    "store",
                    "name logo"
                )
                .sort({
                    lastMessageAt: -1,
                    updatedAt: -1
                });

        return res.status(200).json({
            success: true,
            count: conversations.length,
            conversations
        });
    } catch (error) {
        console.error(
            "Get conversations error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not fetch conversations"
        });
    }
};

export const getConversationMessages = async (
    req,
    res
) => {
    try {
        const { conversationId } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                conversationId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid conversation ID"
            });
        }

        const conversation =
            await Conversation.findOne({
                _id: conversationId,
                $or: [
                    {
                        buyer: req.user.id
                    },
                    {
                        seller: req.user.id
                    }
                ]
            });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        const messages = await Message.find({
            conversation: conversationId
        })
            .populate(
                "sender",
                "fullName profileImage role"
            )
            .populate(
                "receiver",
                "fullName profileImage role"
            )
            .sort({
                createdAt: 1
            });

        return res.status(200).json({
            success: true,
            count: messages.length,
            messages
        });
    } catch (error) {
        console.error(
            "Get conversation messages error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not fetch messages"
        });
    }
};

export const sendMessage = async (
    req,
    res
) => {
    try {
        const { conversationId } = req.params;
        const { text } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(
                conversationId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid conversation ID"
            });
        }

        if (
            typeof text !== "string" ||
            !text.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Message text is required"
            });
        }

        if (text.trim().length > 2000) {
            return res.status(400).json({
                success: false,
                message:
                    "Message cannot exceed 2000 characters"
            });
        }

        const conversation =
            await Conversation.findOne({
                _id: conversationId,
                $or: [
                    {
                        buyer: req.user.id
                    },
                    {
                        seller: req.user.id
                    }
                ]
            });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        const receiver =
            conversation.buyer.toString() ===
            req.user.id.toString()
                ? conversation.seller
                : conversation.buyer;

        const message = await Message.create({
            conversation: conversationId,
            sender: req.user.id,
            receiver,
            text: text.trim()
        });

        await Conversation.findByIdAndUpdate(
            conversationId,
            {
                lastMessage: text.trim(),
                lastMessageAt: new Date()
            }
        );

        await message.populate([
            {
                path: "sender",
                select:
                    "fullName profileImage role"
            },
            {
                path: "receiver",
                select:
                    "fullName profileImage role"
            }
        ]);

        return res.status(201).json({
            success: true,
            message:
                "Message sent successfully",
            data: message
        });
    } catch (error) {
        console.error(
            "Send message error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not send message"
        });
    }
};

export const markMessagesAsRead = async (
    req,
    res
) => {
    try {
        const { conversationId } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                conversationId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid conversation ID"
            });
        }

        const conversation =
            await Conversation.findOne({
                _id: conversationId,
                $or: [
                    {
                        buyer: req.user.id
                    },
                    {
                        seller: req.user.id
                    }
                ]
            });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        const result =
            await Message.updateMany(
                {
                    conversation: conversationId,
                    receiver: req.user.id,
                    isRead: false
                },
                {
                    $set: {
                        isRead: true,
                        readAt: new Date()
                    }
                }
            );

        return res.status(200).json({
            success: true,
            message:
                "Messages marked as read",
            modifiedCount:
                result.modifiedCount
        });
    } catch (error) {
        console.error(
            "Mark messages as read error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not mark messages as read"
        });
    }
};

export const deleteConversation = async (
    req,
    res
) => {
    try {
        const { conversationId } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                conversationId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid conversation ID"
            });
        }

        const conversation =
            await Conversation.findOne({
                _id: conversationId,
                $or: [
                    {
                        buyer: req.user.id
                    },
                    {
                        seller: req.user.id
                    }
                ]
            });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        await Message.deleteMany({
            conversation: conversationId
        });

        await Conversation.findByIdAndDelete(
            conversationId
        );

        return res.status(200).json({
            success: true,
            message:
                "Conversation deleted successfully"
        });
    } catch (error) {
        console.error(
            "Delete conversation error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not delete conversation"
        });
    }
};