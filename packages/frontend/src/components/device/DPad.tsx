interface DPadProps {
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void
}

export function DPad({ onNavigate }: DPadProps) {
  const btn =
    'w-11 h-11 bg-charcoal text-bone flex items-center justify-center text-sm ' +
    'active:scale-90 active:brightness-125 transition-all duration-100 cursor-pointer select-none ' +
    'border-0 shadow-[inset_0_-2px_0_rgba(0,0,0,0.4),inset_0_2px_2px_rgba(255,255,255,0.05)]'

  return (
    <div className="grid grid-cols-3 gap-0 w-fit p-1.5 bg-device-black rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="col-start-2">
        <button className={`${btn} rounded-t-lg`} onClick={() => onNavigate?.('up')}>
          <span className="mb-0.5 text-xs">▲</span>
        </button>
      </div>
      <button className={`${btn} rounded-l-lg justify-end pr-1`} onClick={() => onNavigate?.('left')}>
        <span className="text-xs">◀</span>
      </button>
      <div className="w-11 h-11 flex items-center justify-center">
        <div className="w-3 h-3 bg-dpad-center rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
      </div>
      <button className={`${btn} rounded-r-lg justify-start pl-1`} onClick={() => onNavigate?.('right')}>
        <span className="text-xs">▶</span>
      </button>
      <div className="col-start-2">
        <button className={`${btn} rounded-b-lg`} onClick={() => onNavigate?.('down')}>
          <span className="mt-0.5 text-xs">▼</span>
        </button>
      </div>
    </div>
  )
}
