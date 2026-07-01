interface ScanButtonProps {
  scanning: boolean
  onClick: () => void
  disabled?: boolean
}

export function ScanButton({ scanning, onClick, disabled }: ScanButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || scanning}
      className="relative w-16 h-16 rounded-full bg-pokedex-cyan border-4 border-bone shadow-lg
                 flex items-center justify-center transition-all duration-200
                 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className={`w-8 h-8 rounded-full border-2 border-white ${scanning ? 'animate-ping' : ''}`} />
    </button>
  )
}
