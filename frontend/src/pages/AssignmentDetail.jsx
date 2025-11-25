import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAssignmentById, getMySubmission, submitAssignment, updateAssignment } from '../services/api.js'
import { useAuth } from '../context/auth.js'

export default function AssignmentDetail() {
  const { id } = useParams()
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(null)
  const [editing, setEditing] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    Promise.all([getAssignmentById(id), getMySubmission(id)])
      .then(([a, s]) => { setAssignment(a); setSubmitted(s); setText(s?.text || ''); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  async function submit() {
    const res = await submitAssignment(id, { text })
    setSubmitted(res.submission)
  }

  if (loading) return <div>Loading assignment...</div>
  if (!assignment) return <div>Not found</div>

  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold text-center">{assignment.title}</div>
      {(user?.role === 'admin' || user?.role === 'teacher') && (
        <div className="flex justify-end">
          <button onClick={() => setEditing((e) => !e)} className="rounded bg-purple-600 text-white px-3 py-1">
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      )}
      {editing && (user?.role === 'admin' || user?.role === 'teacher') ? (
        <div className="space-y-3">
          <input value={assignment.title} onChange={(e) => setAssignment({ ...assignment, title: e.target.value })} className="w-full border rounded p-2" />
          <textarea value={assignment.description || ''} onChange={(e) => setAssignment({ ...assignment, description: e.target.value })} className="w-full border rounded p-2" rows={6} />
          <button
            onClick={async () => {
              const updated = await updateAssignment(id, { title: assignment.title, description: assignment.description })
              setAssignment(updated)
              setEditing(false)
            }}
            className="rounded bg-purple-600 text-white px-3 py-2"
          >
            Save
          </button>
        </div>
      ) : (
        <>
          <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full border rounded p-2" rows={6} />
          <button onClick={submit} className="rounded bg-purple-600 text-white px-3 py-2">Submit</button>
          {submitted && <div className="text-sm text-gray-600">Last submitted: {new Date(submitted.submittedAt).toLocaleString()}</div>}
        </>
      )}
    </div>
  )
}
