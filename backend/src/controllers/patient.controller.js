import { Patient } from "../models/patient.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Appointment } from "../models/appointment.model.js";
import { Hospital } from "../models/hospital.model.js";
import { isValidObjectId } from "mongoose";

//!AUTHORIZE ROLE MIDDLEWARE ALREADY CHECKS IF ROLE IS PATIENT SO WE DONT HAVE TO CHECK IT IN ANY OF CONTROLLERS

const createPatient = asyncHandler(async (req, res) => {
  const { gender, dob } = req.body;
  const userId = req.user._id;

  if (!gender.trim() || !dob) {
    throw new ApiError(400, "all fields are required");
  }

  const patient = await Patient.create({
    user: userId,
    gender,
    dob,
  });

  const createdPatient = await Patient.findById(patient._id);
  if (!createdPatient) {
    throw new ApiError(
      500,
      "Something went wrong while making patient profile"
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        createdPatient,
        "patient profile created succesfully"
      )
    );
});

const getPatientDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const patient = await Patient.findOne({ user: userId }).populate(
    "user",
    "-password -refreshToken"
  );

  if (!patient) {
    throw new ApiError(404, "Patient profile not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, patient, "Patient profile fetched successfully")
    );
});

const getAppointmentsForPatient = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const patient = await Patient.findOne({ user: userId }).populate(
    "user",
    "-password -refreshToken"
  );

  if (!patient) {
    throw new ApiError(404, "Patient profile not found");
  }
  const patientId = patient._id;
  const { status } = req.query;

  if (!isValidObjectId(patientId)) {
    throw new ApiError(400, "Invalid patient ID");
  }

  const query = { patient: patientId };
  if (status) {
    query.status = status;
  }

  const appointments = await Appointment.find(query)
    .populate({
      path: "doctor",
      select: "specialization experience user",
      populate: {
        path: "user",
        select: "fullName avatar email",
      },
    })
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(200, appointments, "Appointments fetched successfully")
    );
});

const deletePatient = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const findPatient = await Patient.findOne({ user: userId }).populate(
    "user",
    "-password -refreshToken"
  );

  if (!findPatient) {
    throw new ApiError(404, "Patient profile not found");
  }
  const patientId = findPatient._id;

  const patient = await Hospital.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Hospital not found");
  }

  // Optional: check if the user is authorized to delete
  if (patient.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to delete this hospital");
  }

  const deletePatient = await Patient.deleteOne(patient._id);
  if (deletePatient.deletedCount === 0) {
    throw new ApiError(500, "unable to delete hospital");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, deleteHospital, "hospital deleted successfully")
    );
});

const getNearbyHospitals = asyncHandler(async (req, res) => {
  const { lat, lon, maxDistance = 5000 } = req.query; //lat lon will be sent from frontend using geolocation API in browser

  if (!lat || !lon) {
    throw new ApiError(400, "Latitude and longitude are required");
  }

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  if (isNaN(latNum) || isNaN(lonNum)) {
    throw new ApiError(400, "Invalid latitude or longitude format");
  }

  const hospitals = await Hospital.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lonNum, latNum],
        },
        $maxDistance: parseFloat(maxDistance), // optional: filter by radius
      },
    },
  }).limit(5).populate("user", "avatar email");

  return res
    .status(200)
    .json(
      new ApiResponse(200, hospitals, "Nearby hospitals fetched successfully")
    );
});

const updatePatient = asyncHandler(async (req, res) => {
  const { gender, dob } = req.body;
  if (!gender && !dob) {
    throw new ApiError(400, "One of the patient fields must be provided");
  }

  const userId = req.user._id;

  const patient = await Patient.findOne({ user: userId });
  if (!patient) {
    throw new ApiError(404, "Patient profile not found");
  }

  // Build update object only with provided fields
  const updateFields = {};
  if (gender) updateFields.gender = gender;
  if (dob) updateFields.dob = dob;

  const updatedPatient = await Patient.findByIdAndUpdate(
    patient._id,
    updateFields,
    { new: true }
  ).populate("user", "-password -refreshToken");

  if (!updatedPatient) {
    throw new ApiError(500, "Failed to update patient info");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedPatient, "Updated patient successfully"));
});

export {
  createPatient,
  getPatientDetails,
  getAppointmentsForPatient,
  deletePatient,
  getNearbyHospitals,
  updatePatient,
};
