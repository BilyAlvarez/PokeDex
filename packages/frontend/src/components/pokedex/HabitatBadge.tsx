interface HabitatBadgeProps {
  habitat: string | null
}

export function HabitatBadge({ habitat }: HabitatBadgeProps) {
  if (!habitat) return null

  return (
    <span className="inline-flex items-center gap-1 text-sm bg-cream px-3 py-1 rounded-full capitalize text-charcoal">
      <span>🌍</span>
      {habitat}
    </span>
  )
}
