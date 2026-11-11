
import { useCallback, useEffect, useState } from 'react'

import {
  getLabSubjects,
  getLabTopics,
} from './QuestAPI-lab.service';

const ITEMS_PER_PAGE = 20

export default function QuestApiLabPage() {
  // Matérias
  const [subjects, setSubjects] = useState<string[]>([])
  const [subjectsPage, setSubjectsPage] = useState(1)
  const [subjectsHasMore, setSubjectsHasMore] = useState(false)
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [subjectsError, setSubjectsError] = useState('')

  // Matéria escolhida
  const [selectedSubject, setSelectedSubject] = useState('')

  // Assuntos
  const [topics, setTopics] = useState<string[]>([])
  const [topicsPage, setTopicsPage] = useState(1)
  const [topicsHasMore, setTopicsHasMore] = useState(false)
  const [topicsLoading, setTopicsLoading] = useState(false)
  const [topicsError, setTopicsError] = useState('')

  // Seleção de assuntos
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])

  // Consulta as matérias
  const loadSubjects = useCallback(
    async (page: number, append: boolean) => {
      setSubjectsLoading(true)
      setSubjectsError('')

      try {
        const response = await getLabSubjects({
          page,
          per_page: ITEMS_PER_PAGE,
        })

        setSubjects((previous) =>
          append
            ? Array.from(new Set([...previous, ...response.items]))
            : response.items,
        )

        setSubjectsPage(response.page)
        setSubjectsHasMore(response.hasMore)
      } catch (error) {
        console.error(error)

        setSubjectsError(
          error instanceof Error
            ? error.message
            : 'Erro ao carregar matérias.',
        )
      } finally {
        setSubjectsLoading(false)
      }
    },
    [],
  )

  // Carrega a primeira página de matérias ao abrir a tela
  useEffect(() => {
    void loadSubjects(1, false)
  }, [loadSubjects])

  // Consulta os assuntos da matéria escolhida
  const loadTopics = useCallback(
    async (materia: string, page: number, append: boolean) => {
      setTopicsLoading(true)
      setTopicsError('')

      try {
        const response = await getLabTopics({
          materia,
          page,
          per_page: ITEMS_PER_PAGE,
        })

        setTopics((previous) =>
          append
            ? Array.from(new Set([...previous, ...response.items]))
            : response.items,
        )

        setTopicsPage(response.page)
        setTopicsHasMore(response.hasMore)
      } catch (error) {
        console.error(error)

        setTopicsError(
          error instanceof Error
            ? error.message
            : 'Erro ao carregar assuntos.',
        )
      } finally {
        setTopicsLoading(false)
      }
    },
    [],
  )

  // Quando o usuário seleciona outra matéria
  function handleSubjectChange(materia: string) {
    setSelectedSubject(materia)

    // Limpa os assuntos da matéria anterior
    setTopics([])
    setSelectedTopics([])
    setTopicsPage(1)
    setTopicsHasMore(false)
    setTopicsError('')

    if (materia) {
      void loadTopics(materia, 1, false)
    }
  }

  // Marca ou desmarca um assunto
  function handleTopicSelection(
    topic: string,
    checked: boolean,
  ) {
    setSelectedTopics((previous) =>
      checked
        ? [...previous, topic]
        : previous.filter((item) => item !== topic),
    )
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">
          Ambiente de desenvolvimento
        </p>

        <h1 className="text-3xl font-bold tracking-tight">
          Laboratório Quest API
        </h1>

        <p className="text-muted-foreground">
          Consulte matérias, explore assuntos e teste a paginação
          da Quest API.
        </p>
      </header>

      {/* SELEÇÃO DE MATÉRIAS */}
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">
              1. Matérias disponíveis
            </h2>

            <p className="text-sm text-muted-foreground">
              Selecione uma matéria para consultar seus assuntos.
            </p>
          </div>

          <span className="text-sm text-muted-foreground">
            {subjects.length} carregadas
          </span>
        </div>

        {subjectsError && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {subjectsError}

            <button
              type="button"
              onClick={() => void loadSubjects(1, false)}
              className="ml-2 font-semibold underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        <select
          value={selectedSubject}
          onChange={(event) =>
            handleSubjectChange(event.target.value)
          }
          disabled={subjectsLoading && subjects.length === 0}
          className="w-full rounded-lg border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">
            {subjectsLoading && subjects.length === 0
              ? 'Carregando matérias...'
              : 'Selecione uma matéria'}
          </option>

          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>

        {subjectsHasMore && (
          <button
            type="button"
            onClick={() =>
              void loadSubjects(subjectsPage + 1, true)
            }
            disabled={subjectsLoading}
            className="mt-4 w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {subjectsLoading
              ? 'Carregando...'
              : 'Carregar mais matérias'}
          </button>
        )}

        {!subjectsLoading && subjects.length === 0 && !subjectsError && (
          <p className="mt-4 text-sm text-muted-foreground">
            Nenhuma matéria encontrada.
          </p>
        )}
      </section>

      {/* CONSULTA DE ASSUNTOS */}
      {selectedSubject && (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">
                2. Assuntos da matéria
              </h2>

              <p className="text-sm text-muted-foreground">
                Matéria selecionada: {selectedSubject}
              </p>
            </div>

            <span className="text-sm text-muted-foreground">
              {topics.length} carregados
            </span>
          </div>

          {topicsError && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {topicsError}

              <button
                type="button"
                onClick={() =>
                  void loadTopics(selectedSubject, 1, false)
                }
                className="ml-2 font-semibold underline"
              >
                Tentar novamente
              </button>
            </div>
          )}

          <div className="space-y-2">
            {topics.map((topic) => (
              <label
                key={topic}
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition hover:bg-accent"
              >
                <input
                  type="checkbox"
                  checked={selectedTopics.includes(topic)}
                  onChange={(event) =>
                    handleTopicSelection(
                      topic,
                      event.target.checked,
                    )
                  }
                  className="size-4 accent-primary"
                />

                <span className="text-sm">{topic}</span>
              </label>
            ))}
          </div>

          {topicsLoading && topics.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Carregando assuntos...
            </p>
          )}

          {!topicsLoading &&
            topics.length === 0 &&
            !topicsError && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum assunto encontrado para esta matéria.
              </p>
            )}

          {topicsHasMore && (
            <button
              type="button"
              onClick={() =>
                void loadTopics(
                  selectedSubject,
                  topicsPage + 1,
                  true,
                )
              }
              disabled={topicsLoading}
              className="mt-4 w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {topicsLoading
                ? 'Carregando...'
                : 'Carregar mais assuntos'}
            </button>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <span className="text-sm text-muted-foreground">
              {selectedTopics.length} assunto(s) selecionado(s)
            </span>

            <button
              type="button"
              onClick={() => setSelectedTopics([])}
              disabled={selectedTopics.length === 0}
              className="text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              Limpar seleção
            </button>
          </div>

          {selectedTopics.length > 0 && (
            <div className="mt-3 rounded-lg bg-muted p-3">
              <p className="mb-2 text-sm font-semibold">
                Sua seleção:
              </p>

              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {selectedTopics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </main>
  )
}
