// import { useEffect, useMemo, useState } from 'react'
// import { useLocation, useNavigate } from 'react-router-dom'
// import {
//   ArrowRight,
//   ChevronLeft,
//   ChevronRight,
//   Flag,
//   Sparkles,
// } from 'lucide-react'

// import { adaptQuestions } from '../adapters/simulation.types'

// import { QuestionCard } from '../components/QuestionCard'
// import { QuestionNavigation } from '../components/QuestionNavigation'
// import { QuestionsFeedback } from '../components/QuestionsFeedback'
// import { SimulationsSummary } from '../components/SimulationSummary'
// import { SimulationTimer } from '../components/SimulationTimer'

// import { useSimulation } from '../hooks/useSimulation'
// import { studyService } from '../../study/services/study.service'
// import { QuestionTutorChat } from '../components/QuestionTutorChat'

// import type {
//   GenerateQuestionsResponse,
//   ResolvedStudyStatus,
//   ResolvedStudySubject,
//   SimulationConfig,
//   SimulationQuestion,
//   TutorConversationMessage,
// } from '../types/simulation.types'

// interface SimulationLocationState {
//   result?: GenerateQuestionsResponse['result'] & {
//     resolvedSubjects?: ResolvedStudySubject[]
//   }
// }

// function htmlToPlainText(html: string): string {
//   if (!html.trim()) return ''

//   const parsed = new DOMParser().parseFromString(html, 'text/html')
//   return (parsed.body.textContent ?? '').replace(/\s+/g, ' ').trim()
// }

// function buildTutorQuestionContext(
//   question: SimulationQuestion,
//   userAnswer: string | null,
// ) {
//   const associatedTexts = question.associatedTextsHtml
//     .map(htmlToPlainText)
//     .filter(Boolean)

//   const statement = [
//     associatedTexts.length > 0
//       ? `Texto(s) associado(s):\n${associatedTexts.join('\n\n')}`
//       : '',
//     htmlToPlainText(question.statementHtml),
//   ]
//     .filter(Boolean)
//     .join('\n\n')

//   return {
//     statement: statement || 'A questão não possui enunciado textual disponível.',
//     alternatives: question.alternatives.map((alternative) => {
//       const text = htmlToPlainText(alternative.contentHtml)

//       return {
//         key: alternative.letter,
//         text:
//           text ||
//           (alternative.images.length > 0
//             ? '[Esta alternativa contém imagem, que não foi enviada ao tutor.]'
//             : '[Alternativa sem conteúdo textual.]'),
//       }
//     }),
//     subject: question.subject.trim() || null,
//     topic: question.topic.trim() || null,
//     userAnswer,
//     correctAnswer: question.correctAlternativeLetter,
//   }
// }

// function getTutorRequestError(error: unknown): string {
//   if (typeof error === 'object' && error !== null && 'response' in error) {
//     const response = error.response
//     if (typeof response === 'object' && response !== null && 'data' in response) {
//       const data = response.data
//       if (typeof data === 'object' && data !== null && 'message' in data) {
//         const message = data.message
//         if (typeof message === 'string' && message.trim()) return message
//       }
//     }
//   }

//   if (error instanceof Error && error.message.trim()) return error.message
//   return 'Não foi possível conversar com o tutor. Tente novamente.'
// }

// interface SimulationPageProps {
//   config?: SimulationConfig
//   showSemanticRelations?: boolean
// }

// const defaultConfig: SimulationConfig = {
//   correctionMode: 'final',
//   durationInMinutes: null,
// }

// function getSemanticStatusLabel(status: ResolvedStudyStatus): string {
//   switch (status) {
//     case 'MATCHED':
//       return 'Correspondência encontrada'
//     case 'NO_MATCH':
//       return 'Sem correspondência'
//     case 'NOT_ANALYZED':
//       return 'Não analisado'
//     case 'ERROR_FALLBACK':
//       return 'Nome original utilizado'
//   }
// }

