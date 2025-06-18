import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const appointmentSchema=new Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    fee: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["booked", "completed", "cancelled", "pending"],//pending for uncomplete payment
        default: "pending",
    }
},{timestamps:true})

appointmentSchema.plugin(mongooseAggregatePaginate)//?allows you to use pagination on this schema cntrollers
export const Appointment=mongoose.model("Appointment", appointmentSchema)