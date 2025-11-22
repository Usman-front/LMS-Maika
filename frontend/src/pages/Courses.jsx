import { useEffect, useState } from 'react'
import { createCourse, getCourses } from '../services/api.js'
import { Link } from 'react-router-dom'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')

  useEffect(() => {
    getCourses().then((data) => { setCourses(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function addCourse(e) {
    e.preventDefault()
    if (!title.trim()) return
    const created = await createCourse({ title })
    setCourses((prev) => [...prev, created])
    setTitle('')
  }

  if (loading) return <div>Loading courses...</div>

  return (
    <div className="space-y-4">
      <form onSubmit={addCourse} className="flex gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New course title" className="flex-1 border rounded p-2" />
        <button className="rounded bg-purple-600 text-white px-3">Add</button>
      </form>
      <ul className="space-y-2">
        {courses.map((c) => (
          <li key={c.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{c.title}</div>
              {c.description && <div className="text-sm text-gray-600">{c.description}</div>}
            </div>
            <Link to={`/courses/${c.id}`} className="text-purple-700">Open</Link>
          </li>
        ))}
        {courses.length === 0 && <div className="text-sm text-gray-600">No courses yet.</div>}
      </ul>
    </div>
  )
}