// function getSemanticStatusClass(status: ResolvedStudyStatus): string {
//   switch (status) {
//     case 'MATCHED':
//       return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
//     case 'NO_MATCH':
//       return 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
//     case 'NOT_ANALYZED':
//       return 'bg-muted text-muted-foreground'
//     case 'ERROR_FALLBACK':
//       return 'bg-orange-500/10 text-orange-700 dark:text-orange-300'
//   }
// }

// interface SemanticRelationRowProps {
//   label: string
//   originalName: string
//   resolvedName: string
//   status: ResolvedStudyStatus
//   confidence: number | null
//   reason: string | null
// }

// function SemanticRelationRow({
//   label,
//   originalName,
//   resolvedName,
//   status,
//   confidence,
//   reason,
// }: SemanticRelationRowProps) {
//   return (
//     <div className="space-y-2 rounded-lg border bg-background/50 p-3">
//       <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
//         {label}
//       </p>

//       <div className="flex flex-wrap items-center gap-2 text-sm">
//         <span>{originalName}</span>

//         {originalName !== resolvedName ? (
//           <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
//         ) : (
//           <span className="text-xs text-muted-foreground">
//             Nome preservado
//           </span>
//         )}

//         <strong>{resolvedName}</strong>
//       </div>

//       <div className="flex flex-wrap items-center gap-2">
//         <span
//           className={`rounded-full px-2.5 py-1 text-xs font-medium ${getSemanticStatusClass(status)}`}
//         >
//           {getSemanticStatusLabel(status)}
//         </span>

//         {confidence !== null && status === 'MATCHED' && (
//           <span className="text-xs text-muted-foreground">
//             Confiança: {Math.round(confidence * 100)}%
//           </span>
//         )}
//       </div>

//       {reason && (
//         <p className="text-xs leading-5 text-muted-foreground">
//           {reason}
//         </p>
//       )}
//     </div>
//   )
// }

// function SemanticRelationsPanel({
//   subjects,
// }: {
//   subjects: ResolvedStudySubject[]
// }) {
//   if (subjects.length === 0) {
//     return null
//   }

//   return (
//     <details className="rounded-xl border p-4 md:p-5">
//       <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
//         <div className="flex items-center gap-3">
//           <Sparkles className="h-5 w-5 shrink-0 text-primary" />

//           <div>
//             <h2 className="font-semibold">Correspondências semânticas</h2>
//             <p className="text-xs text-muted-foreground">
//               Consulte como as matérias e os assuntos foram relacionados ao catálogo.
//             </p>
//           </div>
//         </div>

//         <span className="rounded-full bg-muted px-3 py-1 text-xs">
//           {subjects.length} matéria(s)
//         </span>
//       </summary>

//       <div className="mt-4 space-y-3">
//         {subjects.map((subject, index) => (
//           <article
//             key={`${subject.originalName}-${index}`}
//             className="space-y-3 rounded-lg border p-3"
//           >
//             <SemanticRelationRow
//               label="Matéria"
//               originalName={subject.originalName}
//               resolvedName={subject.resolvedName}
//               status={subject.status}
//               confidence={subject.confidence}
//               reason={subject.reason}
//             />

//             {subject.topics.length > 0 && (
//               <div className="space-y-2 border-t pt-3">
//                 <h3 className="text-sm font-medium">Assuntos</h3>

//                 {subject.topics.map((topic, topicIndex) => (
//                   <SemanticRelationRow
//                     key={`${topic.originalName}-${topicIndex}`}
//                     label="Assunto"
//                     originalName={topic.originalName}
//                     resolvedName={topic.resolvedName}
//                     status={topic.status}
//                     confidence={topic.confidence}
//                     reason={topic.reason}
//                   />
//                 ))}
//               </div>
//             )}
//           </article>
//         ))}
//       </div>
//     </details>
//   )
// }

// export function SimulationPage({
//   config = defaultConfig,
//   showSemanticRelations = true,
// }: SimulationPageProps) {
//   const location = useLocation()
//   const navigate = useNavigate()

//   const locationState =
//     location.state as SimulationLocationState | null

//   const apiResult = locationState?.result

//   const questions = useMemo(
//     () => (apiResult ? adaptQuestions(apiResult) : []),
//     [apiResult],
//   )

