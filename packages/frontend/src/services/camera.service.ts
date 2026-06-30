export class CameraService {
  private stream: MediaStream | null = null

  async start(facingMode: 'user' | 'environment' = 'environment'): Promise<MediaStream> {
    this.stop()

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
    })

    return this.stream
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
  }

  captureFrame(video: HTMLVideoElement): string {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')
    ctx.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.8)
  }

  isSupported(): boolean {
    return !!(navigator.mediaDevices?.getUserMedia)
  }
}

export const cameraService = new CameraService()
