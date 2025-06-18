import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const doctorSchema= new Schema({
    //TODO: ADD A SCHEDULE FIELD AS WELL LATER
    user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    },
    specialization: {
    type: String,
    required: true,
    trim: true,
    },
    experience: {
    type: Number, //in years
    min: 0,
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
    },
    hourlyRate: {
        type: Number,
        required: true, // set by hospital
    },
    registrationNumber:{
        type: String,
        required: true,
        unique: true
    },
    verified: {
    type: Boolean,
    default: false,
    },
    unavailableStatus: [
        {
            status: {
            type: Boolean,
            default: false // false = available, true = unavailable
            },
            startDate: {
            type: Date,
            required: true
            },
            endDate: {
            type: Date,
            required: true
            }
        }
    ],
    schedule: [
        {
            day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },
            breaks: [
            {
                breakStart: { type: String, required: true }, // e.g. "10:00"
                breakEnd: { type: String, required: true }    // e.g. "11:00"
            }
            ]
        }
    ]

},{timestamps:true})

doctorSchema.plugin(mongooseAggregatePaginate)
export const Doctor=mongoose.model("Doctor", doctorSchema)