import mongoose, { Schema } from "mongoose";

const patientSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  //add apointment history by aggregation lookup or maybe add default={} here
}, { timestamps: true });

export const Patient = mongoose.model("Patient", patientSchema);
