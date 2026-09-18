import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { createNotification } from "../utils/notification.util.js";

export const getSellerOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            "items.seller": req.user.id
        })
            .populate("buyer", "fullName email")
            .populate("items.product", "name slug images")
            .populate("items.store", "name")
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        console.error("Get seller orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch seller orders"
        });
    }
};

export const getSellerOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findOne({
            _id: id,
            "items.seller": req.user.id
        })
            .populate("buyer", "fullName email")
            .populate("items.product", "name slug images")
            .populate("items.store", "name");

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
        console.error("Get seller order error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch order"
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const allowedStatuses = [
            "confirmed",
            "processing",
            "shipped",
            "delivered"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const order = await Order.findOne({
            _id: id,
            "items.seller": req.user.id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled order cannot be updated"
            });
        }

        if (order.status === "delivered") {
            return res.status(400).json({
                success: false,
                message: "Delivered order cannot be updated"
            });
        }

        const statusOrder = {
            pending: 0,
            confirmed: 1,
            processing: 2,
            shipped: 3,
            delivered: 4
        };

        if (statusOrder[status] < statusOrder[order.status]) {
            return res.status(400).json({
                success: false,
                message: "Order status cannot move backwards"
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

        const notification =
            notificationMessages[status];

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
        console.error("Update order status error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not update order status"
        });
    }
};