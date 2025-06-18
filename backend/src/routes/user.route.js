import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { changeCurrentPassword, loginUser, logoutUser, refreshAccessToken, registerUser, getCurrentUser, 
    updateAccountDetails,updateUserAvatar, 
    deleteUser
} from "../controllers/user.controller.js";

const router=Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)



//secure routes needing auth
router.route("/logout").get(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)//we dont use verifyJWT here cause user access token is expired and we r giving new token to them
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)//here we r expecting a file so multer middleware is used
router.route("/delete").get(verifyJWT,deleteUser)



export default router