import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const notificationSchema = new Schema({
  user: {                    //Who receives this notification
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {                 
    type: String,
    required: true,
  },
  read: {                       
    type: Boolean,
    default: false,
  },
  data: {                        //Optional: store any extra info (like appointmentId, URLs)
    type: Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

notificationSchema.plugin(mongooseAggregatePaginate)

export const Notification = mongoose.model("Notification", notificationSchema);
