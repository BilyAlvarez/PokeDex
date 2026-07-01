import { motion } from 'framer-motion'

interface ScanOverlayProps {
  active: boolean
}

export function ScanOverlay({ active }: ScanOverlayProps) {
  if (!active) return null

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute left-0 right-0 h-1 bg-pokedex-cyan shadow-[0_0_12px_rgba(0,180,216,0.8)]"
        initial={{ top: 0 }}
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-pokedex-cyan rounded-tl" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-pokedex-cyan rounded-tr" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-pokedex-cyan rounded-bl" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-pokedex-cyan rounded-br" />
    </motion.div>
  )
}
