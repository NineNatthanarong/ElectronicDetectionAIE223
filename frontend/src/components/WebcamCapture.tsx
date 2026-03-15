import { useState, useRef, useCallback, useEffect } from 'react'
import { Detection, PredictionResponse } from '../types'

interface WebcamCaptureProps {
  confidence: number
  setDetections: (detections: Detection[]) => void
  setAnnotatedImage: (image: string | null) => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
}

const API_URL = import.meta.env.VITE_API_URL || '/api'

const WebcamCapture = ({ confidence, setDetections, setAnnotatedImage, isProcessing, setIsProcessing }: WebcamCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshRate, setRefreshRate] = useState(0.2) // Default 0.2s
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startCamera = async () => {
    setError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      })
      setStream(mediaStream)
      
      // Small delay to ensure video ref is ready
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
        setIsStreaming(true)
      }
    } catch (err: unknown) {
      console.error('Error accessing camera:', err)
      let errorMessage = 'Could not access camera.'
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.'
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera and try again.'
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is in use by another application.'
        } else {
          errorMessage = `Camera error: ${err.message}`
        }
      }
      setError(errorMessage)
    }
  }

  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsStreaming(false)
    setError(null)
    setDetections([])
    setAnnotatedImage(null)
  }

  const captureAndPredict = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return

    const video = videoRef.current
    const canvas = canvasRef.current
    
    // Check if video has valid dimensions and is ready
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('Video not ready, state:', video.readyState, 'dimensions:', video.videoWidth, 'x', video.videoHeight)
      return
    }
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    console.log('Captured image, size:', imageData.length)

    setIsProcessing(true)
    try {
      const response = await fetch(`${API_URL}/predict/base64`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData, confidence })
      })

      const data: PredictionResponse = await response.json()

      if (data.success) {
        setDetections(data.detections)
        setAnnotatedImage(data.annotated_image)
      } else {
        console.error('Prediction failed:', data.error)
      }
    } catch (error) {
      console.error('Prediction error:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [confidence, isProcessing, setDetections, setAnnotatedImage, setIsProcessing])

  useEffect(() => {
    if (isStreaming) {
      // Wait 500ms for video to be ready before starting captures
      const timeoutId = setTimeout(() => {
        intervalRef.current = setInterval(captureAndPredict, refreshRate * 1000)
      }, 500)
      return () => {
        clearTimeout(timeoutId)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isStreaming, captureAndPredict, refreshRate])

  return (
    <div className="p-4">
      <div className="relative aspect-video bg-[#1a1612]">
        {/* Always render video element so ref is available */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isStreaming ? '' : 'hidden'}`}
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {!isStreaming ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {error ? (
              <>
                <div className="w-12 h-12 bg-[#4a433c] flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-[#ff8c42]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-[#ff8c42] mb-3 text-center px-4 max-w-md text-xs font-mono">{error}</p>
                <button
                  onClick={startCamera}
                  className="tape-button text-xs"
                >
                  Try Again
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-[#4a433c] flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-[#f5e6d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-[#6a635c] mb-3 text-xs font-mono">CAMERA OFF</p>
                <button
                  onClick={startCamera}
                  className="tape-button active text-xs"
                >
                  Start Camera
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Retro processing indicator */}
            {isProcessing && (
              <div className="absolute top-2 right-2 flex items-center gap-2 px-3 py-1 bg-[#2a2520] border border-[#4a433c] text-xs z-10">
                <div className="processing-led" />
                <span className="text-[#ff8c42] font-mono">SCANNING...</span>
              </div>
            )}

            <button
              onClick={stopCamera}
              className="absolute bottom-2 right-2 px-3 py-1 bg-[#4a433c] text-[#f5e6d3] text-xs font-mono border border-[#6a635c] hover:bg-[#5a534c] transition-colors"
            >
              ■ STOP
            </button>
          </>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 ${isStreaming ? 'bg-[#44ff44]' : 'bg-[#ff4444]'}`} />
          <span className="text-[#6a635c] text-xs font-mono">{isStreaming ? 'LIVE' : 'OFFLINE'}</span>
        </div>
        
        {/* Refresh Rate Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[#6a635c] text-xs font-mono">REFRESH:</span>
          <select
            value={refreshRate}
            onChange={(e) => {
              const newRate = parseFloat(e.target.value)
              setRefreshRate(newRate)
              // Restart interval with new rate if streaming
              if (isStreaming && intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = setInterval(captureAndPredict, newRate * 1000)
              }
            }}
            className="bg-[#1a1612] border border-[#4a433c] text-[#f5e6d3] text-xs font-mono px-2 py-1 focus:outline-none focus:border-[#ff8c42]"
          >
            <option value={0.1}>0.1s</option>
            <option value={0.2}>0.2s</option>
            <option value={0.3}>0.3s</option>
            <option value={0.5}>0.5s</option>
            <option value={0.75}>0.75s</option>
            <option value={1}>1s</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default WebcamCapture
