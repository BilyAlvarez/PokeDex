import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AssistantMessage } from './AssistantMessage'
import { useAssistant } from '../../hooks/useAssistant'

export function AssistantPanel() {
  const [open, setOpen] = useState(false)
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

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-40 w-12 h-12 bg-[#00B4D8] text-white rounded-full shadow-lg
                   flex items-center justify-center text-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
      >
        {open ? '✕' : '💬'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-20 right-4 z-40 w-80 h-96 bg-[#F5F0E8] rounded-xl shadow-2xl border-2 border-[#E8E0D0] flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            <div className="bg-[#CC1F1F] text-white px-4 py-2 font-bold text-sm">
              Pokédex Assistant
            </div>

            <div className="flex-1 overflow-auto p-3 space-y-2">
              {messages.length === 0 && (
                <p className="text-xs text-gray-400 text-center mt-8">Ask me anything about Pokémon!</p>
              )}
              {messages.map((msg, i) => (
                <AssistantMessage key={i} message={msg} />
              ))}
              <div ref={endRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t border-[#E8E0D0] p-2 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white border border-[#E8E0D0] rounded-lg px-3 py-1.5 text-sm
                           focus:outline-none focus:border-[#CC1F1F]"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-[#CC1F1F] text-white px-3 py-1.5 rounded-lg text-sm font-semibold
                           hover:bg-[#8E1212] disabled:opacity-50 transition-colors cursor-pointer"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
