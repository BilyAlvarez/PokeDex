import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { TypeBadge } from '../components/pokedex/TypeBadge'
import { StatsChart } from '../components/pokedex/StatsChart'
import { EvolutionChain } from '../components/pokedex/EvolutionChain'
import { MovesList } from '../components/pokedex/MovesList'
import { HabitatBadge } from '../components/pokedex/HabitatBadge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { usePokemonStore } from '../stores/pokemonStore'
import { Button } from '../components/ui/Button'

const TYPE_HEX: Record<string, string> = {
  normal: '#9ca3af', fire: '#f97316', water: '#3b82f6',
  electric: '#eab308', grass: '#22c55e', ice: '#06b6d4',
  fighting: '#dc2626', poison: '#a855f7', ground: '#d97706',
  flying: '#818cf8', psychic: '#ec4899', bug: '#84cc16',
  rock: '#ca8a04', ghost: '#7c3aed', dragon: '#4f46e5',
  dark: '#374151', steel: '#94a3b8', fairy: '#f472b6',
}

const GENERATION_LABELS: Record<number, string> = {
  1: 'Gen I', 2: 'Gen II', 3: 'Gen III', 4: 'Gen IV',
  5: 'Gen V', 6: 'Gen VI', 7: 'Gen VII', 8: 'Gen VIII', 9: 'Gen IX',
}

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.09, duration: 0.35, ease: 'easeOut' } }),
}

export function PokemonPage() {
  const { id } = useParams<{ id: string }>()
  const { current, loading, error, fetchById, fetchByDexNumber } = usePokemonStore()

  useEffect(() => {
    if (!id) return
    if (/^\d+$/.test(id)) {
      fetchByDexNumber(parseInt(id, 10))
    } else {
      fetchById(id)
    }
  }, [id, fetchById, fetchByDexNumber])

  const [shiny, setShiny] = useState(false)

  const cryUrl = current ? `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${current.nationalDexNumber}.ogg` : null

  const playCry = useCallback(() => {
    if (!cryUrl) return
    new Audio(cryUrl).play().catch(() => {})
  }, [cryUrl])

  const spriteSrc = shiny
    ? (current?.shinyArtworkUrl ?? current?.shinySpriteUrl ?? current?.artworkUrl ?? current?.spriteUrl ?? '')
    : (current?.artworkUrl ?? current?.spriteUrl ?? '')

  const typeHex = current ? (TYPE_HEX[current.types[0]] ?? '#9ca3af') : '#9ca3af'

  return (
    <AppLayout>
      <PageHeader
        title={current
          ? current.name.charAt(0).toUpperCase() + current.name.slice(1)
          : loading ? '...' : 'Pokémon'}
        subtitle={current ? `#${String(current.nationalDexNumber).padStart(3, '0')}` : undefined}
      />

      {loading && (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button onClick={() => { if (!id) return; if (/^\d+$/.test(id)) { fetchByDexNumber(parseInt(id, 10)) } else { fetchById(id) } }}>
            Retry
          </Button>
        </div>
      )}

      {current && !loading && (
        <div className="space-y-4">

          {/* ── Hero card ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="app-card overflow-hidden relative"
          >
            {/* Type gradient wash */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 80% 10%, ${typeHex}22 0%, ${typeHex}08 45%, transparent 70%)`,
              }}
            />

            <div className="relative z-10 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">

              {/* Info — left on desktop, bottom on mobile */}
              <div className="flex-1 min-w-0 order-2 sm:order-1 text-center sm:text-left">
                {/* Badges row */}
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                  <span className="text-xs font-mono font-semibold text-gray-400 tabular-nums">
                    #{String(current.nationalDexNumber).padStart(3, '0')}
                  </span>
                  {current.generation && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5
                                     bg-cream text-gray-500 rounded-md">
                      {GENERATION_LABELS[current.generation] ?? `Gen ${current.generation}`}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1 className="text-3xl sm:text-4xl font-bold text-charcoal capitalize leading-tight mb-0.5 inline-flex items-center gap-3">
                  {current.name}
                  <button
                    onClick={playCry}
                    className="w-8 h-8 rounded-full bg-cream hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    aria-label="Play cry"
                    title="Play cry"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 10h-2a1 1 0 00-1 1v2a1 1 0 001 1h2l3.5 3.5V6.5L6.5 10z" />
                    </svg>
                  </button>
                </h1>

                {/* Category */}
                {current.category && (
                  <p className="text-sm text-gray-400 mb-3">{current.category}</p>
                )}

                {/* Type badges */}
                <div className="flex gap-2 flex-wrap justify-center sm:justify-start mb-4">
                  {current.types.map(type => (
                    <TypeBadge key={type} type={type} />
                  ))}
                </div>

                {/* Description */}
                {current.description && (
                  <p className="text-sm text-gray-500 leading-relaxed italic mb-5 max-w-md">
                    {current.description}
                  </p>
                )}

                {/* Physical stats row */}
                <div className="flex gap-5 flex-wrap justify-center sm:justify-start">
                  {current.height != null && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Height</p>
                      <p className="font-mono font-semibold text-charcoal text-sm">{current.height} m</p>
                    </div>
                  )}
                  {current.weight != null && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Weight</p>
                      <p className="font-mono font-semibold text-charcoal text-sm">{current.weight} kg</p>
                    </div>
                  )}
                  {current.abilities?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Abilities</p>
                      <p className="font-semibold text-charcoal text-sm capitalize">
                        {current.abilities.join(', ')}
                      </p>
                    </div>
                  )}
                  {current.habitat && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Habitat</p>
                      <HabitatBadge habitat={current.habitat} />
                    </div>
                  )}
                </div>
              </div>

              {/* Artwork — right on desktop, top on mobile */}
              <div className="order-1 sm:order-2 flex-shrink-0">
                <motion.div
                  className="relative"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                >
                  {/* Glow shadow under artwork */}
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-5 rounded-full blur-xl opacity-30"
                    style={{ background: typeHex }}
                  />
                  {spriteSrc ? (
                    <img
                      src={spriteSrc}
                      alt={current.name}
                      className="w-44 h-44 sm:w-52 sm:h-52 object-contain drop-shadow-xl"
                    />
                  ) : (
                    <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl bg-cream flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                      </svg>
                    </div>
                  )}
                </motion.div>
                <div className="flex justify-center mt-2">
                  <button
                    onClick={() => setShiny(s => !s)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                      shiny
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                        : 'bg-cream text-gray-500 border border-transparent hover:border-gray-300'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {shiny ? 'Shiny' : 'Normal'}
                  </button>
                </div>
              </div>

            </div>
          </motion.div>

          {/* ── Base Stats ──────────────────────────────────────────────────── */}
          <motion.div
            className="app-card p-5"
            custom={1}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <h3 className="dex-section-heading">Base Stats</h3>
            <StatsChart stats={current.baseStats} typeHex={typeHex} />
          </motion.div>

          {/* ── Evolutions ──────────────────────────────────────────────────── */}
          {current.evolutions?.length > 0 && (
            <motion.div
              className="app-card p-5"
              custom={2}
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <h3 className="dex-section-heading">Evolution Chain</h3>
              <EvolutionChain evolutions={current.evolutions} />
            </motion.div>
          )}

          {/* ── Moves ───────────────────────────────────────────────────────── */}
          {current.moves?.length > 0 && (
            <motion.div
              className="app-card p-5"
              custom={3}
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <h3 className="dex-section-heading">Moves</h3>
              <MovesList moves={current.moves} />
            </motion.div>
          )}

        </div>
      )}
    </AppLayout>
  )
}
