import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { FileText, Trash2, Upload } from 'lucide-react'

interface PdfUploadFieldProps {
  file: File | null
  onFileChange: (file: File | null) => void
  maxSizeInMb?: number
}

/**
 * Componente responsável somente por selecionar, validar e remover o PDF.
 * O envio do arquivo e a análise continuam sob responsabilidade da página.
 */
export function PdfUploadField({
  file,
  onFileChange,
  maxSizeInMb = 10,
}: PdfUploadFieldProps) {
  const [error, setError] = useState('')

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]
    setError('')

    if (!selectedFile) return

    const hasPdfExtension = selectedFile.name.toLowerCase().endsWith('.pdf')

    if (!hasPdfExtension) {
      setError('Selecione um arquivo com extensão .pdf.')
      onFileChange(null)
      event.target.value = ''
      return
    }

    if (selectedFile.size > maxSizeInMb * 1024 * 1024) {
      setError(`O arquivo deve ter no máximo ${maxSizeInMb} MB.`)
      onFileChange(null)
      event.target.value = ''
      return
    }

    onFileChange(selectedFile)
  }

  function handleRemove() {
    onFileChange(null)
    setError('')
  }

  return (
    <section className="w-full min-w-0 rounded-2xl border border-blue-400/20 bg-[#0B1424] p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
          <FileText className="size-5" />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white sm:text-base">
            Envie o edital do concurso
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
            Selecione um arquivo PDF de até {maxSizeInMb} MB. Depois, solicite
            a análise para identificar as matérias e os assuntos do edital.
          </p>
        </div>
      </div>

      {!file ? (
        <label className="flex min-h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-blue-300/25 bg-blue-500/[0.04] px-4 py-6 text-center transition hover:border-blue-300/50 hover:bg-blue-500/[0.08] focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-400">
          <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
            <Upload className="size-5" />
          </span>
          <span className="text-sm font-medium text-slate-200">
            Escolher arquivo PDF
          </span>
          <span className="mt-1 text-xs text-slate-500">
            Clique para procurar no seu dispositivo
          </span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleChange}
            className="sr-only"
          />
        </label>
      ) : (
        <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300">
              <FileText className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-200">
                {file.name}
              </p>
              <p className="text-xs text-slate-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB · PDF selecionado
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-400/20 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-400/10 sm:w-auto"
          >
            <Trash2 className="size-3.5" />
            Remover arquivo
          </button>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-300"
        >
          {error}
        </p>
      )}
    </section>
  )
}
