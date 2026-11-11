import { Pause, Play, Timer } from 'lucide-react'

interface SimulationTimerProps {
  remainingTimeInSeconds: number | null
  elapsedTimeInSeconds: number
  isPaused: boolean
  isFinished: boolean
  onPause: () => void
  onResume: () => void
}

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
}

export function SimulationTimer({
  remainingTimeInSeconds,
  elapsedTimeInSeconds,
  isPaused,
  isFinished,
  onPause,
  onResume,
}: SimulationTimerProps) {
  const hasCountdown = remainingTimeInSeconds !== null

  const displayedTime = hasCountdown
    ? remainingTimeInSeconds
    : elapsedTimeInSeconds

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <Timer className="h-5 w-5 text-muted-foreground" />

        <div>
          <p className="text-xs text-muted-foreground">
            {hasCountdown ? 'Tempo restante' : 'Tempo decorrido'}
          </p>

          <strong className="font-mono text-xl tabular-nums">
            {formatTime(displayedTime ?? 0)}
          </strong>
        </div>
      </div>

      {!isFinished && (
        <button
          type="button"
          onClick={isPaused ? onResume : onPause}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          {isPaused ? (
            <>
              <Play className="h-4 w-4" />
              Continuar
            </>
          ) : (
            <>
              <Pause className="h-4 w-4" />
              Pausar
            </>
          )}
        </button>
      )}

      {isPaused && (
        <span className="w-full text-sm font-medium text-amber-600">
          Simulado pausado
        </span>
      )}
    </div>
  )
}