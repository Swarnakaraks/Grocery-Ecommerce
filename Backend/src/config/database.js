import mongoose from "mongoose";

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("MongoDB is connected successfully")
    }

    catch(error){
        console.error("MongoDB connection error");
        console.error(error.message);

        process.exit(1);
    }
}

export default connectDB;