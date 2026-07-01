import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AssistantMessage } from './AssistantMessage'
import { useAssistant } from '../../hooks/useAssistant'
import { useTranslation } from '../../i18n/useTranslation'

export function AssistantPanel() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
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

  if (dismissed) return null

  return (
    <>
      {/* Floating bubble — draggable, dismissable */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.1}
        dragConstraints={{ top: -400, bottom: 80, left: -280, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 70) setDismissed(true)
        }}
        whileDrag={{ scale: 1.08, opacity: 0.85 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="hidden sm:block fixed bottom-6 right-4 z-40 touch-none select-none"
      >
        <div className="relative group">
          {/* Dismiss × badge */}
          <motion.button
            onClick={() => setDismissed(true)}
            initial={{ opacity: 0, scale: 0.7 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-gray-500 text-white
                       flex items-center justify-center opacity-0 group-hover:opacity-100
                       transition-opacity cursor-pointer z-10 sm:flex hidden"
            style={{ fontSize: 9, lineHeight: 1 }}
          >
            ×
          </motion.button>

          {/* Main bubble */}
          <button
            onClick={() => setOpen(o => !o)}
            className="w-12 h-12 bg-pokedex-red text-white rounded-full shadow-lg
                       flex items-center justify-center hover:bg-pokedex-dark
                       active:scale-95 transition-colors duration-150 cursor-pointer"
            aria-label={t('assistant.title')}
          >
            {open ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            )}
          </button>

          {/* Mobile: swipe-down hint */}
          <span className="sm:hidden absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-gray-400
                           whitespace-nowrap opacity-0 group-active:opacity-100 transition-opacity pointer-events-none">
            desliza ↓
          </span>
        </div>
      </motion.div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="hidden sm:flex fixed bottom-24 right-4 z-40 w-80 h-[420px]
                       app-card flex-col overflow-hidden"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            {/* Header */}
            <div className="bg-pokedex-red px-4 py-3 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/60" />
                <span className="text-white font-semibold text-sm tracking-wide">
                  {t('assistant.panelTitle')}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-3 space-y-2 bg-bone/40">
              {messages.length === 0 && (
                <p className="dex-empty mt-6 text-xs">{t('assistant.panelEmpty')}</p>
              )}
              {messages.map((msg, i) => (
                <AssistantMessage key={i} message={msg} />
              ))}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t border-cream bg-white p-2.5 flex gap-2 shrink-0">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={t('assistant.panelPlaceholder')}
                className="flex-1 bg-bone border border-cream rounded-lg px-3 py-2 text-sm text-charcoal
                           placeholder-gray-400 focus:outline-none focus:border-pokedex-red transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-pokedex-red text-white px-3 py-2 rounded-lg text-sm font-semibold
                           hover:bg-pokedex-dark disabled:opacity-40 transition-colors cursor-pointer"
              >
                {t('assistant.send')}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
