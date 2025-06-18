import { Doctor } from "../models/doctor.model.js";
import mongoose from "mongoose";
import { Hospital } from "../models/hospital.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Appointment } from "../models/appointment.model.js";
import { isValidObjectId } from "mongoose";
/*
 *The populate() method in Mongoose is used to automatically replace a field in a document with the actual data from a related document. It
 *simplifies handling referenced documents and helps replace ObjectIds with the actual data from related collections.
 */
const createDoctor = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { specialization, experience, HRN, registrationNumber, hourlyRate } =
    req.body;

  if (
    !specialization.trim() ||
    !experience ||
    !HRN ||
    !registrationNumber ||
    !hourlyRate
  ) {
    throw new ApiError(400, "all fields are required");
  }

  const hospital = await Hospital.findOne({ HRN });

  const doctor = await Doctor.create({
    user: userId,
    specialization,
    experience,
    registrationNumber,
    hourlyRate,
    hospital: hospital._id,
  });

  if (!doctor) {
    throw new ApiError(500, "unable to create doctor profile");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, doctor, "doctor profile created successfully"));
});

const getDoctorById = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, "Invalid doctor ID!");
  }

  const doctor = await Doctor.findById(doctorId).populate(
    "user",
    "fullName avatar email"
  );

  if (!doctor) {
    throw new ApiError(404, "doctor not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, doctor, "doctor fetched successfully"));
});

const deleteDoctor = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const doctor = await Doctor.findOne({ user: userId }).populate(
    "user",
    "-password -refreshToken"
  );
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }
  const deletedoctor = await doctor.deleteOne(); //you can use deleteOne on the instance instead of model but it wont return u deletedCount
  //its better to use Model.deletOne instead of using it with instance to confirm deletion but just know this is also a way
  if (!deleteDoctor) {
    throw new ApiError(500, "unable to delete hospital");
  }

  res
    .status(200)
    .json(new ApiResponse(200, deletedoctor, "hospital deleted successfully"));
});

//TODO: modify this in a way it handles case for appointment present during unavailable time
const setUnavailableStatus = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;
  const userId = req.user._id;

  if (!startDate || !endDate) {
    throw new ApiError(400, "Both startDate and endDate are required");
  }

  const doctor = await Doctor.findOne({ user: userId }).populate(
    "user",
    "-password -refreshToken"
  );
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check for conflicting (booked or pending) appointments
  const conflictingAppointments = await Appointment.find({
    doctor: doctor._id,
    status: { $in: ["booked", "pending"] },
    $or: [
      { startTime: { $lt: end, $gte: start } },
      { endTime: { $gt: start, $lte: end } },
      { startTime: { $lte: start }, endTime: { $gte: end } },
    ],
  });

  if (conflictingAppointments.length > 0) {
    throw new ApiError(
      400,
      "Some booked or pending appointments exist during this period. Please cancel them manually before setting unavailable status."
    );
  }

  const updatedDoc = await Doctor.findByIdAndUpdate(
    doctor._id,
    {
      $push: {
        unavailableStatus: {
          status: true,
          startDate: start,
          endDate: end,
        },
      },
    },
    { new: true }
  );

  if (!updatedDoc) {
    throw new ApiError(500, "Unable to set unavailable status");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedDoc, "Unavailable period set successfully")
    );
});

const setSchedule = asyncHandler(async (req, res) => {
  const { schedule } = req.body;
  const userId = req.user._id;

  const doctor = await Doctor.findOne({ user: userId }).populate(
    "user",
    "-password -refreshToken"
  );
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  if (!Array.isArray(schedule)) {
    throw new ApiError(400, "Schedule must be an array");
  }

  doctor.schedule = schedule;

  const updatedDoctor = await doctor.save({ validateBeforeSave: false });
  if (!updatedDoctor) {
    throw new ApiError(500, "Failed to update schedule");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedDoctor, "Schedule updated successfully"));
});

