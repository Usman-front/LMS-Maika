import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartlearn'

export async function connectDB() {
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
}
