import { RefObject } from 'react'

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>
  active: boolean
  mirrored?: boolean
}

export function CameraView({ videoRef, active, mirrored = false }: CameraViewProps) {
  return (
    <div className="relative w-full aspect-[4/3] bg-black rounded-lg overflow-hidden border-2 border-[#00B4D8]">
      {active ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${mirrored ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-[#F5F0E8] text-sm font-mono">
          Camera inactive
        </div>
      )}
      <div className="absolute inset-0 border-4 border-transparent rounded-lg pointer-events-none" />
    </div>
  )
}
