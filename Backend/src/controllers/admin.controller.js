import { User } from "../models/user.model.js";
import { Store } from "../models/store.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Payment } from "../models/payment.model.js";
import mongoose from "mongoose";
import { createNotification } from "../utils/notification.util.js";

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

export const blockUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin account cannot be blocked"
            });
        }

        if (user.isBlocked) {
            return res.status(400).json({
                success: false,
                message: "User is already blocked"
            });
        }

        user.isBlocked = true;
        user.blockedAt = new Date();
        user.blockReason = reason?.trim() || null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "User blocked successfully",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                isBlocked: user.isBlocked,
                blockedAt: user.blockedAt,
                blockReason: user.blockReason
            }
        });
    } catch (error) {
        next(error);
    }
};

export const unblockUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.isBlocked) {
            return res.status(400).json({
                success: false,
                message: "User is not blocked"
            });
        }

        user.isBlocked = false;
        user.blockedAt = null;
        user.blockReason = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "User unblocked successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const activateUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin account cannot be modified"
            });
        }

        if (user.isActive) {
            return res.status(400).json({
                success: false,
                message: "User is already active"
            });
        }

        user.isActive = true;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "User activated successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const deactivateUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin account cannot be modified"
            });
        }

        if (!user.isActive) {
            return res.status(400).json({
                success: false,
                message: "User is already inactive"
            });
        }

        user.isActive = false;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "User deactivated successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const getAllSellers = async (req, res, next) => {
    try {
        const sellers = await User.find({ role: "seller" })
            .select("-password")
            .sort({ createdAt: -1 });

        const stores = await Store.find()
            .populate("seller", "fullName email profilePicture")
            .sort({ createdAt: -1 });

        const sellerData = sellers.map((seller) => ({
            seller,
            store: stores.find(
                (store) => store.seller?._id.toString() === seller._id.toString()
            ) || null
        }));

        return res.status(200).json({
            success: true,
            count: sellerData.length,
            sellers: sellerData
        });
    } catch (error) {
        next(error);
    }
};

export const getSellerById = async (req, res, next) => {
    try {
        const { sellerId } = req.params;

        const seller = await User.findOne({
            _id: sellerId,
            role: "seller"
        }).select("-password");

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found"
            });
        }

        const store = await Store.findOne({
            seller: seller._id
        });

        return res.status(200).json({
            success: true,
            seller,
            store
        });
    } catch (error) {
        next(error);
    }
};

export const activateStore = async (req, res, next) => {
    try {
        const { storeId } = req.params;

        const store = await Store.findById(storeId);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        if (store.isActive) {
            return res.status(400).json({
                success: false,
                message: "Store is already active"
            });
        }

        store.isActive = true;

        await store.save();

        return res.status(200).json({
            success: true,
            message: "Store activated successfully",
            store
        });
    } catch (error) {
        next(error);
    }
};

export const deactivateStore = async (req, res, next) => {
    try {
        const { storeId } = req.params;

        const store = await Store.findById(storeId);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        if (!store.isActive) {
            return res.status(400).json({
                success: false,
                message: "Store is already inactive"
            });
        }

        store.isActive = false;

        await store.save();

        return res.status(200).json({
            success: true,
            message: "Store deactivated successfully",
            store
        });
    } catch (error) {
        next(error);
    }
};

export const getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find()
            .populate("seller", "fullName email profilePicture")
            .populate("store", "storeName")
            .populate("category", "name")
            .populate("subcategory", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId)
            .populate("seller", "fullName email profilePicture")
            .populate("store", "storeName")
            .populate("category", "name")
            .populate("subcategory", "name");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
};

export const activateProduct = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.isActive) {
            return res.status(400).json({
                success: false,
                message: "Product is already active"
            });
        }

        product.isActive = true;

        await product.save();

        return res.status(200).json({
            success: true,
            message: "Product activated successfully",
            product
        });
    } catch (error) {
        next(error);
    }
};

export const deactivateProduct = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (!product.isActive) {
            return res.status(400).json({
                success: false,
                message: "Product is already inactive"
            });
        }

        product.isActive = false;

        await product.save();

        return res.status(200).json({
            success: true,
            message: "Product deactivated successfully",
            product
        });
    } catch (error) {
        next(error);
    }
};

export const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate("buyer", "fullName email profilePicture")
            .populate("items.product", "name slug images")
            .populate("items.store", "storeName")
            .populate("items.seller", "fullName email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        next(error);
    }
};

export const getOrderById = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate("buyer", "fullName email profilePicture")
            .populate("items.product", "name slug images")
            .populate("items.store", "storeName")
            .populate("items.seller", "fullName email");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        next(error);
    }
};

