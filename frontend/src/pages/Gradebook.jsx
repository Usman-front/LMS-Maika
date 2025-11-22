import { useEffect, useState } from 'react'
import { getGradebook } from '../services/api.js'

export default function Gradebook() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGradebook().then((data) => { setItems(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading gradebook...</div>

  return (
    <div className="space-y-3">
      {items.map((g) => (
        <div key={g.id} className="border rounded p-3">
          <div className="font-medium">{g.assignment} • {g.course}</div>
          <div className="text-sm text-gray-600">{g.studentEmail}</div>
          <div className="mt-2 text-sm">Grade: {g.grade ?? '—'}</div>
          {g.feedback && <div className="mt-1 text-sm text-gray-700">{g.feedback}</div>}
        </div>
      ))}
      {items.length === 0 && <div className="text-sm text-gray-600">No grade entries.</div>}
    </div>
  )
}
