import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import  authorizeRole  from "../middlewares/authorizeRole.middleware.js";
import { createHospital, deleteHospital, getAllHospitals, getHospitalById, getHospitalDetails, updateHospital } from "../controllers/hospital.controller.js";

const router= Router()


router.route("/get-all-hospital").get(getAllHospitals)

//authorized routes
router.route("/create-hospital").post(verifyJWT,authorizeRole("hospital"), createHospital)
router.route("/get-hospital").get(verifyJWT,authorizeRole("hospital"), getHospitalDetails)
router.route("/update-hospital").patch(verifyJWT,authorizeRole("hospital"), updateHospital)
router.route("/delete-hospital").delete(verifyJWT,authorizeRole("hospital"), deleteHospital)

router.route("/:hospitalId").get( getHospitalById)

export default router