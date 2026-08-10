import mongoose from "mongoose";

export default async function db() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database has been connected");

    } catch (error) {
        console.log("Database is not connected");
    }
}