import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Bot, ChevronDown, ChevronUp, LoaderCircle, Send, Sparkles } from 'lucide-react'

import type { TutorConversationMessage } from '../types/simulation.types'

interface QuestionTutorChatProps {
  messages: TutorConversationMessage[]
  isLoading: boolean
  hasUserAnswer: boolean
  error?: string | null
  onSend: (content: string) => Promise<boolean>
}

function renderInlineMarkdown(value: string) {
  const tokens = value.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)

  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={index}>{token.slice(2, -2)}</strong>
    }

    if (token.startsWith('*') && token.endsWith('*')) {
      return <em key={index}>{token.slice(1, -1)}</em>
    }

    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code key={index} className="rounded bg-muted px-1 py-0.5 text-xs">
          {token.slice(1, -1)}
        </code>
      )
    }

    return <span key={index}>{token}</span>
  })
}

function TutorMessageContent({ content }: { content: string }) {
  const lines = content.split(/\r?\n/)

  return (
    <div className="space-y-1.5 break-words text-sm leading-6">
      {lines.map((line, index) => {
        const trimmed = line.trim()

        if (!trimmed) return <div key={index} className="h-1" />
        if (/^---+$/.test(trimmed)) {
          return <hr key={index} className="my-2 border-border" />
        }

        const heading = trimmed.match(/^(#{1,3})\s+(.+)$/)
        if (heading) {
          return (
            <p key={index} className="pt-1 font-semibold">
              {renderInlineMarkdown(heading[2] ?? '')}
            </p>
          )
        }

        const bullet = trimmed.match(/^[-*]\s+(.+)$/)
        if (bullet) {
          return (
            <div key={index} className="flex gap-2 pl-1">
              <span aria-hidden="true">•</span>
              <span>{renderInlineMarkdown(bullet[1] ?? '')}</span>
            </div>
          )
        }

        if (trimmed.startsWith('|')) {
          return (
            <p key={index} className="overflow-x-auto font-mono text-xs leading-5">
              {trimmed.replace(/\|/g, '  │  ').replace(/:?-{3,}:?/g, '────')}
            </p>
          )
        }

        return <p key={index}>{renderInlineMarkdown(line)}</p>
      })}
    </div>
  )
}

export function QuestionTutorChat({
  messages,
  isLoading,
  hasUserAnswer,
  error,
  onSend,
}: QuestionTutorChatProps) {
  const [draft, setDraft] = useState('')
  const [isOpen, setIsOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isLoading])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = draft.trim()

    if (!content || isLoading) return

    const sent = await onSend(content)
    if (sent) setDraft('')
  }

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left md:px-5"
      >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bot className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2 font-semibold">
                Tutor de IA
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="size-3" />
                  Assistente de estudos
                </span>
              </span>
              <span className="block text-xs text-muted-foreground">
                Tire dúvidas sobre esta questão e o conteúdo relacionado.
              </span>
            </span>
          </span>
        {isOpen ? (
          <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-3 border-t p-3 md:p-4">
          <div
            className="max-h-80 space-y-3 overflow-y-auto rounded-lg bg-muted/30 p-3 md:p-4"
            role="log"
            aria-live="polite"
            aria-label="Conversa com o tutor de IA"
          >
            {messages.length === 0 && (
              <div className="space-y-3 rounded-lg border bg-background p-3">
                <div className="flex gap-2">
                  <Bot className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p className="text-sm leading-6 text-muted-foreground">
                    Olá! Posso explicar o raciocínio do gabarito, revisar o conteúdo e
                    responder outras dúvidas sobre esta questão.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    void onSend(
                      hasUserAnswer
                        ? 'Explique por que minha resposta está correta ou incorreta. Analise a alternativa que escolhi, justifique o gabarito e destaque o conceito principal.'
                        : 'Explique esta questão, justifique o gabarito disponível e destaque o conceito principal cobrado.',
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="size-3.5" />
                  {hasUserAnswer ? 'Explicar minha resposta' : 'Explicar esta questão'}
                </button>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[95%] rounded-xl px-3 py-2.5 md:max-w-[88%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'border bg-background text-foreground'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <TutorMessageContent content={message.content} />
                  ) : (
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {message.content}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                O tutor está preparando uma explicação...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }
              }}
              rows={2}
              maxLength={4000}
              disabled={isLoading}
              placeholder="Ex.: Por que a alternativa B está correta?"
              aria-label="Digite sua dúvida para o tutor"
              className="min-h-11 min-w-0 flex-1 resize-y rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !draft.trim()}
              aria-label="Enviar mensagem"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLoading ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </form>
          <p className="text-[11px] text-muted-foreground">
            Enter envia a mensagem; Shift + Enter cria uma nova linha. Confira informações importantes com o material oficial.
          </p>
        </div>
      )}
    </section>
  )
}
