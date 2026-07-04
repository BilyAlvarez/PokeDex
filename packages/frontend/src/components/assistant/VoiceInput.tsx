import { useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'

interface VoiceInputProps {
  onResult: (text: string) => void
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string
  interimResults: boolean
  start: () => void
  onresult: ((event: { results: { transcript: string }[][] }) => void) | null
  onend: (() => void) | null
}

export function VoiceInput({ onResult }: VoiceInputProps) {
  const { t } = useTranslation()
  const [listening, setListening] = useState(false)

  const toggle = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    if (listening) {
      setListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript
      onResult(text)
      setListening(false)
    }

    recognition.onend = () => setListening(false)
    recognition.start()
    setListening(true)
  }

  return (
    <button
      onClick={toggle}
      className={`p-2 rounded-full transition-colors ${
        listening ? 'bg-pokedex-red text-white animate-pulse' : 'bg-cream text-charcoal hover:bg-gray-300'
      }`}
      title={t('voice.input')}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    </button>
  )
}
