import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const addressSchema = new mongoose.Schema({
  name: String,         // e.g., "Ayurvedic Hospital"
  street: String,       // e.g., "Bharatpur Road"
  city: String,         // e.g., "Bhubaneswar"
  state: String,        // e.g., "Odisha"
  country: String,      // e.g., "India"
  postcode: String,    // e.g., "751003"
}, { _id: false }); // no separate _id for this subdocument

const hospitalSchema=new Schema({
    user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
    },
    name:{
        type: String,
        required: true
    },
    address: { 
        type: addressSchema,
        required: true
    },
    location: {
        type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point"
        },
        coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
        }
    },
    contactNumber: { type: String, required: true },
    HRN:{//hospital registration number
        type: String,
        required: true,
        unique: true
    },
    verified: {
    type: Boolean,
    default: false,
    }
},{timestamps: true})

hospitalSchema.index({ location: '2dsphere' });

hospitalSchema.plugin(mongooseAggregatePaginate)
export const Hospital= mongoose.model("Hospital", hospitalSchema)