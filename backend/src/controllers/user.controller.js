import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendMail } from "../utils/mailer.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"
import { registrationEmailHTML } from "../mailTemplate.js";

//function only used here
const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken//give refresh token to user
        await user.save({ validateBeforeSave: false })
        //?when you save something in db, it needs all fields some of which are marked as required but here we are not passing all required 
        //?fields, so we remove validation such that mongoDB wont care if everything is sent properly it will just save the data

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}
//controllers
const registerUser=asyncHandler(async(req,res)=>{
    const {fullName, email, userName, password, role} = req.body;

    if ([fullName, email, userName, password,role].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }
    //check for existing user
    const existedUser= await User.findOne({
        $or: [{ userName }, { email }]
    })
    if(existedUser){
        throw new ApiError(400,"User already exist")
    }

    const user = await User.create({
        fullName,
        email, 
        password,
        userName: userName.toLowerCase(),
        role: role
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user");
    }
    // console.log("Email to send:", createdUser.email);
    const mailResult = await sendMail(createdUser.email, "Welcome!", `${registrationEmailHTML(fullName)}`);

    if (!mailResult.success) {
    throw new ApiError(500,`failed to send email: ${mailResult.error}`)
    } else {
    console.log("Mail sent! ID:", mailResult.messageId);
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None", // Must be "None" for cross-site cookies
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                201,
                {
                    user: createdUser,
                    accessToken,
                    refreshToken
                },
                "Account created and logged in successfully"
            )
        );
})

//TODO: SEE IF YOU NEED TO CHECK IF USER IS LOGGED IN ALREADY DONT LOG HIM IN AGAIN
const loginUser=asyncHandler(async(req,res)=>{
    const {email,password}=req.body;
    if ([email, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findOne({
        $or: [{email}]
    })
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
   //here isPasswordCorrect is a method of the obj we defined in schema so here we will use "user" not "User" which is connected to DB
   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //*options are sent with cokkies to ensure more security
    const options = {
        httpOnly: true,
        secure: true,//secure allows https sites only or localhost
        sameSite: "None", // Must be "None" for cross-site cookies
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {user: loggedInUser, accessToken, refreshToken},"User logged In Successfully")
    )
})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        //.user is a property added by auth middleware when logout is clicked,it contains every info about user other than password and refreshtoken
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    //?here hashing is taken care by pre hook or pre middleware written in user model, before saving in DB the password gets encrypted

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})


    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"User fetched successfully" ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email, userName} = req.body

    if (!fullName || !email || !userName) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email,
                userName
            }
        },
        {new: true}//updated information is sent to u, so u can store it if this is used
        
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = asyncHandler(async(req, res) => {
    //here multer middleware has allowed more field in req other than body hence we can use req.file here to access files
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    const currentuser=req.user;
    
    //TODO: delete old image - assignment
    const fullOldImageUrl=currentuser.avatar;
    const splitUrl = fullOldImageUrl.split('/')
    const fileNameWithExtension = splitUrl[splitUrl.length - 1];
    const publicId = fileNameWithExtension.split('.')[0];
    const deleteResponse=await deleteFromCloudinary(publicId);
    if(deleteResponse){
        console.log("img delted succesfully");
    }
    else{
        console.log("error in deleting image")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }
    
    const user = await User.findByIdAndUpdate(
        currentuser?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Delete the user by their ID
  const deletedUser = await User.findByIdAndDelete(userId);

 if(deletedUser.deletedCount===0){
    throw new ApiError(500, "unable to delete user")
 }

  res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    deleteUser
}