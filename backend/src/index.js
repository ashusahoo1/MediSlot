// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";//sometimes if you dont give .js the code gives error so write the complete path
import {app} from './app.js'
dotenv.config({
    path: './.env'
})


connectDB()//async func return promise
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})
