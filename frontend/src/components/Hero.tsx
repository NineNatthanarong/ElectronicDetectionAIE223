import { motion } from 'framer-motion'

const Hero = () => {
  return (
    <header className="py-6 md:py-8">
      <div className="container mx-auto px-4 text-center">
        {/* Project Label */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <span className="label-tag">AIE223</span>
          <span className="label-tag alt ml-2">PROJECT</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold mb-3 text-[#4a433c]"
        >
          <span className="doodle-underline">Electronic Parts</span>
          <span className="text-[#ff8c42]"> Detection</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[#6a635c] mb-4 text-sm md:text-base"
        >
          Object Detection using YOLO Model
        </motion.p>

        {/* Authors - Handwritten style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-block paper-card px-6 py-3"
        >
          <p className="text-[#4a433c] text-sm font-medium">
            by <span className="text-[#ff8c42] font-bold">Natthanarong Tiangjit</span> & <span className="text-[#ff8c42] font-bold">Chanunya Sutti</span>
          </p>
        </motion.div>
      </div>
    </header>
  )
}

export default Hero
