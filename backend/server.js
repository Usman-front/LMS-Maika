import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { connectDB } from './db.js'
import { nextId } from './models/Counter.js'
import User from './models/User.js'
import Course from './models/Course.js'
import Assignment from './models/Assignment.js'
import Submission from './models/Submission.js'
import Announcement from './models/Announcement.js'
import Gradebook from './models/Gradebook.js'

const app = express()
const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

app.use(cors())
app.use(express.json({ limit: '10mb' }))

const signToken = (user) => jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '12h' })
const authRequired = (req, res, next) => {
  const h = req.headers.authorization || ''
  const [, token] = h.split(' ')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {}
  const found = await User.findOne({ email, password }).lean()
  if (!found) return res.status(401).json({ ok: false, error: 'Invalid credentials' })
  const token = signToken(found)
  return res.json({ ok: true, user: { email: found.email, role: found.role }, token })
})

app.post('/auth/register', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ ok: false, error: 'Admin only' })
  const { email, password, role } = req.body || {}
  if (!email || !password) return res.status(400).json({ ok: false, error: 'Email and password required' })
  const exists = await User.findOne({ email }).lean()
  if (exists) return res.status(409).json({ ok: false, error: 'Email exists' })
  const allowedRoles = ['student', 'teacher', 'admin']
  const assignedRole = allowedRoles.includes(role) ? role : 'student'
  await User.create({ email, password, role: assignedRole })
  return res.json({ ok: true, user: { email, role: assignedRole } })
})

app.get('/me', authRequired, (req, res) => {
  res.json({ user: req.user })
})

app.get('/students', authRequired, async (req, res) => {
  if (!['teacher', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
  const students = await User.find({ role: 'student' }).select('email').lean()
  res.json(students.map((u) => ({ email: u.email })))
})

app.get('/courses', authRequired, async (req, res) => {
  const courses = await Course.find().lean()
  res.json(courses)
})

app.get('/courses/:id', authRequired, async (req, res) => {
  const item = await Course.findOne({ id: Number(req.params.id) }).lean()
  if (!item) return res.status(404).json({ error: 'Not found' })
  return res.json(item)
})

app.post('/courses', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  const { title, description, overview, resources } = req.body || {}
  if (!title) return res.status(400).json({ error: 'Title required' })
  const id = await nextId('courses')
  const course = await Course.create({ id, title, description: description || '', overview: overview || '', resources: resources || '' })
  return res.status(201).json(course)
})

app.put('/courses/:id', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  const { title, description, overview, resources } = req.body || {}
  const updated = await Course.findOneAndUpdate(
    { id: Number(req.params.id) },
    {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(overview !== undefined ? { overview } : {}),
      ...(resources !== undefined ? { resources } : {}),
    },
    { new: true }
  ).lean()
  if (!updated) return res.status(404).json({ error: 'Not found' })
  res.json(updated)
})

app.delete('/courses/:id', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  const removed = await Course.findOneAndDelete({ id: Number(req.params.id) }).lean()
  if (!removed) return res.status(404).json({ error: 'Not found' })
  res.json(removed)
})

app.get('/assignments', authRequired, async (req, res) => {
  const { courseId } = req.query || {}
  const filter = {}
  if (courseId) filter.courseId = Number(courseId)
  const assignments = await Assignment.find(filter).lean()
  res.json(assignments)
})