//   const simulation = useSimulation({
//     questions,
//     config,
//   })

//   const [reviewingQuestion, setReviewingQuestion] = useState(false)
//   const [tutorConversations, setTutorConversations] = useState<
//     Record<string, TutorConversationMessage[]>
//   >({})
//   const [tutorLoadingQuestions, setTutorLoadingQuestions] = useState<Record<string, boolean>>({})
//   const [tutorErrors, setTutorErrors] = useState<Record<string, string>>({})

//   useEffect(() => {
//     simulation.startSimulation()
//   }, [simulation.startSimulation])

//   if (!apiResult) {
//     return (
//       <main className="mx-auto max-w-3xl space-y-4 p-6">
//         <h1 className="text-2xl font-bold">
//           Nenhum simulado encontrado
//         </h1>

//         <p className="text-muted-foreground">
//           Não recebemos as questões da preparação. Volte à etapa
//           anterior e gere o simulado novamente.
//         </p>

//         <button
//           type="button"
//           onClick={() => navigate(-1)}
//           className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
//         >
//           Voltar
//         </button>
//       </main>
//     )
//   }

//   if (questions.length === 0) {
//     return (
//       <main className="mx-auto max-w-3xl space-y-4 p-6">
//         <h1 className="text-2xl font-bold">
//           Nenhuma questão disponível
//         </h1>

//         <p className="text-muted-foreground">
//           A resposta da API não contém questões para iniciar este simulado.
//         </p>

//         <button
//           type="button"
//           onClick={() => navigate(-1)}
//           className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
//         >
//           Voltar
//         </button>
//       </main>
//     )
//   }

//   const currentQuestion = simulation.currentQuestion

//   const showCorrection =
//     currentQuestion !== null &&
//     simulation.isQuestionCorrected(currentQuestion.id)

//   const canCorrect =
//     config.correctionMode === 'immediate' &&
//     !showCorrection &&
//     simulation.status === 'in_progress'

//   const currentQuestionNumber =
//     simulation.currentQuestionIndex + 1

//   const handleSelectAnswer = (letter: string) => {
//     if (!currentQuestion) {
//       return
//     }

//     simulation.selectAnswer(currentQuestion.id, letter)
//   }

//   const handleCorrectQuestion = () => {
//     if (!currentQuestion) {
//       return
//     }

//     simulation.correctQuestion(currentQuestion.id)
//   }

//   const handleFinish = () => {
//     const confirmed = window.confirm(
//       'Deseja realmente finalizar o simulado? Não será possível alterar suas respostas depois.',
//     )

//     if (confirmed) {
//       simulation.finishSimulation()
//       setReviewingQuestion(false)
//     }
//   }

//   const handleReviewQuestion = (index: number) => {
//     simulation.goToQuestion(index)
//     setReviewingQuestion(true)
//   }

//   const handleRestart = () => {
//     simulation.restartSimulation()
//     setReviewingQuestion(false)
//   }


//   const handleAskTutor = async (
//     question: SimulationQuestion,
//     userAnswer: string | null,
//     content: string,
//   ): Promise<boolean> => {
//     const userMessage: TutorConversationMessage = {
//       role: 'user',
//       content: content.trim(),
//     }

//     const previousMessages = tutorConversations[question.id] ?? []
//     // O backend aceita até 20 mensagens por chamada. Mantemos o trecho mais recente.
//     const messages = [...previousMessages, userMessage].slice(-20)

//     setTutorLoadingQuestions((current) => ({ ...current, [question.id]: true }))
//     setTutorErrors((current) => ({ ...current, [question.id]: '' }))

//     try {
//       const response = await studyService.askQuestionTutor({
//         question: buildTutorQuestionContext(question, userAnswer),
//         messages,
//       })

//       setTutorConversations((current) => ({
//         ...current,
//         [question.id]: [
//           ...messages,
//           { role: 'assistant', content: response.reply },
//         ],
//       }))

