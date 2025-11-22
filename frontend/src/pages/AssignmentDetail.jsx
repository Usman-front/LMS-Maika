import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAssignmentById, getMySubmission, submitAssignment } from '../services/api.js'

export default function AssignmentDetail() {
  const { id } = useParams()
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(null)

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
      <div className="text-xl font-semibold">{assignment.title}</div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full border rounded p-2" rows={6} />
      <button onClick={submit} className="rounded bg-purple-600 text-white px-3 py-2">Submit</button>
      {submitted && <div className="text-sm text-gray-600">Last submitted: {new Date(submitted.submittedAt).toLocaleString()}</div>}
    </div>
  )
}
