import { useState, useRef, useEffect } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { AssistantMessage } from '../components/assistant/AssistantMessage'
import { VoiceInput } from '../components/assistant/VoiceInput'
import { useAssistant } from '../hooks/useAssistant'
import { useTranslation } from '../i18n/useTranslation'

export function AssistantPage() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const { messages, loading, send } = useAssistant()
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    send(input.trim())
    setInput('')
  }

  const handleVoiceResult = (text: string) => {
    setInput(text)
    send(text)
  }

  return (
    <AppLayout>
      <PageHeader title={t('assistant.title')} subtitle={t('assistant.subtitle')} />

      <div className="app-card overflow-hidden flex flex-col" style={{ minHeight: '60vh' }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-3">
              <div className="w-14 h-14 rounded-full bg-pokedex-red/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-pokedex-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                {t('assistant.emptyState')}
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {[t('assistant.suggestion1'), t('assistant.suggestion2'), t('assistant.suggestion3')].map(q => (
                  <button
                    key={q}
                    onClick={() => { send(q) }}
                    className="text-xs bg-bone text-charcoal border border-cream rounded-full px-3 py-1.5
                               hover:border-pokedex-red/40 hover:bg-white transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <AssistantMessage key={i} message={msg} />
          ))}
          {loading && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1 bg-white border border-cream rounded-2xl rounded-bl-sm px-4 py-3">
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-cream bg-white p-3">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t('assistant.placeholder')}
              className="dex-input flex-1"
              autoFocus
            />
            <VoiceInput onResult={handleVoiceResult} />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-1.5 bg-pokedex-red text-white px-4 py-2 rounded-lg
                         text-sm font-semibold hover:bg-pokedex-dark disabled:opacity-40 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              {t('assistant.send')}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
