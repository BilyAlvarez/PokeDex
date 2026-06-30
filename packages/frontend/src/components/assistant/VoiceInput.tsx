import { useState } from 'react'

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
      className={`p-2 rounded-full transition-colors cursor-pointer ${
        listening ? 'bg-[#CC1F1F] text-white animate-pulse' : 'bg-[#E8E0D0] text-[#2D2D2D] hover:bg-gray-300'
      }`}
      title="Voice input"
    >
      🎤
    </button>
  )
}
