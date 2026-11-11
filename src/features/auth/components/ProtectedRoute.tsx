import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  // Aguarda a recuperação da sessão.
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090D18]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
      </div>
    )
  }

  // Redireciona usuários não autenticados.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}