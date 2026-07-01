import { motion } from 'framer-motion'
import { PokemonData } from '../../types/pokemon'
import type { UserProgressData } from '../../types/user'
import { TypeBadge } from './TypeBadge'
import { useSound } from '../../hooks/useSound'
import { useNavigate } from 'react-router-dom'

interface PokemonCardProps {
  pokemon: PokemonData
  progress?: UserProgressData | null
}

const TYPE_ACCENT: Record<string, string> = {
  normal: 'bg-gray-400', fire: 'bg-orange-500', water: 'bg-blue-500',
  electric: 'bg-yellow-400', grass: 'bg-green-500', ice: 'bg-cyan-400',
  fighting: 'bg-red-600', poison: 'bg-purple-500', ground: 'bg-amber-500',
  flying: 'bg-indigo-400', psychic: 'bg-pink-500', bug: 'bg-lime-500',
  rock: 'bg-yellow-600', ghost: 'bg-purple-700', dragon: 'bg-indigo-600',
  dark: 'bg-gray-700', steel: 'bg-slate-400', fairy: 'bg-pink-400',
}

const TYPE_SPRITE_BG: Record<string, string> = {
  normal: 'bg-gray-400/10', fire: 'bg-orange-500/10', water: 'bg-blue-500/10',
  electric: 'bg-yellow-400/15', grass: 'bg-green-500/10', ice: 'bg-cyan-400/12',
  fighting: 'bg-red-600/10', poison: 'bg-purple-500/10', ground: 'bg-amber-500/10',
  flying: 'bg-indigo-400/12', psychic: 'bg-pink-500/10', bug: 'bg-lime-500/10',
  rock: 'bg-yellow-600/10', ghost: 'bg-purple-700/10', dragon: 'bg-indigo-600/10',
  dark: 'bg-gray-700/10', steel: 'bg-slate-400/10', fairy: 'bg-pink-400/10',
}

export function PokemonCard({ pokemon, progress }: PokemonCardProps) {
  const navigate = useNavigate()
  const { playBip } = useSound()

  const primaryType = pokemon.types[0] ?? 'normal'
  const accentClass = TYPE_ACCENT[primaryType] ?? 'bg-gray-300'
  const spriteBgClass = TYPE_SPRITE_BG[primaryType] ?? 'bg-bone'
  const dexNum = `#${String(pokemon.nationalDexNumber).padStart(3, '0')}`

  const handleClick = () => {
    playBip()
    navigate(`/pokemon/${pokemon.id}`)
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="w-full app-card flex items-center gap-0 relative overflow-hidden
                 hover:border-pokedex-red/30 hover:shadow-lg
                 transition-[border-color,box-shadow] duration-200 cursor-pointer text-left group"
    >
      {/* Type accent bar */}
      <div className={`w-1 self-stretch flex-shrink-0 ${accentClass}`} />

      {/* Sprite */}
      <div className={`w-16 h-16 flex items-center justify-center flex-shrink-0 m-3 rounded-xl ${spriteBgClass}`}>
        {pokemon.spriteUrl ? (
          <img
            src={pokemon.spriteUrl}
            alt={pokemon.name}
            className="w-14 h-14 object-contain group-hover:scale-110 transition-transform duration-200 drop-shadow-sm"
          />
        ) : (
          <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-3 pr-2">
        <span className="text-[10px] font-mono font-medium text-gray-400 tabular-nums">{dexNum}</span>
        <h3 className="font-bold text-charcoal capitalize text-sm leading-snug truncate mt-0.5
                       group-hover:text-pokedex-red transition-colors duration-150">
          {pokemon.name}
        </h3>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {pokemon.types.map(type => (
            <TypeBadge key={type} type={type} size="sm" />
          ))}
        </div>
      </div>

      {/* Status + chevron */}
      <div className="flex items-center gap-2 pr-4 flex-shrink-0">
        {progress?.status === 'CAUGHT' && (
          <span className="w-5 h-5 rounded-full bg-pokedex-cyan flex items-center justify-center shadow-sm flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
        )}
        {progress?.status === 'SEEN' && (
          <span className="w-5 h-5 rounded-full bg-pokedex-amber flex items-center justify-center shadow-sm flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
        )}
        <svg
          className="w-4 h-4 text-cream-dark group-hover:text-pokedex-red group-hover:translate-x-0.5
                     transition-all duration-150 flex-shrink-0"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.button>
  )
}
