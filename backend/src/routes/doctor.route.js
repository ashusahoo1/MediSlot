import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/authorizeRole.middleware.js"
import { createDoctor, deleteDoctor, getAllDoctors, getAppointmentsForDoctor, getDoctorById, getDoctorDetails, setSchedule, setUnavailableStatus, updateDoctor, updateDoctorVerificationStatus, updateSchedulePart } from "../controllers/doctor.controller.js";

const router=Router()

router.route("/get-all-doctors").get(getAllDoctors)
//authorized routes
router.route("/create-doctor").post(verifyJWT, authorizeRole("doctor"), createDoctor)
router.route("/delete-doctor").get(verifyJWT, authorizeRole("doctor"), deleteDoctor)
router.route("/set-unavailable").post(verifyJWT, authorizeRole("doctor"), setUnavailableStatus)
router.route("/set-schedule").post(verifyJWT, authorizeRole("doctor"), setSchedule)
// router.route("/update-schedule").post(verifyJWT, authorizeRole("doctor"), updateSchedulePart)
router.route("/update-doctor").patch(verifyJWT, authorizeRole("doctor"), updateDoctor)
router.route("/get-appointments-for-doctor").get(verifyJWT, authorizeRole("doctor"), getAppointmentsForDoctor)
router.route("/get-doctor-details").get(verifyJWT, authorizeRole("doctor"), getDoctorDetails)
router.route("/change-verification").patch(verifyJWT, authorizeRole("hospital"), updateDoctorVerificationStatus)
/*
!router with params must always come at last as express matches routes in order of how you have written them
!for example when i wrote this earlier 
router.route("/:doctorId").get(getDoctorById)
router.route("/get-all-doctors").get(getAllDoctors)
!calling /get-all-doctors through postman called getDoctorById and took doctorId as "get-all-doctors" and throwed
!invalid Doctor Id Error
*/
router.route("/:doctorId").get(getDoctorById)




export default router