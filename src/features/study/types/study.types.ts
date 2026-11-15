// // export type StudyMode = 'pdf' | 'manual'

// // export interface StudySubject {
// //   id: string
// //   nome: string
// //   topicos: string[]
// //   quantidadeQuestoes: number
// // }

// // export interface ManualStudySubject {
// //   id: string
// //   name: string
// //   questionCount: number
// // }

// // // Formato recebido da análise do edital
// // export interface PdfAnalysis {
// //   totalQuestions: number | null

// //   groups: {
// //     name: string
// //     questionCount: number | null
// //   }[]

// //   subjects: {
// //     name: string
// //     group: string | null
// //     questionCount: number | null
// //     topics?: string[]
// //   }[]
// // }

// // export interface PdfAnalysisResponse {
// //   message: string
// //   analysis: PdfAnalysis
// // }

// // export interface GenerateQuestionsResponse {
// //   message: string
// //   result: unknown
// // }
// export type StudyMode = 'pdf' | 'manual'

// // Modelo utilizado pela interface durante a revisão da preparação.
// export interface StudySubject {
//   id: string
//   nome: string
//   topicos: string[]
//   quantidadeQuestoes: number
// }

// export interface ManualStudySubject {
//   id: string
//   name: string
//   questionCount: number
// }

// // Estrutura retornada pela análise de edital feita pela IA.
// export type NivelEscolaridade = 'Fundamental' | 'Médio' | 'Superior'

// export interface CargoEdital {
//   nome: string
//   nivel: NivelEscolaridade | null
//   escolaridadeExigida: string | null
//   salario: number | null
//   quantidadeVagas: number | null
//   cargaHorariaSemanal: number | null
// }

// export interface DisciplinaEdital {
//   nome: string
//   topicos: string[]
//   quantidadeQuestoes?: number | null
// }

// export interface EditalAnalysis {
//   concurso: {
//     nome: string | null
//     orgao?: string | null
//     banca: string | null
//   }
//   cargos: CargoEdital[]
//   datas: {
//     inicioInscricao: string | null
//     fimInscricao: string | null
//     dataProva: string | null
//   }
//   prova: {
//     quantidadeTotalQuestoes: number | null
//     duracaoMinutos: number | null
//   }
//   disciplinas: DisciplinaEdital[]
// }

// export interface EditalAnalysisResponse {
//   message: string
//   analysis: EditalAnalysis
// }

// // Contrato legado da página antiga. Manter enquanto ela ainda existir no projeto.
// export interface PdfAnalysis {
//   totalQuestions: number | null
//   groups: {
//     name: string
//     questionCount: number | null
//   }[]
//   subjects: {
//     name: string
//     group: string | null
//     questionCount: number | null
//   }[]
// }

// export interface PdfAnalysisResponse {
//   message: string
//   analysis: PdfAnalysis
// }

// export interface GenerateQuestionsResponse {
//   message: string
//   result: unknown
// }

export type StudyMode = 'pdf' | 'manual'

// Modelo utilizado pela interface durante a revisão da preparação.
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

// Estrutura retornada pela análise de edital feita pela IA.
export type NivelEscolaridade = 'Fundamental' | 'Médio' | 'Superior'

export interface CargoEdital {
  nome: string
  nivel: NivelEscolaridade | null
  escolaridadeExigida: string | null
  salario: number | null
  quantidadeVagas: number | null
  cargaHorariaSemanal: number | null
}

export interface DisciplinaEdital {
  nome: string
  topicos: string[]
  quantidadeQuestoes?: number | null
}

export interface EditalAnalysis {
  concurso: {
    nome: string | null
    orgao?: string | null
    banca: string | null
  }
  cargos: CargoEdital[]
  datas: {
    inicioInscricao: string | null
    fimInscricao: string | null
    dataProva: string | null
  }
  prova: {
    quantidadeTotalQuestoes: number | null
    duracaoMinutos: number | null
  }
  disciplinas: DisciplinaEdital[]
}

export interface EditalAnalysisResponse {
  message: string
  analysis: EditalAnalysis
}

// Contrato legado da página antiga. Manter enquanto ela ainda existir no projeto.
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
    topics: string[]
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
