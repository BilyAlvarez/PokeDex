export function PokemonCardSkeleton() {
  return (
    <div className="app-card flex items-center gap-0 animate-pulse overflow-hidden">
      {/* Accent bar */}
      <div className="w-1 self-stretch bg-cream-dark flex-shrink-0" />
      {/* Sprite */}
      <div className="w-16 h-16 rounded-xl bg-cream flex-shrink-0 m-3" />
      {/* Info */}
      <div className="flex-1 min-w-0 py-3 pr-2 space-y-2">
        <div className="h-2 w-8 bg-cream rounded" />
        <div className="h-3.5 w-24 bg-cream-dark rounded" />
        <div className="flex gap-1.5 mt-1">
          <div className="h-4 w-12 bg-cream rounded-full" />
          <div className="h-4 w-14 bg-cream rounded-full" />
        </div>
      </div>
      {/* Chevron */}
      <div className="w-4 h-4 bg-cream rounded flex-shrink-0 mr-4" />
    </div>
  )
}
