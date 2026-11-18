import { api } from '@/services/api'

import type {
  PdfAnalysis,
  PdfAnalysisResponse,
  GenerateQuestionsResponse,
} from '../types/study.types'

import type { StudyPreparationRequest } from '../../../types/Communication.types'

import type {
  QuestionTutorRequestPayload,
  QuestionTutorResponse,
} from '../../simulations/types/simulation.types'

// export const studyService = {
//   /**
//    * Analisa um edital PDF e retorna o formato atual produzido por
//    * AnalyseTextFromPDF: totalQuestions, groups e subjects.
//    */
//   async analyzePdfForPreparation(
//     file: File,
//   ): Promise<PdfAnalysisResponse> {
//     const formData = new FormData()
//     formData.append('pdf', file)

//     const response = await api.post<PdfAnalysisResponse>(
//       '/editais/pdf',
//       formData,
//     )

//     return response.data
//   },

//   /**
//    * Método legado. Mantido temporariamente para não quebrar a página antiga.
//    * A nova Analysis.page.tsx deve utilizar analyzePdfForPreparation().
//    */
//   async analyzePdf(file: File): Promise<PdfAnalysisResponse> {
//     const formData = new FormData()
//     formData.append('pdf', file)

//     const response = await api.post<PdfAnalysisResponse>(
//       '/editais/pdf',
//       formData,
//     )

//     return response.data
//   },

//   /**
//    * Gera questões a partir da preparação revisada pelo usuário.
//    * O backend recebe StudyPreparationRequest diretamente no corpo do POST.
//    */
//   async generatePreparedQuestions(
//     preparation: StudyPreparationRequest,
//   ): Promise<GenerateQuestionsResponse> {
//     const response = await api.post<GenerateQuestionsResponse>(
//       '/editais/pdf/questions',
//       preparation,
//     )

//     return response.data
//   },

//   /** Método legado da preparação anterior. */
//   async generateQuestions(
//     analysis: PdfAnalysis,
//   ): Promise<GenerateQuestionsResponse> {
//     const response = await api.post<GenerateQuestionsResponse>(
//       '/editais/pdf/questions',
//       { analysis },
//     )

//     return response.data
//   },


//   /**
//    * Envia uma dúvida ao tutor de IA com o contexto da questão atual.
//    * O identificador do modelo é público e configurado no frontend;
//    * a chave da OpenRouter permanece exclusivamente no backend.
//    */
//   async askQuestionTutor(
//     payload: QuestionTutorRequestPayload,
//   ): Promise<QuestionTutorResponse> {
//     const model =
//       import.meta.env.VITE_TUTOR_MODEL?.trim() ||
//       'nvidia/nemotron-3-ultra-550b-a55b:free'

//     const response = await api.post<QuestionTutorResponse>(
//       '/ai/tutor/chat',
//       { ...payload, model },
//     )

//     return response.data
//   },
// }

export const studyService = {
  /**
   * Analisa um edital PDF e retorna o formato atual produzido por
   * AnalyseTextFromPDF: totalQuestions, groups e subjects.
   */
  async analyzePdfForPreparation(
    file: File,
  ): Promise<PdfAnalysisResponse> {
    const formData = new FormData()
    formData.append('pdf', file)

    const response = await api.post<PdfAnalysisResponse>(
      '/editais/pdf',
      formData,
    )

    return response.data
  },

  /**
   * Método legado. Mantido temporariamente para não quebrar a página antiga.
   * A nova Analysis.page.tsx deve utilizar analyzePdfForPreparation().
   */
  async analyzePdf(file: File): Promise<PdfAnalysisResponse> {
    const formData = new FormData()
    formData.append('pdf', file)

    const response = await api.post<PdfAnalysisResponse>(
      '/editais/pdf',
      formData,
    )

    return response.data
  },

  /**
   * Gera questões a partir da preparação revisada pelo usuário.
   * O backend recebe StudyPreparationRequest diretamente no corpo do POST.
   */
  async generatePreparedQuestions(
    preparation: StudyPreparationRequest,
  ): Promise<GenerateQuestionsResponse> {
    const response = await api.post<GenerateQuestionsResponse>(
      '/editais/pdf/questions',
      preparation,
    )

    return response.data
  },

  /** Método legado da preparação anterior. */
  async generateQuestions(
    analysis: PdfAnalysis,
  ): Promise<GenerateQuestionsResponse> {
    const response = await api.post<GenerateQuestionsResponse>(
      '/editais/pdf/questions',
      { analysis },
    )

    return response.data
  },




  /** Cria uma nova tentativa para o simulado persistido. */
  async startSimulationAttempt(simulationId: string): Promise<{
    attempt: {
      id: string
      simulationId: string
      status: string
      startedAt: string
    }
  }> {
    const response = await api.post<{
      attempt: {
        id: string
        simulationId: string
        status: string
        startedAt: string
      }
    }>(`/simulations/${encodeURIComponent(simulationId)}/attempts`)

    return response.data
  },

  /** Salva ou substitui a alternativa escolhida em uma questão. */
  async saveSimulationAnswer(
    attemptId: string,
    payload: {
      questionExternalId: string
      selectedAlternativeLetter: string
      timeSpentSeconds?: number
    },
  ): Promise<void> {
    await api.put<{ saved: boolean }>(
      `/simulations/attempts/${encodeURIComponent(attemptId)}/answers`,
      payload,
    )
  },

  /** Finaliza a tentativa no backend. */
  async finishSimulationAttempt(attemptId: string): Promise<{
    attempt: {
      id: string
      status: string
      submittedAt: string | null
    }
  }> {
    const response = await api.patch<{
      attempt: {
        id: string
        status: string
        submittedAt: string | null
      }
    }>(`/simulations/attempts/${encodeURIComponent(attemptId)}/finish`)

    return response.data
  },

  /**
   * Envia uma dúvida ao tutor de IA com o contexto da questão atual.
   * O identificador do modelo é público e configurado no frontend;
   * a chave da OpenRouter permanece exclusivamente no backend.
   */
  async askQuestionTutor(
    payload: QuestionTutorRequestPayload,
  ): Promise<QuestionTutorResponse> {
    const model =
      import.meta.env.VITE_TUTOR_MODEL?.trim() ||
      'nvidia/nemotron-3-ultra-550b-a55b:free'

    const response = await api.post<QuestionTutorResponse>(
      '/ai/tutor/chat',
      { ...payload, model },
    )

    return response.data
  },
}
