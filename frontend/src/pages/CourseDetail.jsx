import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCourseById, updateCourse } from '../services/api.js'
import { useAuth } from '../context/auth.js'

export default function CourseDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    getCourseById(id).then((data) => { setCourse(data); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div>Loading course...</div>
  if (!course) return <div>Not found</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-center">{course.title}</h1>
      {user?.role === 'admin' && (
        <div className="flex justify-end">
          <button onClick={() => setEditing((e) => !e)} className="rounded bg-purple-600 text-white px-3 py-1">
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      )}
      {!editing && (
        <div className="border rounded p-3 text-gray-800" style={{ whiteSpace: 'pre-wrap' }}>
          {course.description}
        </div>
      )}
      {editing && user?.role === 'admin' && (
        <div className="space-y-3">
          <input value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} className="w-full border rounded p-2" />
          <textarea value={course.description || ''} onChange={(e) => setCourse({ ...course, description: e.target.value })} className="w-full border rounded p-2" rows={6} />
          <button
            onClick={async () => {
              const updated = await updateCourse(id, { title: course.title, description: course.description })
              setCourse(updated)
              setEditing(false)
            }}
            className="rounded bg-purple-600 text-white px-3 py-2"
          >
            Save
          </button>
        </div>
      )}
    </div>
  )
}
