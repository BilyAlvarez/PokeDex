import { useState, useRef, useCallback, useEffect } from 'react'
import { cameraService } from '../services/camera.service'

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const start = useCallback(async (facingMode: 'user' | 'environment' = 'environment'): Promise<boolean> => {
    try {
      setError(null)
      const s = await cameraService.start(facingMode)
      setStream(s)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Camera access denied')
      return false
    }
  }, [])

  const stop = useCallback(() => {
    cameraService.stop()
    setStream(null)
  }, [])

  const capture = useCallback((): string | null => {
    const video = videoRef.current
    if (!video || !video.srcObject || video.readyState < 2) return null
    return cameraService.captureFrame(video)
  }, [])

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  useEffect(() => {
    return () => { cameraService.stop() }
  }, [])

  return { stream, error, videoRef, start, stop, capture, isSupported: cameraService.isSupported() }
}