app.get('/assignments/:id', authRequired, async (req, res) => {
  const item = await Assignment.findOne({ id: Number(req.params.id) }).lean()
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

app.post('/assignments', authRequired, async (req, res) => {
  if (!['teacher', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
  const { title, due, courseId, description } = req.body || {}
  if (!title || !courseId) return res.status(400).json({ error: 'Title and courseId required' })
  const id = await nextId('assignments')
  const assignment = await Assignment.create({ id, title, due: due || null, courseId: Number(courseId), description: description || '' })
  res.status(201).json(assignment)
})

app.put('/assignments/:id', authRequired, async (req, res) => {
  if (!['teacher', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
  const { title, due, courseId, description } = req.body || {}
  const updated = await Assignment.findOneAndUpdate(
    { id: Number(req.params.id) },
    {
      ...(title !== undefined ? { title } : {}),
      ...(due !== undefined ? { due } : {}),
      ...(courseId !== undefined ? { courseId: Number(courseId) } : {}),
      ...(description !== undefined ? { description } : {}),
    },
    { new: true }
  ).lean()
  if (!updated) return res.status(404).json({ error: 'Not found' })
  res.json(updated)
})

app.delete('/assignments/:id', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  const removed = await Assignment.findOneAndDelete({ id: Number(req.params.id) }).lean()
  if (!removed) return res.status(404).json({ error: 'Not found' })
  res.json(removed)
})

app.post('/assignments/:id/submit', authRequired, async (req, res) => {
  const { file, text } = req.body || {}
  const assignmentId = Number(req.params.id)
  const assignment = await Assignment.findOne({ id: assignmentId }).lean()
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' })
  const course = await Course.findOne({ id: Number(assignment.courseId) }).lean()

  const base = {
    assignmentId,
    assignmentTitle: assignment.title,
    courseId: assignment.courseId,
    courseTitle: course?.title || String(assignment.courseId),
    studentEmail: req.user.email,
    file: file || null,
    text: text || '',
    submittedAt: new Date().toISOString(),
  }

  const existing = await Submission.findOne({ assignmentId, studentEmail: req.user.email }).lean()
  if (existing) {
    const updated = await Submission.findOneAndUpdate({ assignmentId, studentEmail: req.user.email }, base, { new: true }).lean()
    return res.json({ ok: true, submission: updated })
  } else {
    const id = await nextId('submissions')
    const created = await Submission.create({ id, ...base })
    return res.status(201).json({ ok: true, submission: created })
  }
})

app.get('/assignments/:id/submission/me', authRequired, async (req, res) => {
  const assignmentId = Number(req.params.id)
  const found = await Submission.findOne({ assignmentId, studentEmail: req.user.email }).lean()
  return res.json(found || null)
})

app.get('/submissions', authRequired, async (req, res) => {
  if (!['teacher', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
  const { assignmentId, courseId } = req.query || {}
  const filter = {}
  if (assignmentId) filter.assignmentId = Number(assignmentId)
  if (courseId) filter.courseId = Number(courseId)
  const submissions = await Submission.find(filter).lean()
  return res.json(submissions)
})

app.get('/announcements', authRequired, async (req, res) => {
  const announcements = await Announcement.find().lean()
  res.json(announcements)
})

app.post('/announcements', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  const { title, body } = req.body || {}
  if (!title) return res.status(400).json({ error: 'Title required' })
  const id = await nextId('announcements')
  const announcement = await Announcement.create({ id, title, body: body || '' })
  res.status(201).json(announcement)
})

app.put('/announcements/:id', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  const { title, body } = req.body || {}
  const updated = await Announcement.findOneAndUpdate(
    { id: Number(req.params.id) },
    { ...(title !== undefined ? { title } : {}), ...(body !== undefined ? { body } : {}) },
    { new: true }
  ).lean()
  if (!updated) return res.status(404).json({ error: 'Not found' })
  res.json(updated)
})

app.delete('/announcements/:id', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  const removed = await Announcement.findOneAndDelete({ id: Number(req.params.id) }).lean()
  if (!removed) return res.status(404).json({ error: 'Not found' })
  res.json(removed)
})

app.get('/gradebook', authRequired, async (req, res) => {
  let gradebook = await Gradebook.find().lean()
  if (req.user.role === 'student') {
    gradebook = gradebook.filter((g) => String(g.studentEmail) === String(req.user.email))
  }
  res.json(gradebook)
})

app.post('/gradebook', authRequired, async (req, res) => {
  if (!['teacher', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
  const { course, assignment, grade, feedback, studentEmail } = req.body || {}
  if (!course || !assignment || !studentEmail) return res.status(400).json({ error: 'course, assignment, studentEmail required' })
  const id = await nextId('gradebook')
  const entry = await Gradebook.create({ id, course, assignment, grade: grade ?? null, feedback: feedback ?? '', studentEmail })
  res.status(201).json(entry)
})

app.put('/gradebook/:id', authRequired, async (req, res) => {
  if (!['teacher', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
  const { course, assignment, grade, feedback, studentEmail } = req.body || {}
  const updated = await Gradebook.findOneAndUpdate(
    { id: Number(req.params.id) },
    {
      ...(course !== undefined ? { course } : {}),
      ...(assignment !== undefined ? { assignment } : {}),
      ...(grade !== undefined ? { grade } : {}),
      ...(feedback !== undefined ? { feedback } : {}),
      ...(studentEmail !== undefined ? { studentEmail } : {}),
    },
    { new: true }
  ).lean()
  if (!updated) return res.status(404).json({ error: 'Not found' })
  res.json(updated)
})

app.delete('/gradebook/:id', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  const removed = await Gradebook.findOneAndDelete({ id: Number(req.params.id) }).lean()
  if (!removed) return res.status(404).json({ error: 'Not found' })
  res.json(removed)
})

connectDB()
  .then(() => {
    (async () => {
      try {
        const existingAdmin = await User.findOne({ role: 'admin' }).lean()
        if (!existingAdmin) {
          const email = process.env.ADMIN_EMAIL || 'admin@smartlearn.local'
          const password = process.env.ADMIN_PASSWORD || 'admin123'
          const found = await User.findOne({ email }).lean()
          if (!found) {
            await User.create({ email, password, role: 'admin' })
            console.log(`Seeded default admin: ${email}`)
          }
        }
      } catch (e) {
        console.error('Admin bootstrap failed', e)
      }
    })()
    app.listen(PORT, () => {
      console.log(`SmartLearn backend running at http://localhost:${PORT}/`)
    })
  })
  .catch((e) => {
    console.error('DB connection error', e)
    process.exit(1)
  })
