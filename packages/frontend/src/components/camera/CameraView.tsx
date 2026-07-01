import { RefObject } from 'react'
import { useTranslation } from '../../i18n/useTranslation'

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>
  active: boolean
  mirrored?: boolean
}

export function CameraView({ videoRef, active, mirrored = false }: CameraViewProps) {
  const { t } = useTranslation()

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {active ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${mirrored ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-bone text-sm font-mono">
          {t('camera.inactive')}
        </div>
      )}
      <div className="absolute inset-0 border-4 border-transparent rounded-lg pointer-events-none" />
    </div>
  )
}
