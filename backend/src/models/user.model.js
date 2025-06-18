import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema= new Schema({
    userName: {
        type: String,
        required: true,
        unique: [true,'usrname already taken'],
        lowercase: true,
        trim: true, 
        index: true//forsearching purposes if you think you will use this field to search add index property to it
    },
    fullName:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, 
        match: [/.+@.+\..+/, 'Please enter a valid email'],//regex for email validation
    },
    password: {
        type: String,
        required: [true, 'Password is required']//[true,custom error msg]
    },
    role: {
        type: String,
        required: true,
        enum: ['hospital', 'doctor', 'patient']
    },
    avatar: {
        type: String, // cloudinary url
        default: "https://res.cloudinary.com/dpjzdmxmb/image/upload/v1748199191/s5vopvoplqn153d00vvz.jpg",
    },
    refreshToken: {
        type: String
    }
},{timestamps:true})

//pre middleware works before saving any data in DB used for changing information or registering
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    //if the user's password has been modified then before saving in DB hash it
    else{
        this.password = await bcrypt.hash(this.password, 10)
        next()
    }
})

//add a method to useSchema class to check password, here async is used as bcrypt takes lot of time
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    //create jwt token by .sign
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    //create jwt token by .sign
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User= mongoose.model("User", userSchema)