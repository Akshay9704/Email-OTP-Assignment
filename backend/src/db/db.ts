import mongoose from "mongoose";
import { DB_NAME } from "../constants"

const connectDB = async () => {
    try {
        const uri = `${process.env.MONGO_URI}/${DB_NAME}`;
        console.log('MongoDB URI:', uri); // Log the URI
        const connectionInstance = await mongoose.connect(uri);
        console.log(`MongoDB connected to: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

export default connectDB;