const allowedStatusTransitions = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: []
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, reason } = req.body;

        if (!mongoose.isValidObjectId(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const allowedStatuses = [
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.status === "delivered") {
            return res.status(400).json({
                success: false,
                message: "Delivered order cannot be updated"
            });
        }

        if (order.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled order cannot be updated"
            });
        }

        if (
            order.paymentMethod === "esewa" &&
            order.paymentStatus !== "paid" &&
            status !== "cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message: "eSewa payment must be completed before processing the order"
            });
        }

        const statusOrder = {
            pending: 0,
            confirmed: 1,
            processing: 2,
            shipped: 3,
            delivered: 4
        };

        if (
            status !== "cancelled" &&
            statusOrder[status] < statusOrder[order.status]
        ) {
            return res.status(400).json({
                success: false,
                message: "Order status cannot move backwards"
            });
        }

        if (status === "cancelled") {
            for (const item of order.items) {
                const update = {
                    $inc: {
                        stock: item.quantity
                    }
                };

                if (order.paymentMethod === "cod") {
                    update.$inc.totalSold = -item.quantity;
                }

                await Product.updateOne(
                    {
                        _id: item.product
                    },
                    update
                );
            }

            order.status = "cancelled";
            order.cancelledAt = new Date();
            order.cancelReason = reason || null;

            if (order.paymentMethod === "esewa") {
                order.paymentStatus = "refunded";

                await Payment.findOneAndUpdate(
                    {
                        order: order._id
                    },
                    {
                        status: "refunded"
                    }
                );
            } else {
                await Payment.findOneAndUpdate(
                    {
                        order: order._id
                    },
                    {
                        status: "pending"
                    }
                );
            }

            await order.save();

            await createNotification({
                recipient: order.buyer,
                type: "order",
                title: "Order cancelled",
                message: `Your order #${order.orderNumber} has been cancelled by the administrator.`,
                relatedId: order._id
            });

            return res.status(200).json({
                success: true,
                message: "Order cancelled successfully",
                order
            });
        }

        order.status = status;

        await order.save();

        const notificationMessages = {
            confirmed: {
                title: "Order confirmed",
                message: `Your order #${order.orderNumber} has been confirmed.`
            },
            processing: {
                title: "Order processing",
                message: `Your order #${order.orderNumber} is now being processed.`
            },
            shipped: {
                title: "Order shipped",
                message: `Your order #${order.orderNumber} has been shipped.`
            },
            delivered: {
                title: "Order delivered",
                message: `Your order #${order.orderNumber} has been delivered.`
            }
        };

        const notification = notificationMessages[status];

        await createNotification({
            recipient: order.buyer,
            type: "order",
            title: notification.title,
            message: notification.message,
            relatedId: order._id
        });

        return res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            order
        });
    } catch (error) {
        console.error("Update admin order status error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not update order status"
        });
    }
};

export const getAllPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find()
            .populate("buyer", "fullName email profilePicture")
            .populate("order", "orderNumber total status paymentMethod paymentStatus")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: payments.length,
            payments
        });
    } catch (error) {
        next(error);
    }
};

export const getPaymentById = async (req, res, next) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findById(paymentId)
            .populate("buyer", "fullName email profilePicture")
            .populate(
                "order",
                "orderNumber items shippingAddress subtotal discount shippingFee total status paymentMethod paymentStatus"
            );

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        return res.status(200).json({
            success: true,
            payment
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminDashboard = async (req, res, next) => {
    try {
        const [
            totalUsers,
            totalBuyers,
            totalSellers,
            totalStores,
            activeStores,
            inactiveStores,
            totalProducts,
            activeProducts,
            inactiveProducts,
            totalOrders,
            pendingOrders,
            deliveredOrders,
            cancelledOrders,
            totalPayments,
            paidPayments,
            pendingPayments,
            failedPayments,
            revenueResult
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "buyer" }),
            User.countDocuments({ role: "seller" }),
            Store.countDocuments(),
            Store.countDocuments({ isActive: true }),
            Store.countDocuments({ isActive: false }),
            Product.countDocuments(),
            Product.countDocuments({ isActive: true }),
            Product.countDocuments({ isActive: false }),
            Order.countDocuments(),
            Order.countDocuments({ status: "pending" }),
            Order.countDocuments({ status: "delivered" }),
            Order.countDocuments({ status: "cancelled" }),
            Payment.countDocuments(),
            Payment.countDocuments({ status: "paid" }),
            Payment.countDocuments({ status: "pending" }),
            Payment.countDocuments({ status: "failed" }),
            Payment.aggregate([
                {
                    $match: {
                        status: "paid"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: {
                            $sum: "$amount"
                        }
                    }
                }
            ])
        ]);

        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        return res.status(200).json({
            success: true,
            dashboard: {
                users: {
                    total: totalUsers,
                    buyers: totalBuyers,
                    sellers: totalSellers
                },

                stores: {
                    total: totalStores,
                    active: activeStores,
                    inactive: inactiveStores
                },

                products: {
                    total: totalProducts,
                    active: activeProducts,
                    inactive: inactiveProducts
                },

                orders: {
                    total: totalOrders,
                    pending: pendingOrders,
                    delivered: deliveredOrders,
                    cancelled: cancelledOrders
                },

                payments: {
                    total: totalPayments,
                    paid: paidPayments,
                    pending: pendingPayments,
                    failed: failedPayments,
                    revenue: totalRevenue
                }
            }
        });
    } catch (error) {
        next(error);
    }
};