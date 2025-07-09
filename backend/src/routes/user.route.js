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


/*



| Method     | When to Use                                         | What It Does                                       |
| ---------- | --------------------------------------------------- | -------------------------------------------------- |
| **GET**    | When you want to **read/fetch data**                | Retrieves data (does **not** modify anything)      |
| **POST**   | When you want to **create new data**                | Creates a new resource (e.g., user, post, product) |
| **PUT**    | When you want to **replace** existing data entirely | Updates **entire** resource (all fields)           |
| **PATCH**  | When you want to **partially update** existing data | Updates **some fields** of a resource              |
| **DELETE** | When you want to **remove** data                    | Deletes the specified resource                     |


*/