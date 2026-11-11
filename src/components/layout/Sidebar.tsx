
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Brain,
  Settings,
  Zap,
} from 'lucide-react'

import { NavLink } from 'react-router-dom'

const navItems = [
  {
    label: 'Visão geral',
    to: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Questões',
    to: '/questions',
    icon: BookOpen,
  },
  {
    label: 'Simulados',
    to: '/simulations',
    icon: ClipboardList,
  },
  {
    label: 'Estudos com IA',
    to: '/study',
    icon: Brain,
  },
]

export function Sidebar() {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-8 border-b border-slate-800 bg-[#0F172A] p-5 md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r">

      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
          <Zap size={23} className="text-white" />
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            Só Uma?
          </h1>
          <p className="text-xs text-slate-400">
            Sua jornada de aprovação
          </p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex flex-wrap gap-2 md:flex-col">
        <p className="mb-2 hidden px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 md:block">
          Menu principal
        </p>

        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={19} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto hidden border-t border-slate-800 pt-5 md:block">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <Settings size={19} />
          Configurações
        </NavLink>
      </div>
    </aside>
  )
}
