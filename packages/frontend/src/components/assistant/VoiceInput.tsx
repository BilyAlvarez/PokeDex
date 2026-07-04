import { useState, useMemo, useCallback, useRef } from 'react'

interface VoiceInputProps {
  onResult: (text: string) => void
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionError {
  error: string
  message?: string
}

interface SpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onstart: ((this: SpeechRecognition) => void) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  onend: ((this: SpeechRecognition) => void) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionError) => void) | null
}

export function VoiceInput({ onResult }: VoiceInputProps) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const listeningRef = useRef(false)

  const supported = useMemo(() => {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }, [])

  const toggle = useCallback(() => {
    setError(null)
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionCtor) return

    if (listeningRef.current) {
      recognitionRef.current?.stop()
      recognitionRef.current = null
      listeningRef.current = false
      setListening(false)
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      listeningRef.current = true
      setListening(true)
    }

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1]
      const text = result[0]?.transcript
      if (text) {
        onResult(text)
      }
    }

    recognition.onerror = (event) => {
      const msg = event.error === 'not-allowed' ? 'Microphone access denied' : `Voice error: ${event.error}`
      setError(msg)
      listeningRef.current = false
      setListening(false)
      recognitionRef.current = null
    }

    recognition.onend = () => {
      listeningRef.current = false
      setListening(false)
      recognitionRef.current = null
    }

    try {
      recognitionRef.current = recognition
      recognition.start()
    } catch (e) {
      setError('Could not start voice recognition')
      recognitionRef.current = null
    }
  }, [onResult])

  const buttonClass = !supported
    ? 'bg-cream text-gray-300 cursor-not-allowed'
    : listening
      ? 'bg-pokedex-red text-white animate-pulse'
      : 'bg-cream text-charcoal hover:bg-gray-300 cursor-pointer'

  return (
    <div className="relative">
      <button
        onClick={toggle}
        disabled={!supported}
        className={`p-2 rounded-full transition-colors ${buttonClass}`}
        title={!supported ? 'Voice input not supported' : listening ? 'Listening...' : 'Voice input'}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      </button>
      {error && (
        <div className="absolute top-full mt-1 right-0 text-[10px] text-red-500 whitespace-nowrap bg-white border border-red-200 rounded px-1.5 py-0.5 shadow-sm z-10">
          {error}
        </div>
      )}
    </div>
  )
}
