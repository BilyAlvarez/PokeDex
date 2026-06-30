interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-[#2D2D2D] font-mono">
        <span>{current} / {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="bg-[#E8E0D0] rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#CC1F1F] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
