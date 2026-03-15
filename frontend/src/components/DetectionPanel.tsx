import { useState } from 'react'
import { motion } from 'framer-motion'
import ImageUpload from './ImageUpload'
import WebcamCapture from './WebcamCapture'
import ResultsPanel from './ResultsPanel'
import { Detection } from '../types'

interface DetectionPanelProps {
  detections: Detection[]
  setDetections: (detections: Detection[]) => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
}

const DetectionPanel = ({ detections, setDetections, isProcessing, setIsProcessing }: DetectionPanelProps) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'webcam'>('upload')
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null)
  const [confidence, setConfidence] = useState(0.25)

  const clearResults = () => {
    setDetections([])
    setAnnotatedImage(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pb-8">
      {/* Control Panel - Paper Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="paper-card p-4 mb-6"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('upload'); clearResults(); }}
              className={`tape-button ${activeTab === 'upload' ? 'active' : ''}`}
            >
              Upload Image
            </button>
            <button
              onClick={() => { setActiveTab('webcam'); clearResults(); }}
              className={`tape-button ${activeTab === 'webcam' ? 'active' : ''}`}
            >
              Live Camera
            </button>
          </div>

          {/* Confidence Slider */}
          <div className="flex items-center gap-3 bg-[#f5e6d3] px-4 py-2 sketch-border">
            <span className="text-[#4a433c] text-xs font-bold uppercase tracking-wider">Threshold</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="w-24"
            />
            <span className="text-[#ff8c42] font-bold text-sm font-mono min-w-[3ch]">
              {(confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main Content - CRT Monitor Style */}
      <div className="space-y-6">
        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="processing-led" />
            <span className="text-[#6a635c] text-xs font-mono uppercase">Input Source</span>
          </div>
          <div className="crt-frame">
            <div className="crt-screen">
              {activeTab === 'upload' ? (
                <ImageUpload
                  confidence={confidence}
                  setDetections={setDetections}
                  setAnnotatedImage={setAnnotatedImage}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              ) : (
                <WebcamCapture
                  confidence={confidence}
                  setDetections={setDetections}
                  setAnnotatedImage={setAnnotatedImage}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* Results Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`processing-led ${isProcessing ? '' : 'active'}`} />
            <span className="text-[#6a635c] text-xs font-mono uppercase">Analysis Results</span>
          </div>
          <ResultsPanel
            detections={detections}
            annotatedImage={annotatedImage}
            isProcessing={isProcessing}
            onClear={clearResults}
          />
        </motion.div>
      </div>
    </div>
  )
}

export default DetectionPanel
