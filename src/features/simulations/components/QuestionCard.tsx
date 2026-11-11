import DOMPurify from 'dompurify'
import type {
  SimulationQuestion,
} from '../types/simulation.types'
import { AnswerOption } from './AnswerOptions'

interface QuestionCardProps {
  question: SimulationQuestion
  questionIndex: number
  totalQuestions: number
  selectedAnswer: string | null
  showCorrection: boolean
  onSelectAnswer: (letter: string) => void
  disabled?: boolean
}

export function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  showCorrection,
  onSelectAnswer,
  disabled = false,
}: QuestionCardProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            Questão {questionIndex + 1} de {totalQuestions}
          </p>

          <h2 className="text-xl font-semibold">
            {question.subject}
          </h2>

          <p className="text-sm text-muted-foreground">
            {question.topic}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {question.difficulty > 0 && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs">
              Dificuldade: {question.difficulty}/5
            </span>
          )}

          {question.exam && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs">
              {question.exam.banca} • {question.exam.ano}
            </span>
          )}
        </div>
      </div>

      {question.associatedTextsHtml.length > 0 && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <h3 className="font-semibold">Texto de apoio</h3>

          {question.associatedTextsHtml.map((html, index) => (
            <div
              key={`${question.id}-text-${index}`}
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(html),
              }}
            />
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div
          className="prose max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(question.statementHtml),
          }}
        />

        {question.attachments.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {question.attachments.map((attachment, index) => (
              <a
                key={`${question.id}-attachment-${index}`}
                href={attachment}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary underline"
              >
                Visualizar anexo {index + 1}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Alternativas</h3>

        {question.alternatives.map((alternative) => (
          <AnswerOption
            key={alternative.id}
            alternative={alternative}
            selected={selectedAnswer === alternative.letter}
            correctLetter={question.correctAlternativeLetter}
            showCorrection={showCorrection}
            disabled={disabled}
            onSelect={onSelectAnswer}
          />
        ))}
      </div>
    </section>
  )
}