const getAllDoctors = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "user.fullName",
    sortType = 1,
    hospitalId,
    verified,
  } = req.query;

  const sortQuery = { [sortBy]: Number(sortType) };

  const matchStage = {
    $or: [
      { "user.fullName": { $regex: query, $options: "i" } },
      { specialization: { $regex: query, $options: "i" } },
    ],
  };

  // Convert and add verified filter as the query comes in string but we need to check boolean
  if (verified === "true" || verified === "false") {
    matchStage.verified = verified === "true";
  }

  if (hospitalId && isValidObjectId(hospitalId)) {
    matchStage.hospital = new mongoose.Types.ObjectId(hospitalId);
  }

  const aggregateQuery = Doctor.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: matchStage },
    { $sort: sortQuery },
  ]);

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const result = await Doctor.aggregatePaginate(aggregateQuery, options);

  res
    .status(200)
    .json(new ApiResponse(200, result, "All doctors fetched successfully"));
});

const updateDoctor = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const doctor = await Doctor.findOne({ user: userId }).populate(
    "user",
    "-password -refreshToken"
  );
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }
  const { specialization, experience, hourlyRate, registrationNumber, HRN } =
    req.body;

  let hospital = null;
  if (HRN) {
    const findhospital = await Hospital.findOne({ HRN: HRN });
    if (!findhospital) {
      throw new ApiError(500, "unable to get the hospital from HRN");
    }
    hospital = findhospital;
  }

  if (hospital) doctor.hospital = hospital._id;
  if (specialization) doctor.specialization = specialization;
  if (experience) doctor.experience = experience;
  if (hourlyRate) doctor.hourlyRate = hourlyRate;
  if (registrationNumber) doctor.registrationNumber = registrationNumber;

  const updatedDoctor = await doctor.save({ validateBeforeSave: false });

  if (!updatedDoctor) {
    throw new ApiError(500, "unable to update doctor");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedDoctor,
        "succesfull updated doctor information"
      )
    );
});

const getAppointmentsForDoctor = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const doctor = await Doctor.findOne({ user: userId }).populate(
    "user",
    "-password -refreshToken"
  );
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  // Optional query parameters for filtering
  const { status } = req.query;
  const query = { doctor: doctor._id };
  if (status) {
    query.status = status; // e.g., 'completed', 'pending', etc.
  }

  const appointments = await Appointment.find(query)
    .populate({
      path: "doctor",
      populate: {
        path: "user",
        select: "fullName avatar",
      },
      select: "-__v",
    })
    .populate({
      path: "patient",
      populate: {
        path: "user",
        select: "fullName avatar gender",
      },
      select: "-__v",
    })
    .sort({ createdAt: -1 }); //latest first

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        appointments,
        "Doctor's appointments fetched successfully"
      )
    );
});

const updateSchedulePart = asyncHandler(async (req, res) => {
  const { index, newScheduleItem } = req.body; // e.g. index: 2, newScheduleItem: { day: "Monday", slots: [...] }
  const userId = req.user._id;

  if (
    typeof index !== "number" ||
    !newScheduleItem ||
    typeof newScheduleItem !== "object"
  ) {
    throw new ApiError(400, "Index and newScheduleItem (object) are required");
  }

  const doctor = await Doctor.findOne({ user: userId }).populate(
    "user",
    "-password -refreshToken"
  );
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  if (index < 0 || index >= doctor.schedule.length) {
    throw new ApiError(400, "Invalid schedule index");
  }

  // Update only the specific schedule item at index
  doctor.schedule[index] = {
    ...doctor.schedule[index].toObject(),
    ...newScheduleItem,
  };

  const updatedDoctor = await doctor.save({ validateBeforeSave: false });
  if (!updatedDoctor) {
    throw new ApiError(500, "Failed to update schedule");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedDoctor, "Schedule updated successfully"));
});

const updateDoctorVerificationStatus = asyncHandler(async (req, res) => {
  const { doctorId } = req.body;

  if (!doctorId) {
    throw new ApiError(400, "doctorId is required");
  }

  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, "Invalid doctorId");
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  doctor.verified = !doctor.verified;
  await doctor.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        doctor,
        `Doctor verification status updated to ${!doctor.verified}`
      )
    );
});

const getDoctorDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const doctor = await Doctor.findOne({ user: userId })
    .populate("user", "-password -refreshToken")
    .populate("hospital", "name"); // Populate only the name field
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, doctor, "Doctor profile fetched successfully"));
});

export {
  createDoctor,
  getDoctorById,
  deleteDoctor,
  getAllDoctors,
  updateDoctor,
  getAppointmentsForDoctor,
  setUnavailableStatus,
  setSchedule,
  updateSchedulePart,
  updateDoctorVerificationStatus,
  getDoctorDetails,
};
