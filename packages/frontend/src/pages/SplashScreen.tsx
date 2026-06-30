import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const BOOT_STEPS = ['Initializing...', 'Loading database...', 'System ready']

export function SplashScreen() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 600)
    const timer2 = setTimeout(() => setStep(2), 1400)
    const timer3 = setTimeout(() => setFadeOut(true), 2200)
    const timer4 = setTimeout(() => navigate('/home'), 2600)
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4) }
  }, [navigate])

  return (
    <motion.div
      className="min-h-screen bg-pokedex-red flex flex-col items-center justify-center relative overflow-hidden"
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)] pointer-events-none" />

      <motion.div
        className="text-center relative z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-20 h-20 mx-auto mb-5 rounded-full border-[3px] border-bone/80 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <motion.div
            className="w-10 h-10 bg-bone rounded-full"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>

        <h1 className="text-3xl font-bold text-bone tracking-[0.15em] mb-1">POKÉDEX</h1>
        <p className="text-[11px] text-bone/50 font-mono tracking-[0.2em] uppercase mb-6">Real</p>

        {BOOT_STEPS.slice(0, step + 1).map((text, i) => (
          <motion.p
            key={i}
            className={`text-xs font-mono ${i === step ? 'text-pokedex-amber' : 'text-bone/40'}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {i < step ? '✓' : '→'} {text}
          </motion.p>
        ))}
      </motion.div>
    </motion.div>
  )
}
