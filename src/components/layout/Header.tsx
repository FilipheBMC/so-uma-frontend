import { Bell, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/features/auth/hooks/useAuth'

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-800 bg-[#0F172A] px-8">

      <div>
        <h1 className="text-lg font-semibold text-white">
          Painel de estudos
        </h1>

        <p className="text-sm text-slate-400">
          Bem-vindo de volta, {user?.name}!
        </p>
      </div>

      <div className="flex items-center gap-5">

        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          aria-label="Notificações"
        >
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-3 border-l border-slate-800 pl-5">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">
              {user?.name}
            </p>

            <p className="text-xs text-slate-400">
              {user?.email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Sair da plataforma"
            aria-label="Sair da plataforma"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={19} />
          </button>

        </div>
      </div>
    </header>
  )
}