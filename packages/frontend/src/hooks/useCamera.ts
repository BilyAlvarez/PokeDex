import { useState, useRef, useCallback, useEffect } from 'react'
import { cameraService } from '../services/camera.service'

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const start = useCallback(async (facingMode: 'user' | 'environment' = 'environment') => {
    try {
      setError(null)
      const s = await cameraService.start(facingMode)
      setStream(s)
      if (videoRef.current) {
        videoRef.current.srcObject = s
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Camera access denied')
    }
  }, [])

  const stop = useCallback(() => {
    cameraService.stop()
    setStream(null)
  }, [])

  const capture = useCallback((): string | null => {
    if (!videoRef.current) return null
    return cameraService.captureFrame(videoRef.current)
  }, [])

  useEffect(() => {
    return () => { cameraService.stop() }
  }, [])

  return { stream, error, videoRef, start, stop, capture, isSupported: cameraService.isSupported() }
}
