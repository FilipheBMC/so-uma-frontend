import { useEffect, useState } from 'react'
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Target,
  Trophy,
} from 'lucide-react'

import {
  dashboardService,
  type DashboardPerformanceItem,
  type DashboardStatistics as DashboardStatisticsData,
} from '../services/dashboard.service'

function formatDate(value: string | null): string {
  if (!value) return 'Data não disponível'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatPercent(value: number | null): string {
  return value === null ? 'Sem gabarito' : `${value}%`
}

function PerformanceList({
  title,
  items,
  emptyMessage,
}: {
  title: string
  items: DashboardPerformanceItem[]
  emptyMessage: string
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#111827] p-5">
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      ) : (
        <div className="space-y-5">
          {items.map((item) => {
            const accuracy = item.accuracyPercent ?? 0

            return (
              <div key={item.name} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-200">
                    {item.name}
                  </span>
                  <span className="text-sm tabular-nums text-gray-300">
                    {formatPercent(item.accuracyPercent)}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${Math.max(0, Math.min(accuracy, 100))}%` }}
                  />
                </div>

                <p className="text-xs text-gray-500">
                  {item.correctAnswers} acertos · {item.incorrectAnswers} erros ·{' '}
                  {item.answeredQuestions} respondidas
                </p>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export function DashboardStatistics() {
  const [data, setData] = useState<DashboardStatisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')

      try {
        const result = await dashboardService.getStatistics()
        if (!cancelled) setData(result)
      } catch (err: unknown) {
        if (cancelled) return

        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Não foi possível carregar suas estatísticas.'
        setError(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  if (loading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#111827] p-6 text-sm text-gray-400">
        Carregando suas estatísticas...
      </section>
    )
  }

  if (error || !data) {
    return (
      <section className="rounded-2xl border border-red-400/20 bg-[#111827] p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div className="flex-1">
            <h2 className="font-semibold text-white">Estatísticas indisponíveis</h2>
            <p className="mt-1 text-sm text-gray-400">
              {error || 'Não recebemos dados do servidor.'}
            </p>
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="mt-4 rounded-lg border border-white/15 px-3 py-2 text-sm text-white transition hover:bg-white/5"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </section>
    )
  }

  const { summary } = data
  const hasHistory =
    summary.completedSimulations > 0 || summary.answeredQuestions > 0

  const cards = [
    {
      label: 'Tentativas concluídas',
      value: summary.completedSimulations.toLocaleString('pt-BR'),
      detail: 'Execuções finalizadas',
      icon: ClipboardCheck,
    },
    {
      label: 'Questões respondidas',
      value: summary.answeredQuestions.toLocaleString('pt-BR'),
      detail: 'Em simulados concluídos',
      icon: BookOpen,
    },
    {
      label: 'Acertos',
      value: summary.correctAnswers.toLocaleString('pt-BR'),
      detail: `${summary.incorrectAnswers.toLocaleString('pt-BR')} erros`,
      icon: CheckCircle2,
    },
    {
      label: 'Aproveitamento',
      value: summary.accuracyPercent === null ? '—' : `${summary.accuracyPercent}%`,
      detail: `${summary.evaluatedQuestions.toLocaleString('pt-BR')} questões avaliadas`,
      icon: Target,
    },
  ]

  return (
    <section className="space-y-6">
      <header>
        <div className="flex items-center gap-2 text-blue-400">
          <Trophy className="h-5 w-5" />
          <span className="text-sm font-medium">Seu desempenho</span>
        </div>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">Estatísticas de estudo</h2>
            <p className="mt-1 text-sm text-gray-400">
              Resultados calculados a partir das suas tentativas finalizadas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="rounded-lg border border-white/15 px-3 py-2 text-sm text-gray-200 transition hover:bg-white/5"
          >
            Atualizar dados
          </button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <article
              key={card.label}
              className="rounded-2xl border border-white/10 bg-[#111827] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-400">{card.label}</span>
                <Icon className="h-5 w-5 text-blue-400" />
              </div>
              <p className="mt-3 text-3xl font-bold tabular-nums text-white">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-gray-500">{card.detail}</p>
            </article>
          )
        })}
      </div>

      {!hasHistory && (
        <div className="rounded-2xl border border-dashed border-white/15 bg-[#111827] p-6">
          <h3 className="font-semibold text-white">Seu histórico começa aqui</h3>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Quando você finalizar seu primeiro simulado, os acertos, o aproveitamento
            e o desempenho por disciplina e assunto aparecerão nesta área.
          </p>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <PerformanceList
          title="Desempenho por disciplina"
          items={data.subjects}
          emptyMessage="Ainda não há questões avaliadas por disciplina."
        />
        <PerformanceList
          title="Desempenho por assunto"
          items={data.topics}
          emptyMessage="Ainda não há questões avaliadas por assunto."
        />
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#111827] p-5">
        <h2 className="mb-1 text-lg font-semibold text-white">Evolução nos últimos seis meses</h2>
        <p className="mb-5 text-xs text-gray-500">
          Percentual de acertos por mês, considerando apenas questões com gabarito.
        </p>

        {data.monthlyEvolution.length === 0 ? (
          <p className="text-sm text-gray-400">Ainda não há histórico mensal suficiente.</p>
        ) : (
          <div className="space-y-4">
            {data.monthlyEvolution.map((month) => (
              <div key={month.month} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-gray-200">{month.month}</span>
                  <span className="tabular-nums text-gray-300">
                    {formatPercent(month.accuracyPercent)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-purple-500"
                    style={{ width: `${Math.max(0, Math.min(month.accuracyPercent ?? 0, 100))}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {month.answeredQuestions} respondidas · {month.correctAnswers} acertos · {month.incorrectAnswers} erros
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111827] p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Tentativas recentes</h2>

        {data.recentAttempts.length === 0 ? (
          <p className="text-sm text-gray-400">Você ainda não finalizou nenhum simulado.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {data.recentAttempts.map((attempt) => (
              <article
                key={attempt.id}
                className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-medium text-gray-100">
                    {attempt.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Finalizado em {formatDate(attempt.submittedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-sm">
                  <span className="text-gray-400">
                    {attempt.answeredQuestions} respondidas
                  </span>
                  <span className="font-semibold text-white">
                    {formatPercent(attempt.accuracyPercent)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="text-xs leading-5 text-gray-500">
        O aproveitamento considera apenas questões com gabarito cadastrado. Questões
        sem gabarito são contabilizadas como respondidas, mas não entram no cálculo
        percentual.
      </p>
    </section>
  )
}