//       return true
//     } catch (error: unknown) {
//       setTutorErrors((current) => ({
//         ...current,
//         [question.id]: getTutorRequestError(error),
//       }))
//       return false
//     } finally {
//       setTutorLoadingQuestions((current) => ({ ...current, [question.id]: false }))
//     }
//   }

//   // Tela de resultado.
//   if (simulation.isFinished && simulation.result) {
//     return (
//       <main className="mx-auto max-w-5xl space-y-8 p-4 md:p-8">
//         {showSemanticRelations && (
//           <SemanticRelationsPanel
//             subjects={apiResult.resolvedSubjects ?? []}
//           />
//         )}

//         <SimulationsSummary
//           result={simulation.result}
//           questions={questions}
//           answers={simulation.answers}
//           onReviewQuestion={handleReviewQuestion}
//           onRestart={handleRestart}
//         />

//         {reviewingQuestion && currentQuestion && (
//           <section className="space-y-5 rounded-xl border p-5">
//             <div className="flex flex-wrap items-center justify-between gap-3">
//               <h2 className="text-xl font-semibold">
//                 Revisão da questão {currentQuestionNumber}
//               </h2>

//               <button
//                 type="button"
//                 onClick={() => setReviewingQuestion(false)}
//                 className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
//               >
//                 Fechar revisão
//               </button>
//             </div>

//             <QuestionCard
//               question={currentQuestion}
//               questionIndex={simulation.currentQuestionIndex}
//               totalQuestions={questions.length}
//               selectedAnswer={simulation.currentAnswer}
//               showCorrection
//               disabled
//               onSelectAnswer={() => undefined}
//             />

//             <QuestionsFeedback
//               selectedAnswer={simulation.currentAnswer}
//               correctAnswer={currentQuestion.correctAlternativeLetter}
//               showCorrection
//               isCanceled={currentQuestion.isCanceled}
//             />

//             <QuestionTutorChat
//               key={currentQuestion.id}
//               messages={tutorConversations[currentQuestion.id] ?? []}
//               isLoading={Boolean(tutorLoadingQuestions[currentQuestion.id])}
//               hasUserAnswer={Boolean(simulation.currentAnswer)}
//               error={tutorErrors[currentQuestion.id] || null}
//               onSend={(content) =>
//                 handleAskTutor(currentQuestion, simulation.currentAnswer, content)
//               }
//             />

//             <div className="flex justify-between gap-3">
//               <button
//                 type="button"
//                 disabled={simulation.currentQuestionIndex === 0}
//                 onClick={simulation.previousQuestion}
//                 className="rounded-md border px-4 py-2 disabled:opacity-40"
//               >
//                 <ChevronLeft className="mr-1 inline h-4 w-4" />
//                 Anterior
//               </button>

//               <button
//                 type="button"
//                 disabled={
//                   simulation.currentQuestionIndex ===
//                   questions.length - 1
//                 }
//                 onClick={simulation.nextQuestion}
//                 className="rounded-md border px-4 py-2 disabled:opacity-40"
//               >
//                 Próxima
//                 <ChevronRight className="ml-1 inline h-4 w-4" />
//               </button>
//             </div>
//           </section>
//         )}
//       </main>
//     )
//   }

//   if (!currentQuestion) {
//     return null
//   }

//   return (
//     <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
//       <header className="flex flex-wrap items-center justify-between gap-3">
//         <div>
//           <h1 className="text-2xl font-bold">Simulado</h1>

//           <p className="text-sm text-muted-foreground">
//             {questions.length} questões disponíveis
//           </p>
//         </div>

//         <span className="rounded-full bg-muted px-3 py-1 text-sm">
//           {simulation.answeredQuestions} de {questions.length} respondidas
//         </span>
//       </header>

//       {showSemanticRelations && (
//         <SemanticRelationsPanel
//           subjects={apiResult.resolvedSubjects ?? []}
//         />
//       )}

//       <SimulationTimer
//         remainingTimeInSeconds={simulation.remainingTimeInSeconds}
//         elapsedTimeInSeconds={simulation.elapsedTimeInSeconds}
//         isPaused={simulation.isPaused}
//         isFinished={simulation.isFinished}
//         onPause={simulation.pauseSimulation}
//         onResume={simulation.resumeSimulation}
//       />

