// import { useMemo, useState } from 'react'
// import {
//   ArrowLeft,
//   ArrowRight,
//   BookOpen,
//   Check,
//   ChevronDown,
//   ChevronUp,
//   FileText,
//   Layers3,
//   LoaderCircle,
//   Plus,
//   Sparkles,
//   Trash2,
// } from 'lucide-react'
// import { Link, useNavigate } from 'react-router-dom'

// import { studyService } from '../study/services/study.service'
// import { getLabSubjects, getLabTopics } from '../pages/QuestAPI-lab.service'
// import { PdfUploadField } from './components/PdfUploadField'

// import type { StudyPreparationRequest } from '../../types/Communication.types'
// import type { PdfAnalysis, StudySubject } from '../study/types/study.types'

// type PreparationMode = 'pdf' | 'manual' | null

// const DEFAULT_QUESTION_COUNT = 10

// /**
//  * Converte a resposta real de AnalyseTextFromPDF para o modelo da interface.
//  * A resposta atual da API contém totalQuestions, groups e subjects.
//  * Os assuntos ainda não vêm nessa resposta, então a lista começa vazia.
//  */
// function mapPdfAnalysisToSubjects(analysis: PdfAnalysis): StudySubject[] {
//   const sourceSubjects = Array.isArray(analysis.subjects)
//     ? analysis.subjects
//     : []

//   // Começa pelas quantidades explícitas que a IA conseguiu identificar.
//   const questionCounts = sourceSubjects.map((subject) => subject.questionCount)

//   // Distribui os totais dos grupos entre matérias que vieram sem quantidade.
//   for (const group of analysis.groups ?? []) {
//     if (group.questionCount === null || group.questionCount <= 0) continue

//     const groupIndexes = sourceSubjects
//       .map((subject, index) => ({ subject, index }))
//       .filter(({ subject }) => subject.group === group.name)
//       .map(({ index }) => index)

//     const alreadyAssigned = groupIndexes.reduce((total, index) => {
//       const amount = questionCounts[index]
//       return total + (typeof amount === 'number' && amount > 0 ? amount : 0)
//     }, 0)

//     const pendingIndexes = groupIndexes.filter(
//       (index) => questionCounts[index] === null || questionCounts[index] === undefined,
//     )

//     if (pendingIndexes.length === 0) continue

//     const remaining = Math.max(0, group.questionCount - alreadyAssigned)
//     const distribution = distributeQuestions(remaining, pendingIndexes.length)

//     pendingIndexes.forEach((subjectIndex, index) => {
//       const amount = distribution[index]
//       if (amount !== undefined && amount > 0) {
//         questionCounts[subjectIndex] = amount
//       }
//     })
//   }

//   return sourceSubjects
//     .filter((subject) => typeof subject.name === 'string' && subject.name.trim().length > 0)
//     .map((subject) => {
//       const sourceIndex = sourceSubjects.indexOf(subject)
//       const suggestedAmount = questionCounts[sourceIndex]

//       return {
//         id: crypto.randomUUID(),
//         nome: subject.name.trim(),
//         // A resposta atual da IA não inclui assuntos. Eles serão adicionados
//         // pelo catálogo da Quest API na etapa de revisão.
//         topicos: [],
//         quantidadeQuestoes:
//           typeof suggestedAmount === 'number' && suggestedAmount > 0
//             ? suggestedAmount
//             : DEFAULT_QUESTION_COUNT,
//       }
//     })
// }

// function distributeQuestions(total: number, count: number): number[] {
//   if (count <= 0) return []

//   const base = Math.floor(total / count)
//   const remainder = total % count

//   return Array.from(
//     { length: count },
//     (_, index) => base + (index < remainder ? 1 : 0),
//   )
// }

// export default function AnalysisPage() {
//   const navigate = useNavigate()
//   const [mode, setMode] = useState<PreparationMode>(null)
//   const [file, setFile] = useState<File | null>(null)
//   const [subjects, setSubjects] = useState<StudySubject[]>([])
//   const [analysisCompleted, setAnalysisCompleted] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [submitting, setSubmitting] = useState(false)
//   const [error, setError] = useState('')

//   const totalTopics = useMemo(
//     () => subjects.reduce((total, subject) => total + subject.topicos.length, 0),
//     [subjects],
//   )

//   const totalQuestions = useMemo(
//     () =>
//       subjects.reduce(
//         (total, subject) => total + subject.quantidadeQuestoes,
//         0,
//       ),
//     [subjects],
//   )

//   function resetAnalysis() {
//     setSubjects([])
//     setAnalysisCompleted(false)
//     setError('')
//   }

//   function handleModeChange(nextMode: PreparationMode) {
//     setMode(nextMode)
//     setFile(null)
//     resetAnalysis()
//   }

//   function handleFileChange(nextFile: File | null) {
//     setFile(nextFile)
//     resetAnalysis()
//   }

//   async function handleAnalyzePdf() {
//     if (!file) {
//       setError('Selecione um arquivo PDF antes de solicitar a análise.')
//       return
//     }

//     setLoading(true)
//     setError('')
//     resetAnalysis()

//     try {
//       const response = await studyService.analyzePdfForPreparation(file)
//       const mappedSubjects = mapPdfAnalysisToSubjects(response.analysis)

//       if (mappedSubjects.length === 0) {
//         setError('A IA não identificou disciplinas no edital.')
//         return
//       }

//       setSubjects(mappedSubjects)
//       setAnalysisCompleted(true)
//     } catch (cause) {
//       console.error('Erro ao analisar o edital:', cause)
//       setError(
//         cause instanceof Error
//           ? cause.message
//           : 'Não foi possível analisar o edital.',
//       )
//     } finally {
//       setLoading(false)
//     }
//   }

//   function updateSubject(
//     subjectId: string,
//     updates: Partial<Pick<StudySubject, 'nome' | 'quantidadeQuestoes'>>,
//   ) {
//     setSubjects((current) =>
//       current.map((subject) =>
//         subject.id === subjectId ? { ...subject, ...updates } : subject,
//       ),
//     )
//   }

//   function updateTopic(subjectId: string, topicIndex: number, value: string) {
//     setSubjects((current) =>
//       current.map((subject) => {
//         if (subject.id !== subjectId) return subject

//         return {
//           ...subject,
//           topicos: subject.topicos.map((topic, index) =>
//             index === topicIndex ? value : topic,
//           ),
//         }
//       }),
//     )
//   }

//   function removeTopic(subjectId: string, topicIndex: number) {
//     setSubjects((current) =>
//       current.map((subject) => {
//         if (subject.id !== subjectId) return subject

//         return {
//           ...subject,
//           topicos: subject.topicos.filter((_, index) => index !== topicIndex),
//         }
//       }),
//     )
//   }

//   function addTopic(subjectId: string, topic: string) {
//     const normalizedTopic = topic.trim()
//     if (!normalizedTopic) return

//     setSubjects((current) =>
//       current.map((subject) => {
//         if (subject.id !== subjectId) return subject

//         const alreadyExists = subject.topicos.some(
//           (currentTopic) =>
//             currentTopic.trim().toLocaleLowerCase() ===
//             normalizedTopic.toLocaleLowerCase(),
//         )

//         if (alreadyExists) return subject

//         return {
//           ...subject,
//           topicos: [...subject.topicos, normalizedTopic],
//         }
//       }),
//     )
//   }

//   function removeSubject(subjectId: string) {
//     setSubjects((current) =>
//       current.filter((subject) => subject.id !== subjectId),
//     )
//   }

//   // Adiciona uma matéria existente no catálogo da Quest API.
//   function addCatalogSubject(subjectName: string) {
//     const normalizedName = subjectName.trim()
//     if (!normalizedName) return

//     setSubjects((current) => {
//       const alreadyExists = current.some(
//         (subject) =>
//           subject.nome.trim().toLocaleLowerCase() ===
//           normalizedName.toLocaleLowerCase(),
//       )

//       if (alreadyExists) return current

//       return [
//         ...current,
//         {
//           id: crypto.randomUUID(),
//           nome: normalizedName,
//           topicos: [],
//           quantidadeQuestoes: DEFAULT_QUESTION_COUNT,
//         },
//       ]
//     })

//     setAnalysisCompleted(true)
//     setError('')
//   }

//   function validatePreparation(): string | null {
//     if (!analysisCompleted) {
//       return 'Escolha um edital ou adicione matérias pelo catálogo antes de continuar.'
//     }

//     if (subjects.length === 0) {
//       return 'Adicione pelo menos uma matéria à preparação.'
//     }

