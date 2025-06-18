import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Patient } from "../models/patient.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import stripe from "../utils/stripe.js";
import { sendNotification } from "../utils/sendNotification.js";
import { getINRtoUSDConversionRate } from "../utils/currencyConverter.js";

const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const userId = req.user._id;
  const { startTime, endTime } = req.body;
  console.log(startTime, endTime);

  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, "Invalid doctorId");
  }

  if (!startTime || !endTime) {
    throw new ApiError(400, "startTime and endTime are required");
  }

  const patient = await Patient.findOne({ user: userId });

  if (!patient) {
    throw new ApiError(404, "Patient profile not found");
  }

  const patientId = patient._id;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const doctor = await Doctor.findById(doctorId, null, { session });
    if (!doctor) throw new ApiError(404, "Doctor not found");

    const start = new Date(startTime);
    const end = new Date(endTime);

    console.log(start, end);
    const dayOfWeek = start.toLocaleString("en-US", { weekday: "long" }); // "Monday", "Tuesday", ...
    console.log(dayOfWeek);
    // Get schedule for the specific day
    const daySchedule = doctor.schedule.find(
      (s) => s.day.toLowerCase() === dayOfWeek.toLowerCase()
    );

    if (!daySchedule) {
      throw new ApiError(400, `Doctor is not available on ${dayOfWeek}`);
    }

    /*
    ?THERE WAS A MAJOR ISSUE WHILE SENDING REQUEST THROUGH POSTMAN ON LOCALHOST AND FROM FRONTEND TO RENDER
    ?WHAT HAPPEND WAS THAT RENDER AND LOCALHOST USED DIFFRENT TIME ZONES WHICH GAVE WRONG RESULTS SO WE CONVERTED EVERYTHING
    ?INTO UTC TIME AS FRONTEND WAS SENDING TIME IN ISO FORMAT UTC
    !Always convert and compare dates in the same time zone — preferably UTC 
    *the error occured becuase we were using setHours() which sets the time in the system’s local time zone, not in UTC.
    *Heres a list of all method which uses localTime most of these have a UTC version as well

    | Method                                                               | Description                                                            |
    ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
    `new Date()`                                                         | If passed a date string without a time zone, it assumes **local time** |
    `setHours(hours, minutes, seconds, ms)`                              | Sets the time in **local time zone**                                   |
    `setFullYear(year, month, day)`                                      | Sets the date in **local time zone**                                   |
    `setMonth(month)`                                                    | Sets the month (local)                                                 |
    `setDate(day)`                                                       | Sets the day of the month (local)                                      |
    `setMinutes(minutes)` / `setSeconds()` / `setMilliseconds()`         | Set time components in **local time**                                  |
    `getHours()` / `getMinutes()` / `getSeconds()`                       | Returns values in **local time**                                       |
    `getFullYear()` / `getMonth()` / `getDate()`                         | Get date components in **local time**                                  |
    `toLocaleString()` / `toLocaleDateString()` / `toLocaleTimeString()` | Returns strings in **local time**                                      |
    `toString()`                                                         | Returns the date string in **local time** format                       |
    `Date.parse()`                                                       | If string lacks a time zone, it assumes **local time**                 |

    */

    // Helper to convert "HH:mm" to Date using the original `startTime` date
    const toTimeOnDate = (dateObj, timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const utcDate = new Date(dateObj);

      // Create a UTC time that matches the IST time
      const istDate = new Date(
        Date.UTC(
          utcDate.getUTCFullYear(),
          utcDate.getUTCMonth(),
          utcDate.getUTCDate(),
          hours - 5, // 5 hours behind
          minutes - 30 // minus 30 mins for IST offset
        )
      );

      return istDate;
    };

    // Compute working hours for that day
    console.log(daySchedule.startTime, daySchedule.endTime);
    const scheduleStart = toTimeOnDate(start, daySchedule.startTime);
    const scheduleEnd = toTimeOnDate(start, daySchedule.endTime);
    console.log("scheduleStart: ", scheduleStart, "scheduleEnd: ", scheduleEnd);

    // Check if appointment is within schedule time
    if (start < scheduleStart || end > scheduleEnd) {
      throw new ApiError(
        400,
        `Appointment time is outside of doctor's schedule on ${dayOfWeek}`
      );
    }

    // Check for overlap with any breaks
    for (const br of daySchedule.breaks) {
      const breakStart = toTimeOnDate(start, br.breakStart);
      const breakEnd = toTimeOnDate(start, br.breakEnd);
      console.log("break start :", breakStart, "break end:", breakEnd);
      const overlapsBreak =
        (start < breakEnd && start >= breakStart) || // starts during break
        (end > breakStart && end <= breakEnd) || // ends during break
        (start <= breakStart && end >= breakEnd); // fully covers a break
      if (overlapsBreak) {
        throw new ApiError(
          400,
          `Appointment time overlaps with a break from ${br.breakStart} to ${br.breakEnd}`
        );
      }
    }

    // Check for overlapping appointment
    const overlappingAppointment = await Appointment.findOne(
      {
        doctor: doctorId,
        status: { $in: ["pending", "booked"] }, // Only consider pending or booked
        $or: [
          {
            startTime: { $lt: new Date(endTime), $gte: new Date(startTime) },
          },
          {
            endTime: { $gt: new Date(startTime), $lte: new Date(endTime) },
          },
          {
            startTime: { $lte: new Date(startTime) },
            endTime: { $gte: new Date(endTime) },
          },
        ],
      },
      null,
      { session }
    );

    /*
    Model.findOne(filter, projection, options)
    projection: fields to include or exclude, since we dont need that we pass null to move to options

    In Mongoose(and MongoDB), when you use transactions, you must ensure that all operations inside the transaction share the same session.
    That’s why you pass {session} it explicitly ties a Mongoose query to the session you're using for the transaction.
    you can also use .session(session) outside of findOne function does the same work
    */

    if (overlappingAppointment) {
      throw new ApiError(409, "Doctor already booked for this time slot");
    }
    const durationInHours = (end - start) / (1000 * 60 * 60);

    if (durationInHours <= 0) {
      throw new ApiError(400, "End time must be after start time");
    }

    const fee = Math.ceil(durationInHours * doctor.hourlyRate);

    // Since create can accept either a single document or an array, it normally returns a single doc or an array. But during transactions
    // (with session), it only works with the array syntax, even for a single document. so destructure it using []
    const [appointment] = await Appointment.create(
      [
        {
          doctor: doctorId,
          patient: patientId,
          startTime,
          endTime,
          status: "pending",
          fee,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res
      .status(201)
      .json(
        new ApiResponse(201, appointment, "Appointment booked successfully")
      );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(500, error.message);
  }
});

const deleteAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  if (!isValidObjectId(appointmentId)) {
    throw new ApiError(400, "Invalid appointment ID");
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  const patient = await Patient.findById(appointment.patient); //if no patient find returns null
  const doctor = await Doctor.findById(appointment.doctor); //if no doctor find returns null

  const userId = req.user._id.toString();

  const isPatient = patient.user.toString() === userId;
  const isDoctor = doctor.user.toString() === userId;

  if (!isPatient && !isDoctor) {
    throw new ApiError(403, "Unauthorized to delete this appointment");
  }

  const deletedAppointment = await Appointment.findByIdAndDelete(appointmentId); //return deletedDocument if found null if not delted
  if (!deletedAppointment) {
    throw new ApiError(500, "Unable to delete the appointment");
  }
  res
    .status(200)
    .json(new ApiResponse(200, null, "Appointment cancelled successfully"));
});

//!YOU HAVE TO USE -> stripe listen --forward-to localhost:8000/api/v1/stripe/webhook WHENEVER YOU ARE TESTING STRIPE IN LOCALHOST
//!MAKE SURE YOU USE IT IN WINDOWS COMMAND PROMPT NOT VS CODE TERMINAL
const payUsingStripe = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  // Optional: Fetch appointment info from DB (e.g., amount, doctor, patient)
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  const inrToUsd = await getINRtoUSDConversionRate();
  const usdAmount = Math.ceil(appointment.fee * inrToUsd);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    invoice_creation: {
      enabled: true,
    },
    success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`, //if payement success redirect user to this url
    cancel_url: `${process.env.CLIENT_URL}/payment-cancel`, //if payement failed redirect user to this url
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Appointment with ${appointment.doctor}`,
          },
          unit_amount: usdAmount * 100, // amount in cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      appointmentId: appointment._id.toString(),
      userId: req.user._id.toString(),
    },
  });

  res.status(200).json({ url: session.url });
});

const fetchAppointments = asyncHandler(async (req, res) => {
  const { doctorId, patientId } = req.query;

  if (!doctorId && !patientId) {
    throw new ApiError(400, "doctorId or patientId is required");
  }

  if (doctorId && !isValidObjectId(doctorId)) {
    throw new ApiError(400, "Invalid doctor ID");
  }

  if (patientId && !isValidObjectId(patientId)) {
    throw new ApiError(400, "Invalid patient ID");
  }

  const filter = doctorId ? { doctor: doctorId } : { patient: patientId };
  //nested populating
  const appointments = await Appointment.find(filter)
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
        select: "fullName avatar",
      },
      select: "-__v",
    })
    .sort({ date: -1 }); // latest first

  res
    .status(200)
    .json(
      new ApiResponse(200, appointments, "Appointments fetched successfully")
    );
});

const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { appointmentId, status } = req.body;

  if (!appointmentId || !status) {
    throw new ApiError(400, "appointmentId and status are required");
  }

  if (!isValidObjectId(appointmentId)) {
    throw new ApiError(400, "Invalid appointment ID");
  }

  // Find appointment with both patient and doctor populated
  const appointment = await Appointment.findById(appointmentId)
    .populate({
      path: "patient",
      populate: {
        path: "user",
        select: "fullName avatar",
      },
      select: "-__v",
    })
    .populate({
      path: "doctor",
      populate: {
        path: "user",
        select: "fullName avatar email",
      },
      select: "-__v",
    });

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  const patient = appointment.patient;

  //TODO: this block is throwing some error check it later
  // if (status.toLowerCase() === 'cancelled') {
  //   await sendMail(patient.user.email,"Appointment Cancelled","<h1>Your appoinment has been cancelled</h1>")
  // }

  // Update appointment status
  appointment.status = status;
  await appointment.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        appointment,
        "Appointment status updated successfully"
      )
    );
});

export {
  bookAppointment,
  deleteAppointment,
  payUsingStripe,
  fetchAppointments,
  updateAppointmentStatus,
};
