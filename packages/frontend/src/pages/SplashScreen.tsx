import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export function SplashScreen() {
  const navigate = useNavigate()
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      navigate('/home')
    }, 2500)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <motion.div
      className="min-h-screen bg-[#CC1F1F] flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-[#F5F0E8] flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-12 h-12 bg-[#F5F0E8] rounded-full" />
        </motion.div>

        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-4xl font-bold text-[#F5F0E8] tracking-wider">POKÉDEX</h1>
            <p className="text-[#F5F0E8]/70 text-sm mt-2 font-mono">Initializing...</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