//       {simulation.isPaused ? (
//         <div className="rounded-lg border border-amber-500 bg-amber-50 p-6 text-center dark:bg-amber-950/30">
//           <h2 className="text-lg font-semibold">Simulado pausado</h2>

//           <p className="mt-1 text-sm text-muted-foreground">
//             O cronômetro está parado. Continue quando estiver pronto.
//           </p>

//           <button
//             type="button"
//             onClick={simulation.resumeSimulation}
//             className="mt-4 rounded-md bg-primary px-5 py-2 text-primary-foreground"
//           >
//             Continuar simulado
//           </button>
//         </div>
//       ) : (
//         <>
//           <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
//             <div className="min-w-0 space-y-6 rounded-xl border p-4 md:p-6">
//               <QuestionCard
//                 question={currentQuestion}
//                 questionIndex={simulation.currentQuestionIndex}
//                 totalQuestions={questions.length}
//                 selectedAnswer={simulation.currentAnswer}
//                 showCorrection={showCorrection}
//                 disabled={
//                   simulation.status !== 'in_progress' ||
//                   showCorrection
//                 }
//                 onSelectAnswer={handleSelectAnswer}
//               />

//               <QuestionsFeedback
//                 selectedAnswer={simulation.currentAnswer}
//                 correctAnswer={currentQuestion.correctAlternativeLetter}
//                 showCorrection={showCorrection}
//                 isCanceled={currentQuestion.isCanceled}
//                 canCorrect={canCorrect}
//                 onCorrect={handleCorrectQuestion}
//               />

//               {showCorrection && (
//                 <QuestionTutorChat
//                   key={currentQuestion.id}
//                   messages={tutorConversations[currentQuestion.id] ?? []}
//                   isLoading={Boolean(tutorLoadingQuestions[currentQuestion.id])}
//                   hasUserAnswer={Boolean(simulation.currentAnswer)}
//                   error={tutorErrors[currentQuestion.id] || null}
//                   onSend={(content) =>
//                     handleAskTutor(currentQuestion, simulation.currentAnswer, content)
//                   }
//                 />
//               )}

//               <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
//                 <button
//                   type="button"
//                   disabled={simulation.currentQuestionIndex === 0}
//                   onClick={simulation.previousQuestion}
//                   className="rounded-md border px-4 py-2 text-sm disabled:opacity-40"
//                 >
//                   <ChevronLeft className="mr-1 inline h-4 w-4" />
//                   Anterior
//                 </button>

//                 <button
//                   type="button"
//                   disabled={
//                     simulation.currentQuestionIndex ===
//                     questions.length - 1
//                   }
//                   onClick={simulation.nextQuestion}
//                   className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-40"
//                 >
//                   Próxima
//                   <ChevronRight className="ml-1 inline h-4 w-4" />
//                 </button>
//               </div>
//             </div>

//             <QuestionNavigation
//               totalQuestions={questions.length}
//               currentQuestionIndex={simulation.currentQuestionIndex}
//               answers={simulation.answers}
//               questionIds={questions.map((question) => question.id)}
//               correctedQuestionIds={simulation.correctedQuestionIds}
//               onNavigate={simulation.goToQuestion}
//             />
//           </div>

//           <div className="flex justify-end border-t pt-5">
//             <button
//               type="button"
//               onClick={handleFinish}
//               className="inline-flex items-center gap-2 rounded-md bg-red-600 px-5 py-2.5 font-medium text-white hover:bg-red-700"
//             >
//               <Flag className="h-4 w-4" />
//               Finalizar simulado
//             </button>
//           </div>
//         </>
//       )}
//     </main>
//   )
// }

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { studyService } from '../../study/services/study.service'
import { QuestionTutorChat } from '../components/QuestionTutorChat'

import type {
  GenerateQuestionsResponse,
  ResolvedStudyStatus,
  ResolvedStudySubject,
  SimulationConfig,
  SimulationQuestion,
  TutorConversationMessage,
} from '../types/simulation.types'

