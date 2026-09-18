import { Notification } from "../models/notification.model.js";

export const createNotification = async ({
    recipient,
    type,
    title,
    message,
    relatedId = null
}) => {
    return Notification.create({
        recipient,
        type,
        title,
        message,
        relatedId
    });
};