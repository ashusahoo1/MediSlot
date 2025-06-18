import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

//here "res" is not being used so some people write "_" in place of res
export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        //either the user will have token stored in cookies or they will manually send some authorization such as api_key etc
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        //the decodedToken contains id,email etc info about the user (as writen in model) from which we use _id to get access to user in DB
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) { 
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;//add a property of user to req which contains all necessary info about user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})