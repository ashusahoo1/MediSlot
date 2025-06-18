// utils/sendNotification.js
import {Notification} from '../models/notification.model.js';

const sendNotification = async (userId, message, data = {}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      message,
      data,
    });

    return notification;
  } catch (error) {
    console.error("Failed to send notification:", error.message);
    return null;
  }
};

export {sendNotification}