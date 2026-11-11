
import { Outlet } from 'react-router-dom'

import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#090D18] text-slate-100 md:flex">

      <Sidebar />

      <div className="min-w-0 flex-1">
        <Header />

        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  )
}
