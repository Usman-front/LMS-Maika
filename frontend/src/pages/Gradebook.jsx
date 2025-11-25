import { useEffect, useState } from 'react'
import { getGradebook, createGradebookEntry, updateGradebookEntry, deleteGradebookEntry } from '../services/api.js'
import { useAuth } from '../context/auth.js'

export default function Gradebook() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const [form, setForm] = useState({ course: '', assignment: '', grade: '', feedback: '', studentEmail: '' })

  useEffect(() => {
    getGradebook().then((data) => { setItems(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading gradebook...</div>

  return (
    <div className="space-y-3">
      {(user?.role === 'admin' || user?.role === 'teacher') && (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 border rounded p-3">
          <input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} placeholder="Course" className="border rounded p-2" />
          <input value={form.assignment} onChange={(e) => setForm({ ...form, assignment: e.target.value })} placeholder="Assignment" className="border rounded p-2" />
          <input value={form.studentEmail} onChange={(e) => setForm({ ...form, studentEmail: e.target.value })} placeholder="Student Email" className="border rounded p-2" />
          <input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="Grade" className="border rounded p-2" />
          <div className="flex gap-2">
            <button
              className="rounded bg-purple-600 text-white px-3"
              onClick={async () => {
                const created = await createGradebookEntry({ ...form })
                setItems((prev) => [...prev, created])
                setForm({ course: '', assignment: '', grade: '', feedback: '', studentEmail: '' })
              }}
            >Add</button>
          </div>
          <textarea value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} placeholder="Feedback" className="sm:col-span-5 border rounded p-2" rows={3} />
        </div>
      )}
      {items.map((g) => (
        <div key={g.id} className="border rounded p-3">
          <div className="font-medium">{g.assignment} • {g.course}</div>
          <div className="text-sm text-gray-600">{g.studentEmail}</div>
          <div className="mt-2 text-sm">Grade: {g.grade ?? '—'}</div>
          {g.feedback && <div className="mt-1 text-sm text-gray-700">{g.feedback}</div>}
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input value={g.grade ?? ''} onChange={(e) => setItems((prev) => prev.map((it) => it.id === g.id ? { ...it, grade: e.target.value } : it))} placeholder="Grade" className="border rounded p-2" />
              <textarea value={g.feedback || ''} onChange={(e) => setItems((prev) => prev.map((it) => it.id === g.id ? { ...it, feedback: e.target.value } : it))} className="sm:col-span-2 border rounded p-2" rows={2} />
              <button
                className="rounded bg-purple-600 text-white px-3"
                onClick={async () => {
                  const updated = await updateGradebookEntry(g.id, { grade: g.grade, feedback: g.feedback })
                  setItems((prev) => prev.map((it) => it.id === g.id ? updated : it))
                }}
              >Save</button>
              {user?.role === 'admin' && (
                <button
                  className="rounded bg-red-600 text-white px-3"
                  onClick={async () => {
                    await deleteGradebookEntry(g.id)
                    setItems((prev) => prev.filter((it) => it.id !== g.id))
                  }}
                >Delete</button>
              )}
            </div>
          )}
        </div>
      ))}
      {items.length === 0 && <div className="text-sm text-gray-600">No grade entries.</div>}
    </div>
  )
}