interface SimulationLocationState {
  result?: GenerateQuestionsResponse['result'] & {
    resolvedSubjects?: ResolvedStudySubject[]
  }
}

function htmlToPlainText(html: string): string {
  if (!html.trim()) return ''

  const parsed = new DOMParser().parseFromString(html, 'text/html')
  return (parsed.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}

function buildTutorQuestionContext(
  question: SimulationQuestion,
  userAnswer: string | null,
) {
  const associatedTexts = question.associatedTextsHtml
    .map(htmlToPlainText)
    .filter(Boolean)

  const statement = [
    associatedTexts.length > 0
      ? `Texto(s) associado(s):\n${associatedTexts.join('\n\n')}`
      : '',
    htmlToPlainText(question.statementHtml),
  ]
    .filter(Boolean)
    .join('\n\n')

  return {
    statement: statement || 'A questão não possui enunciado textual disponível.',
    alternatives: question.alternatives.map((alternative) => {
      const text = htmlToPlainText(alternative.contentHtml)

      return {
        key: alternative.letter,
        text:
          text ||
          (alternative.images.length > 0
            ? '[Esta alternativa contém imagem, que não foi enviada ao tutor.]'
            : '[Alternativa sem conteúdo textual.]'),
      }
    }),
    subject: question.subject.trim() || null,
    topic: question.topic.trim() || null,
    userAnswer,
    correctAnswer: question.correctAlternativeLetter,
  }
}

function getTutorRequestError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = error.response
    if (typeof response === 'object' && response !== null && 'data' in response) {
      const data = response.data
      if (typeof data === 'object' && data !== null && 'message' in data) {
        const message = data.message
        if (typeof message === 'string' && message.trim()) return message
      }
    }
  }

  if (error instanceof Error && error.message.trim()) return error.message
  return 'Não foi possível conversar com o tutor. Tente novamente.'
}

