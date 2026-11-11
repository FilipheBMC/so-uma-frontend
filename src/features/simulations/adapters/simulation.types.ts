
import type {
  QuestApiQuestion,
  QuestApiResult,
  SimulationQuestion,
} from '../types/simulation.types'

function adaptQuestion(
  question: QuestApiQuestion,
  subject: string,
): SimulationQuestion {
  return {
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

    isCanceled:
      question.anulada || question.sinalizadores.anulada,
  }
}

export function adaptQuestions(
  result: QuestApiResult,
): SimulationQuestion[] {
  return result.questions.flatMap((group) => {
    const items = group.questions.data.items

    return items.map((question) =>
      adaptQuestion(question, group.materia),
    )
  })
}
