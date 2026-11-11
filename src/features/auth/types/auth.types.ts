export interface User {
  id: string
  name: string
  email: string
  created_at: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface AuthContextData {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginInput) => Promise<void>
  logout: () => void
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}