import { useEffect, useState } from 'react'
import { createAssignment, getAssignments } from '../services/api.js'
import { Link } from 'react-router-dom'

export default function Assignments() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [courseId, setCourseId] = useState('')

  useEffect(() => {
    getAssignments().then((data) => { setItems(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function add(e) {
    e.preventDefault()
    if (!title.trim() || !courseId) return
    const created = await createAssignment({ title, courseId })
    setItems((prev) => [...prev, created])
    setTitle('')
    setCourseId('')
  }

  if (loading) return <div>Loading assignments...</div>

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title" className="border rounded p-2" />
        <input value={courseId} onChange={(e) => setCourseId(e.target.value)} placeholder="Course ID" className="border rounded p-2" />
        <button className="rounded bg-purple-600 text-white px-3">Add</button>
      </form>
      <ul className="space-y-2">
        {items.map((a) => (
          <li key={a.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{a.title}</div>
              <div className="text-sm text-gray-600">Course #{a.courseId}</div>
            </div>
            <Link to={`/assignments/${a.id}`} className="text-purple-700">Open</Link>
          </li>
        ))}
        {items.length === 0 && <div className="text-sm text-gray-600">No assignments yet.</div>}
      </ul>
    </div>
  )
}
