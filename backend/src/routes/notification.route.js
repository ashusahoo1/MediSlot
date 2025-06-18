import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteNotification, getAllNotifications } from "../controllers/notification.controller.js";

const router=Router()


router.route("/get-all-notifications").get(verifyJWT, getAllNotifications)
router.route("/delete-notifications").get(verifyJWT, deleteNotification)



export default router