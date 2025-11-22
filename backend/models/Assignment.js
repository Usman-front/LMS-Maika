import mongoose from 'mongoose'

const AssignmentSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  title: { type: String, required: true },
  due: { type: String, default: null },
  courseId: { type: Number, required: true },
  description: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.model('Assignment', AssignmentSchema)
