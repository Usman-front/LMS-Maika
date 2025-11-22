import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI || 'mongodb+srv://sadia031755_db_user:1122334455@cluster0.qghapru.mongodb.net/?appName=Cluster0'

export async function connectDB() {
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
}
