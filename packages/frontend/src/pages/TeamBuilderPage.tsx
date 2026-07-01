import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { useTranslation } from '../i18n/useTranslation'
import { useToast } from '../stores/toastStore'
import { api } from '../services/api'
import { TYPE_CHART, TYPES } from '../data/typeChart'
import type { Team, TeamSlot } from '../types/pokemon'

function getTeamCoverage(slots: TeamSlot[]): { strong: string[]; weak: string[] } {
  const teamTypes = slots.flatMap(s => s.pokemon.types)
  const strong = new Set<string>()
  const weak = new Set<string>()
  for (const t of teamTypes) {
    for (const [defender, mult] of Object.entries(TYPE_CHART[t] ?? {})) {
      if (mult >= 2) strong.add(defender)
    }
  }
  for (const t of teamTypes) {
    for (const [, targets] of Object.entries(TYPE_CHART)) {
      const m = targets[t]
      if (m !== undefined && m >= 2) weak.add(t)
    }
  }
  return { strong: Array.from(strong), weak: Array.from(weak) }
}

export function TeamBuilderPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSlots, setEditSlots] = useState<(TeamSlot | null)[]>([])
  const [pokemonInput, setPokemonInput] = useState('')
  const [selectingSlot, setSelectingSlot] = useState<number | null>(null)

  const reloadTeams = useCallback(async (showError = false) => {
    try {
      const data = await api.team.list()
      setTeams(data)
    } catch {
      if (showError) toast.error('Failed to load teams')
    }
  }, [toast])

  useEffect(() => {
    ;(async () => {
      try {
        await reloadTeams(true)
      } finally {
        setLoading(false)
      }
    })()
  }, [reloadTeams])

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      await api.team.create({ name: newName.trim(), slots: [] })
      setNewName('')
      setShowNewForm(false)
      await reloadTeams()
    } catch {
      toast.error('Failed to create team')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.team.delete(id)
      await reloadTeams()
    } catch {
      toast.error('Failed to delete team')
    }
  }

  const startEdit = (team: Team) => {
    setEditingId(team.id)
    const slots: (TeamSlot | null)[] = []
    for (let i = 0; i < 6; i++) {
      const found = team.slots.find(s => s.slotIndex === i)
      slots.push(found ?? null)
    }
    setEditSlots(slots)
    setSelectingSlot(null)
    setPokemonInput('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditSlots([])
    setSelectingSlot(null)
    setPokemonInput('')
  }

  const handleSlotSelect = async (slotIndex: number) => {
    if (!pokemonInput.trim()) return
    const input = pokemonInput.trim()
    try {
      const dexNum = parseInt(input, 10)
      if (!isNaN(dexNum) && dexNum > 0) {
        const p = await api.pokemon.getByDexNumber(dexNum)
        const newSlot: TeamSlot = { id: `temp-${slotIndex}`, slotIndex, pokemon: p }
        const updated = [...editSlots]
        updated[slotIndex] = newSlot
        setEditSlots(updated)
      }
      setPokemonInput('')
      setSelectingSlot(null)
    } catch {
      toast.error('Pokémon not found')
    }
  }

  const saveEdit = async () => {
    if (!editingId) return
    const slots = editSlots
      .filter((s): s is TeamSlot => s !== null)
      .map(s => ({ pokemonId: s.pokemon.id, slotIndex: s.slotIndex }))
    try {
      await api.team.update(editingId, { slots })
      setEditingId(null)
      setEditSlots([])
      setSelectingSlot(null)
      await reloadTeams()
    } catch {
      toast.error('Failed to save team')
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title={t('teamBuilder.title')}
        subtitle={t('teamBuilder.subtitle')}
        showBack
        action={
          <Button size="sm" onClick={() => setShowNewForm(true)}>
            {t('teamBuilder.newTeam')}
          </Button>
        }
      />

      <div className="max-w-4xl mx-auto space-y-4">
        {/* New team form */}
        {showNewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="app-card p-4 flex items-center gap-3 overflow-hidden"
          >
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder={t('teamBuilder.teamName')}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pokedex-red/30"
            />
            <Button size="sm" onClick={handleCreate}>{t('teamBuilder.save')}</Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowNewForm(false); setNewName('') }}>{t('teamBuilder.cancel')}</Button>
          </motion.div>
        )}

        {/* Team list */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        )}

        {!loading && teams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">{t('teamBuilder.emptySlots')}</p>
          </div>
        )}

        {teams.map(team => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="app-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-charcoal">{team.name}</h3>
              <div className="flex gap-2">
                {editingId === team.id ? (
                  <>
                    <Button size="sm" onClick={saveEdit}>{t('teamBuilder.save')}</Button>
                    <Button size="sm" variant="ghost" onClick={cancelEdit}>{t('teamBuilder.cancel')}</Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => startEdit(team)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(team.id)}>{t('teamBuilder.delete')}</Button>
                  </>
                )}
              </div>
            </div>

            {/* Slot grid */}
            <div className="grid grid-cols-6 gap-2 mb-4">
              {Array.from({ length: 6 }).map((_, i) => {
                const slot = editingId === team.id ? editSlots[i] : team.slots.find(s => s.slotIndex === i) ?? null
                const isSelecting = editingId === team.id && selectingSlot === i
                return (
                  <div key={i} className="relative">
                    {editingId === team.id ? (
                      <>
                        {isSelecting ? (
                          <div className="flex flex-col gap-1">
                            <input
                              type="text"
                              value={pokemonInput}
                              onChange={e => setPokemonInput(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleSlotSelect(i) }}
                              placeholder="Name/#"
                              className="w-full px-2 py-1 text-xs rounded border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-pokedex-red/30"
                              autoFocus
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleSlotSelect(i)}
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-pokedex-red text-white cursor-pointer"
                              >
                                OK
                              </button>
                              <button
                                onClick={() => setSelectingSlot(null)}
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 cursor-pointer"
                              >
                                X
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectingSlot(i)}
                            className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-pokedex-red/40 flex items-center justify-center bg-white/50 hover:bg-white transition-colors cursor-pointer"
                          >
                            {slot ? (
                              <img
                                src={slot.pokemon.spriteUrl ?? ''}
                                alt={slot.pokemon.name}
                                className="w-10 h-10 object-contain"
                              />
                            ) : (
                              <span className="text-xs font-bold text-gray-300">+</span>
                            )}
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="w-full aspect-square rounded-xl border border-gray-100 bg-white/50 flex items-center justify-center">
                        {slot ? (
                          <img
                            src={slot.pokemon.spriteUrl ?? ''}
                            alt={slot.pokemon.name}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <span className="text-xs font-bold text-gray-200">?</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Coverage */}
            {team.slots.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{t('teamBuilder.coverage')}</h4>
                <CoverageSummary slots={editingId === team.id ? editSlots.filter((s): s is TeamSlot => s !== null) : team.slots} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </AppLayout>
  )
}

function CoverageSummary({ slots }: { slots: TeamSlot[] }) {
  const { strong } = getTeamCoverage(slots)
  const allTypes = TYPES

  return (
    <div className="flex flex-wrap gap-1">
      {allTypes.map(type => {
        const isStrong = strong.includes(type)
        return (
          <span
            key={type}
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${
              isStrong ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {type}
          </span>
        )
      })}
    </div>
  )
}
