import { useRef } from 'react'
import { FileText, Upload, X } from 'lucide-react'

interface EditalUploadProps {
  file: File | null
  onChange: (file: File | null) => void
}

export function EditalUpload({ file, onChange }: EditalUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) return

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      alert('Selecione um arquivo PDF.')
      event.target.value = ''
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 10 MB.')
      event.target.value = ''
      return
    }

    onChange(selectedFile)
  }

  function removeFile() {
    onChange(null)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111827] p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
          <FileText size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">
            Edital do concurso
          </h2>
          <p className="text-sm text-gray-400">
            Envie o edital para análise da inteligência artificial.
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 px-6 py-10 transition hover:border-blue-500 hover:bg-blue-500/5"
        >
          <Upload size={30} className="mb-3 text-blue-400" />

          <span className="font-medium text-white">
            Clique para selecionar seu edital
          </span>

          <span className="mt-2 text-xs text-gray-500">
            PDF • Tamanho máximo: 10 MB
          </span>
        </button>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="shrink-0 text-green-400" size={24} />

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {file.name}
              </p>

              <p className="text-xs text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={removeFile}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
            aria-label="Remover arquivo"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </section>
  )
}