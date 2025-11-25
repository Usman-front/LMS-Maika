import { useEffect, useState } from 'react'
import { getSubmissions, deleteSubmissionById } from '../services/api.js'
import { useAuth } from '../context/auth.js'

export default function Submissions() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

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
          {user?.role === 'admin' && (
            <div className="mt-2">
              <button
                onClick={async () => {
                  await deleteSubmissionById(s.id)
                  setSubmissions((prev) => prev.filter((it) => it.id !== s.id))
                }}
                className="rounded bg-red-600 text-white px-3 py-1"
              >Delete</button>
            </div>
          )}
        </div>
      ))}
      {submissions.length === 0 && <div className="text-sm text-gray-600">No submissions yet.</div>}
    </div>
  )
}
