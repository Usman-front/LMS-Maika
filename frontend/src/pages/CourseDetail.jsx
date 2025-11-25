import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCourseById } from '../services/api.js'

export default function CourseDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCourseById(id).then((data) => { setCourse(data); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div>Loading course...</div>
  if (!course) return <div>Not found</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{course.title}</h1>
      {course.description && (
        <div className="border rounded p-3 text-gray-800" style={{ whiteSpace: 'pre-wrap' }}>
          {course.description}
        </div>
      )}
    </div>
  )
}
