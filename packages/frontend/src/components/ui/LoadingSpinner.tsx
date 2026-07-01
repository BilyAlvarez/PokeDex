import { useId } from 'react'
import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: number
  className?: string
}

export function LoadingSpinner({ size = 44, className = '' }: LoadingSpinnerProps) {
  const clipId = useId()

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.svg
        viewBox="0 0 44 44"
        width={size}
        height={size}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <defs>
          <clipPath id={clipId}>
            <circle cx="22" cy="22" r="19" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <rect x="0" y="0" width="44" height="44" fill="white" />
          <rect x="0" y="0" width="44" height="22" fill="#cc1f1f" />
          <rect x="0" y="19.5" width="44" height="5" fill="#1a1a1a" />
        </g>
        <circle cx="22" cy="22" r="19" fill="none" stroke="#1a1a1a" strokeWidth="2.5" />
        <circle cx="22" cy="22" r="6.5" fill="white" stroke="#1a1a1a" strokeWidth="2.5" />
        <circle cx="22" cy="22" r="2.5" fill="#e0e0e0" />
      </motion.svg>
    </div>
  )
}
