import { useState } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBar({ onSearch, placeholder = 'Search Pokémon...' }: SearchBarProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(value)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#F5F0E8] border-2 border-[#E8E0D0] rounded-lg px-4 py-2 pr-10
                   text-[#2D2D2D] placeholder-gray-400 font-mono text-sm
                   focus:outline-none focus:border-[#CC1F1F] transition-colors"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#CC1F1F] cursor-pointer"
      >
        🔍
      </button>
    </form>
  )
}
