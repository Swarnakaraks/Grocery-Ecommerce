import { Notification } from "../models/notification.model.js";

export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipient: req.user._id
        })
            .sort({
                createdAt: -1
            })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            isRead: false
        });

        return res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount,
            notifications
        });
    } catch (error) {
        console.error("Get notifications error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch notifications"
        });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findOne({
            _id: notificationId,
            recipient: req.user._id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        if (!notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date();

            await notification.save();
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        console.error(
            "Mark notification as read error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Could not mark notification as read"
        });
    }
};

export const markAllNotificationsAsRead = async (
    req,
    res
) => {
    try {
        const result = await Notification.updateMany(
            {
                recipient: req.user._id,
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
            message: "All notifications marked as read",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error(
            "Mark all notifications as read error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not mark all notifications as read"
        });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification =
            await Notification.findOneAndDelete({
                _id: notificationId,
                recipient: req.user._id
            });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification deleted successfully"
        });
    } catch (error) {
        console.error(
            "Delete notification error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Could not delete notification"
        });
    }
};