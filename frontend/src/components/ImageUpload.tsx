import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Loader2, ImagePlus, X } from 'lucide-react'
import { Detection, PredictionResponse } from '../types'

interface ImageUploadProps {
  confidence: number
  setDetections: (detections: Detection[]) => void
  setAnnotatedImage: (image: string | null) => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
}

const API_URL = import.meta.env.VITE_API_URL || '/api'

const ImageUpload = ({ confidence, setDetections, setAnnotatedImage, isProcessing, setIsProcessing }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    setCurrentFile(file)

    await predictImage(file)
  }

  const predictImage = async (file: File) => {
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('confidence', confidence.toString())

      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
      })

      const data: PredictionResponse = await response.json()

      if (data.success) {
        setDetections(data.detections)
        setAnnotatedImage(data.annotated_image)
      }
    } catch (error) {
      console.error('Prediction error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [confidence])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const clearImage = () => {
    setPreview(null)
    setCurrentFile(null)
    setAnnotatedImage(null)
    setDetections([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Re-predict when confidence changes
  useEffect(() => {
    if (currentFile && !isProcessing) {
      predictImage(currentFile)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confidence])

  return (
    <div className="p-4">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`relative border-2 border-dashed border-[#c4b4a0] rounded-lg p-8 transition-all duration-300 ${
              isDragging
                ? 'border-[#ff8c42] bg-[#ff8c42]/10'
                : 'bg-[#1a1612] hover:border-[#a49480]'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />

            <div className="text-center">
              <motion.div
                animate={{ y: isDragging ? -5 : 0 }}
                className="inline-flex items-center justify-center w-14 h-14 bg-[#4a433c] mb-3"
              >
                <svg className="w-7 h-7 text-[#f5e6d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </motion.div>

              <h3 className="text-[#f5e6d3] font-medium mb-1 text-sm">
                Drop image here
              </h3>
              <p className="text-[#6a635c] text-xs mb-3">
                or click to browse
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="tape-button text-xs px-4 py-2"
              >
                Choose File
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
          >
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 z-10 px-3 py-1 bg-[#1a1612]/80 text-[#f5e6d3] text-xs font-mono border border-[#4a433c] hover:bg-[#2a2520] transition-colors"
            >
              ✕ Clear
            </button>

            <div className="relative bg-[#0a0a08]">
              {/* Retro processing overlay */}
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#1a1612]/50 z-10">
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#2a2520] border border-[#4a433c]">
                    <div className="processing-led" />
                    <span className="text-[#ff8c42] text-xs font-mono">SCANNING...</span>
                  </div>
                </div>
              )}
              <img
                src={preview}
                alt="Preview"
                className="w-full h-auto max-h-[400px] object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ImageUpload
