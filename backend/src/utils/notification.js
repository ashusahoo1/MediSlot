import { Notification } from "../models/notification.model.js";

export const sendNotification = async ({ userId, message, data = {} }) => {
  try {
    const notification = await Notification.create({
      recipient: userId,
      message,
      data
    });
    return notification;
  } catch (err) {
    console.error("Failed to send notification:", err.message);
  }
};