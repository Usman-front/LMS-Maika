import mongoose from 'mongoose'

const CourseSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  overview: { type: String, default: '' },
  resources: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.model('Course', CourseSchema)
