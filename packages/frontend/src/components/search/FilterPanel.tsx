interface FilterPanelProps {
  selectedType?: string
  selectedGen?: number
  onTypeChange: (type: string | undefined) => void
  onGenChange: (gen: number | undefined) => void
}

const TYPES = ['bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting', 'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 'normal', 'poison', 'psychic', 'rock', 'steel', 'water']
const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export function FilterPanel({ selectedType, selectedGen, onTypeChange, onGenChange }: FilterPanelProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type</label>
        <div className="flex flex-wrap gap-1 mt-1">
          <button
            onClick={() => onTypeChange(undefined)}
            className={`text-xs px-2 py-1 rounded-full cursor-pointer transition-colors
              ${!selectedType ? 'bg-[#CC1F1F] text-white' : 'bg-[#E8E0D0] text-[#2D2D2D] hover:bg-gray-300'}`}
          >All</button>
          {TYPES.map(type => (
            <button
              key={type}
              onClick={() => onTypeChange(selectedType === type ? undefined : type)}
              className={`text-xs px-2 py-1 rounded-full capitalize cursor-pointer transition-colors
                ${selectedType === type ? 'bg-[#CC1F1F] text-white' : 'bg-[#E8E0D0] text-[#2D2D2D] hover:bg-gray-300'}`}
            >{type}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Generation</label>
        <div className="flex flex-wrap gap-1 mt-1">
          <button
            onClick={() => onGenChange(undefined)}
            className={`text-xs px-2 py-1 rounded-full cursor-pointer transition-colors
              ${!selectedGen ? 'bg-[#CC1F1F] text-white' : 'bg-[#E8E0D0] text-[#2D2D2D] hover:bg-gray-300'}`}
          >All</button>
          {GENERATIONS.map(gen => (
            <button
              key={gen}
              onClick={() => onGenChange(selectedGen === gen ? undefined : gen)}
              className={`text-xs px-2 py-1 rounded-full cursor-pointer transition-colors
                ${selectedGen === gen ? 'bg-[#CC1F1F] text-white' : 'bg-[#E8E0D0] text-[#2D2D2D] hover:bg-gray-300'}`}
            >Gen {gen}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
