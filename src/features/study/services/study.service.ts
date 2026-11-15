// import { api } from '@/services/api'

// import type {
//   EditalAnalysisResponse,
//   PdfAnalysis,
//   PdfAnalysisResponse,
//   GenerateQuestionsResponse,
// } from '../types/study.types'

// export const studyService = {
//   /**
//    * Analisa um edital PDF e retorna o formato completo produzido pela IA:
//    * concurso, cargos, datas, prova e disciplinas com tópicos.
//    */
//   async analyzePdfForPreparation(
//     file: File,
//   ): Promise<EditalAnalysisResponse> {
//     const formData = new FormData()
//     formData.append('pdf', file)

//     const response = await api.post<EditalAnalysisResponse>(
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
// }

// import { api } from '@/services/api'

// import type {
//   EditalAnalysisResponse,
//   PdfAnalysis,
//   PdfAnalysisResponse,
//   GenerateQuestionsResponse,
// } from '../types/study.types'

// import type { StudyPreparationRequest } from '../../../types/Communication.types'

// export const studyService = {
//   /**
//    * Analisa um edital PDF e retorna o formato completo produzido pela IA:
//    * concurso, cargos, datas, prova e disciplinas com tópicos.
//    */
//   async analyzePdfForPreparation(
//     file: File,
//   ): Promise<EditalAnalysisResponse> {
//     const formData = new FormData()
//     formData.append('pdf', file)

//     const response = await api.post<EditalAnalysisResponse>(
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
// }

import { api } from '@/services/api'

import type {
  PdfAnalysis,
  PdfAnalysisResponse,
  GenerateQuestionsResponse,
} from '../types/study.types'

import type { StudyPreparationRequest } from '../../../types/Communication.types'

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
}
