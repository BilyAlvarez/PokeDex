import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToastStore, type ToastItem, type ToastVariant } from '../../stores/toastStore'

const VARIANT_CONFIG: Record<ToastVariant, {
  border: string
  iconBg: string
  icon: React.ReactNode
}> = {
  success: {
    border: 'border-l-pokedex-cyan',
    iconBg: 'bg-pokedex-cyan/10 text-pokedex-cyan',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    ),
  },
  error: {
    border: 'border-l-pokedex-red',
    iconBg: 'bg-pokedex-red/10 text-pokedex-red',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    border: 'border-l-pokedex-amber',
    iconBg: 'bg-pokedex-amber/10 text-pokedex-amber',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  info: {
    border: 'border-l-blue-500',
    iconBg: 'bg-blue-500/10 text-blue-500',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  },
}

function ToastCard({ toast }: { toast: ToastItem }) {
  const remove = useToastStore(s => s.remove)
  const cfg = VARIANT_CONFIG[toast.variant]

  useEffect(() => {
    const timer = setTimeout(() => remove(toast.id), toast.duration)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, remove])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.94, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className={`relative flex items-start gap-3 bg-white rounded-xl border border-cream border-l-4
                  ${cfg.border} shadow-lg px-4 py-3.5 w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden`}
    >
      {/* Icon */}
      <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${cfg.iconBg}`}>
        {cfg.icon}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0 pr-1">
        {toast.title && (
          <p className="text-sm font-semibold text-charcoal leading-snug">{toast.title}</p>
        )}
        <p className={`text-sm text-gray-500 leading-snug ${toast.title ? 'mt-0.5' : ''}`}>
          {toast.message}
        </p>
      </div>

      {/* Close */}
      <button
        onClick={() => remove(toast.id)}
        className="shrink-0 w-5 h-5 flex items-center justify-center text-gray-350
                   hover:text-gray-500 transition-colors cursor-pointer mt-0.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cream overflow-hidden">
        <motion.div
          className={`h-full ${cfg.border.replace('border-l-', 'bg-')}`}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        />
      </div>
    </motion.div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore(s => s.toasts)

  return (
    <div className="fixed bottom-24 sm:bottom-6 right-4 z-[200] flex flex-col gap-2.5 items-end pointer-events-none">
      <AnimatePresence mode="sync">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastCard toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
