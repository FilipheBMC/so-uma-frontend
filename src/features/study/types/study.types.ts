export type StudyMode = 'pdf' | 'manual'

export interface StudySubject {
  id: string
  nome: string
  topicos: string[]
  quantidadeQuestoes: number
}

export interface ManualStudySubject {
  id: string
  name: string
  questionCount: number
}

// Formato recebido da análise do edital
export interface PdfAnalysis {
  totalQuestions: number | null

  groups: {
    name: string
    questionCount: number | null
  }[]

  subjects: {
    name: string
    group: string | null
    questionCount: number | null
  }[]
}

export interface PdfAnalysisResponse {
  message: string
  analysis: PdfAnalysis
}

export interface GenerateQuestionsResponse {
  message: string
  result: unknown
}