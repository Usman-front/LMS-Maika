import mongoose from 'mongoose'

const SubmissionSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  assignmentId: { type: Number, required: true, index: true },
  assignmentTitle: { type: String, default: '' },
  courseId: { type: Number, required: true },
  courseTitle: { type: String, default: '' },
  studentEmail: { type: String, required: true, index: true },
  file: { type: String, default: null },
  text: { type: String, default: '' },
  submittedAt: { type: String, required: true },
}, { timestamps: true })

export default mongoose.model('Submission', SubmissionSchema)
