import { useState } from 'react'
import { useAuth } from '../context/auth.js'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const res = await login(email, password)
      if (res.ok) navigate((location.state?.from?.pathname) || '/', { replace: true })
      else setError('Invalid credentials')
    } catch {
      setError('Login failed')
    }
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
      <button type="submit" className="inline-flex items-center rounded-md bg-purple-600 text-white px-4 py-2">Login</button>
      {error && <div className="text-sm text-red-600">{error}</div>}
    </form>
  )
}
