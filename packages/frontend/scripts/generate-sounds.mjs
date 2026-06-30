import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function generateWAV(frequency, duration, amplitude, sampleRate = 44100) {
  const numChannels = 1
  const bitsPerSample = 16
  const numSamples = Math.floor(sampleRate * duration)
  const blockAlign = numChannels * bitsPerSample / 8
  const byteRate = sampleRate * blockAlign
  const dataSize = numSamples * blockAlign
  const buf = Buffer.alloc(44 + dataSize)

  buf.write('RIFF', 0)
  buf.writeUInt32LE(36 + dataSize, 4)
  buf.write('WAVE', 8)
  buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20)
  buf.writeUInt16LE(numChannels, 22)
  buf.writeUInt32LE(sampleRate, 24)
  buf.writeUInt32LE(byteRate, 28)
  buf.writeUInt16LE(blockAlign, 32)
  buf.writeUInt16LE(bitsPerSample, 34)
  buf.write('data', 36)
  buf.writeUInt32LE(dataSize, 40)

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    const envelope = Math.max(0, 1 - t / duration)
    const sample = Math.sin(2 * Math.PI * frequency * t) * amplitude * envelope
    const val = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)))
    buf.writeInt16LE(val, 44 + i * 2)
  }
  return buf
}

const soundsDir = join(__dirname, '..', 'public', 'sounds')

writeFileSync(join(soundsDir, 'bip.wav'), generateWAV(1000, 0.08, 0.5))
writeFileSync(join(soundsDir, 'scan.wav'), generateWAV(440, 1.0, 0.3))
writeFileSync(join(soundsDir, 'confirm.wav'), generateWAV(660, 0.3, 0.4))

console.log('Generated bip.wav, scan.wav, confirm.wav')
