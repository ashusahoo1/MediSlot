import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPatient, deletePatient, getAppointmentsForPatient, getNearbyHospitals, getPatientDetails, updatePatient } from "../controllers/patient.controller.js";
import  authorizeRole  from "../middlewares/authorizeRole.middleware.js";

const router=Router()

router.route("/create-patient").post(verifyJWT, authorizeRole("patient"), createPatient)
router.route("/get-patient-details").get(verifyJWT,authorizeRole("patient"), getPatientDetails)
router.route("/get-appointments-for-patient").get(verifyJWT, authorizeRole("patient"), getAppointmentsForPatient)
router.route("/delete-patient").get(verifyJWT, authorizeRole("patient"), deletePatient)
router.route("/get-nearby-hospitals").get(verifyJWT, authorizeRole("patient"), getNearbyHospitals)
router.route("/update-patient").patch(verifyJWT, authorizeRole("patient"), updatePatient)


export default router