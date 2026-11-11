import { useCallback, useEffect, useMemo, useState } from 'react'

import type {
  SimulationAnswer,
  SimulationConfig,
  SimulationQuestion,
  SimulationResult,
  SimulationStatus,
} from '../types/simulation.types'

interface UseSimulationProps {
  questions: SimulationQuestion[]
  config: SimulationConfig
}

function createInitialAnswers(
  questions: SimulationQuestion[],
): SimulationAnswer[] {
  return questions.map((question) => ({
    questionId: question.id,
    selectedAlternativeLetter: null,
  }))
}

export function useSimulation({
  questions,
  config,
}: UseSimulationProps) {
  const initialTime =
    config.durationInMinutes === null
      ? null
      : config.durationInMinutes * 60

  const [status, setStatus] =
    useState<SimulationStatus>('not_started')

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const [answers, setAnswers] = useState<SimulationAnswer[]>(() =>
    createInitialAnswers(questions),
  )

  const [remainingTimeInSeconds, setRemainingTimeInSeconds] =
    useState<number | null>(initialTime)

  const [elapsedTimeInSeconds, setElapsedTimeInSeconds] = useState(0)

  const [result, setResult] = useState<SimulationResult | null>(null)

  const [correctedQuestionIds, setCorrectedQuestionIds] = useState<
    string[]
  >([])

  const currentQuestion = questions[currentQuestionIndex] ?? null

  const answeredQuestions = useMemo(
    () =>
      answers.filter(
        (answer) => answer.selectedAlternativeLetter !== null,
      ).length,
    [answers],
  )

  const isFinished = status === 'finished'
  const isPaused = status === 'paused'

  const isQuestionCorrected = useCallback(
    (questionId: string) => {
      return (
        config.correctionMode === 'final' && isFinished
      ) || correctedQuestionIds.includes(questionId)
    },
    [config.correctionMode, correctedQuestionIds, isFinished],
  )

  const startSimulation = useCallback(() => {
    if (questions.length === 0 || status !== 'not_started') {
      return
    }

    setStatus('in_progress')
  }, [questions.length, status])

  const pauseSimulation = useCallback(() => {
    setStatus((currentStatus) =>
      currentStatus === 'in_progress' ? 'paused' : currentStatus,
    )
  }, [])

  const resumeSimulation = useCallback(() => {
    setStatus((currentStatus) =>
      currentStatus === 'paused' ? 'in_progress' : currentStatus,
    )
  }, [])

  const selectAnswer = useCallback(
    (questionId: string, letter: string) => {
      if (status !== 'in_progress') {
        return
      }

      if (
        config.correctionMode === 'immediate' &&
        correctedQuestionIds.includes(questionId)
      ) {
        return
      }

      setAnswers((currentAnswers) =>
        currentAnswers.map((answer) =>
          answer.questionId === questionId
            ? {
                ...answer,
                selectedAlternativeLetter: letter,
              }
            : answer,
        ),
      )
    },
    [config.correctionMode, correctedQuestionIds, status],
  )

  const correctQuestion = useCallback(
    (questionId: string) => {
      if (
        config.correctionMode !== 'immediate' ||
        status !== 'in_progress'
      ) {
        return
      }

      const answer = answers.find(
        (item) => item.questionId === questionId,
      )

      if (!answer?.selectedAlternativeLetter) {
        return
      }

      setCorrectedQuestionIds((currentIds) =>
        currentIds.includes(questionId)
          ? currentIds
          : [...currentIds, questionId],
      )
    },
    [answers, config.correctionMode, status],
  )

  const goToQuestion = useCallback(
    (index: number) => {
      if (index < 0 || index >= questions.length) {
        return
      }

      setCurrentQuestionIndex(index)
    },
    [questions.length],
  )

  const nextQuestion = useCallback(() => {
    setCurrentQuestionIndex((currentIndex) =>
      Math.min(currentIndex + 1, questions.length - 1),
    )
  }, [questions.length])

  const previousQuestion = useCallback(() => {
    setCurrentQuestionIndex((currentIndex) =>
      Math.max(currentIndex - 1, 0),
    )
  }, [])

  const finishSimulation = useCallback(() => {
    if (status === 'finished' || questions.length === 0) {
      return
    }

    const answered = answers.filter(
      (answer) => answer.selectedAlternativeLetter !== null,
    ).length

    const unanswered = questions.length - answered

    const validQuestions = questions.filter(
      (question) =>
        !question.isCanceled &&
        question.correctAlternativeLetter !== null,
    )

    const correct = validQuestions.filter((question) => {
      const answer = answers.find(
        (item) => item.questionId === question.id,
      )

      return (
        answer?.selectedAlternativeLetter ===
        question.correctAlternativeLetter
      )
    }).length

    const incorrect = validQuestions.filter((question) => {
      const answer = answers.find(
        (item) => item.questionId === question.id,
      )

      return (
        answer?.selectedAlternativeLetter !== null &&
        answer?.selectedAlternativeLetter !== undefined &&
        answer.selectedAlternativeLetter !==
          question.correctAlternativeLetter
      )
    }).length

    const percentage =
      validQuestions.length > 0
        ? (correct / validQuestions.length) * 100
        : 0

    const durationInSeconds =
      initialTime === null
        ? elapsedTimeInSeconds
        : initialTime - (remainingTimeInSeconds ?? 0)

    const simulationResult: SimulationResult = {
      totalQuestions: questions.length,
      answeredQuestions: answered,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unansweredQuestions: unanswered,
      percentage,
      durationInSeconds,
    }

    setResult(simulationResult)
    setStatus('finished')
  }, [
    answers,
    elapsedTimeInSeconds,
    initialTime,
    questions,
    remainingTimeInSeconds,
    status,
  ])

  const restartSimulation = useCallback(() => {
    setStatus('in_progress')
    setCurrentQuestionIndex(0)
    setAnswers(createInitialAnswers(questions))
    setRemainingTimeInSeconds(initialTime)
    setElapsedTimeInSeconds(0)
    setResult(null)
    setCorrectedQuestionIds([])
  }, [initialTime, questions])

  // Cronômetro: só avança quando o simulado está em andamento.
  useEffect(() => {
    if (status !== 'in_progress') {
      return
    }

    const interval = window.setInterval(() => {
      setElapsedTimeInSeconds((current) => current + 1)

      if (initialTime !== null) {
        setRemainingTimeInSeconds((current) =>
          current === null ? null : Math.max(current - 1, 0),
        )
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [initialTime, status])

  // Finalização automática quando o tempo termina.
  useEffect(() => {
    if (
      status === 'in_progress' &&
      remainingTimeInSeconds === 0
    ) {
      finishSimulation()
    }
  }, [finishSimulation, remainingTimeInSeconds, status])

  const currentAnswer =
    answers.find(
      (answer) => answer.questionId === currentQuestion?.id,
    )?.selectedAlternativeLetter ?? null

  return {
    status,
    currentQuestionIndex,
    currentQuestion,
    answers,
    currentAnswer,
    answeredQuestions,
    remainingTimeInSeconds,
    elapsedTimeInSeconds,
    result,
    correctedQuestionIds,
    isPaused,
    isFinished,

    startSimulation,
    pauseSimulation,
    resumeSimulation,
    selectAnswer,
    correctQuestion,
    isQuestionCorrected,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    finishSimulation,
    restartSimulation,
  }
}