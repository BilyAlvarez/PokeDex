import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeviceShell } from '../components/device/DeviceShell'
import { CameraView } from '../components/camera/CameraView'
import { ScanButton } from '../components/camera/ScanButton'
import { ScanOverlay } from '../components/camera/ScanOverlay'
import { Button } from '../components/ui/Button'
import { useCamera } from '../hooks/useCamera'
import { useScanStore } from '../stores/scanStore'
import { useSound } from '../hooks/useSound'
import { AssistantPanel } from '../components/assistant/AssistantPanel'

export function ScanPage() {
  const navigate = useNavigate()
  const { videoRef, start, stop, capture } = useCamera()
  const { scanning, result, error, scan } = useScanStore()
  const { playScan } = useSound()
  const [cameraActive, setCameraActive] = useState(false)

  const handleStartCamera = useCallback(async () => {
    await start('environment')
    setCameraActive(true)
  }, [start])

  const handleStopCamera = useCallback(() => {
    stop()
    setCameraActive(false)
  }, [stop])

  const handleScan = useCallback(async () => {
    if (!capture) return
    const frame = capture()
    if (!frame) return
    playScan()
    await scan(frame)
  }, [capture, playScan, scan])

  return (
    <>
      <DeviceShell
        ledStatus={scanning ? 'yellow' : cameraActive ? 'green' : 'off'}
        topScreen={
          <div className="relative w-full">
            <CameraView videoRef={videoRef} active={cameraActive} />
            <ScanOverlay active={scanning} />

            {!cameraActive ? (
              <div className="mt-3 flex justify-center">
                <Button onClick={handleStartCamera}>Start Camera</Button>
              </div>
            ) : (
              <div className="mt-3 flex justify-center gap-3">
                <ScanButton scanning={scanning} onClick={handleScan} />
                <Button variant="ghost" size="sm" onClick={handleStopCamera}>Stop</Button>
              </div>
            )}

            {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
          </div>
        }
        bottomScreen={
          <div className="space-y-3">
            {result?.identified && result.pokemon ? (
              <div className="text-center">
                <p className="text-green-600 font-bold text-lg">{result.message}</p>
                <p className="text-2xl font-bold capitalize mt-2">{result.pokemon.name}</p>
                {result.pokemon.spriteUrl && (
                  <img src={result.pokemon.spriteUrl} alt="" className="w-20 h-20 mx-auto object-contain" />
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => navigate(`/pokemon/${result.pokemon!.id}`)}
                >
                  View Details
                </Button>
              </div>
            ) : result?.candidates ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                <div className="space-y-1">
                  {result.candidates.map((c, i) => (
                    <p key={i} className="text-sm capitalize font-mono">
                      {c.species} — {(c.confidence * 100).toFixed(0)}%
                    </p>
                  ))}
                </div>
              </div>
            ) : result && !result.identified ? (
              <p className="text-sm text-gray-500 text-center">{result.message}</p>
            ) : (
              <p className="text-sm text-gray-400 text-center italic">Point the camera at a Pokémon to scan</p>
            )}
          </div>
        }
        onNavigate={() => navigate('/home')}
      />
      <AssistantPanel />
    </>
  )
}
