import { motion, AnimatePresence } from 'framer-motion'
import { Box, Download, Trash2, Loader2 } from 'lucide-react'
import { Detection } from '../types'

interface ResultsPanelProps {
  detections: Detection[]
  annotatedImage: string | null
  isProcessing: boolean
  onClear: () => void
}

const ResultsPanel = ({ detections, annotatedImage, isProcessing, onClear }: ResultsPanelProps) => {
  const downloadImage = () => {
    if (!annotatedImage) return
    const link = document.createElement('a')
    link.href = annotatedImage
    link.download = `detection_${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'bg-green-500'
    if (conf >= 0.5) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="crt-frame">
      {/* Subtle processing indicator */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 bg-[#2a2520] border border-[#4a433c] text-[#ff8c42] text-xs font-mono z-10"
          >
            <div className="processing-led" />
            <span>PROCESSING...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Annotated Image - CRT Screen Style */}
      {annotatedImage ? (
        <div className="crt-screen relative">
          <img
            src={annotatedImage}
            alt="Detection result"
            className="w-full h-auto max-h-[500px] object-contain"
          />
          {/* Download button - retro style */}
          <button
            onClick={downloadImage}
            className="absolute bottom-3 right-3 px-3 py-1.5 bg-[#1a1612]/90 text-[#f5e6d3] text-xs font-mono border border-[#4a433c] hover:bg-[#2a2520] transition-colors"
          >
            ↓ SAVE
          </button>
        </div>
      ) : (
        <div className="crt-screen p-8 text-center">
          <div className="w-14 h-14 bg-[#4a433c] flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-[#6a635c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-[#6a635c] text-xs font-mono">
            NO ANALYSIS DATA
          </p>
        </div>
      )}

      {/* Detection List - Paper Card Style */}
      {detections.length > 0 && (
        <div className="bg-[#f5e6d3] border-t-4 border-[#4a433c] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#4a433c] font-bold text-xs font-mono flex items-center gap-2">
              <span className="w-2 h-2 bg-[#ff8c42]" />
              DETECTED PARTS
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[#4a433c] text-xs font-mono">
                {detections.length} ITEMS
              </span>
              <button
                onClick={onClear}
                className="p-1 bg-[#e8d5c0] border border-[#d4c4b0] text-[#4a433c] hover:bg-[#d4c4b0] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {detections.map((det, index) => (
              <motion.div
                key={`${det.class}-${index}-${det.confidence}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="bg-[#faf6f1] border-2 border-[#d4c4b0] p-2 shadow-[0_2px_0_#c4b4a0]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#4a433c] flex items-center justify-center text-[#f5e6d3] font-bold text-xs font-mono">
                    {det.class.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[#4a433c] font-bold text-xs capitalize truncate font-mono">{det.class}</h4>
                    <p className="text-[#ff8c42] text-xs font-mono font-bold">
                      {(det.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ResultsPanel
