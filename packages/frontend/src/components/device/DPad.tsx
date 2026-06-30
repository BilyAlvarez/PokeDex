interface DPadProps {
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void
}

export function DPad({ onNavigate }: DPadProps) {
  const btn = 'w-10 h-10 bg-[#2D2D2D] text-[#F5F0E8] flex items-center justify-center rounded-lg text-lg active:scale-90 transition-transform cursor-pointer select-none'

  return (
    <div className="grid grid-cols-3 gap-1 w-fit">
      <div />
      <button className={btn} onClick={() => onNavigate?.('up')}>▲</button>
      <div />
      <button className={btn} onClick={() => onNavigate?.('left')}>◀</button>
      <button className={`${btn} bg-[#CC1F1F]`} onClick={() => onNavigate?.('right')}>▶</button>
      <div />
      <button className={btn} onClick={() => onNavigate?.('down')}>▼</button>
      <div />
    </div>
  )
}
