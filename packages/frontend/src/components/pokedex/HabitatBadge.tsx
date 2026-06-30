interface HabitatBadgeProps {
  habitat: string | null
}

export function HabitatBadge({ habitat }: HabitatBadgeProps) {
  if (!habitat) return null

  return (
    <span className="inline-flex items-center gap-1 text-sm bg-[#E8E0D0] px-3 py-1 rounded-full capitalize text-[#2D2D2D]">
      <span>🌍</span>
      {habitat}
    </span>
  )
}
