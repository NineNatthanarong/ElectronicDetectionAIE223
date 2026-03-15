import { useState } from 'react'
import Hero from './components/Hero'
import DetectionPanel from './components/DetectionPanel'
import { Detection } from './types'

function App() {
  const [detections, setDetections] = useState<Detection[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  return (
    <div className="min-h-screen retro-bg">
      <div className="relative z-10">
        <Hero />
        <main className="container mx-auto px-4 pb-12">
          <DetectionPanel 
            detections={detections} 
            setDetections={setDetections}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        </main>
      </div>
    </div>
  )
}

export default App
