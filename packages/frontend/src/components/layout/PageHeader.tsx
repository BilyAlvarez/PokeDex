import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  title: React.ReactNode
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, showBack = true, onBack, action }: PageHeaderProps) {
  const navigate = useNavigate()
  const handleBack = onBack ?? (() => navigate(-1))

  return (
    <div className="app-card px-4 py-3 flex items-center gap-3 mb-5">
      {showBack && (
        <motion.button
          onClick={handleBack}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0
                     bg-cream hover:bg-pokedex-red/10 text-gray-400 hover:text-pokedex-red
                     transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
      )}

      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-charcoal leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
