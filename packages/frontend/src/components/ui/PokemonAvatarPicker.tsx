import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const POKEMON = [
  { id: 1, name: 'Bulbasaur' }, { id: 4, name: 'Charmander' }, { id: 7, name: 'Squirtle' },
  { id: 25, name: 'Pikachu' }, { id: 39, name: 'Jigglypuff' }, { id: 52, name: 'Meowth' },
  { id: 59, name: 'Arcanine' }, { id: 94, name: 'Gengar' }, { id: 131, name: 'Lapras' },
  { id: 133, name: 'Eevee' }, { id: 143, name: 'Snorlax' }, { id: 144, name: 'Articuno' },
  { id: 145, name: 'Zapdos' }, { id: 146, name: 'Moltres' }, { id: 150, name: 'Mewtwo' },
  { id: 151, name: 'Mew' }, { id: 152, name: 'Chikorita' }, { id: 155, name: 'Cyndaquil' },
  { id: 158, name: 'Totodile' }, { id: 175, name: 'Togepi' }, { id: 196, name: 'Espeon' },
  { id: 197, name: 'Umbreon' }, { id: 245, name: 'Suicune' }, { id: 249, name: 'Lugia' },
  { id: 250, name: 'Ho-oh' }, { id: 252, name: 'Treecko' }, { id: 255, name: 'Torchic' },
  { id: 258, name: 'Mudkip' }, { id: 282, name: 'Gardevoir' }, { id: 384, name: 'Rayquaza' },
  { id: 385, name: 'Jirachi' }, { id: 387, name: 'Turtwig' }, { id: 390, name: 'Chimchar' },
  { id: 393, name: 'Piplup' }, { id: 448, name: 'Lucario' }, { id: 483, name: 'Dialga' },
  { id: 484, name: 'Palkia' }, { id: 487, name: 'Giratina' }, { id: 495, name: 'Snivy' },
  { id: 498, name: 'Tepig' }, { id: 501, name: 'Oshawott' }, { id: 643, name: 'Reshiram' },
  { id: 644, name: 'Zekrom' }, { id: 650, name: 'Chespin' }, { id: 653, name: 'Fennekin' },
  { id: 656, name: 'Froakie' }, { id: 658, name: 'Greninja' }, { id: 700, name: 'Sylveon' },
  { id: 717, name: 'Yveltal' }, { id: 718, name: 'Zygarde' },
]

interface PokemonAvatarPickerProps {
  currentId: number | null
  onSelect: (id: number) => void
  onClose: () => void
}

export function PokemonAvatarPicker({ currentId, onSelect, onClose }: PokemonAvatarPickerProps) {
  const [search, setSearch] = useState('')
  const [customNum, setCustomNum] = useState('')

  const filtered = POKEMON.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    String(p.id).startsWith(search)
  )

  const handleCustom = () => {
    const n = parseInt(customNum, 10)
    if (n >= 1 && n <= 898) {
      onSelect(n)
      setCustomNum('')
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-cream shrink-0">
            <div>
              <h2 className="font-bold text-charcoal text-sm">Choose your Pokémon</h2>
              <p className="text-xs text-gray-400 mt-0.5">Select a Pokémon as your profile avatar</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-bone flex items-center justify-center
                         hover:bg-cream transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2 border-b border-cream shrink-0">
            <input
              type="text"
              placeholder="Search by name or number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="dex-input"
              autoFocus
            />
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-3">
            {filtered.length === 0 ? (
              <p className="dex-empty py-8">No Pokémon found</p>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
                {filtered.map(({ id, name }) => (
                  <button
                    key={id}
                    onClick={() => onSelect(id)}
                    title={name}
                    className={`flex flex-col items-center gap-0.5 p-2 rounded-xl cursor-pointer
                                transition-all duration-150
                                ${currentId === id
                                  ? 'bg-pokedex-red/10 ring-2 ring-pokedex-red/40'
                                  : 'hover:bg-bone'}`}
                  >
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                      alt={name}
                      className="w-10 h-10 object-contain"
                      loading="lazy"
                    />
                    <span className="text-[9px] text-gray-400 truncate w-full text-center leading-tight">
                      {name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom number input */}
          <div className="px-3 py-3 border-t border-cream shrink-0 flex gap-2">
            <input
              type="number"
              placeholder="Enter Pokédex # (1–898)"
              value={customNum}
              onChange={e => setCustomNum(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustom()}
              min={1}
              max={898}
              className="dex-input flex-1"
            />
            <button
              onClick={handleCustom}
              disabled={!customNum || parseInt(customNum) < 1 || parseInt(customNum) > 898}
              className="px-4 py-2 bg-pokedex-red text-white text-sm font-semibold rounded-lg
                         hover:bg-pokedex-dark transition-colors cursor-pointer shrink-0
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Use
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
