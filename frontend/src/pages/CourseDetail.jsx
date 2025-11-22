import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCourseById, updateCourse } from '../services/api.js'

export default function CourseDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCourseById(id).then((data) => { setCourse(data); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  async function save() {
    const updated = await updateCourse(id, course)
    setCourse(updated)
  }

  if (loading) return <div>Loading course...</div>
  if (!course) return <div>Not found</div>

  return (
    <div className="space-y-4">
      <input value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} className="w-full border rounded p-2" />
      <textarea value={course.description || ''} onChange={(e) => setCourse({ ...course, description: e.target.value })} className="w-full border rounded p-2" rows={4} />
      <button onClick={save} className="rounded bg-purple-600 text-white px-3 py-2">Save</button>
    </div>
  )
}
