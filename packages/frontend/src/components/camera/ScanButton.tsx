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
      className="relative w-16 h-16 rounded-full bg-[#00B4D8] border-4 border-[#F5F0E8] shadow-lg
                 flex items-center justify-center transition-all duration-200
                 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      <div className={`w-8 h-8 rounded-full border-2 border-white ${scanning ? 'animate-ping' : ''}`} />
    </button>
  )
}
