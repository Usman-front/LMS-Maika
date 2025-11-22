import { useState } from 'react'
import { useAuth } from '../context/auth.js'

export default function Register() {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const res = await register('', email, password, role)
    setMessage(res.ok ? 'Account created' : 'Failed to create')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 w-full border rounded p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-1 w-full border rounded p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full border rounded p-2">
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit" className="inline-flex items-center rounded-md bg-purple-600 text-white px-4 py-2">Create</button>
      {message && <div className="text-sm text-gray-600">{message}</div>}
    </form>
  )
}
