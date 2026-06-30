export class TTSService {
  private synth: SpeechSynthesis

  constructor() {
    this.synth = window.speechSynthesis
  }

  speak(text: string, onEnd?: () => void) {
    if (!this.synth) return

    this.synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.1
    utterance.volume = 1

    const voices = this.synth.getVoices()
    const englishVoice = voices.find(v => v.lang.startsWith('en'))
    if (englishVoice) utterance.voice = englishVoice

    if (onEnd) {
      utterance.onend = onEnd
    }

    this.synth.speak(utterance)
  }

  stop() {
    if (this.synth) {
      this.synth.cancel()
    }
  }

  isSpeaking(): boolean {
    return this.synth?.speaking ?? false
  }

  isSupported(): boolean {
    return 'speechSynthesis' in window
  }
}

export const ttsService = new TTSService()
