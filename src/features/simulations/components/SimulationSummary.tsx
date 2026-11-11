import { CheckCircle2, CircleHelp, XCircle } from 'lucide-react'
import type {
  SimulationQuestion,
  SimulationResult,
} from '../types/simulation.types'

interface SimulationsSummaryProps {
  result: SimulationResult
  questions: SimulationQuestion[]
  answers: {
    questionId: string
    selectedAlternativeLetter: string | null
  }[]
  onReviewQuestion: (index: number) => void
  onRestart: () => void
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}min ${String(remainingSeconds).padStart(2, '0')}s`
}

export function SimulationsSummary({
  result,
  questions,
  answers,
  onReviewQuestion,
  onRestart,
}: SimulationsSummaryProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Simulado finalizado!</h1>

        <p className="text-muted-foreground">
          Confira seu desempenho e revise suas respostas.
        </p>

        <p className="text-5xl font-bold text-primary">
          {result.percentage.toFixed(1)}%
        </p>

        <p className="text-sm text-muted-foreground">
          Aproveitamento
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Questões</p>
          <strong className="text-2xl">{result.totalQuestions}</strong>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Acertos</p>
          <strong className="text-2xl text-green-600">
            {result.correctAnswers}
          </strong>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Erros</p>
          <strong className="text-2xl text-red-600">
            {result.incorrectAnswers}
          </strong>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Não respondidas</p>
          <strong className="text-2xl">
            {result.unansweredQuestions}
          </strong>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Tempo utilizado</p>
        <strong>{formatDuration(result.durationInSeconds)}</strong>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Revisão das questões</h2>

        {questions.map((question, index) => {
          const answer = answers.find(
            (item) => item.questionId === question.id,
          )

          const selected = answer?.selectedAlternativeLetter ?? null
          const isCanceled = question.isCanceled
          const hasGabarito = Boolean(question.correctAlternativeLetter)

          const isCorrect =
            !isCanceled &&
            hasGabarito &&
            selected === question.correctAlternativeLetter

          return (
            <button
              key={question.id}
              type="button"
              onClick={() => onReviewQuestion(index)}
              className="flex w-full items-center justify-between gap-3 rounded-lg border p-4 text-left hover:bg-muted/50"
            >
              <div className="flex min-w-0 items-center gap-3">
                {isCanceled ? (
                  <CircleHelp className="h-5 w-5 shrink-0 text-amber-600" />
                ) : isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0 text-red-600" />
                )}

                <div className="min-w-0">
                  <p className="font-medium">
                    Questão {index + 1}
                  </p>

                  <p className="truncate text-sm text-muted-foreground">
                    {question.subject} — {question.topic}
                  </p>
                </div>
              </div>

              <span className="shrink-0 text-sm text-muted-foreground">
                {selected ?? 'Sem resposta'}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90"
        >
          Refazer simulado
        </button>
      </div>
    </section>
  )
}