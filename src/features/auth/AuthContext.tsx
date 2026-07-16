import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User } from '@/types'
import { login as apiLogin } from '@/api/client'

interface AuthContextValue {
  currentUser: User | null
  token: string | null
  isAuthenticating: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  async function login(email: string, password: string) {
    setIsAuthenticating(true)
    try {
      const result = await apiLogin({ email, password })
      setCurrentUser(result.user)
      setToken(result.token)
    } finally {
      setIsAuthenticating(false)
    }
  }

  function logout() {
    setCurrentUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, token, isAuthenticating, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