function getPersistenceRequestError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = error.response
    if (typeof response === 'object' && response !== null && 'data' in response) {
      const data = response.data
      if (typeof data === 'object' && data !== null && 'message' in data) {
        const message = data.message
        if (typeof message === 'string' && message.trim()) return message
      }
    }
  }

  if (error instanceof Error && error.message.trim()) return error.message
  return 'Não foi possível salvar o progresso do simulado. Tente novamente.'
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
  const [tutorConversations, setTutorConversations] = useState<
    Record<string, TutorConversationMessage[]>
  >({})
  const [tutorLoadingQuestions, setTutorLoadingQuestions] = useState<Record<string, boolean>>({})
  const [tutorErrors, setTutorErrors] = useState<Record<string, string>>({})

  const simulationId = apiResult?.simulation?.id ?? null
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [attemptLoading, setAttemptLoading] = useState(true)
  const [isFinishing, setIsFinishing] = useState(false)
  const [isRestarting, setIsRestarting] = useState(false)
  const [persistenceError, setPersistenceError] = useState<string | null>(null)

  const startSimulationRef = useRef(simulation.startSimulation)
  const attemptStartRef = useRef<{
    simulationId: string
    promise: Promise<string>
  } | null>(null)
  const answerSaveQueueRef = useRef<Map<string, Promise<void>>>(new Map())
  const failedAnswerIdsRef = useRef<Set<string>>(new Set())
  const finishAttemptInProgressRef = useRef(false)
  const autoFinishTriggeredRef = useRef(false)

  useEffect(() => {
    startSimulationRef.current = simulation.startSimulation
  }, [simulation.startSimulation])

  // A tentativa é criada no servidor antes de liberar a interação com as questões.
  // O ref evita criar duas tentativas no replay de efeitos do React Strict Mode.
  useEffect(() => {
    let active = true

    if (!simulationId) {
      setAttemptLoading(false)
      setPersistenceError(
        'O servidor não retornou um simulado persistido. Volte à preparação e gere as questões novamente.',
      )
      return () => {
        active = false
      }
    }

    if (attemptStartRef.current?.simulationId !== simulationId) {
      const promise = studyService
        .startSimulationAttempt(simulationId)
        .then((response) => response.attempt.id)

      attemptStartRef.current = { simulationId, promise }
    }

    void attemptStartRef.current.promise
      .then((createdAttemptId) => {
        if (!active) return

        setAttemptId(createdAttemptId)
        setAttemptLoading(false)
        setPersistenceError(null)
        startSimulationRef.current()
      })
      .catch((error: unknown) => {
        if (!active) return

        setAttemptLoading(false)
        setPersistenceError(getPersistenceRequestError(error))
      })

    return () => {
      active = false
    }
  }, [simulationId])

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
    if (!currentQuestion || !attemptId) {
      return
    }

    const questionExternalId = currentQuestion.id
    simulation.selectAnswer(questionExternalId, letter)

    // Serializa gravações da mesma questão para que um clique mais recente
    // não seja sobrescrito por uma requisição anterior que termine depois.
    const previousSave =
      answerSaveQueueRef.current.get(questionExternalId) ?? Promise.resolve()

    const savePromise = previousSave
      .catch(() => undefined)
      .then(() =>
        studyService.saveSimulationAnswer(attemptId, {
          questionExternalId,
          selectedAlternativeLetter: letter,
        }),
      )

    answerSaveQueueRef.current.set(questionExternalId, savePromise)

    void savePromise
      .then(() => {
        failedAnswerIdsRef.current.delete(questionExternalId)
        if (failedAnswerIdsRef.current.size === 0) {
          setPersistenceError(null)
        }
      })
      .catch((error: unknown) => {
        failedAnswerIdsRef.current.add(questionExternalId)
        setPersistenceError(getPersistenceRequestError(error))
      })
      .finally(() => {
        if (answerSaveQueueRef.current.get(questionExternalId) === savePromise) {
          answerSaveQueueRef.current.delete(questionExternalId)
        }
      })
  }

  const handleCorrectQuestion = () => {
    if (!currentQuestion) {
      return
    }

    simulation.correctQuestion(currentQuestion.id)
  }

  const persistAndFinishAttempt = useCallback(async (askForConfirmation: boolean) => {
    if (finishAttemptInProgressRef.current || simulation.isFinished) {
      return
    }

    if (askForConfirmation) {
      const confirmed = window.confirm(
        'Deseja realmente finalizar o simulado? Não será possível alterar suas respostas depois.',
      )
      if (!confirmed) return
    }

    if (!attemptId) {
      setPersistenceError('Não existe uma tentativa ativa para finalizar.')
      return
    }

    finishAttemptInProgressRef.current = true
    setIsFinishing(true)

    try {
      await Promise.all(Array.from(answerSaveQueueRef.current.values()))

      if (failedAnswerIdsRef.current.size > 0) {
        throw new Error(
          'Existem respostas que ainda não foram salvas. Selecione novamente as alternativas indicadas e tente finalizar.',
        )
      }

      await studyService.finishSimulationAttempt(attemptId)
      simulation.finishSimulation()
      setReviewingQuestion(false)
      setPersistenceError(null)
    } catch (error: unknown) {
      setPersistenceError(getPersistenceRequestError(error))
      finishAttemptInProgressRef.current = false
    } finally {
      setIsFinishing(false)
    }
  }, [attemptId, simulation.finishSimulation, simulation.isFinished])

  const handleFinish = () => {
    void persistAndFinishAttempt(true)
  }

  // Quando o cronômetro chega a zero, finaliza também a tentativa no backend.
  useEffect(() => {
    if (
      simulation.status === 'in_progress' &&
      simulation.remainingTimeInSeconds === 0 &&
      !autoFinishTriggeredRef.current
    ) {
      autoFinishTriggeredRef.current = true
      void persistAndFinishAttempt(false)
    }
  }, [persistAndFinishAttempt, simulation.remainingTimeInSeconds, simulation.status])

  const handleReviewQuestion = (index: number) => {
    simulation.goToQuestion(index)
    setReviewingQuestion(true)
  }

  const handleRestart = async () => {
    if (!simulationId) {
      setPersistenceError('O identificador do simulado não está disponível.')
      return
    }

    setIsRestarting(true)
    setPersistenceError(null)

    try {
      const response = await studyService.startSimulationAttempt(simulationId)

      answerSaveQueueRef.current.clear()
      failedAnswerIdsRef.current.clear()
      finishAttemptInProgressRef.current = false
      autoFinishTriggeredRef.current = false
      setAttemptId(response.attempt.id)
      simulation.restartSimulation()
      setReviewingQuestion(false)
    } catch (error: unknown) {
      setPersistenceError(getPersistenceRequestError(error))
    } finally {
      setIsRestarting(false)
    }
  }


  const handleAskTutor = async (
    question: SimulationQuestion,
    userAnswer: string | null,
    content: string,
  ): Promise<boolean> => {
    const userMessage: TutorConversationMessage = {
      role: 'user',
      content: content.trim(),
    }

    const previousMessages = tutorConversations[question.id] ?? []
    // O backend aceita até 20 mensagens por chamada. Mantemos o trecho mais recente.
    const messages = [...previousMessages, userMessage].slice(-20)

    setTutorLoadingQuestions((current) => ({ ...current, [question.id]: true }))
    setTutorErrors((current) => ({ ...current, [question.id]: '' }))

    try {
      const response = await studyService.askQuestionTutor({
        question: buildTutorQuestionContext(question, userAnswer),
        messages,
      })

      setTutorConversations((current) => ({
        ...current,
        [question.id]: [
          ...messages,
          { role: 'assistant', content: response.reply },
        ],
      }))

      return true
    } catch (error: unknown) {
      setTutorErrors((current) => ({
        ...current,
        [question.id]: getTutorRequestError(error),
      }))
      return false
    } finally {
      setTutorLoadingQuestions((current) => ({ ...current, [question.id]: false }))
    }
  }

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

  if (attemptLoading) {
    return (
      <main className="mx-auto max-w-3xl space-y-3 p-6">
        <h1 className="text-2xl font-bold">Preparando sua tentativa</h1>
        <p className="text-muted-foreground">Registrando o início do simulado...</p>
      </main>
    )
  }

  if (!attemptId) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 p-6">
        <h1 className="text-2xl font-bold">Não foi possível iniciar o simulado</h1>
        <p role="alert" className="text-sm text-destructive">
          {persistenceError ?? 'Não foi possível registrar a tentativa.'}
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


  // Tela de resultado.
  if (simulation.isFinished && simulation.result) {
    return (
      <main className="mx-auto max-w-5xl space-y-8 p-4 md:p-8">
        {persistenceError && (
          <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {persistenceError}
          </div>
        )}
        {isRestarting && (
          <p className="text-sm text-muted-foreground">Criando uma nova tentativa...</p>
        )}
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

            <QuestionTutorChat
              key={currentQuestion.id}
              messages={tutorConversations[currentQuestion.id] ?? []}
              isLoading={Boolean(tutorLoadingQuestions[currentQuestion.id])}
              hasUserAnswer={Boolean(simulation.currentAnswer)}
              error={tutorErrors[currentQuestion.id] || null}
              onSend={(content) =>
                handleAskTutor(currentQuestion, simulation.currentAnswer, content)
              }
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
      {persistenceError && (
        <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {persistenceError}
        </div>
      )}
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
                  showCorrection ||
                  isFinishing
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

              {showCorrection && (
                <QuestionTutorChat
                  key={currentQuestion.id}
                  messages={tutorConversations[currentQuestion.id] ?? []}
                  isLoading={Boolean(tutorLoadingQuestions[currentQuestion.id])}
                  hasUserAnswer={Boolean(simulation.currentAnswer)}
                  error={tutorErrors[currentQuestion.id] || null}
                  onSend={(content) =>
                    handleAskTutor(currentQuestion, simulation.currentAnswer, content)
                  }
                />
              )}

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
              disabled={isFinishing}
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-5 py-2.5 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Flag className="h-4 w-4" />
              {isFinishing ? 'Salvando e finalizando...' : 'Finalizar simulado'}
            </button>
          </div>
        </>
      )}
    </main>
  )
}