import DOMPurify from 'dompurify'
import { CheckCircle2, Circle, XCircle } from 'lucide-react'
import type { SimulationAlternative } from '../types/simulation.types'

interface AnswerOptionProps {
  alternative: SimulationAlternative
  selected: boolean
  correctLetter: string | null
  showCorrection: boolean
  disabled?: boolean
  onSelect: (letter: string) => void
}

export function AnswerOption({
  alternative,
  selected,
  correctLetter,
  showCorrection,
  disabled = false,
  onSelect,
}: AnswerOptionProps) {
  const isCorrect = alternative.letter === correctLetter
  const isIncorrectSelection = selected && !isCorrect

  let containerClass =
    'border-border hover:border-primary/60 hover:bg-muted/50'

  if (selected && !showCorrection) {
    containerClass = 'border-primary bg-primary/5'
  }

  if (showCorrection && isCorrect) {
    containerClass = 'border-green-600 bg-green-50 dark:bg-green-950/30'
  }

  if (showCorrection && isIncorrectSelection) {
    containerClass = 'border-red-600 bg-red-50 dark:bg-red-950/30'
  }

  return (
    <button
      type="button"
      disabled={disabled || showCorrection}
      onClick={() => onSelect(alternative.letter)}
      className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors disabled:cursor-default ${containerClass}`}
    >
      <span className="mt-0.5 shrink-0">
        {showCorrection && isCorrect ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : showCorrection && isIncorrectSelection ? (
          <XCircle className="h-5 w-5 text-red-600" />
        ) : selected ? (
          <CheckCircle2 className="h-5 w-5 text-primary" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </span>

      <span className="flex min-w-0 flex-1 gap-3">
        <strong className="shrink-0">{alternative.letter})</strong>

        <span
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(alternative.contentHtml),
          }}
        />
      </span>

      {alternative.images.length > 0 && (
        <span className="flex flex-col gap-2">
          {alternative.images.map((image, index) => (
            <img
              key={`${alternative.id}-image-${index}`}
              src={image}
              alt={`Imagem da alternativa ${alternative.letter}`}
              className="max-h-48 max-w-full rounded-md object-contain"
            />
          ))}
        </span>
      )}
    </button>
  )
}