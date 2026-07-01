import { useState } from 'react'
import { motion } from 'framer-motion'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { TypeBadge } from '../components/pokedex/TypeBadge'
import { useTranslation } from '../i18n/useTranslation'
import { TYPE_CHART, TYPES } from '../data/typeChart'

function getEffectiveness(attackType: string, defenderTypes: string[]): number {
  let multiplier = 1
  for (const dt of defenderTypes) {
    const m = TYPE_CHART[attackType]?.[dt]
    if (m !== undefined) multiplier *= m
  }
  return multiplier
}

function getDefensiveInfo(type: string): { weaknesses: string[]; resistances: string[]; immunities: string[] } {
  const weaknesses: string[] = []
  const resistances: string[] = []
  const immunities: string[] = []
  for (const [attacker, targets] of Object.entries(TYPE_CHART)) {
    const m = targets[type]
    if (m === 2) weaknesses.push(attacker)
    else if (m === 0.5) resistances.push(attacker)
    else if (m === 0) immunities.push(attacker)
  }
  return { weaknesses, resistances, immunities }
}

export function TypeChartPage() {
  const { t } = useTranslation()
  const [attackType, setAttackType] = useState('fire')
  const [defenderTypes, setDefenderTypes] = useState<string[]>([])

  const toggleDefender = (type: string) => {
    setDefenderTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : prev.length < 2 ? [...prev, type] : prev
    )
  }

  const effectiveness = defenderTypes.length > 0 ? getEffectiveness(attackType, defenderTypes) : null

  const effLabel = () => {
    if (effectiveness === null) return null
    if (effectiveness === 0) return { text: t('typeChart.immune'), cls: 'text-gray-400' }
    if (effectiveness === 0.25) return { text: '¼×', cls: 'text-red-400' }
    if (effectiveness === 0.5) return { text: `½× — ${t('typeChart.notVery')}`, cls: 'text-red-400' }
    if (effectiveness === 1) return { text: t('typeChart.normal'), cls: 'text-gray-600' }
    if (effectiveness === 2) return { text: `2× — ${t('typeChart.superEffective')}`, cls: 'text-green-600' }
    if (effectiveness === 4) return { text: '4×', cls: 'text-green-700 font-bold' }
    return { text: `${effectiveness}×`, cls: 'text-gray-600' }
  }

  const eff = effLabel()

  return (
    <AppLayout>
      <PageHeader title={t('typeChart.title')} subtitle={t('typeChart.subtitle')} showBack />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="app-card p-5 space-y-4"
        >
          <h3 className="dex-section-heading">{t('typeChart.attack')}</h3>

          <div className="flex flex-wrap gap-3">
            <div className="w-full sm:w-48">
              <label className="block text-xs font-semibold text-gray-500 mb-1">{t('typeChart.attackType')}</label>
              <select
                value={attackType}
                onChange={e => setAttackType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium capitalize focus:outline-none focus:ring-2 focus:ring-pokedex-red/30"
              >
                {TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{t('typeChart.defenderType')}</label>
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map(type => {
                  const selected = defenderTypes.includes(type)
                  return (
                    <button
                      key={type}
                      onClick={() => toggleDefender(type)}
                      className={`text-xs font-semibold px-2 py-1 rounded-full capitalize transition-colors cursor-pointer ${
                        selected
                          ? 'bg-pokedex-red text-white'
                          : 'bg-cream text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {effectiveness !== null && eff && (
            <div className="pt-2">
              <span className="text-xs font-semibold text-gray-500 mr-2">{t('typeChart.effectiveness')}:</span>
              <span className={`text-lg font-bold ${eff.cls}`}>{eff.text}</span>
            </div>
          )}
        </motion.div>

        {/* Defense Grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="app-card p-5"
        >
          <h3 className="dex-section-heading mb-4">{t('typeChart.defense')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TYPES.map(type => {
              const info = getDefensiveInfo(type)
              return (
                <div key={type} className="border border-gray-100 rounded-xl p-3 bg-white/60">
                  <div className="mb-2">
                    <TypeBadge type={type} size="sm" />
                  </div>
                  {info.immunities.length > 0 && (
                    <div className="mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Immune: </span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {info.immunities.map(t => (
                          <span key={t} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 capitalize">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {info.resistances.length > 0 && (
                    <div className="mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Resists: </span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {info.resistances.map(t => (
                          <span key={t} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-50 text-green-700 capitalize">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {info.weaknesses.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Weak to: </span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {info.weaknesses.map(t => (
                          <span key={t} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-600 capitalize">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
