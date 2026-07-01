import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { PokemonCard } from '../components/pokedex/PokemonCard'
import { ProgressBar } from '../components/pokedex/ProgressBar'
import { PokemonCardSkeleton } from '../components/ui/PokemonCardSkeleton'
import { Button } from '../components/ui/Button'
import { usePokemonStore } from '../stores/pokemonStore'
import { useUserStore } from '../stores/userStore'
import { useUserProgress } from '../hooks/useUserProgress'
import { useTranslation } from '../i18n/useTranslation'

const TOTAL_POKEMON = 898

export function MyPokedexPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { list, total, loading, fetchList } = usePokemonStore()
  const { token } = useUserStore()
  const { progress } = useUserProgress()
  const [page, setPage] = useState(1)
  const limit = 20

  const progressMap = useMemo(() => {
    const map = new Map<string, typeof progress[number]>()
    for (const p of progress) {
      map.set(p.pokemonId, p)
    }
    return map
  }, [progress])

  const seenCount = useMemo(() =>
    progress.filter(p => p.status === 'SEEN' || p.status === 'CAUGHT').length,
    [progress]
  )

  const caughtCount = useMemo(() =>
    progress.filter(p => p.status === 'CAUGHT').length,
    [progress]
  )

  useEffect(() => {
    fetchList({ page, limit })
  }, [page, fetchList])

  return (
    <AppLayout>
      <PageHeader title={t('pokedex.title')} subtitle={t('pokedex.subtitle')} />

      {token && (
        <div className="app-card p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-charcoal">{t('pokedex.collectionProgress')}</p>
            <span className="dex-dex-number">{seenCount} {t('progressBar.of')} {TOTAL_POKEMON}</span>
          </div>
          <ProgressBar current={seenCount} total={TOTAL_POKEMON} />
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <span><span className="font-semibold text-pokedex-cyan">{caughtCount}</span> {t('pokedex.caught')}</span>
            <span><span className="font-semibold text-pokedex-amber">{seenCount - caughtCount}</span> {t('pokedex.seen')}</span>
          </div>
        </div>
      )}

      {!token && (
        <div className="app-card p-8 text-center mb-5">
          <p className="text-sm text-gray-500 mb-4">{t('pokedex.signInToTrack')}</p>
          <Button onClick={() => navigate('/login')}>{t('pokedex.signIn')}</Button>
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 10 }, (_, i) => <PokemonCardSkeleton key={i} />)}
        </div>
      )}

      {!loading && (
        <div className="space-y-2">
          {list.map(p => (
            <PokemonCard key={p.id} pokemon={p} progress={progressMap.get(p.id) ?? null} />
          ))}
        </div>
      )}

      {total > limit && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            {t('pokedex.previous')}
          </Button>
          <span className="text-sm font-mono text-gray-500 tabular-nums">{t('pokedex.page')} {page}</span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page * limit >= total}
            onClick={() => setPage(p => p + 1)}
          >
            {t('pokedex.next')}
          </Button>
        </div>
      )}
    </AppLayout>
  )
}
