import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flag,
  Sparkles,
} from 'lucide-react'

import { adaptQuestions } from '../adapters/simulation.types'

import { QuestionCard } from '../components/QuestionCard'
import { QuestionNavigation } from '../components/QuestionNavigation'
import { QuestionsFeedback } from '../components/QuestionsFeedback'
import { SimulationsSummary } from '../components/SimulationSummary'
import { SimulationTimer } from '../components/SimulationTimer'

import { useSimulation } from '../hooks/useSimulation'

import type {
  GenerateQuestionsResponse,
  ResolvedStudyStatus,
  ResolvedStudySubject,
  SimulationConfig,
} from '../types/simulation.types'

interface SimulationLocationState {
  result?: GenerateQuestionsResponse['result'] & {
    resolvedSubjects?: ResolvedStudySubject[]
  }
}

interface SimulationPageProps {
  config?: SimulationConfig
  showSemanticRelations?: boolean
}

const defaultConfig: SimulationConfig = {
  correctionMode: 'final',
  durationInMinutes: null,
}

function getSemanticStatusLabel(status: ResolvedStudyStatus): string {
  switch (status) {
    case 'MATCHED':
      return 'Correspondência encontrada'
    case 'NO_MATCH':
      return 'Sem correspondência'
    case 'NOT_ANALYZED':
      return 'Não analisado'
    case 'ERROR_FALLBACK':
      return 'Nome original utilizado'
  }
}

function getSemanticStatusClass(status: ResolvedStudyStatus): string {
  switch (status) {
    case 'MATCHED':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
    case 'NO_MATCH':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
    case 'NOT_ANALYZED':
      return 'bg-muted text-muted-foreground'
    case 'ERROR_FALLBACK':
      return 'bg-orange-500/10 text-orange-700 dark:text-orange-300'
  }
}

interface SemanticRelationRowProps {
  label: string
  originalName: string
  resolvedName: string
  status: ResolvedStudyStatus
  confidence: number | null
  reason: string | null
}