//     for (const subject of subjects) {
//       if (!subject.nome.trim()) {
//         return 'Todas as matérias precisam ter um nome.'
//       }

//       if (
//         !Number.isInteger(subject.quantidadeQuestoes) ||
//         subject.quantidadeQuestoes < 1 ||
//         subject.quantidadeQuestoes > 200
//       ) {
//         return `Informe uma quantidade entre 1 e 200 questões para ${subject.nome}.`
//       }
//     }

//     return null
//   }

//   async function handleGenerateQuestions() {
//     const validationError = validatePreparation()

//     if (validationError) {
//       setError(validationError)
//       return
//     }

//     const preparation: StudyPreparationRequest = {
//       subjects: subjects.map((subject) => ({
//         materia: subject.nome.trim(),
//         topics: Array.from(
//           new Set(
//             subject.topicos
//               .map((topic) => topic.trim())
//               .filter((topic) => topic.length > 0),
//           ),
//         ),
//         amountQuestions: subject.quantidadeQuestoes,
//       })),
//     }

//     setSubmitting(true)
//     setError('')

//     try {
//       const response = await studyService.generatePreparedQuestions(preparation)

//       navigate('/simulado', {
//         state: {
//           result: response.result,
//         },
//       })
//     } catch (cause) {
//       console.error('Erro ao gerar questões:', cause)
//       setError(
//         cause instanceof Error
//           ? cause.message
//           : 'Não foi possível gerar as questões. Tente novamente.',
//       )
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   return (
//     <main className="min-h-screen w-full overflow-x-hidden bg-[#080D18] px-3 py-5 text-white sm:px-6 sm:py-8 lg:px-8">
//       <div className="mx-auto w-full max-w-6xl min-w-0">
//         <div className="mb-6 sm:mb-8">
//           <Link
//             to="/"
//             className="inline-flex min-h-9 items-center gap-2 rounded-lg text-sm text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
//           >
//             <ArrowLeft className="size-4" />
//             Voltar ao início
//           </Link>
//         </div>

//         <header className="mb-6 flex min-w-0 flex-col gap-4 border-b border-white/10 pb-6 sm:mb-8 sm:gap-5 sm:pb-8 md:flex-row md:items-end md:justify-between">
//           <div className="min-w-0 max-w-2xl">
//             <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
//               Monte sua preparação
//             </h1>
//             <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400 sm:mt-3 sm:text-base">
//               Organize as matérias e os assuntos que deseja estudar. Comece com
//               um edital ou monte sua seleção manualmente.
//             </p>
//           </div>

//           <div className="flex w-full min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-[#111827] px-3 py-3 sm:w-auto sm:px-4">
//             <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300">
//               <Layers3 className="size-5" />
//             </div>
//             <div className="min-w-0">
//               <p className="text-xs text-slate-500">Área de preparação</p>
//               <p className="truncate text-sm font-semibold text-slate-200">
//                 Nova preparação
//               </p>
//             </div>
//           </div>
//         </header>

//         <nav
//           aria-label="Etapas da preparação"
//           className="mb-5 rounded-2xl border border-white/10 bg-[#111827] p-3 sm:mb-8 sm:p-5"
//         >
//           <div className="grid grid-cols-3 gap-1 sm:gap-4">
//             <Step
//               number="1"
//               title="Origem"
//               description="Como começar"
//               active={!analysisCompleted}
//             />
//             <Step
//               number="2"
//               title="Matérias"
//               description="Matérias e assuntos"
//               active={analysisCompleted}
//             />
//             <Step number="3" title="Revisão" description="Preparar simulado" />
//           </div>
//           <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/5 sm:mt-5">
//             <div
//               className={`h-full rounded-full bg-blue-500 transition-all ${
//                 analysisCompleted ? 'w-2/3' : 'w-1/3'
//               }`}
//             />
//           </div>
//         </nav>

//         <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
//           <section className="min-w-0 space-y-5 sm:space-y-6">
//             <section className="min-w-0 rounded-2xl border border-white/10 bg-[#111827] p-4 sm:p-6 lg:p-7">
//               <div className="mb-5">
//                 <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300 sm:text-xs">
//                   Etapa 01
//                 </p>
//                 <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-2xl">
//                   Como deseja começar?
//                 </h2>
//                 <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
//                   Escolha uma forma de informar as matérias do seu concurso.
//                   Você poderá revisar a seleção antes de continuar.
//                 </p>
//               </div>

//               <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
//                 <button
//                   type="button"
//                   aria-pressed={mode === 'pdf'}
//                   onClick={() => handleModeChange('pdf')}
//                   disabled={loading || submitting}
//                   className={`group flex min-w-0 flex-col rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-60 sm:p-5 ${
//                     mode === 'pdf'
//                       ? 'border-blue-400/60 bg-blue-500/10'
//                       : 'border-blue-400/20 bg-blue-500/[0.04] hover:border-blue-400/50 hover:bg-blue-500/[0.08]'
//                   }`}
//                 >
//                   <div className="flex w-full items-center justify-between gap-3">
//                     <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300 sm:size-11">
//                       <FileText className="size-5" />
//                     </span>
//                     {mode === 'pdf' && <Check className="size-4 shrink-0 text-blue-300" />}
//                   </div>
//                   <h3 className="mt-4 text-sm font-semibold text-white sm:text-base">
//                     Enviar edital em PDF
//                   </h3>
//                   <p className="mt-2 text-xs leading-5 text-slate-400 sm:text-sm">
//                     A IA identifica as matérias e os assuntos presentes no documento.
//                   </p>
//                   <span className="mt-4 text-xs font-semibold text-blue-300 sm:text-sm">
//                     Usar edital
//                   </span>
//                 </button>

//                 <button
//                   type="button"
//                   aria-pressed={mode === 'manual'}
//                   onClick={() => handleModeChange('manual')}
//                   disabled={loading || submitting}
//                   className={`group flex min-w-0 flex-col rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:cursor-not-allowed disabled:opacity-60 sm:p-5 ${
//                     mode === 'manual'
//                       ? 'border-violet-400/60 bg-violet-500/10'
//                       : 'border-violet-400/20 bg-violet-500/[0.04] hover:border-violet-400/50 hover:bg-violet-500/[0.08]'
//                   }`}
//                 >
//                   <div className="flex w-full items-center justify-between gap-3">
//                     <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300 sm:size-11">
//                       <BookOpen className="size-5" />
//                     </span>
//                     {mode === 'manual' && <Check className="size-4 shrink-0 text-violet-300" />}
//                   </div>
//                   <h3 className="mt-4 text-sm font-semibold text-white sm:text-base">
//                     Escolher matérias
//                   </h3>
//                   <p className="mt-2 text-xs leading-5 text-slate-400 sm:text-sm">
//                     Selecione as matérias e os assuntos disponíveis no catálogo.
//                   </p>
//                   <span className="mt-4 text-xs font-semibold text-violet-300 sm:text-sm">
//                     Selecionar manualmente
//                   </span>
//                 </button>
//               </div>
//             </section>

//             {mode === 'pdf' && (
//               <div className="space-y-4">
//                 <PdfUploadField file={file} onFileChange={handleFileChange} />

//                 <button
//                   type="button"
//                   onClick={handleAnalyzePdf}
//                   disabled={!file || loading || submitting}
//                   className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3.5 sm:text-base"
//                 >
//                   {loading ? (
//                     <>
//                       <LoaderCircle className="size-4 animate-spin" />
//                       Analisando edital...
//                     </>
//                   ) : (
//                     <>
//                       <Sparkles className="size-4" />
//                       Analisar edital com IA
//                     </>
//                   )}
//                 </button>
//               </div>
//             )}

//             {mode === 'manual' && (
//               <section className="min-w-0 rounded-2xl border border-violet-300/20 bg-[#0B1220] p-4 sm:p-5">
//                 <div className="mb-4 flex items-start gap-3">
//                   <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
//                     <BookOpen className="size-5" />
//                   </div>
//                   <div className="min-w-0">
//                     <h3 className="text-sm font-semibold text-slate-200 sm:text-base">
//                       Seleção manual de matérias
//                     </h3>
//                     <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
//                       Consulte o catálogo da Quest API e adicione as matérias que deseja estudar. Depois, escolha os assuntos de cada uma.
//                     </p>
//                   </div>
//                 </div>

//                 <SubjectCatalogPicker
//                   existingSubjects={subjects.map((subject) => subject.nome)}
//                   disabled={loading || submitting}
//                   onAddSubject={addCatalogSubject}
//                 />
//               </section>
//             )}

//             {mode === null && (
//               <section className="flex min-h-36 min-w-0 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#0B1220] px-4 py-8 text-center sm:min-h-44 sm:px-6">
//                 <div className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-500">
//                   <BookOpen className="size-5" />
//                 </div>
//                 <h3 className="mt-3 text-sm font-semibold text-slate-200">
//                   Escolha como deseja iniciar
//                 </h3>
//                 <p className="mt-1 max-w-md text-xs leading-5 text-slate-500 sm:text-sm">
//                   Selecione uma das opções acima para exibir os campos correspondentes.
//                 </p>
//               </section>
//             )}

//             {analysisCompleted && (
//               <section className="space-y-4 rounded-2xl border border-emerald-400/20 bg-[#111827] p-4 sm:p-6">
//                 <div>
//                   <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
//                     {mode === 'pdf' ? 'Análise concluída' : 'Matérias selecionadas'}
//                   </p>
//                   <h2 className="mt-2 text-lg font-semibold text-white sm:text-xl">
//                     Revise as matérias e os assuntos
//                   </h2>
//                   <p className="mt-1 text-sm leading-5 text-slate-400">
//                     Edite o nome e a quantidade de questões de cada matéria. Você também pode corrigir, remover ou complementar os assuntos pelo catálogo.
//                   </p>
//                 </div>

//                 {subjects.length === 0 ? (
//                   <div className="rounded-xl border border-dashed border-white/10 bg-[#0B1220] px-4 py-8 text-center">
//                     <p className="text-sm font-medium text-slate-300">
//                       Nenhuma matéria selecionada
//                     </p>
//                     <p className="mt-1 text-xs text-slate-500">
//                       Remova ou ajuste a seleção para continuar a preparação.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {subjects.map((subject, index) => (
//                       <article
//                         key={subject.id}
//                         className="min-w-0 rounded-xl border border-white/10 bg-[#0B1220] p-3 sm:p-4"
//                       >
//                         <div className="mb-4 flex items-center justify-between gap-3">
//                           <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
//                             Matéria {index + 1}
//                           </p>
//                           <button
//                             type="button"
//                             onClick={() => removeSubject(subject.id)}
//                             disabled={loading || submitting}
//                             className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
//                             aria-label={`Remover matéria ${subject.nome}`}
//                           >
//                             <Trash2 className="size-3.5" />
//                             Remover matéria
//                           </button>
//                         </div>

//                         <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
//                           <label className="block min-w-0">
//                             <span className="mb-1.5 block text-xs font-medium text-slate-400">
//                               Nome da matéria
//                             </span>
//                             <input
//                               type="text"
//                               value={subject.nome}
//                               onChange={(event) =>
//                                 updateSubject(subject.id, {
//                                   nome: event.target.value,
//                                 })
//                               }
//                               disabled={loading || submitting}
//                               placeholder="Nome da matéria"
//                               className="w-full min-w-0 rounded-lg border border-white/10 bg-[#111827] px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/10 disabled:opacity-60"
//                             />
//                           </label>

//                           <label className="block min-w-0">
//                             <span className="mb-1.5 block text-xs font-medium text-slate-400">
//                               Questões
//                             </span>
//                             <input
//                               type="number"
//                               min={1}
//                               max={200}
//                               step={1}
//                               value={subject.quantidadeQuestoes}
//                               onChange={(event) =>
//                                 updateSubject(subject.id, {
//                                   quantidadeQuestoes:
//                                     event.target.value === ''
//                                       ? 0
//                                       : Number(event.target.value),
//                                 })
//                               }
//                               disabled={loading || submitting}
//                               className="w-full min-w-0 rounded-lg border border-white/10 bg-[#111827] px-3 py-2.5 text-sm tabular-nums text-slate-100 outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/10 disabled:opacity-60"
//                             />
//                           </label>
//                         </div>

//                         <div className="mt-4 border-t border-white/5 pt-3">
//                           <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
//                             <p className="text-xs font-medium text-slate-300">
//                               Assuntos identificados
//                             </p>
//                             <span className="text-[11px] tabular-nums text-slate-500">
//                               {subject.topicos.length} assunto(s)
//                             </span>
//                           </div>

//                           {subject.topicos.length > 0 ? (
//                             <div className="space-y-2">
//                               {subject.topicos.map((topic, topicIndex) => (
//                                 <div
//                                   key={`${subject.id}-topic-${topicIndex}`}
//                                   className="flex min-w-0 items-center gap-2"
//                                 >
//                                   <input
//                                     type="text"
//                                     value={topic}
//                                     onChange={(event) =>
//                                       updateTopic(
//                                         subject.id,
//                                         topicIndex,
//                                         event.target.value,
//                                       )
//                                     }
//                                     disabled={loading || submitting}
//                                     aria-label={`Assunto ${topicIndex + 1} de ${subject.nome}`}
//                                     className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-xs leading-5 text-slate-300 outline-none transition placeholder:text-slate-600 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/10 disabled:opacity-60 sm:text-sm"
//                                   />
//                                   <button
//                                     type="button"
//                                     onClick={() =>
//                                       removeTopic(subject.id, topicIndex)
//                                     }
//                                     disabled={loading || submitting}
//                                     className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/5 text-slate-500 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
//                                     aria-label={`Remover assunto ${topic || topicIndex + 1}`}
//                                     title="Remover assunto"
//                                   >
//                                     <Trash2 className="size-3.5" />
//                                   </button>
//                                 </div>
//                               ))}
//                             </div>
//                           ) : (
//                             <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-xs leading-5 text-slate-500">
//                               Nenhum assunto selecionado para esta matéria. Na próxima etapa, você poderá adicionar assuntos pelo catálogo da Quest API.
//                             </p>
//                           )}

//                           <TopicCatalogPicker
//                             key={`${subject.id}-${subject.nome}`}
//                             subjectName={subject.nome}
//                             selectedTopics={subject.topicos}
//                             disabled={loading || submitting}
//                             onAddTopic={(topic) => addTopic(subject.id, topic)}
//                           />
//                         </div>
//                       </article>
//                     ))}
//                   </div>
//                 )}
//               </section>
//             )}

//             {error && (
//               <div
//                 role="alert"
//                 className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
//               >
//                 {error}
//               </div>
//             )}
//           </section>

//           <aside className="h-fit min-w-0 rounded-2xl border border-white/10 bg-[#111827] p-4 sm:p-5">
//             <div className="flex items-center gap-3">
//               <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">
//                 <Check className="size-4" />
//               </div>
//               <div className="min-w-0">
//                 <h2 className="text-sm font-semibold text-white">
//                   Resumo da preparação
//                 </h2>
//                 <p className="text-xs text-slate-500">Visão geral da seleção</p>
//               </div>
//             </div>

//             <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-1">
//               <SummaryItem
//                 label="Matérias"
//                 value={analysisCompleted ? String(subjects.length) : '—'}
//               />
//               <SummaryItem
//                 label="Assuntos"
//                 value={analysisCompleted ? String(totalTopics) : '—'}
//               />
//               <SummaryItem
//                 label="Questões"
//                 value={analysisCompleted ? String(totalQuestions) : '—'}
//               />
//             </div>

//             <div className="mt-4 rounded-xl border border-blue-400/10 bg-blue-500/[0.06] p-3 sm:p-4">
//               <div className="flex items-center gap-2 text-blue-300">
//                 <Sparkles className="size-4" />
//                 <span className="text-xs font-semibold">Dica</span>
//               </div>
//               <p className="mt-2 text-xs leading-5 text-slate-400">
//                 Revise os nomes, as quantidades e os assuntos antes de preparar seu simulado.
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={handleGenerateQuestions}
//               disabled={!analysisCompleted || subjects.length === 0 || loading || submitting}
//               className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-600/30 disabled:text-white/50 sm:text-sm"
//             >
//               {submitting ? (
//                 <>
//                   <LoaderCircle className="size-4 animate-spin" />
//                   Gerando questões...
//                 </>
//               ) : (
//                 <>
//                   Gerar simulado
//                   <ArrowRight className="size-4" />
//                 </>
//               )}
//             </button>
//             <p className="mt-2 text-center text-[11px] leading-4 text-slate-600">
//               {analysisCompleted
//                 ? 'Confira sua seleção antes de gerar o simulado.'
//                 : 'Sua preparação ainda não foi iniciada.'}
//             </p>
//           </aside>
//         </div>
//       </div>
//     </main>
//   )
// }

// interface StepProps {
//   number: string
//   title: string
//   description: string
//   active?: boolean
// }

// function Step({ number, title, description, active = false }: StepProps) {
//   return (
//     <div className="flex min-w-0 flex-col items-center gap-1 text-center sm:flex-row sm:gap-3 sm:text-left">
//       <span
//         className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:size-8 sm:text-sm ${
//           active
//             ? 'bg-blue-500 text-white'
//             : 'border border-white/15 bg-white/5 text-slate-400'
//         }`}
//       >
//         {number}
//       </span>
//       <div className="min-w-0">
//         <p className={`text-[11px] font-semibold leading-4 sm:text-sm ${active ? 'text-white' : 'text-slate-400'}`}>
//           {title}
//         </p>
//         <p className="hidden text-xs text-slate-600 sm:block">{description}</p>
//       </div>
//     </div>
//   )
// }

// interface SummaryItemProps {
//   label: string
//   value: string
// }

// function SummaryItem({ label, value }: SummaryItemProps) {
//   return (
//     <div className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#0B1220] px-3 py-3 sm:px-4">
//       <span className="text-xs text-slate-400 sm:text-sm">{label}</span>
//       <span className="text-sm font-semibold tabular-nums text-slate-200">
//         {value}
//       </span>
//     </div>
//   )
// }


// interface TopicCatalogPickerProps {
//   subjectName: string
//   selectedTopics: string[]
//   disabled?: boolean
//   onAddTopic: (topic: string) => void
// }

// /**
//  * Consulta os assuntos da matéria no catálogo do Lab/Quest API.
//  * Cada instância mantém sua própria paginação, evitando misturar
//  * os resultados de matérias diferentes.
//  */
// function TopicCatalogPicker({
//   subjectName,
//   selectedTopics,
//   disabled = false,
//   onAddTopic,
// }: TopicCatalogPickerProps) {
//   const [isOpen, setIsOpen] = useState(false)
//   const [topics, setTopics] = useState<string[]>([])
//   const [page, setPage] = useState(1)
//   const [hasMore, setHasMore] = useState(false)
//   const [loadingTopics, setLoadingTopics] = useState(false)
//   const [topicsError, setTopicsError] = useState('')

//   async function loadTopics(nextPage: number, append: boolean) {
//     const materia = subjectName.trim()

//     if (!materia) {
//       setTopicsError('Informe o nome da matéria antes de consultar o catálogo.')
//       setIsOpen(true)
//       return
//     }

//     setLoadingTopics(true)
//     setTopicsError('')

//     try {
//       const response = await getLabTopics({
//         materia,
//         page: nextPage,
//         per_page: 20,
//       })

//       setTopics((current) =>
//         append
//           ? Array.from(new Set([...current, ...response.items]))
//           : response.items,
//       )
//       setPage(response.page)
//       setHasMore(response.hasMore)
//     } catch (cause) {
//       console.error('Erro ao consultar assuntos do catálogo:', cause)
//       setTopicsError(
//         cause instanceof Error
//           ? cause.message
//           : 'Não foi possível carregar os assuntos.',
//       )
//     } finally {
//       setLoadingTopics(false)
//     }
//   }

//   function handleToggle() {
//     if (disabled) return

//     if (isOpen) {
//       setIsOpen(false)
//       return
//     }

//     setIsOpen(true)
//     setTopics([])
//     setPage(1)
//     setHasMore(false)
//     void loadTopics(1, false)
//   }

//   function isAlreadySelected(topic: string) {
//     return selectedTopics.some(
//       (selectedTopic) =>
//         selectedTopic.trim().toLocaleLowerCase() ===
//         topic.trim().toLocaleLowerCase(),
//     )
//   }

//   return (
//     <div className="mt-3">
//       <button
//         type="button"
//         onClick={handleToggle}
//         disabled={disabled}
//         aria-expanded={isOpen}
//         className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-400/30 px-3 py-2 text-xs font-medium text-blue-300 transition hover:border-blue-400/60 hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-start sm:text-sm"
//       >
//         <Plus className="size-3.5" />
//         Adicionar assunto do catálogo
//         {isOpen ? (
//           <ChevronUp className="size-3.5" />
//         ) : (
//           <ChevronDown className="size-3.5" />
//         )}
//       </button>

//       {isOpen && (
//         <div className="mt-3 rounded-xl border border-blue-400/15 bg-[#080D18] p-3 sm:p-4">
//           <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
//             <div className="min-w-0">
//               <p className="text-xs font-semibold text-slate-200 sm:text-sm">
//                 Catálogo de assuntos
//               </p>
//               <p className="mt-1 break-words text-[11px] leading-4 text-slate-500">
//                 Matéria consultada: {subjectName || 'Nome não informado'}
//               </p>
//             </div>
//             <span className="shrink-0 text-[11px] text-slate-500">
//               {topics.length} carregado(s)
//             </span>
//           </div>

//           {topicsError && (
//             <div
//               role="alert"
//               className="mb-3 rounded-lg border border-red-400/15 bg-red-400/10 p-3 text-xs text-red-300"
//             >
//               <p>{topicsError}</p>
//               {subjectName.trim() && (
//                 <button
//                   type="button"
//                   onClick={() => void loadTopics(1, false)}
//                   disabled={loadingTopics}
//                   className="mt-2 font-semibold underline underline-offset-2 disabled:opacity-50"
//                 >
//                   Tentar novamente
//                 </button>
//               )}
//             </div>
//           )}

//           {loadingTopics && topics.length === 0 && (
//             <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-400">
//               <LoaderCircle className="size-4 animate-spin" />
//               Carregando assuntos...
//             </div>
//           )}

//           {!loadingTopics && topics.length === 0 && !topicsError && (
//             <p className="rounded-lg border border-dashed border-white/10 px-3 py-5 text-center text-xs text-slate-500">
//               Nenhum assunto encontrado para esta matéria.
//             </p>
//           )}

//           {topics.length > 0 && (
//             <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
//               {topics.map((topic) => {
//                 const alreadySelected = isAlreadySelected(topic)

//                 return (
//                   <div
//                     key={topic}
//                     className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5"
//                   >
//                     <span className="min-w-0 break-words text-xs leading-5 text-slate-300 sm:text-sm">
//                       {topic}
//                     </span>
//                     <button
//                       type="button"
//                       onClick={() => onAddTopic(topic)}
//                       disabled={disabled || alreadySelected}
//                       className={`shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed ${
//                         alreadySelected
//                           ? 'border border-emerald-400/15 bg-emerald-400/10 text-emerald-300/70'
//                           : 'bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 disabled:opacity-50'
//                       }`}
//                     >
//                       {alreadySelected ? 'Adicionado' : 'Adicionar'}
//                     </button>
//                   </div>
//                 )
//               })}
//             </div>
//           )}

//           {hasMore && (
//             <button
//               type="button"
//               onClick={() => void loadTopics(page + 1, true)}
//               disabled={loadingTopics}
//               className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               {loadingTopics ? (
//                 <>
//                   <LoaderCircle className="size-3.5 animate-spin" />
//                   Carregando...
//                 </>
//               ) : (
//                 'Carregar mais assuntos'
//               )}
//             </button>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

// interface SubjectCatalogPickerProps {
//   existingSubjects: string[]
//   disabled?: boolean
//   onAddSubject: (subject: string) => void
// }

// /**
//  * Consulta as matérias disponíveis no catálogo da Quest API.
//  * A lista é paginada e permite adicionar várias matérias à preparação.
//  */
// function SubjectCatalogPicker({
//   existingSubjects,
//   disabled = false,
//   onAddSubject,
// }: SubjectCatalogPickerProps) {
//   const [isOpen, setIsOpen] = useState(false)
//   const [catalogSubjects, setCatalogSubjects] = useState<string[]>([])
//   const [page, setPage] = useState(1)
//   const [hasMore, setHasMore] = useState(false)
//   const [loadingSubjects, setLoadingSubjects] = useState(false)
//   const [subjectsError, setSubjectsError] = useState('')

//   async function loadSubjects(nextPage: number, append: boolean) {
//     if (loadingSubjects) return

//     setLoadingSubjects(true)
//     setSubjectsError('')

//     try {
//       const response = await getLabSubjects({
//         page: nextPage,
//         per_page: 20,
//       })

//       setCatalogSubjects((current) =>
//         append
//           ? Array.from(new Set([...current, ...response.items]))
//           : response.items,
//       )
//       setPage(response.page)
//       setHasMore(response.hasMore)
//     } catch (cause) {
//       console.error('Erro ao consultar matérias do catálogo:', cause)
//       setSubjectsError(
//         cause instanceof Error
//           ? cause.message
//           : 'Não foi possível carregar as matérias.',
//       )
//     } finally {
//       setLoadingSubjects(false)
//     }
//   }

//   function handleToggle() {
//     if (disabled) return

//     if (isOpen) {
//       setIsOpen(false)
//       return
//     }

//     setIsOpen(true)

//     if (catalogSubjects.length === 0) {
//       void loadSubjects(1, false)
//     }
//   }

//   function isAlreadySelected(subjectName: string) {
//     return existingSubjects.some(
//       (existingSubject) =>
//         existingSubject.trim().toLocaleLowerCase() ===
//         subjectName.trim().toLocaleLowerCase(),
//     )
//   }

//   return (
//     <div>
//       <button
//         type="button"
//         onClick={handleToggle}
//         disabled={disabled}
//         aria-expanded={isOpen}
//         className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-violet-300/30 px-3 py-2.5 text-xs font-semibold text-violet-200 transition hover:border-violet-300/60 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-start sm:text-sm"
//       >
//         <Plus className="size-4" />
//         Consultar matérias do catálogo
//         {isOpen ? (
//           <ChevronUp className="size-4" />
//         ) : (
//           <ChevronDown className="size-4" />
//         )}
//       </button>

//       {isOpen && (
//         <div className="mt-3 rounded-xl border border-violet-300/15 bg-[#080D18] p-3 sm:p-4">
//           <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
//             <div>
//               <p className="text-xs font-semibold text-slate-200 sm:text-sm">
//                 Matérias disponíveis
//               </p>
//               <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
//                 Selecione uma matéria para adicioná-la à preparação.
//               </p>
//             </div>
//             <span className="text-[11px] text-slate-500">
//               {catalogSubjects.length} carregada(s)
//             </span>
//           </div>

//           {subjectsError && (
//             <div
//               role="alert"
//               className="mb-3 rounded-lg border border-red-400/15 bg-red-400/10 p-3 text-xs text-red-300"
//             >
//               <p>{subjectsError}</p>
//               <button
//                 type="button"
//                 onClick={() => void loadSubjects(1, false)}
//                 disabled={loadingSubjects}
//                 className="mt-2 font-semibold underline underline-offset-2 disabled:opacity-50"
//               >
//                 Tentar novamente
//               </button>
//             </div>
//           )}

//           {loadingSubjects && catalogSubjects.length === 0 && (
//             <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-400">
//               <LoaderCircle className="size-4 animate-spin" />
//               Carregando matérias...
//             </div>
//           )}

//           {!loadingSubjects && catalogSubjects.length === 0 && !subjectsError && (
//             <p className="rounded-lg border border-dashed border-white/10 px-3 py-5 text-center text-xs text-slate-500">
//               Nenhuma matéria encontrada no catálogo.
//             </p>
//           )}

//           {catalogSubjects.length > 0 && (
//             <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
//               {catalogSubjects.map((subjectName) => {
//                 const alreadySelected = isAlreadySelected(subjectName)

//                 return (
//                   <div
//                     key={subjectName}
//                     className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5"
//                   >
//                     <span className="min-w-0 break-words text-xs leading-5 text-slate-300 sm:text-sm">
//                       {subjectName}
//                     </span>
//                     <button
//                       type="button"
//                       onClick={() => onAddSubject(subjectName)}
//                       disabled={disabled || alreadySelected}
//                       className={`shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed ${
//                         alreadySelected
//                           ? 'border border-emerald-400/15 bg-emerald-400/10 text-emerald-300/70'
//                           : 'bg-violet-500/15 text-violet-200 hover:bg-violet-500/25 disabled:opacity-50'
//                       }`}
//                     >
//                       {alreadySelected ? 'Adicionada' : 'Adicionar'}
//                     </button>
//                   </div>
//                 )
//               })}
//             </div>
//           )}

//           {hasMore && (
//             <button
//               type="button"
//               onClick={() => void loadSubjects(page + 1, true)}
//               disabled={loadingSubjects}
//               className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               {loadingSubjects ? (
//                 <>
//                   <LoaderCircle className="size-3.5 animate-spin" />
//                   Carregando...
//                 </>
//               ) : (
//                 'Carregar mais matérias'
//               )}
//             </button>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Layers3,
  LoaderCircle,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { studyService } from '../study/services/study.service'
import { getLabSubjects, getLabTopics } from '../pages/QuestAPI-lab.service'
import { PdfUploadField } from './components/PdfUploadField'

import type { StudyPreparationRequest } from '../../types/Communication.types'
import type { PdfAnalysis, StudySubject } from '../study/types/study.types'

type PreparationMode = 'pdf' | 'manual' | null

const DEFAULT_QUESTION_COUNT = 10

/**
 * Converte a resposta de AnalyseTextFromPDF para o modelo utilizado pela interface.
 * Os tópicos extraídos do edital são preservados para a etapa de preparação.
 */
function mapPdfAnalysisToSubjects(analysis: PdfAnalysis): StudySubject[] {
  const sourceSubjects = Array.isArray(analysis.subjects)
    ? analysis.subjects
    : []

  // Começa pelas quantidades explícitas que a IA conseguiu identificar.
  const questionCounts = sourceSubjects.map((subject) => subject.questionCount)

  // Distribui os totais dos grupos entre matérias que vieram sem quantidade.
  for (const group of analysis.groups ?? []) {
    if (group.questionCount === null || group.questionCount <= 0) continue

    const groupIndexes = sourceSubjects
      .map((subject, index) => ({ subject, index }))
      .filter(({ subject }) => subject.group === group.name)
      .map(({ index }) => index)

    const alreadyAssigned = groupIndexes.reduce((total, index) => {
      const amount = questionCounts[index]
      return total + (typeof amount === 'number' && amount > 0 ? amount : 0)
    }, 0)

    const pendingIndexes = groupIndexes.filter(
      (index) => questionCounts[index] === null || questionCounts[index] === undefined,
    )

    if (pendingIndexes.length === 0) continue

    const remaining = Math.max(0, group.questionCount - alreadyAssigned)
    const distribution = distributeQuestions(remaining, pendingIndexes.length)

    pendingIndexes.forEach((subjectIndex, index) => {
      const amount = distribution[index]
      if (amount !== undefined && amount > 0) {
        questionCounts[subjectIndex] = amount
      }
    })
  }

  return sourceSubjects
    .filter((subject) => typeof subject.name === 'string' && subject.name.trim().length > 0)
    .map((subject) => {
      const sourceIndex = sourceSubjects.indexOf(subject)
      const suggestedAmount = questionCounts[sourceIndex]

      return {
        id: crypto.randomUUID(),
        nome: subject.name.trim(),
        topicos: Array.isArray(subject.topics)
          ? Array.from(
              new Set(
                subject.topics
                  .filter((topic): topic is string => typeof topic === 'string')
                  .map((topic) => topic.trim())
                  .filter((topic) => topic.length > 0),
              ),
            )
          : [],
        quantidadeQuestoes:
          typeof suggestedAmount === 'number' && suggestedAmount > 0
            ? suggestedAmount
            : DEFAULT_QUESTION_COUNT,
      }
    })
}

function distributeQuestions(total: number, count: number): number[] {
  if (count <= 0) return []

  const base = Math.floor(total / count)
  const remainder = total % count

  return Array.from(
    { length: count },
    (_, index) => base + (index < remainder ? 1 : 0),
  )
}

export default function AnalysisPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<PreparationMode>(null)
  const [file, setFile] = useState<File | null>(null)
  const [subjects, setSubjects] = useState<StudySubject[]>([])
  const [analysisCompleted, setAnalysisCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const totalTopics = useMemo(
    () => subjects.reduce((total, subject) => total + subject.topicos.length, 0),
    [subjects],
  )

  const totalQuestions = useMemo(
    () =>
      subjects.reduce(
        (total, subject) => total + subject.quantidadeQuestoes,
        0,
      ),
    [subjects],
  )

  function resetAnalysis() {
    setSubjects([])
    setAnalysisCompleted(false)
    setError('')
  }

  function handleModeChange(nextMode: PreparationMode) {
    setMode(nextMode)
    setFile(null)
    resetAnalysis()
  }

  function handleFileChange(nextFile: File | null) {
    setFile(nextFile)
    resetAnalysis()
  }

  async function handleAnalyzePdf() {
    if (!file) {
      setError('Selecione um arquivo PDF antes de solicitar a análise.')
      return
    }

    setLoading(true)
    setError('')
    resetAnalysis()

    try {
      const response = await studyService.analyzePdfForPreparation(file)
      const mappedSubjects = mapPdfAnalysisToSubjects(response.analysis)

      if (mappedSubjects.length === 0) {
        setError('A IA não identificou disciplinas no edital.')
        return
      }

      setSubjects(mappedSubjects)
      setAnalysisCompleted(true)
    } catch (cause) {
      console.error('Erro ao analisar o edital:', cause)
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível analisar o edital.',
      )
    } finally {
      setLoading(false)
    }
  }

  function updateSubject(
    subjectId: string,
    updates: Partial<Pick<StudySubject, 'nome' | 'quantidadeQuestoes'>>,
  ) {
    setSubjects((current) =>
      current.map((subject) =>
        subject.id === subjectId ? { ...subject, ...updates } : subject,
      ),
    )
  }

  function updateTopic(subjectId: string, topicIndex: number, value: string) {
    setSubjects((current) =>
      current.map((subject) => {
        if (subject.id !== subjectId) return subject

        return {
          ...subject,
          topicos: subject.topicos.map((topic, index) =>
            index === topicIndex ? value : topic,
          ),
        }
      }),
    )
  }

  function removeTopic(subjectId: string, topicIndex: number) {
    setSubjects((current) =>
      current.map((subject) => {
        if (subject.id !== subjectId) return subject

        return {
          ...subject,
          topicos: subject.topicos.filter((_, index) => index !== topicIndex),
        }
      }),
    )
  }

  function addTopic(subjectId: string, topic: string) {
    const normalizedTopic = topic.trim()
    if (!normalizedTopic) return

    setSubjects((current) =>
      current.map((subject) => {
        if (subject.id !== subjectId) return subject

        const alreadyExists = subject.topicos.some(
          (currentTopic) =>
            currentTopic.trim().toLocaleLowerCase() ===
            normalizedTopic.toLocaleLowerCase(),
        )

        if (alreadyExists) return subject

        return {
          ...subject,
          topicos: [...subject.topicos, normalizedTopic],
        }
      }),
    )
  }

  function removeSubject(subjectId: string) {
    setSubjects((current) =>
      current.filter((subject) => subject.id !== subjectId),
    )
  }

  // Adiciona uma matéria existente no catálogo da Quest API.
  function addCatalogSubject(subjectName: string) {
    const normalizedName = subjectName.trim()
    if (!normalizedName) return

    setSubjects((current) => {
      const alreadyExists = current.some(
        (subject) =>
          subject.nome.trim().toLocaleLowerCase() ===
          normalizedName.toLocaleLowerCase(),
      )

      if (alreadyExists) return current

      return [
        ...current,
        {
          id: crypto.randomUUID(),
          nome: normalizedName,
          topicos: [],
          quantidadeQuestoes: DEFAULT_QUESTION_COUNT,
        },
      ]
    })

    setAnalysisCompleted(true)
    setError('')
  }

  function validatePreparation(): string | null {
    if (!analysisCompleted) {
      return 'Escolha um edital ou adicione matérias pelo catálogo antes de continuar.'
    }

    if (subjects.length === 0) {
      return 'Adicione pelo menos uma matéria à preparação.'
    }

    for (const subject of subjects) {
      if (!subject.nome.trim()) {
        return 'Todas as matérias precisam ter um nome.'
      }

      if (
        !Number.isInteger(subject.quantidadeQuestoes) ||
        subject.quantidadeQuestoes < 1 ||
        subject.quantidadeQuestoes > 200
      ) {
        return `Informe uma quantidade entre 1 e 200 questões para ${subject.nome}.`
      }
    }

    return null
  }

  async function handleGenerateQuestions() {
    const validationError = validatePreparation()

    if (validationError) {
      setError(validationError)
      return
    }

    const preparation: StudyPreparationRequest = {
      subjects: subjects.map((subject) => ({
        materia: subject.nome.trim(),
        topics: Array.from(
          new Set(
            subject.topicos
              .map((topic) => topic.trim())
              .filter((topic) => topic.length > 0),
          ),
        ),
        amountQuestions: subject.quantidadeQuestoes,
      })),
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await studyService.generatePreparedQuestions(preparation)

      navigate('/simulado', {
        state: {
          result: response.result,
        },
      })
    } catch (cause) {
      console.error('Erro ao gerar questões:', cause)
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível gerar as questões. Tente novamente.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#080D18] px-3 py-5 text-white sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-6xl min-w-0">
        <div className="mb-6 sm:mb-8">
          <Link
            to="/"
            className="inline-flex min-h-9 items-center gap-2 rounded-lg text-sm text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <ArrowLeft className="size-4" />
            Voltar ao início
          </Link>
        </div>

        <header className="mb-6 flex min-w-0 flex-col gap-4 border-b border-white/10 pb-6 sm:mb-8 sm:gap-5 sm:pb-8 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Monte sua preparação
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400 sm:mt-3 sm:text-base">
              Organize as matérias e os assuntos que deseja estudar. Comece com
              um edital ou monte sua seleção manualmente.
            </p>
          </div>

          <div className="flex w-full min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-[#111827] px-3 py-3 sm:w-auto sm:px-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300">
              <Layers3 className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Área de preparação</p>
              <p className="truncate text-sm font-semibold text-slate-200">
                Nova preparação
              </p>
            </div>
          </div>
        </header>

        <nav
          aria-label="Etapas da preparação"
          className="mb-5 rounded-2xl border border-white/10 bg-[#111827] p-3 sm:mb-8 sm:p-5"
        >
          <div className="grid grid-cols-3 gap-1 sm:gap-4">
            <Step
              number="1"
              title="Origem"
              description="Como começar"
              active={!analysisCompleted}
            />
            <Step
              number="2"
              title="Matérias"
              description="Matérias e assuntos"
              active={analysisCompleted}
            />
            <Step number="3" title="Revisão" description="Preparar simulado" />
          </div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/5 sm:mt-5">
            <div
              className={`h-full rounded-full bg-blue-500 transition-all ${
                analysisCompleted ? 'w-2/3' : 'w-1/3'
              }`}
            />
          </div>
        </nav>

        <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
          <section className="min-w-0 space-y-5 sm:space-y-6">
            <section className="min-w-0 rounded-2xl border border-white/10 bg-[#111827] p-4 sm:p-6 lg:p-7">
              <div className="mb-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300 sm:text-xs">
                  Etapa 01
                </p>
                <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-2xl">
                  Como deseja começar?
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Escolha uma forma de informar as matérias do seu concurso.
                  Você poderá revisar a seleção antes de continuar.
                </p>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                <button
                  type="button"
                  aria-pressed={mode === 'pdf'}
                  onClick={() => handleModeChange('pdf')}
                  disabled={loading || submitting}
                  className={`group flex min-w-0 flex-col rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-60 sm:p-5 ${
                    mode === 'pdf'
                      ? 'border-blue-400/60 bg-blue-500/10'
                      : 'border-blue-400/20 bg-blue-500/[0.04] hover:border-blue-400/50 hover:bg-blue-500/[0.08]'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300 sm:size-11">
                      <FileText className="size-5" />
                    </span>
                    {mode === 'pdf' && <Check className="size-4 shrink-0 text-blue-300" />}
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-white sm:text-base">
                    Enviar edital em PDF
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400 sm:text-sm">
                    A IA identifica as matérias e os assuntos presentes no documento.
                  </p>
                  <span className="mt-4 text-xs font-semibold text-blue-300 sm:text-sm">
                    Usar edital
                  </span>
                </button>

                <button
                  type="button"
                  aria-pressed={mode === 'manual'}
                  onClick={() => handleModeChange('manual')}
                  disabled={loading || submitting}
                  className={`group flex min-w-0 flex-col rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:cursor-not-allowed disabled:opacity-60 sm:p-5 ${
                    mode === 'manual'
                      ? 'border-violet-400/60 bg-violet-500/10'
                      : 'border-violet-400/20 bg-violet-500/[0.04] hover:border-violet-400/50 hover:bg-violet-500/[0.08]'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300 sm:size-11">
                      <BookOpen className="size-5" />
                    </span>
                    {mode === 'manual' && <Check className="size-4 shrink-0 text-violet-300" />}
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-white sm:text-base">
                    Escolher matérias
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400 sm:text-sm">
                    Selecione as matérias e os assuntos disponíveis no catálogo.
                  </p>
                  <span className="mt-4 text-xs font-semibold text-violet-300 sm:text-sm">
                    Selecionar manualmente
                  </span>
                </button>
              </div>
            </section>

            {mode === 'pdf' && (
              <div className="space-y-4">
                <PdfUploadField file={file} onFileChange={handleFileChange} />

                <button
                  type="button"
                  onClick={handleAnalyzePdf}
                  disabled={!file || loading || submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3.5 sm:text-base"
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Analisando edital...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Analisar edital com IA
                    </>
                  )}
                </button>
              </div>
            )}

            {mode === 'manual' && (
              <section className="min-w-0 rounded-2xl border border-violet-300/20 bg-[#0B1220] p-4 sm:p-5">
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                    <BookOpen className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-200 sm:text-base">
                      Seleção manual de matérias
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
                      Consulte o catálogo da Quest API e adicione as matérias que deseja estudar. Depois, escolha os assuntos de cada uma.
                    </p>
                  </div>
                </div>

                <SubjectCatalogPicker
                  existingSubjects={subjects.map((subject) => subject.nome)}
                  disabled={loading || submitting}
                  onAddSubject={addCatalogSubject}
                />
              </section>
            )}

            {mode === null && (
              <section className="flex min-h-36 min-w-0 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#0B1220] px-4 py-8 text-center sm:min-h-44 sm:px-6">
                <div className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-500">
                  <BookOpen className="size-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-200">
                  Escolha como deseja iniciar
                </h3>
                <p className="mt-1 max-w-md text-xs leading-5 text-slate-500 sm:text-sm">
                  Selecione uma das opções acima para exibir os campos correspondentes.
                </p>
              </section>
            )}

            {analysisCompleted && (
              <section className="space-y-4 rounded-2xl border border-emerald-400/20 bg-[#111827] p-4 sm:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                    {mode === 'pdf' ? 'Análise concluída' : 'Matérias selecionadas'}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-white sm:text-xl">
                    Revise as matérias e os assuntos
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-slate-400">
                    Edite o nome e a quantidade de questões de cada matéria. Você também pode corrigir, remover ou complementar os assuntos pelo catálogo.
                  </p>
                </div>

                {subjects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-[#0B1220] px-4 py-8 text-center">
                    <p className="text-sm font-medium text-slate-300">
                      Nenhuma matéria selecionada
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Remova ou ajuste a seleção para continuar a preparação.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subjects.map((subject, index) => (
                      <article
                        key={subject.id}
                        className="min-w-0 rounded-xl border border-white/10 bg-[#0B1220] p-3 sm:p-4"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Matéria {index + 1}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeSubject(subject.id)}
                            disabled={loading || submitting}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Remover matéria ${subject.nome}`}
                          >
                            <Trash2 className="size-3.5" />
                            Remover matéria
                          </button>
                        </div>

                        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
                          <label className="block min-w-0">
                            <span className="mb-1.5 block text-xs font-medium text-slate-400">
                              Nome da matéria
                            </span>
                            <input
                              type="text"
                              value={subject.nome}
                              onChange={(event) =>
                                updateSubject(subject.id, {
                                  nome: event.target.value,
                                })
                              }
                              disabled={loading || submitting}
                              placeholder="Nome da matéria"
                              className="w-full min-w-0 rounded-lg border border-white/10 bg-[#111827] px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/10 disabled:opacity-60"
                            />
                          </label>

                          <label className="block min-w-0">
                            <span className="mb-1.5 block text-xs font-medium text-slate-400">
                              Questões
                            </span>
                            <input
                              type="number"
                              min={1}
                              max={200}
                              step={1}
                              value={subject.quantidadeQuestoes}
                              onChange={(event) =>
                                updateSubject(subject.id, {
                                  quantidadeQuestoes:
                                    event.target.value === ''
                                      ? 0
                                      : Number(event.target.value),
                                })
                              }
                              disabled={loading || submitting}
                              className="w-full min-w-0 rounded-lg border border-white/10 bg-[#111827] px-3 py-2.5 text-sm tabular-nums text-slate-100 outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/10 disabled:opacity-60"
                            />
                          </label>
                        </div>

                        <div className="mt-4 border-t border-white/5 pt-3">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-medium text-slate-300">
                              Assuntos identificados
                            </p>
                            <span className="text-[11px] tabular-nums text-slate-500">
                              {subject.topicos.length} assunto(s)
                            </span>
                          </div>

                          {subject.topicos.length > 0 ? (
                            <div className="space-y-2">
                              {subject.topicos.map((topic, topicIndex) => (
                                <div
                                  key={`${subject.id}-topic-${topicIndex}`}
                                  className="flex min-w-0 items-center gap-2"
                                >
                                  <input
                                    type="text"
                                    value={topic}
                                    onChange={(event) =>
                                      updateTopic(
                                        subject.id,
                                        topicIndex,
                                        event.target.value,
                                      )
                                    }
                                    disabled={loading || submitting}
                                    aria-label={`Assunto ${topicIndex + 1} de ${subject.nome}`}
                                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-xs leading-5 text-slate-300 outline-none transition placeholder:text-slate-600 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/10 disabled:opacity-60 sm:text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeTopic(subject.id, topicIndex)
                                    }
                                    disabled={loading || submitting}
                                    className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/5 text-slate-500 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label={`Remover assunto ${topic || topicIndex + 1}`}
                                    title="Remover assunto"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-xs leading-5 text-slate-500">
                              Nenhum assunto selecionado para esta matéria. Na próxima etapa, você poderá adicionar assuntos pelo catálogo da Quest API.
                            </p>
                          )}

                          <TopicCatalogPicker
                            key={`${subject.id}-${subject.nome}`}
                            subjectName={subject.nome}
                            selectedTopics={subject.topicos}
                            disabled={loading || submitting}
                            onAddTopic={(topic) => addTopic(subject.id, topic)}
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
              >
                {error}
              </div>
            )}
          </section>

          <aside className="h-fit min-w-0 rounded-2xl border border-white/10 bg-[#111827] p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">
                <Check className="size-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-white">
                  Resumo da preparação
                </h2>
                <p className="text-xs text-slate-500">Visão geral da seleção</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-1">
              <SummaryItem
                label="Matérias"
                value={analysisCompleted ? String(subjects.length) : '—'}
              />
              <SummaryItem
                label="Assuntos"
                value={analysisCompleted ? String(totalTopics) : '—'}
              />
              <SummaryItem
                label="Questões"
                value={analysisCompleted ? String(totalQuestions) : '—'}
              />
            </div>

            <div className="mt-4 rounded-xl border border-blue-400/10 bg-blue-500/[0.06] p-3 sm:p-4">
              <div className="flex items-center gap-2 text-blue-300">
                <Sparkles className="size-4" />
                <span className="text-xs font-semibold">Dica</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Revise os nomes, as quantidades e os assuntos antes de preparar seu simulado.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateQuestions}
              disabled={!analysisCompleted || subjects.length === 0 || loading || submitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-600/30 disabled:text-white/50 sm:text-sm"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Gerando questões...
                </>
              ) : (
                <>
                  Gerar simulado
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
            <p className="mt-2 text-center text-[11px] leading-4 text-slate-600">
              {analysisCompleted
                ? 'Confira sua seleção antes de gerar o simulado.'
                : 'Sua preparação ainda não foi iniciada.'}
            </p>
          </aside>
        </div>
      </div>
    </main>
  )
}

interface StepProps {
  number: string
  title: string
  description: string
  active?: boolean
}

function Step({ number, title, description, active = false }: StepProps) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 text-center sm:flex-row sm:gap-3 sm:text-left">
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:size-8 sm:text-sm ${
          active
            ? 'bg-blue-500 text-white'
            : 'border border-white/15 bg-white/5 text-slate-400'
        }`}
      >
        {number}
      </span>
      <div className="min-w-0">
        <p className={`text-[11px] font-semibold leading-4 sm:text-sm ${active ? 'text-white' : 'text-slate-400'}`}>
          {title}
        </p>
        <p className="hidden text-xs text-slate-600 sm:block">{description}</p>
      </div>
    </div>
  )
}

interface SummaryItemProps {
  label: string
  value: string
}

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#0B1220] px-3 py-3 sm:px-4">
      <span className="text-xs text-slate-400 sm:text-sm">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-slate-200">
        {value}
      </span>
    </div>
  )
}


interface TopicCatalogPickerProps {
  subjectName: string
  selectedTopics: string[]
  disabled?: boolean
  onAddTopic: (topic: string) => void
}

/**
 * Consulta os assuntos da matéria no catálogo do Lab/Quest API.
 * Cada instância mantém sua própria paginação, evitando misturar
 * os resultados de matérias diferentes.
 */
function TopicCatalogPicker({
  subjectName,
  selectedTopics,
  disabled = false,
  onAddTopic,
}: TopicCatalogPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [topics, setTopics] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingTopics, setLoadingTopics] = useState(false)
  const [topicsError, setTopicsError] = useState('')

  async function loadTopics(nextPage: number, append: boolean) {
    const materia = subjectName.trim()

    if (!materia) {
      setTopicsError('Informe o nome da matéria antes de consultar o catálogo.')
      setIsOpen(true)
      return
    }

    setLoadingTopics(true)
    setTopicsError('')

    try {
      const response = await getLabTopics({
        materia,
        page: nextPage,
        per_page: 20,
      })

      setTopics((current) =>
        append
          ? Array.from(new Set([...current, ...response.items]))
          : response.items,
      )
      setPage(response.page)
      setHasMore(response.hasMore)
    } catch (cause) {
      console.error('Erro ao consultar assuntos do catálogo:', cause)
      setTopicsError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível carregar os assuntos.',
      )
    } finally {
      setLoadingTopics(false)
    }
  }

  function handleToggle() {
    if (disabled) return

    if (isOpen) {
      setIsOpen(false)
      return
    }

    setIsOpen(true)
    setTopics([])
    setPage(1)
    setHasMore(false)
    void loadTopics(1, false)
  }

  function isAlreadySelected(topic: string) {
    return selectedTopics.some(
      (selectedTopic) =>
        selectedTopic.trim().toLocaleLowerCase() ===
        topic.trim().toLocaleLowerCase(),
    )
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isOpen}
        className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-400/30 px-3 py-2 text-xs font-medium text-blue-300 transition hover:border-blue-400/60 hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-start sm:text-sm"
      >
        <Plus className="size-3.5" />
        Adicionar assunto do catálogo
        {isOpen ? (
          <ChevronUp className="size-3.5" />
        ) : (
          <ChevronDown className="size-3.5" />
        )}
      </button>

      {isOpen && (
        <div className="mt-3 rounded-xl border border-blue-400/15 bg-[#080D18] p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 sm:text-sm">
                Catálogo de assuntos
              </p>
              <p className="mt-1 break-words text-[11px] leading-4 text-slate-500">
                Matéria consultada: {subjectName || 'Nome não informado'}
              </p>
            </div>
            <span className="shrink-0 text-[11px] text-slate-500">
              {topics.length} carregado(s)
            </span>
          </div>

          {topicsError && (
            <div
              role="alert"
              className="mb-3 rounded-lg border border-red-400/15 bg-red-400/10 p-3 text-xs text-red-300"
            >
              <p>{topicsError}</p>
              {subjectName.trim() && (
                <button
                  type="button"
                  onClick={() => void loadTopics(1, false)}
                  disabled={loadingTopics}
                  className="mt-2 font-semibold underline underline-offset-2 disabled:opacity-50"
                >
                  Tentar novamente
                </button>
              )}
            </div>
          )}

          {loadingTopics && topics.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-400">
              <LoaderCircle className="size-4 animate-spin" />
              Carregando assuntos...
            </div>
          )}

          {!loadingTopics && topics.length === 0 && !topicsError && (
            <p className="rounded-lg border border-dashed border-white/10 px-3 py-5 text-center text-xs text-slate-500">
              Nenhum assunto encontrado para esta matéria.
            </p>
          )}

          {topics.length > 0 && (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {topics.map((topic) => {
                const alreadySelected = isAlreadySelected(topic)

                return (
                  <div
                    key={topic}
                    className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5"
                  >
                    <span className="min-w-0 break-words text-xs leading-5 text-slate-300 sm:text-sm">
                      {topic}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAddTopic(topic)}
                      disabled={disabled || alreadySelected}
                      className={`shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed ${
                        alreadySelected
                          ? 'border border-emerald-400/15 bg-emerald-400/10 text-emerald-300/70'
                          : 'bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 disabled:opacity-50'
                      }`}
                    >
                      {alreadySelected ? 'Adicionado' : 'Adicionar'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {hasMore && (
            <button
              type="button"
              onClick={() => void loadTopics(page + 1, true)}
              disabled={loadingTopics}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingTopics ? (
                <>
                  <LoaderCircle className="size-3.5 animate-spin" />
                  Carregando...
                </>
              ) : (
                'Carregar mais assuntos'
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

interface SubjectCatalogPickerProps {
  existingSubjects: string[]
  disabled?: boolean
  onAddSubject: (subject: string) => void
}

/**
 * Consulta as matérias disponíveis no catálogo da Quest API.
 * A lista é paginada e permite adicionar várias matérias à preparação.
 */
function SubjectCatalogPicker({
  existingSubjects,
  disabled = false,
  onAddSubject,
}: SubjectCatalogPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [catalogSubjects, setCatalogSubjects] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [subjectsError, setSubjectsError] = useState('')

  async function loadSubjects(nextPage: number, append: boolean) {
    if (loadingSubjects) return

    setLoadingSubjects(true)
    setSubjectsError('')

    try {
      const response = await getLabSubjects({
        page: nextPage,
        per_page: 20,
      })

      setCatalogSubjects((current) =>
        append
          ? Array.from(new Set([...current, ...response.items]))
          : response.items,
      )
      setPage(response.page)
      setHasMore(response.hasMore)
    } catch (cause) {
      console.error('Erro ao consultar matérias do catálogo:', cause)
      setSubjectsError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível carregar as matérias.',
      )
    } finally {
      setLoadingSubjects(false)
    }
  }

  function handleToggle() {
    if (disabled) return

    if (isOpen) {
      setIsOpen(false)
      return
    }

    setIsOpen(true)

    if (catalogSubjects.length === 0) {
      void loadSubjects(1, false)
    }
  }

  function isAlreadySelected(subjectName: string) {
    return existingSubjects.some(
      (existingSubject) =>
        existingSubject.trim().toLocaleLowerCase() ===
        subjectName.trim().toLocaleLowerCase(),
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isOpen}
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-violet-300/30 px-3 py-2.5 text-xs font-semibold text-violet-200 transition hover:border-violet-300/60 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-start sm:text-sm"
      >
        <Plus className="size-4" />
        Consultar matérias do catálogo
        {isOpen ? (
          <ChevronUp className="size-4" />
        ) : (
          <ChevronDown className="size-4" />
        )}
      </button>

      {isOpen && (
        <div className="mt-3 rounded-xl border border-violet-300/15 bg-[#080D18] p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-200 sm:text-sm">
                Matérias disponíveis
              </p>
              <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                Selecione uma matéria para adicioná-la à preparação.
              </p>
            </div>
            <span className="text-[11px] text-slate-500">
              {catalogSubjects.length} carregada(s)
            </span>
          </div>

          {subjectsError && (
            <div
              role="alert"
              className="mb-3 rounded-lg border border-red-400/15 bg-red-400/10 p-3 text-xs text-red-300"
            >
              <p>{subjectsError}</p>
              <button
                type="button"
                onClick={() => void loadSubjects(1, false)}
                disabled={loadingSubjects}
                className="mt-2 font-semibold underline underline-offset-2 disabled:opacity-50"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {loadingSubjects && catalogSubjects.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-400">
              <LoaderCircle className="size-4 animate-spin" />
              Carregando matérias...
            </div>
          )}

          {!loadingSubjects && catalogSubjects.length === 0 && !subjectsError && (
            <p className="rounded-lg border border-dashed border-white/10 px-3 py-5 text-center text-xs text-slate-500">
              Nenhuma matéria encontrada no catálogo.
            </p>
          )}

          {catalogSubjects.length > 0 && (
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {catalogSubjects.map((subjectName) => {
                const alreadySelected = isAlreadySelected(subjectName)

                return (
                  <div
                    key={subjectName}
                    className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5"
                  >
                    <span className="min-w-0 break-words text-xs leading-5 text-slate-300 sm:text-sm">
                      {subjectName}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAddSubject(subjectName)}
                      disabled={disabled || alreadySelected}
                      className={`shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed ${
                        alreadySelected
                          ? 'border border-emerald-400/15 bg-emerald-400/10 text-emerald-300/70'
                          : 'bg-violet-500/15 text-violet-200 hover:bg-violet-500/25 disabled:opacity-50'
                      }`}
                    >
                      {alreadySelected ? 'Adicionada' : 'Adicionar'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {hasMore && (
            <button
              type="button"
              onClick={() => void loadSubjects(page + 1, true)}
              disabled={loadingSubjects}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingSubjects ? (
                <>
                  <LoaderCircle className="size-3.5 animate-spin" />
                  Carregando...
                </>
              ) : (
                'Carregar mais matérias'
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

