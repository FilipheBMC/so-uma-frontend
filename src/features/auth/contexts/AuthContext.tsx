import {
  createContext,
  useEffect,
  useState,
} from 'react'

import type { ReactNode } from 'react'

import { authService } from '../services/auth.service'

import type {
  AuthContextData,
  LoginInput,
  User,
} from '../types/auth.types'

import { AUTH_TOKEN_KEY } from '@/services/api'

export const AuthContext = createContext<
  AuthContextData | undefined
>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Recupera a sessão quando a aplicação é iniciada.
  useEffect(() => {
    async function loadUser() {
      const token = sessionStorage.getItem(AUTH_TOKEN_KEY)

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const authenticatedUser = await authService.getMe()

        setUser(authenticatedUser)
      } catch {
        sessionStorage.removeItem(AUTH_TOKEN_KEY)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  // Realiza o login.
  async function login(data: LoginInput) {
    const response = await authService.login(data)

    sessionStorage.setItem(
      AUTH_TOKEN_KEY,
      response.token,
    )

    setUser(response.user)
  }

  // Encerra a sessão local.
  function logout() {
    sessionStorage.removeItem(AUTH_TOKEN_KEY)
    setUser(null)
  }

  const value: AuthContextData = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}