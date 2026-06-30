import { useCallback, useRef } from 'react'

const AUDIO_CACHE = new Map<string, HTMLAudioElement>()

function getAudio(src: string): HTMLAudioElement {
  if (!AUDIO_CACHE.has(src)) {
    AUDIO_CACHE.set(src, new Audio(src))
  }
  return AUDIO_CACHE.get(src)!
}

export function useSound() {
  const lastPlayed = useRef(0)

  const play = useCallback((src: string, debounceMs = 100) => {
    const now = Date.now()
    if (now - lastPlayed.current < debounceMs) return
    lastPlayed.current = now

    const audio = getAudio(src)
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [])

  const playBip = useCallback(() => {
    play('/sounds/bip.mp3', 80)
  }, [play])

  const playScan = useCallback(() => {
    play('/sounds/scan.mp3', 500)
  }, [play])

  const playConfirm = useCallback(() => {
    play('/sounds/confirm.mp3', 300)
  }, [play])

  return { play, playBip, playScan, playConfirm }
}
