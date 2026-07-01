import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from '../i18n/useTranslation'

export function SplashScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)
  const clipId = 'splash-pb'

  const BOOT_STEPS = [t('splash.init'), t('splash.loadingDb'), t('splash.ready')]

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 800)
    const t2 = setTimeout(() => setStep(2), 1600)
    const t3 = setTimeout(() => setFadeOut(true), 2400)
    const t4 = setTimeout(() => navigate('/home'), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [navigate])

  return (
    <motion.div
      className="min-h-screen bg-pokedex-red flex flex-col items-center justify-center relative overflow-hidden"
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Scan-line texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)' }}
      />
      {/* Decorative rings */}
      <div className="absolute rounded-full border border-white/8 w-[600px] h-[600px] pointer-events-none" />
      <div className="absolute rounded-full border border-white/5 w-[380px] h-[380px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Pokéball — drops and bounces in */}
        <motion.div
          className="mb-8"
          animate={{
            y: [-80, 0, -24, 0, -10, 0, -3, 0],
            opacity: [0, 1, 1, 1, 1, 1, 1, 1],
          }}
          transition={{
            duration: 1.1,
            times: [0, 0.28, 0.44, 0.58, 0.70, 0.80, 0.90, 1],
            ease: 'easeOut',
          }}
        >
          <svg viewBox="0 0 80 80" width="80" height="80">
            <defs>
              <clipPath id={clipId}>
                <circle cx="40" cy="40" r="35" />
              </clipPath>
            </defs>
            <g clipPath={`url(#${clipId})`}>
              <rect x="0" y="0" width="80" height="80" fill="white" />
              <rect x="0" y="0" width="80" height="40" fill="#8e1212" />
              <rect x="0" y="36" width="80" height="8" fill="#1a1a1a" />
            </g>
            <circle cx="40" cy="40" r="35" fill="none" stroke="#1a1a1a" strokeWidth="3" />

            {/* Amber glow on system ready */}
            {step >= 2 && (
              <motion.circle
                cx="40" cy="40" r="14"
                fill="none"
                stroke="#f2b705"
                strokeWidth="3"
                initial={{ opacity: 0, r: 10 }}
                animate={{ opacity: [0, 0.9, 0.5, 0.85], r: [10, 16, 13, 14] }}
                transition={{ duration: 0.7 }}
              />
            )}

            {/* Center button */}
            <circle cx="40" cy="40" r="11" fill="white" stroke="#1a1a1a" strokeWidth="3" />
            <motion.circle
              cx="40" cy="40" r="4.5"
              animate={{ fill: step >= 2 ? '#f2b705' : '#e0e0e0' }}
              transition={{ duration: 0.4 }}
            />
          </svg>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center mb-7"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.35 }}
        >
          <h1 className="text-4xl font-bold text-white tracking-[0.2em]">{t('splash.title')}</h1>
        </motion.div>

        {/* Boot steps */}
        <div className="flex flex-col gap-1.5 items-start min-w-[168px]">
          {BOOT_STEPS.slice(0, step + 1).map((text, i) => (
            <motion.div
              key={i}
              className={`flex items-center gap-2 text-xs font-mono
                          ${i === step ? 'text-pokedex-amber' : 'text-white/35'}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              <span className="w-3 text-center shrink-0">{i < step ? '✓' : '›'}</span>
              <span>{text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
