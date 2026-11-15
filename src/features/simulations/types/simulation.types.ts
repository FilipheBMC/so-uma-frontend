
export type CorrectionMode = 'immediate' | 'final'

export type SimulationStatus =
  | 'not_started'
  | 'in_progress'
  | 'paused'
  | 'finished'

// Estrutura original da Quest API

export interface QuestApiAlternative {
  letra: string
  texto: string
  imagens: string[]
}

export interface QuestApiExam {
  id: string
  orgao: string
  cargo: string
  ano: string
  banca: string
  alternative_type: string
  nivel_escolaridade: string
  uf: string
  esfera: string
}

export interface QuestApiQuestion {
  id: string
  numero: string
  enunciado: string
  alternativas: QuestApiAlternative[]
  gabarito: string | null
  provas: QuestApiExam[]
  classificacao: {
    materia: string
    assunto: string
  }
  textos_associados: string[]
  anexos: string[]
  sinalizadores: {
    tem_imagem: boolean
    tem_gabarito: boolean
    tem_texto_associado: boolean
    anulada: boolean
  }
  dificuldade: number
  tipo: string
  anulada: boolean
  areas: string[]
  carreiras: string[]
}

export interface QuestApiQuestionGroup {
  materia: string,
  assunto?: string,
  questions: {
    data: {
      total: number
      page: number
      per_page: number
      items: QuestApiQuestion[]
    }
  }
}

export interface QuestApiResult {
  source: string
  totalQuestions: number
  groups: {
    name: string
    questionCount: number | null
  }[]
  subjects: {
    name: string
    group: string | null
    amount: number
  }[]
  questions: QuestApiQuestionGroup[]
}

export type ResolvedStudyStatus =
  | 'MATCHED'
  | 'NO_MATCH'
  | 'NOT_ANALYZED'
  | 'ERROR_FALLBACK'

export interface SemanticMatch {
  originalName: string
  status: 'MATCHED' | 'NO_MATCH'
  catalogId: string | null
  catalogName: string | null
  confidence: number
  lexicalScore: number | null
  reason: string
}

export interface SemanticTopicMatch extends SemanticMatch {
  catalogSubjectId: string | null
  catalogSubjectName: string | null
}

export interface SemanticMatchingResult {
  originalSubject: string
  subjectMatch: SemanticMatch
  topics: SemanticTopicMatch[]
}

export interface ResolvedStudyTopic {
  originalName: string
  resolvedName: string
  status: ResolvedStudyStatus
  catalogId: string | null
  catalogSubjectId: string | null
  confidence: number | null
  reason: string | null
}

export interface ResolvedStudySubject {
  originalName: string
  resolvedName: string
  amount: number | null
  status: ResolvedStudyStatus
  catalogId: string | null
  confidence: number | null
  reason: string | null
  topics: ResolvedStudyTopic[]
}

export interface StudyPreparationSubject {
  materia: string
  topics: string[]
  amount: number
}

export interface StudyPreparationResult {
  totalQuestions: number

  groups: {
    name: string
    questionCount: number | null
  }[]

  subjects: StudyPreparationSubject[]

  resolvedSubjects: ResolvedStudySubject[]

  semanticMatches: SemanticMatchingResult[]

  questions: QuestApiQuestionGroup[]

  notifications: string[]
}

export interface GenerateQuestionsResponse {
  message: string
  // result: QuestApiResult
  result: StudyPreparationResult
}

// Formato interno do módulo de simulados

export interface SimulationAlternative {
  id: string
  letter: string
  contentHtml: string
  images: string[]
}

export interface SimulationQuestion {
  id: string
  number: string
  statementHtml: string
  alternatives: SimulationAlternative[]
  correctAlternativeLetter: string | null
  associatedTextsHtml: string[]
  attachments: string[]
  subject: string
  topic: string
  difficulty: number
  exam: QuestApiExam | null
  isCanceled: boolean
}

export interface SimulationAnswer {
  questionId: string
  selectedAlternativeLetter: string | null
}

export interface SimulationResult {
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  unansweredQuestions: number
  percentage: number
  durationInSeconds: number
}

export interface SimulationConfig {
  correctionMode: CorrectionMode
  durationInMinutes: number | null
}

export interface SimulationState {
  status: SimulationStatus
  currentQuestionIndex: number
  questions: SimulationQuestion[]
  answers: SimulationAnswer[]
  remainingTimeInSeconds: number | null
  result: SimulationResult | null
}
