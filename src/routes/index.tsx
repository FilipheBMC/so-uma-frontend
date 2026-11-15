
import { Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'

import { DashboardPage } from '@/features/dashboard/pages/DashBoardPage'

import { LoginPage } from '@/features/auth/pages/LoginPage'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'

import StudyPreparationPage from '@/features/study/pages/StudyPreparationPage'
import { SimulationPage } from '@/features/simulations/pages/SimulationPage'
import QuestApiLabPage from '@/features/pages/QuestAPIPage'
import AnalysisPage from '@/features/analysis-next/analysis.page'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#111827] p-8">
      <h2 className="text-2xl font-bold text-white">
        {title}
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        Esta funcionalidade está em desenvolvimento.
      </p>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rotas privadas */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />

        <Route
          path="/questions"
          element={<PlaceholderPage title="Questões" />}
        />

        <Route
          path="/simulations"
          element={<PlaceholderPage title="Simulados" />}
        />

        <Route
          path="/study"
          element={<StudyPreparationPage />}
        />

        <Route
          path="/settings"
          element={<PlaceholderPage title="Configurações" />}
        />

        <Route
          path="/simulado"
          element={<SimulationPage />}
        />

        {/* ROUTE TESTE */}
        <Route
          path="/quest-api-lab"
          element={<QuestApiLabPage />}
        />

        <Route
          path="/testando"
          element={<AnalysisPage/>}
        />

      </Route>

      {/* Rota inexistente */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
