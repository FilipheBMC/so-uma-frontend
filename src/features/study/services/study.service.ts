// import { api } from '@/services/api'

// import type {
//   PdfAnalysis,
//   PdfAnalysisResponse,
//   GenerateQuestionsResponse,
// } from '../types/study.types'

// export const studyService = {
//   async analyzePdf(file: File): Promise<PdfAnalysisResponse> {
//     const formData = new FormData()
//     formData.append('pdf', file)

//     const response = await api.post<PdfAnalysisResponse>(
//       '/editais/pdf',
//       formData,
//     )

//     console.log("Foi aqui")

//     return response.data
//   },

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

export const studyService = {
  async analyzePdf(file: File): Promise<PdfAnalysisResponse> {
    const formData = new FormData()
    formData.append('pdf', file)

    console.log('Enviando edital:', file.name)

    const response = await api.post<PdfAnalysisResponse>(
      '/editais/pdf',
      formData,
    )

    console.log('Resposta recebida:', response.data)

    return response.data
  },

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