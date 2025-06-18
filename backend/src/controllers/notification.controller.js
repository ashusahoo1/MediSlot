import {Notification} from "../models/notification.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//!Create Notification is made to be a utility inside utils so that it can be reused

const getAllNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 5, sortBY = "createdAt", sortType = -1 } = req.body;

  const sortQuery = { [sortBY]: sortType };

  const aggregateQuery = Notification.aggregate([
    { $match: { user: userId } },
    { $sort: sortQuery }
  ]);

  const options = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await Notification.aggregatePaginate(aggregateQuery, options);

  res.status(200).json(
    new ApiResponse(200, result, "Notifications fetched successfully")
  );
});


const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid notification ID");
  }

  const notification = await Notification.findOneAndDelete({
    _id: id,
    user: userId,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found or unauthorized");
  }

  res.status(200).json(
    new ApiResponse(200, notification, "Notification deleted successfully")
  );
});



export{
    getAllNotifications,
    deleteNotification
}