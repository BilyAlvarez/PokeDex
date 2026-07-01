import { motion } from 'framer-motion'
import { useTranslation } from '../../i18n/useTranslation'

interface FilterPanelProps {
  selectedType?: string
  selectedGen?: number
  onTypeChange: (type: string | undefined) => void
  onGenChange: (gen: number | undefined) => void
}

const TYPES = [
  'bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting',
  'fire', 'flying', 'ghost', 'grass', 'ground', 'ice',
  'normal', 'poison', 'psychic', 'rock', 'steel', 'water',
]
const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const TYPE_DOT: Record<string, string> = {
  bug: '#84cc16', dark: '#374151', dragon: '#4f46e5', electric: '#eab308',
  fairy: '#f472b6', fighting: '#dc2626', fire: '#f97316', flying: '#818cf8',
  ghost: '#7c3aed', grass: '#22c55e', ground: '#d97706', ice: '#06b6d4',
  normal: '#9ca3af', poison: '#a855f7', psychic: '#ec4899', rock: '#ca8a04',
  steel: '#94a3b8', water: '#3b82f6',
}

// All icons use 24x24 viewBox, strokeWidth 1.8, no fill (stroke only)
const TYPE_ICON_PATHS: Record<string, React.ReactNode> = {
  fire: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.375 7.5H12c.003-1.336.178-2.659.524-3.928z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a23.25 23.25 0 01-8 0V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0012 3z" />
    </>
  ),
  water: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C9 8 5 12 5 16a7 7 0 0014 0c0-4-4-8-7-13z" />
  ),
  electric: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  ),
  grass: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1 5-5 7-5 12M12 3c1 5 5 7 5 12M12 3v18M8 9c2 0 4 2 4 6M16 9c-2 0-4 2-4 6" />
  ),
  ice: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M5.636 5.636l12.728 12.728M18.364 5.636L5.636 18.364" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  fighting: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15m.002 0h-.002" />
  ),
  poison: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
  ),
  ground: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 20h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 20V10l5-7 5 7v10" />
    </>
  ),
  flying: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  ),
  psychic: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </>
  ),
  bug: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6a4 4 0 100 12 4 4 0 000-12z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 8L5 5M16 8l3-3M8 16l-3 3M16 16l3 3M4 12H2M22 12h-2" />
    </>
  ),
  rock: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3L2 9l10 12L22 9l-4-6H6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 9h20M6 3l4 6M18 3l-4 6" />
    </>
  ),
  ghost: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4a6 6 0 016 6v8l-2-2-2 2-2-2-2 2-2-2-2 2v-8a6 6 0 016-6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 11h.01M14 11h.01" />
    </>
  ),
  dragon: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l3 6h-2v4l4-2-1 4H8l-1-4 4 2V9H9l3-6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19l-2 2M15 19l2 2" />
    </>
  ),
  dark: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  ),
  steel: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  ),
  fairy: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </>
  ),
  normal: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
  ),
}

const chipMotion = { type: 'spring', stiffness: 500, damping: 28 }

function TypeIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? 'rgba(255,255,255,0.9)' : (TYPE_DOT[type] ?? '#9ca3af')
  return (
    <svg
      className="w-3.5 h-3.5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
    >
      {TYPE_ICON_PATHS[type]}
    </svg>
  )
}

function TypeChip({ type, active, onClick }: { type: string; active: boolean; onClick: () => void }) {
  const { t } = useTranslation()
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      transition={chipMotion}
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 w-full text-xs py-1.5 px-1
                  rounded-lg cursor-pointer font-medium transition-all duration-150 border
                  ${active
                    ? 'bg-pokedex-red text-white border-pokedex-dark shadow-sm'
                    : 'bg-cream text-charcoal border-cream-dark hover:border-pokedex-red/40 hover:text-pokedex-red'}`}
    >
      <TypeIcon type={type} active={active} />
      <span className="truncate">{t(`types.${type}`)}</span>
    </motion.button>
  )
}

const GEN_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']

function GenChip({ gen, active, onClick }: { gen: number; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      transition={chipMotion}
      onClick={onClick}
      className={`w-full text-xs py-1.5 rounded-lg cursor-pointer font-medium
                  transition-all duration-150 border text-center flex flex-col items-center gap-0.5
                  ${active
                    ? 'bg-pokedex-red text-white border-pokedex-dark shadow-sm'
                    : 'bg-cream text-charcoal border-cream-dark hover:border-pokedex-red/40 hover:text-pokedex-red'}`}
    >
      <span className={`text-[10px] font-bold font-mono ${active ? 'text-white/80' : 'text-gray-400'}`}>
        {GEN_ROMAN[gen - 1]}
      </span>
      <span>{gen}</span>
    </motion.button>
  )
}

export function FilterPanel({ selectedType, selectedGen, onTypeChange, onGenChange }: FilterPanelProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4 py-3 border-t border-b border-cream-dark">

      {/* Type filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
            <p className="text-xxs font-bold text-gray-400 uppercase tracking-widest">
              {t('filterPanel.type')}
            </p>
          </div>
          {selectedType && (
            <button
              onClick={() => onTypeChange(undefined)}
              className="text-[10px] text-pokedex-red hover:underline cursor-pointer font-medium"
            >
              {t('filterPanel.clear')}
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-1.5">
          <motion.button
            whileTap={{ scale: 0.88 }}
            transition={chipMotion}
            onClick={() => onTypeChange(undefined)}
            className={`flex items-center justify-center gap-1.5 w-full text-xs py-1.5 rounded-lg
                        cursor-pointer font-medium transition-all duration-150 border
                        ${!selectedType
                          ? 'bg-pokedex-red text-white border-pokedex-dark shadow-sm'
                          : 'bg-cream text-charcoal border-cream-dark hover:border-pokedex-red/40 hover:text-pokedex-red'}`}
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            {t('filterPanel.all')}
          </motion.button>
          {TYPES.map(type => (
            <TypeChip
              key={type}
              type={type}
              active={selectedType === type}
              onClick={() => onTypeChange(selectedType === type ? undefined : type)}
            />
          ))}
        </div>
      </div>

      {/* Generation filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xxs font-bold text-gray-400 uppercase tracking-widest">
              {t('filterPanel.generation')}
            </p>
          </div>
          {selectedGen && (
            <button
              onClick={() => onGenChange(undefined)}
              className="text-[10px] text-pokedex-red hover:underline cursor-pointer font-medium"
            >
              {t('filterPanel.clear')}
            </button>
          )}
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          <motion.button
            whileTap={{ scale: 0.88 }}
            transition={chipMotion}
            onClick={() => onGenChange(undefined)}
            className={`w-full text-xs py-1.5 rounded-lg cursor-pointer font-medium
                        transition-all duration-150 border text-center
                        ${!selectedGen
                          ? 'bg-pokedex-red text-white border-pokedex-dark shadow-sm'
                          : 'bg-cream text-charcoal border-cream-dark hover:border-pokedex-red/40 hover:text-pokedex-red'}`}
          >
            {t('filterPanel.all')}
          </motion.button>
          {GENERATIONS.map(gen => (
            <GenChip
              key={gen}
              gen={gen}
              active={selectedGen === gen}
              onClick={() => onGenChange(selectedGen === gen ? undefined : gen)}
            />
          ))}
        </div>
      </div>

    </div>
  )
}
