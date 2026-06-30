interface LedIndicatorProps {
  status: 'off' | 'green' | 'yellow' | 'red'
}

const colors = {
  off: 'bg-gray-600',
  green: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]',
  yellow: 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]',
  red: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
}

export function LedIndicator({ status }: LedIndicatorProps) {
  return (
    <div className={`w-3 h-3 rounded-full ${colors[status]} transition-all duration-300`} />
  )
}
