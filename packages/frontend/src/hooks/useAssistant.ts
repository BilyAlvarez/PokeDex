import { useState, useCallback } from 'react'
import { ChatMessage } from '../types/assistant'
import { api } from '../services/api'
import { ttsService } from '../services/tts.service'

export function useAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  const send = useCallback(async (text: string, pokemonId?: string, section?: string) => {
    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await api.assistant.chat({ message: text, pokemonId, section })
      const assistantMsg: ChatMessage = { role: 'assistant', content: res.text }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      const errMsg: ChatMessage = { role: 'assistant', content: 'Sorry, I could not process that.' }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }, [])

  const narrate = useCallback(async (pokemonId: string) => {
    try {
      const res = await api.assistant.narrate(pokemonId)
      ttsService.speak(res.text)
    } catch {
      // ignore
    }
  }, [])

  const clear = useCallback(() => {
    setMessages([])
  }, [])

  return { messages, loading, send, narrate, clear }
}
