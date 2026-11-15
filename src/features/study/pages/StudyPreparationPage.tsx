import { useState } from 'react'
import type { ChangeEvent } from 'react'

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'

import { Link, useNavigate } from 'react-router-dom'

import { studyService } from '../services/study.service'

import type {
  PdfAnalysis,
  StudyMode,
  ManualStudySubject,
} from '../types/study.types'

export default function StudyPreparationPage() {
  const navigate = useNavigate()

  const [mode, setMode] = useState<StudyMode>('pdf')
  const [file, setFile] = useState<File | null>(null)
  const [manualSubjects, setManualSubjects] = useState<ManualStudySubject[]>([])
  const [analysis, setAnalysis] = useState<PdfAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function resetPreparation() {
    setAnalysis(null)
    setError('')
  }

  function changeMode(newMode: StudyMode) {
    setMode(newMode)
    resetPreparation()
  }

  // Upload do PDF
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) return

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Selecione um arquivo PDF.')
      setFile(null)
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('O arquivo ultrapassa o limite de 10 MB.')
      setFile(null)
      return
    }

    setFile(selectedFile)
    resetPreparation()
  }

  // Adicionar matéria manualmente
  function addSubject() {
    setManualSubjects((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: '',
        questionCount: 10,
      },
    ])
  }

  function updateSubject(
    id: string,
    field: 'name' | 'questionCount',
    value: string | number,
  ) {
    setManualSubjects((current) =>
      current.map((subject) =>
        subject.id === id
          ? { ...subject, [field]: value }
          : subject,
      ),
    )
  }

  function removeManualSubject(id: string) {
    setManualSubjects((current) =>
      current.filter((subject) => subject.id !== id),
    )
  }

  // Modalidade PDF: solicitar análise à IA
  async function handleAnalyzePdf() {
    if (!file) {
      setError('Selecione um edital.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await studyService.analyzePdf(file)

      if (!response.analysis.subjects.length) {
        setError('A IA não identificou matérias no edital.')
        return
      }

      setAnalysis(response.analysis)
    } catch (err) {
      console.error(err)
      setError('Erro ao analisar o edital.')
    } finally {
      setLoading(false)
    }
  }

  // Modalidade manual: criar o mesmo contrato da análise PDF.
  function handleManualPreparation() {
    setError('')

    if (manualSubjects.length === 0) {
      setError('Adicione pelo menos uma matéria.')
      return
    }

    const invalid = manualSubjects.some(
      (subject) =>
        !subject.name.trim() ||
        !Number.isInteger(subject.questionCount) ||
        subject.questionCount < 1 ||
        subject.questionCount > 200,
    )

    if (invalid) {
      setError(
        'Preencha as matérias e quantidades corretamente (1 a 200).',
      )
      return
    }

    const total = manualSubjects.reduce(
      (sum, subject) => sum + subject.questionCount,
      0,
    )

    const manualAnalysis: PdfAnalysis = {
      totalQuestions: total,

      groups: [
        {
          name: 'Geral',
          questionCount: total,
        },
      ],

      subjects: manualSubjects.map((subject) => ({
        name: subject.name.trim(),
        group: 'Geral',
        questionCount: subject.questionCount,
      })),
    }

    setAnalysis(manualAnalysis)
  }

  // Excluir matéria da análise final.
  function removeSelectedSubject(index: number) {
    if (!analysis) return

    const subjects = analysis.subjects.filter(
      (_, subjectIndex) => subjectIndex !== index,
    )

    const total = subjects.reduce(
      (sum, subject) => sum + (subject.questionCount ?? 0),
      0,
    )

    setAnalysis({
      ...analysis,
      totalQuestions: total,
      subjects,
      groups: analysis.groups.map((group) => ({
        ...group,
        questionCount: total,
      })),
    })
  }

  // Gerar questões e encaminhar para o simulado.
  async function handleGenerateQuestions() {
    if (!analysis || analysis.subjects.length === 0) {
      setError('Mantenha pelo menos uma matéria.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await studyService.generateQuestions(analysis)


      // Ver isso aqui depois
      
      // if (!response.result?.questions.length) {
      //   setError('A API não retornou questões para este simulado.')
      //   return
      // }

      navigate('/simulado', {
        state: {
          result: response.result,
        },
      })
    } catch (err) {
      console.error(err)
      setError('Erro ao gerar questões.')
    } finally {
      setLoading(false)
    }
  }

  const totalQuestions =
    analysis?.subjects.reduce(
      (sum, subject) => sum + (subject.questionCount ?? 0),
      0,
    ) ?? 0

  return (
    <main className="min-h-screen bg-[#080D18] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft size={17} />
          Voltar ao dashboard
        </Link>

        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-blue-400">
            <Sparkles size={20} />
            <span className="text-sm font-medium">
              Preparação inteligente
            </span>
          </div>

          <h1 className="text-3xl font-bold">
            Prepare seus estudos
          </h1>

          <p className="mt-3 text-sm text-gray-400">
            Escolha como deseja informar as matérias do seu concurso.
          </p>
        </header>

        {/* ESCOLHA DA MODALIDADE */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => changeMode('pdf')}
            className={`rounded-2xl border p-5 text-left transition ${
              mode === 'pdf'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/10 bg-[#111827] hover:border-gray-600'
            }`}
          >
            <FileText size={28} className="mb-4 text-blue-400" />

            <h2 className="font-semibold">
              Enviar edital PDF
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              A IA identifica as matérias automaticamente.
            </p>
          </button>

          <button
            type="button"
            onClick={() => changeMode('manual')}
            className={`rounded-2xl border p-5 text-left transition ${
              mode === 'manual'
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/10 bg-[#111827] hover:border-gray-600'
            }`}
          >
            <BookOpen size={28} className="mb-4 text-purple-400" />

            <h2 className="font-semibold">
              Preencher matérias
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Informe manualmente as disciplinas e quantidades.
            </p>
          </button>
        </div>

        {/* OPÇÃO PDF */}
        {mode === 'pdf' && !analysis && (
          <section className="rounded-2xl border border-white/10 bg-[#111827] p-6">
            <h2 className="mb-2 text-lg font-semibold">
              Selecione seu edital
            </h2>

            <p className="mb-5 text-sm text-gray-400">
              PDF de até 10 MB.
            </p>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 p-10 hover:border-blue-500">
              <Upload size={30} className="mb-3 text-blue-400" />

              <span className="text-sm font-medium">
                Clique para selecionar o PDF
              </span>

              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {file && (
              <div className="mt-4 flex items-center justify-between rounded-lg bg-white/5 p-4">
                <span className="truncate text-sm">
                  {file.name}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setFile(null)
                    resetPreparation()
                  }}
                  className="text-sm text-red-400"
                >
                  Remover
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleAnalyzePdf}
              disabled={!file || loading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? 'Analisando edital...' : 'Analisar edital'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </section>
        )}

        {/* OPÇÃO MANUAL */}
        {mode === 'manual' && !analysis && (
          <section className="rounded-2xl border border-white/10 bg-[#111827] p-6">
            <h2 className="mb-2 text-lg font-semibold">
              Cadastre suas matérias
            </h2>

            <p className="mb-5 text-sm text-gray-400">
              Você poderá adicionar quantas disciplinas desejar.
            </p>

            <div className="space-y-4">
              {manualSubjects.map((subject, index) => (
                <div
                  key={subject.id}
                  className="rounded-xl border border-white/10 bg-[#0B1220] p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Matéria {index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeManualSubject(subject.id)}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1fr_150px]">
                    <div>
                      <label className="mb-2 block text-sm text-gray-400">
                        Nome da matéria
                      </label>

                      <input
                        type="text"
                        value={subject.name}
                        onChange={(event) =>
                          updateSubject(
                            subject.id,
                            'name',
                            event.target.value,
                          )
                        }
                        placeholder="Ex.: Direito Constitucional"
                        className="w-full rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-sm outline-none focus:border-purple-500"
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
                        value={subject.questionCount}
                        onChange={(event) =>
                          updateSubject(
                            subject.id,
                            'questionCount',
                            Number(event.target.value),
                          )
                        }
                        className="w-full rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-sm outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addSubject}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-700 py-3 text-sm text-gray-300 hover:border-purple-500 hover:text-purple-400"
            >
              <Plus size={18} />
              Adicionar matéria
            </button>

            <button
              type="button"
              onClick={handleManualPreparation}
              disabled={manualSubjects.length === 0}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold hover:bg-purple-500 disabled:opacity-50"
            >
              Revisar matérias
              <ArrowRight size={18} />
            </button>
          </section>
        )}

        {/* REVISÃO COMUM PARA PDF E MANUAL */}
        {analysis && (
          <section className="rounded-2xl border border-white/10 bg-[#111827] p-6">
            <div className="mb-5">
              <span className="text-sm font-medium text-green-400">
                Etapa de revisão
              </span>

              <h2 className="mt-2 text-xl font-semibold">
                Confira as matérias selecionadas
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Remova as matérias que não deseja utilizar.
              </p>
            </div>

            <div className="mb-5 flex gap-8 rounded-xl bg-white/5 p-4">
              <div>
                <p className="text-2xl font-bold">
                  {analysis.subjects.length}
                </p>
                <p className="text-xs text-gray-400">Matérias</p>
              </div>

              <div>
                <p className="text-2xl font-bold">
                  {totalQuestions}
                </p>
                <p className="text-xs text-gray-400">Questões</p>
              </div>
            </div>

            <div className="space-y-3">
              {analysis.subjects.map((subject, index) => (
                <div
                  key={`${subject.name}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0B1220] p-4"
                >
                  <div>
                    <p className="font-medium">
                      {subject.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {subject.questionCount ?? 0} questões
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSelectedSubject(index)}
                    disabled={loading}
                    className="rounded-lg p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleGenerateQuestions}
              disabled={analysis.subjects.length === 0 || loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-4 font-semibold hover:bg-green-500 disabled:opacity-50"
            >
              {loading ? 'Gerando questões...' : 'Gerar questões'}
              {!loading && <ArrowRight size={18} />}
            </button>

            <button
              type="button"
              onClick={resetPreparation}
              disabled={loading}
              className="mt-3 w-full py-2 text-sm text-gray-400 hover:text-white"
            >
              Voltar e alterar a preparação
            </button>
          </section>
        )}

        {/* MENSAGEM DE ERRO */}
        {error && (
          <p className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    </main>
  )
}
