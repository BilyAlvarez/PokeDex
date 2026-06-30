import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeviceShell } from '../components/device/DeviceShell'
import { TopScreen } from '../components/device/TopScreen'
import { BottomScreen } from '../components/device/BottomScreen'
import { AssistantMessage } from '../components/assistant/AssistantMessage'
import { VoiceInput } from '../components/assistant/VoiceInput'
import { useAssistant } from '../hooks/useAssistant'

export function AssistantPage() {
  const navigate = useNavigate()
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
    <DeviceShell
      ledStatus="green"
      topScreen={
        <TopScreen>
          <div className="text-center">
            <p className="text-lg font-bold text-[#2D2D2D]">Assistant</p>
            <p className="text-xs text-gray-400">Ask me anything about Pokémon</p>
          </div>
        </TopScreen>
      }
      bottomScreen={
        <BottomScreen>
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto space-y-2 mb-3 max-h-[300px]">
              {messages.length === 0 && (
                <p className="text-sm text-gray-400 text-center italic mt-8">
                  How can I help you, Trainer?
                </p>
              )}
              {messages.map((msg, i) => (
                <AssistantMessage key={i} message={msg} />
              ))}
              <div ref={endRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask something..."
                className="flex-1 bg-white border border-[#E8E0D0] rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:border-[#CC1F1F]"
              />
              <VoiceInput onResult={handleVoiceResult} />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-[#00B4D8] text-white px-4 rounded-lg text-sm font-semibold
                           hover:bg-[#0090b0] disabled:opacity-50 transition-colors cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </BottomScreen>
      }
      onNavigate={() => navigate('/home')}
    />
  )
}
