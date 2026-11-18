import { api } from '@/services/api'

export interface DashboardSummary {
  completedSimulations: number
  answeredQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  ungradedQuestions: number
  evaluatedQuestions: number
  accuracyPercent: number | null
}

export interface DashboardPerformanceItem {
  name: string
  answeredQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  evaluatedQuestions: number
  accuracyPercent: number | null
}

export interface DashboardRecentAttempt {
  id: string
  title: string
  startedAt: string
  submittedAt: string | null
  answeredQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  accuracyPercent: number | null
}

export interface DashboardMonthlyEvolution {
  month: string
  answeredQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  evaluatedQuestions: number
  accuracyPercent: number | null
}

export interface DashboardStatistics {
  generatedAt: string
  summary: DashboardSummary
  subjects: DashboardPerformanceItem[]
  topics: DashboardPerformanceItem[]
  monthlyEvolution: DashboardMonthlyEvolution[]
  recentAttempts: DashboardRecentAttempt[]
}

export const dashboardService = {
  async getStatistics(): Promise<DashboardStatistics> {
    const response = await api.get<DashboardStatistics>('/dashboard/statistics')
    return response.data
  },
}
