import { useEffect, useState } from 'react'
import { getAnnouncements, postAnnouncement } from '../services/api.js'

export default function Announcements() {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')

  useEffect(() => {
    getAnnouncements().then(setItems)
  }, [])

  async function add(e) {
    e.preventDefault()
    if (!title.trim()) return
    const created = await postAnnouncement({ title })
    setItems((prev) => [...prev, created])
    setTitle('')
  }

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="flex gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" className="flex-1 border rounded p-2" />
        <button className="rounded bg-purple-600 text-white px-3">Add</button>
      </form>
      <ul className="space-y-2">
        {items.map((a) => (
          <li key={a.id} className="border rounded p-3">
            <div className="font-medium">{a.title}</div>
            {a.body && <div className="text-sm text-gray-600">{a.body}</div>}
          </li>
        ))}
        {items.length === 0 && <div className="text-sm text-gray-600">No announcements yet.</div>}
      </ul>
    </div>
  )
}
