import mongoose from 'mongoose'

const GradebookSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  course: { type: String, required: true },
  assignment: { type: String, required: true },
  grade: { type: mongoose.Schema.Types.Mixed, default: null },
  feedback: { type: String, default: '' },
  studentEmail: { type: String, required: true },
}, { timestamps: true })

export default mongoose.model('Gradebook', GradebookSchema)
