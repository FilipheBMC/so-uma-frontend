import { CheckCircle2, XCircle } from 'lucide-react'

interface QuestionsFeedbackProps {
  selectedAnswer: string | null
  correctAnswer: string | null
  showCorrection: boolean
  isCanceled: boolean
  onCorrect?: () => void
  canCorrect?: boolean
}

export function QuestionsFeedback({
  selectedAnswer,
  correctAnswer,
  showCorrection,
  isCanceled,
  onCorrect,
  canCorrect = false,
}: QuestionsFeedbackProps) {
  if (!showCorrection) {
    if (canCorrect && onCorrect) {
      return (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCorrect}
            disabled={!selectedAnswer}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            Corrigir questão
          </button>
        </div>
      )
    }

    return null
  }

  if (isCanceled) {
    return (
      <div className="rounded-lg border border-amber-500 bg-amber-50 p-4 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
        <strong>Questão anulada.</strong>
        <p className="mt-1 text-sm">
          Esta questão não será considerada no cálculo do resultado.
        </p>
      </div>
    )
  }

  if (!correctAnswer) {
    return (
      <div className="rounded-lg border bg-muted p-4">
        <strong>Gabarito indisponível.</strong>
        <p className="mt-1 text-sm text-muted-foreground">
          Não foi possível corrigir esta questão porque a API não
          disponibilizou uma alternativa correta.
        </p>
      </div>
    )
  }

  const isCorrect = selectedAnswer === correctAnswer

  return (
    <div
      className={`rounded-lg border p-4 ${
        isCorrect
          ? 'border-green-600 bg-green-50 dark:bg-green-950/30'
          : 'border-red-600 bg-red-50 dark:bg-red-950/30'
      }`}
    >
      <div className="flex items-center gap-2">
        {isCorrect ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600" />
        )}

        <strong>
          {isCorrect ? 'Resposta correta!' : 'Resposta incorreta.'}
        </strong>
      </div>

      <div className="mt-2 space-y-1 text-sm">
        <p>
          Sua resposta:{' '}
          <strong>{selectedAnswer ?? 'Não respondida'}</strong>
        </p>

        <p>
          Gabarito:{' '}
          <strong>{correctAnswer}</strong>
        </p>
      </div>
    </div>
  )
}