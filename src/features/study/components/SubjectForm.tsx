import { Plus, Trash2, BookOpen } from 'lucide-react'
import type { StudySubject } from '../types/study.types' 

interface SubjectFormProps {
  subjects: StudySubject[]
  onChange: (subjects: StudySubject[]) => void
}

export function SubjectForm({ subjects, onChange }: SubjectFormProps) {
  function addSubject() {
    const newSubject: StudySubject = {
      id: crypto.randomUUID(),
      nome: '',
      topicos: [],
      quantidadeQuestoes: 10,
    }

    onChange([...subjects, newSubject])
  }

  function updateSubject(
    id: string,
    field: keyof StudySubject,
    value: string | number | string[],
  ) {
    onChange(
      subjects.map((subject) =>
        subject.id === id
          ? { ...subject, [field]: value }
          : subject,
      ),
    )
  }

  function removeSubject(id: string) {
    onChange(subjects.filter((subject) => subject.id !== id))
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111827] p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
            <BookOpen size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              Matérias e questões
            </h2>

            <p className="text-sm text-gray-400">
              Configure as disciplinas que deseja estudar.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
          {subjects.length} matérias
        </span>
      </div>

      <div className="space-y-4">
        {subjects.map((subject, index) => (
          <div
            key={subject.id}
            className="rounded-xl border border-white/10 bg-[#0B1220] p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-300">
                Disciplina {index + 1}
              </span>

              <button
                type="button"
                onClick={() => removeSubject(subject.id)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
                aria-label={`Remover disciplina ${index + 1}`}
              >
                <Trash2 size={17} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_150px]">
              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Nome da matéria
                </label>

                <input
                  type="text"
                  value={subject.nome}
                  onChange={(event) =>
                    updateSubject(subject.id, 'nome', event.target.value)
                  }
                  placeholder="Ex.: Direito Constitucional"
                  className="w-full rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Quantidade de questões
                </label>

                <input
                  type="number"
                  min={1}
                  max={200}
                  value={subject.quantidadeQuestoes}
                  onChange={(event) =>
                    updateSubject(
                      subject.id,
                      'quantidadeQuestoes',
                      Math.min(200, Math.max(1, Number(event.target.value))),
                    )
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-gray-400">
                Tópicos da disciplina
              </label>

              <textarea
                value={subject.topicos.join('\n')}
                onChange={(event) =>
                  updateSubject(
                    subject.id,
                    'topicos',
                    event.target.value
                      .split('\n')
                      .map((topic) => topic.trim())
                      .filter(Boolean),
                  )
                }
                placeholder={'Digite um tópico por linha:\nPrincípios fundamentais\nDireitos e garantias fundamentais'}
                rows={3}
                className="w-full resize-y rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addSubject}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-700 py-3 text-sm font-medium text-gray-300 transition hover:border-blue-500 hover:text-blue-400"
      >
        <Plus size={18} />
        Adicionar matéria
      </button>
    </section>
  )
}