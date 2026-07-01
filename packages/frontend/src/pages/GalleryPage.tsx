import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { SearchBar } from '../components/search/SearchBar'
import { TypeBadge } from '../components/pokedex/TypeBadge'
import { FilterPanel } from '../components/search/FilterPanel'
import { usePokemonStore } from '../stores/pokemonStore'
import { useUserProgress } from '../hooks/useUserProgress'
import { useTranslation } from '../i18n/useTranslation'

const PAGE_SIZE = 48

const TYPE_SPRITE_BG: Record<string, string> = {
  normal: 'bg-gray-400/10', fire: 'bg-orange-500/10', water: 'bg-blue-500/10',
  electric: 'bg-yellow-400/15', grass: 'bg-green-500/10', ice: 'bg-cyan-400/12',
  fighting: 'bg-red-600/10', poison: 'bg-purple-500/10', ground: 'bg-amber-500/10',
  flying: 'bg-indigo-400/12', psychic: 'bg-pink-500/10', bug: 'bg-lime-500/10',
  rock: 'bg-yellow-600/10', ghost: 'bg-purple-700/10', dragon: 'bg-indigo-600/10',
  dark: 'bg-gray-700/10', steel: 'bg-slate-400/10', fairy: 'bg-pink-400/10',
}

export function GalleryPage() {
  const navigate = useNavigate()
  const { list, total, loading, fetchList } = usePokemonStore()
  const { progress } = useUserProgress()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<string | undefined>()
  const [gen, setGen] = useState<number | undefined>()
  const { t } = useTranslation()
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set())

  const progressMap = useMemo(() => {
    const map = new Map<string, typeof progress[number]>()
    for (const p of progress) {
      map.set(p.pokemonId, p)
    }
    return map
  }, [progress])

  const handleTypeChange = useCallback((t: string | undefined) => {
    setType(t)
    setPage(1)
  }, [])

  const handleGenChange = useCallback((g: number | undefined) => {
    setGen(g)
    setPage(1)
  }, [])

  const handleSearch = useCallback((q: string) => {
    setSearch(q)
    setPage(1)
  }, [])

  useEffect(() => {
    fetchList({ page, limit: PAGE_SIZE, search: search || undefined, type, generation: gen })
  }, [page, search, type, gen, fetchList])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <AppLayout>
      <PageHeader title={t('gallery.title')} subtitle={t('gallery.subtitle')} />
      <div className="mb-4">
        <SearchBar onSearch={handleSearch} />
      </div>

      <FilterPanel
        selectedType={type}
        selectedGen={gen}
        onTypeChange={handleTypeChange}
        onGenChange={handleGenChange}
      />

      <div className="mt-5">
        {!loading && list.length > 0 && (
          <p className="app-count-label mb-3">
            {total} {t('gallery.total')}
          </p>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      )}

      {!loading && list.length === 0 && (
        <div className="text-center py-20">
          <p className="dex-empty">{t('gallery.empty')}</p>
        </div>
      )}

      {!loading && list.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {list.map(pokemon => {
              const imgKey = `${pokemon.id}-${pokemon.nationalDexNumber}`
              const hasError = imgErrors.has(imgKey)
              const pokemonProgress = progressMap.get(pokemon.id)
              const progressStatus = pokemonProgress?.status
              const primaryType = pokemon.types[0] ?? 'normal'
              const spriteBg = TYPE_SPRITE_BG[primaryType] ?? 'bg-bone'
              const borderClass = progressStatus === 'CAUGHT'
                ? 'border-pokedex-cyan/50'
                : progressStatus === 'SEEN'
                  ? 'border-pokedex-amber/40'
                  : ''

              return (
                <motion.button
                  key={pokemon.id}
                  onClick={() => navigate(`/pokemon/${pokemon.id}`)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  className={`group app-card overflow-hidden flex flex-col text-left relative
                              hover:shadow-xl hover:border-pokedex-red/30
                              transition-[border-color,box-shadow] duration-200 ${borderClass}`}
                >
                  {/* Type-tinted sprite area */}
                  <div className={`${spriteBg} flex items-center justify-center relative`} style={{ height: 96 }}>
                    <span className="absolute top-1.5 left-2 text-[9px] font-mono font-semibold text-gray-400 tabular-nums">
                      #{String(pokemon.nationalDexNumber).padStart(3, '0')}
                    </span>

                    {progressStatus === 'CAUGHT' && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-pokedex-cyan flex items-center justify-center shadow-sm">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </span>
                    )}
                    {progressStatus === 'SEEN' && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-pokedex-amber flex items-center justify-center shadow-sm">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                    )}

                    {!hasError && (pokemon.artworkUrl ?? pokemon.spriteUrl) ? (
                      <img
                        src={pokemon.artworkUrl ?? pokemon.spriteUrl ?? ''}
                        alt={pokemon.name}
                        className="h-20 w-20 object-contain group-hover:scale-110 transition-transform duration-200 drop-shadow-sm"
                        onError={() => setImgErrors(prev => new Set(prev).add(imgKey))}
                      />
                    ) : (
                      <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                      </svg>
                    )}
                  </div>

                  {/* Info section */}
                  <div className="px-2.5 py-2 border-t border-cream-dark/50">
                    <p className="font-bold text-charcoal text-sm capitalize truncate leading-snug
                                  group-hover:text-pokedex-red transition-colors duration-150">
                      {pokemon.name}
                    </p>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {pokemon.types.map(type => (
                        <TypeBadge key={type} type={type} size="sm" />
                      ))}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-3 mt-8 pb-4">
            <motion.button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-150
                         bg-cream text-charcoal hover:bg-cream-dark hover:text-pokedex-red
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t('gallery.previous')}
            </motion.button>
            <span className="text-sm font-mono text-gray-500 tabular-nums">
              {page} / {totalPages || 1}
            </span>
            <motion.button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-150
                         bg-cream text-charcoal hover:bg-cream-dark hover:text-pokedex-red
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t('gallery.next')}
            </motion.button>
          </div>
        </>
      )}
    </AppLayout>
  )
}
