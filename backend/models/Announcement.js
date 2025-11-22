import mongoose from 'mongoose'

const AnnouncementSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  title: { type: String, required: true },
  body: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.model('Announcement', AnnouncementSchema)
