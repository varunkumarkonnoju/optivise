import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authApi.me().then(r => setUser(r.data)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await authApi.login(email, password)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user_email', data.email || '')
    setUser(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    localStorage.removeItem('user_email')
    localStorage.removeItem('used_ai_description')
    localStorage.removeItem('viewed_recommendations')
    localStorage.removeItem('onboarding_dismissed')
    localStorage.removeItem('dismissed_recs')
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)