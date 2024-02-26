import mongoose from 'mongoose';

export const connectToDB = async () => {

    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        console.log("Connected to the MongoDB")
    } catch (error) {
        console.log("Failed to connect to the MongoDB: ", error)
        process.exit(1)
    }
}