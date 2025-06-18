import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";//sometimes if you dont give .js the code gives error so write the complete path


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)  
        /*
        process.exit() is a method in Node.js used to terminate a running process.
        It stops the event loop immediately and exits the program with a specified exit code.
        0: succesful 1,2:some error
        Unlike asynchronous termination (e.g., server.close()), process.exit() immediately stops execution, 
        potentially skipping pending I/O operations like writing to files or sending logs.
        */
    }
}

export default connectDB