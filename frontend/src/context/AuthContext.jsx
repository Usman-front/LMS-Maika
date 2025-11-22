import { useMemo, useState, useEffect } from 'react'
import { authLogin, authRegister } from '../services/api.js'
import { AuthContext } from './auth.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.email && parsed.role) {
          setUser(parsed)
        }
      }
    } catch (e) { void e }
    setIsLoading(false)
  }, [])

  async function login(email, password) {
    const res = await authLogin({ email, password })
    const nextUser = res?.user ?? { email, role: 'student' }
    setUser(nextUser)
    try {
      localStorage.setItem('auth_user', JSON.stringify(nextUser))
      if (res?.token) localStorage.setItem('auth_token', res.token)
    } catch (e) { void e }
    return { ok: Boolean(res?.ok) }
  }

  async function register(name, email, password, role) {
    const res = await authRegister({ email, password, role })
    return { ok: Boolean(res?.ok) }
  }

  function logout() {
    setUser(null)
    try {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
    } catch (e) { void e }
  }

  const value = useMemo(() => ({ user, isLoading, login, register, logout }), [user, isLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