function SemanticRelationRow({
  label,
  originalName,
  resolvedName,
  status,
  confidence,
  reason,
}: SemanticRelationRowProps) {
  return (
    <div className="space-y-2 rounded-lg border bg-background/50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span>{originalName}</span>

        {originalName !== resolvedName ? (
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <span className="text-xs text-muted-foreground">
            Nome preservado
          </span>
        )}

        <strong>{resolvedName}</strong>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getSemanticStatusClass(status)}`}
        >
          {getSemanticStatusLabel(status)}
        </span>

        {confidence !== null && status === 'MATCHED' && (
          <span className="text-xs text-muted-foreground">
            Confiança: {Math.round(confidence * 100)}%
          </span>
        )}
      </div>

      {reason && (
        <p className="text-xs leading-5 text-muted-foreground">
          {reason}
        </p>
      )}
    </div>
  )
}

function SemanticRelationsPanel({
  subjects,
}: {
  subjects: ResolvedStudySubject[]
}) {
  if (subjects.length === 0) {
    return null
  }

  return (
    <details className="rounded-xl border p-4 md:p-5">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 shrink-0 text-primary" />

          <div>
            <h2 className="font-semibold">Correspondências semânticas</h2>
            <p className="text-xs text-muted-foreground">
              Consulte como as matérias e os assuntos foram relacionados ao catálogo.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-muted px-3 py-1 text-xs">
          {subjects.length} matéria(s)
        </span>
      </summary>

      <div className="mt-4 space-y-3">
        {subjects.map((subject, index) => (
          <article
            key={`${subject.originalName}-${index}`}
            className="space-y-3 rounded-lg border p-3"
          >
            <SemanticRelationRow
              label="Matéria"
              originalName={subject.originalName}
              resolvedName={subject.resolvedName}
              status={subject.status}
              confidence={subject.confidence}
              reason={subject.reason}
            />

            {subject.topics.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                <h3 className="text-sm font-medium">Assuntos</h3>

                {subject.topics.map((topic, topicIndex) => (
                  <SemanticRelationRow
                    key={`${topic.originalName}-${topicIndex}`}
                    label="Assunto"
                    originalName={topic.originalName}
                    resolvedName={topic.resolvedName}
                    status={topic.status}
                    confidence={topic.confidence}
                    reason={topic.reason}
                  />
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </details>
  )
}

export function SimulationPage({
  config = defaultConfig,
  showSemanticRelations = true,
}: SimulationPageProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const locationState =
    location.state as SimulationLocationState | null

  const apiResult = locationState?.result

  const questions = useMemo(
    () => (apiResult ? adaptQuestions(apiResult) : []),
    [apiResult],
  )

  const simulation = useSimulation({
    questions,
    config,
  })

  const [reviewingQuestion, setReviewingQuestion] = useState(false)

  useEffect(() => {
    simulation.startSimulation()
  }, [simulation.startSimulation])

  if (!apiResult) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 p-6">
        <h1 className="text-2xl font-bold">
          Nenhum simulado encontrado
        </h1>

        <p className="text-muted-foreground">
          Não recebemos as questões da preparação. Volte à etapa
          anterior e gere o simulado novamente.
        </p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Voltar
        </button>
      </main>
    )
  }

  if (questions.length === 0) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 p-6">
        <h1 className="text-2xl font-bold">
          Nenhuma questão disponível
        </h1>

        <p className="text-muted-foreground">
          A resposta da API não contém questões para iniciar este simulado.
        </p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Voltar
        </button>
      </main>
    )
  }

  const currentQuestion = simulation.currentQuestion

  const showCorrection =
    currentQuestion !== null &&
    simulation.isQuestionCorrected(currentQuestion.id)

  const canCorrect =
    config.correctionMode === 'immediate' &&
    !showCorrection &&
    simulation.status === 'in_progress'

  const currentQuestionNumber =
    simulation.currentQuestionIndex + 1

  const handleSelectAnswer = (letter: string) => {
    if (!currentQuestion) {
      return
    }

    simulation.selectAnswer(currentQuestion.id, letter)
  }

  const handleCorrectQuestion = () => {
    if (!currentQuestion) {
      return
    }

    simulation.correctQuestion(currentQuestion.id)
  }

  const handleFinish = () => {
    const confirmed = window.confirm(
      'Deseja realmente finalizar o simulado? Não será possível alterar suas respostas depois.',
    )

    if (confirmed) {
      simulation.finishSimulation()
      setReviewingQuestion(false)
    }
  }

  const handleReviewQuestion = (index: number) => {
    simulation.goToQuestion(index)
    setReviewingQuestion(true)
  }

  const handleRestart = () => {
    simulation.restartSimulation()
    setReviewingQuestion(false)
  }

  // Tela de resultado.
  if (simulation.isFinished && simulation.result) {
    return (
      <main className="mx-auto max-w-5xl space-y-8 p-4 md:p-8">
        {showSemanticRelations && (
          <SemanticRelationsPanel
            subjects={apiResult.resolvedSubjects ?? []}
          />
        )}

        <SimulationsSummary
          result={simulation.result}
          questions={questions}
          answers={simulation.answers}
          onReviewQuestion={handleReviewQuestion}
          onRestart={handleRestart}
        />

        {reviewingQuestion && currentQuestion && (
          <section className="space-y-5 rounded-xl border p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">
                Revisão da questão {currentQuestionNumber}
              </h2>

              <button
                type="button"
                onClick={() => setReviewingQuestion(false)}
                className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
              >
                Fechar revisão
              </button>
            </div>

            <QuestionCard
              question={currentQuestion}
              questionIndex={simulation.currentQuestionIndex}
              totalQuestions={questions.length}
              selectedAnswer={simulation.currentAnswer}
              showCorrection
              disabled
              onSelectAnswer={() => undefined}
            />

            <QuestionsFeedback
              selectedAnswer={simulation.currentAnswer}
              correctAnswer={currentQuestion.correctAlternativeLetter}
              showCorrection
              isCanceled={currentQuestion.isCanceled}
            />

            <div className="flex justify-between gap-3">
              <button
                type="button"
                disabled={simulation.currentQuestionIndex === 0}
                onClick={simulation.previousQuestion}
                className="rounded-md border px-4 py-2 disabled:opacity-40"
              >
                <ChevronLeft className="mr-1 inline h-4 w-4" />
                Anterior
              </button>

              <button
                type="button"
                disabled={
                  simulation.currentQuestionIndex ===
                  questions.length - 1
                }
                onClick={simulation.nextQuestion}
                className="rounded-md border px-4 py-2 disabled:opacity-40"
              >
                Próxima
                <ChevronRight className="ml-1 inline h-4 w-4" />
              </button>
            </div>
          </section>
        )}
      </main>
    )
  }

  if (!currentQuestion) {
    return null
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Simulado</h1>

          <p className="text-sm text-muted-foreground">
            {questions.length} questões disponíveis
          </p>
        </div>

        <span className="rounded-full bg-muted px-3 py-1 text-sm">
          {simulation.answeredQuestions} de {questions.length} respondidas
        </span>
      </header>

      {showSemanticRelations && (
        <SemanticRelationsPanel
          subjects={apiResult.resolvedSubjects ?? []}
        />
      )}

      <SimulationTimer
        remainingTimeInSeconds={simulation.remainingTimeInSeconds}
        elapsedTimeInSeconds={simulation.elapsedTimeInSeconds}
        isPaused={simulation.isPaused}
        isFinished={simulation.isFinished}
        onPause={simulation.pauseSimulation}
        onResume={simulation.resumeSimulation}
      />

      {simulation.isPaused ? (
        <div className="rounded-lg border border-amber-500 bg-amber-50 p-6 text-center dark:bg-amber-950/30">
          <h2 className="text-lg font-semibold">Simulado pausado</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            O cronômetro está parado. Continue quando estiver pronto.
          </p>

          <button
            type="button"
            onClick={simulation.resumeSimulation}
            className="mt-4 rounded-md bg-primary px-5 py-2 text-primary-foreground"
          >
            Continuar simulado
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
            <div className="min-w-0 space-y-6 rounded-xl border p-4 md:p-6">
              <QuestionCard
                question={currentQuestion}
                questionIndex={simulation.currentQuestionIndex}
                totalQuestions={questions.length}
                selectedAnswer={simulation.currentAnswer}
                showCorrection={showCorrection}
                disabled={
                  simulation.status !== 'in_progress' ||
                  showCorrection
                }
                onSelectAnswer={handleSelectAnswer}
              />

              <QuestionsFeedback
                selectedAnswer={simulation.currentAnswer}
                correctAnswer={currentQuestion.correctAlternativeLetter}
                showCorrection={showCorrection}
                isCanceled={currentQuestion.isCanceled}
                canCorrect={canCorrect}
                onCorrect={handleCorrectQuestion}
              />

              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
                <button
                  type="button"
                  disabled={simulation.currentQuestionIndex === 0}
                  onClick={simulation.previousQuestion}
                  className="rounded-md border px-4 py-2 text-sm disabled:opacity-40"
                >
                  <ChevronLeft className="mr-1 inline h-4 w-4" />
                  Anterior
                </button>

                <button
                  type="button"
                  disabled={
                    simulation.currentQuestionIndex ===
                    questions.length - 1
                  }
                  onClick={simulation.nextQuestion}
                  className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-40"
                >
                  Próxima
                  <ChevronRight className="ml-1 inline h-4 w-4" />
                </button>
              </div>
            </div>

            <QuestionNavigation
              totalQuestions={questions.length}
              currentQuestionIndex={simulation.currentQuestionIndex}
              answers={simulation.answers}
              questionIds={questions.map((question) => question.id)}
              correctedQuestionIds={simulation.correctedQuestionIds}
              onNavigate={simulation.goToQuestion}
            />
          </div>

          <div className="flex justify-end border-t pt-5">
            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-5 py-2.5 font-medium text-white hover:bg-red-700"
            >
              <Flag className="h-4 w-4" />
              Finalizar simulado
            </button>
          </div>
        </>
      )}
    </main>
  )
}