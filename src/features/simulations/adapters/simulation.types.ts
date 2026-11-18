// import type {
//   QuestApiQuestion,
//   StudyPreparationResult,
//   SimulationQuestion,
// } from '../types/simulation.types'

// function adaptQuestion(
//   question: QuestApiQuestion,
//   subject: string,
// ): SimulationQuestion {
//   return {
//     id: question.id,
//     number: question.numero,
//     statementHtml: question.enunciado,

//     alternatives: question.alternativas.map((alternative) => ({
//       id: `${question.id}-${alternative.letra}`,
//       letter: alternative.letra,
//       contentHtml: alternative.texto,
//       images: alternative.imagens,
//     })),

//     correctAlternativeLetter: question.gabarito,
//     associatedTextsHtml: question.textos_associados,
//     attachments: question.anexos,

//     subject: question.classificacao?.materia ?? subject,
//     topic: question.classificacao?.assunto ?? 'Não informado',

//     difficulty: question.dificuldade,

//     exam: question.provas[0] ?? null,

//     isCanceled:
//       question.anulada || question.sinalizadores.anulada,
//   }
// }

// export function adaptQuestions(
//   result: Pick<StudyPreparationResult, 'questions'>,
// ): SimulationQuestion[] {
//   return result.questions.flatMap((group) => {
//     const items = group.questions.data.items

//     return items.map((question) =>
//       adaptQuestion(question, group.materia),
//     )
//   })
// }

import type {
  QuestApiResult,
  SimulationQuestion,
} from '../types/simulation.types'

function adaptQuestion(
  question: QuestApiResult['questions'][number]['questions']['data']['items'][number],
  subject: string,
): SimulationQuestion {
  return {
    // Mantemos o ID externo da Quest API na interface. O backend o resolve
    // para o UUID interno de questions antes de gravar answers.
    id: question.id,
    number: question.numero,
    statementHtml: question.enunciado,

    alternatives: question.alternativas.map((alternative) => ({
      id: `${question.id}-${alternative.letra}`,
      letter: alternative.letra,
      contentHtml: alternative.texto,
      images: alternative.imagens,
    })),

    correctAlternativeLetter: question.gabarito,
    associatedTextsHtml: question.textos_associados,
    attachments: question.anexos,

    subject: question.classificacao?.materia ?? subject,
    topic: question.classificacao?.assunto ?? 'Não informado',

    difficulty: question.dificuldade,
    exam: question.provas[0] ?? null,
    isCanceled: question.anulada || question.sinalizadores.anulada,
  }
}

// A preparação devolvida pelo backend contém vários metadados além de
// questions. O adaptador depende apenas desse campo, sem exigir que o objeto
// também tenha source/groups/subjects com o formato do QuestApiResult original.
export function adaptQuestions(
  result: Pick<QuestApiResult, 'questions'>,
): SimulationQuestion[] {
  return result.questions.flatMap((group) => {
    const items = group.questions.data.items

    return items.map((question) => adaptQuestion(question, group.materia))
  })
}
