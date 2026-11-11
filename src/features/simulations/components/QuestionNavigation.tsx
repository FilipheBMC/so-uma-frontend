interface QuestionNavigationProps {
  totalQuestions: number
  currentQuestionIndex: number
  answers: {
    questionId: string
    selectedAlternativeLetter: string | null
  }[]
  questionIds: string[]
  correctedQuestionIds: string[]
  onNavigate: (index: number) => void
  disabled?: boolean
}

export function QuestionNavigation({
  totalQuestions,
  currentQuestionIndex,
  answers,
  questionIds,
  correctedQuestionIds,
  onNavigate,
  disabled = false,
}: QuestionNavigationProps) {
  function getQuestionStatus(index: number) {
    const questionId = questionIds[index]

    const answer = answers.find(
      (item) => item.questionId === questionId,
    )

    if (correctedQuestionIds.includes(questionId)) {
      return 'corrected'
    }

    if (answer?.selectedAlternativeLetter) {
      return 'answered'
    }

    return 'unanswered'
  }

  return (
    <aside className="space-y-4 rounded-lg border p-4">
      <div>
        <h3 className="font-semibold">Navegação</h3>
        <p className="text-sm text-muted-foreground">
          Selecione uma questão para acessá-la.
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const status = getQuestionStatus(index)
          const isCurrent = currentQuestionIndex === index

          let className =
            'border-border bg-background hover:bg-muted'

          if (status === 'answered') {
            className = 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
          }

          if (status === 'corrected') {
            className = 'border-green-600 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
          }

          if (isCurrent) {
            className += ' ring-2 ring-primary ring-offset-2'
          }

          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => onNavigate(index)}
              className={`flex h-10 items-center justify-center rounded-md border text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            >
              {index + 1}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm border bg-background" />
          Não respondida
        </span>

        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm border border-blue-500 bg-blue-50" />
          Respondida
        </span>

        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm border border-green-600 bg-green-50" />
          Corrigida
        </span>
      </div>
    </aside>
  )
}