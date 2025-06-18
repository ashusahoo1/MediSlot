import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import stripeRoute from "./routes/stripe.route.js"

const app=express()

//cors middleware

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// Stripe webhook requires raw body, so this must come before express.json()
app.use('/api/v1/stripe', stripeRoute);
// basically it must come before app.use(express.json({limit: "64kb"}))

app.use(express.json({limit: "64kb"}))//Parses requests with JSON payloads(convertible to json) and makes the data available under req.body.
app.use(express.urlencoded({extended: true, limit: "32kb"}))//Parses incoming requests with URL-encoded payloads and makes the data available under req.body.
app.use(express.static("public"))
app.use(cookieParser())


import userRouter from './routes/user.route.js'
import patientRouter from "./routes/patient.route.js"
import hospitalRouter from "./routes/hospital.route.js"
import doctorRouter from "./routes/doctor.route.js"
import notificationRouter from "./routes/notification.route.js"
import appointmentRouter from "./routes/appointment.route.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/patients", patientRouter)
app.use("/api/v1/hospitals", hospitalRouter)
app.use("/api/v1/doctors",doctorRouter )
app.use("/api/v1/notifications",notificationRouter )
app.use("/api/v1/appointments",appointmentRouter )





export { app }