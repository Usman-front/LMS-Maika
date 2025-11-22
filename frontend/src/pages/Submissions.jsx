import { useEffect, useState } from 'react'
import { getSubmissions } from '../services/api.js'

export default function Submissions() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSubmissions().then((data) => { setSubmissions(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading submissions...</div>

  return (
    <div className="space-y-3">
      {submissions.map((s) => (
        <div key={s.id} className="border rounded p-3">
          <div className="font-medium">{s.assignmentTitle} • {s.courseTitle}</div>
          <div className="text-sm text-gray-600">{s.studentEmail}</div>
          <div className="mt-2 text-sm">{s.text || '—'}</div>
        </div>
      ))}
      {submissions.length === 0 && <div className="text-sm text-gray-600">No submissions yet.</div>}
    </div>
  )
}
