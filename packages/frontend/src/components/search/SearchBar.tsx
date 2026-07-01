import { useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBar({ onSearch, placeholder }: SearchBarProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const ph = placeholder ?? t('searchBar.placeholder')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(value)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    onSearch(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={ph}
        className="w-full bg-white dark:bg-gray-800 border border-cream dark:border-gray-600 rounded-xl px-4 py-3 pl-11
                   text-charcoal dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 text-sm
                   shadow-sm focus:outline-none focus:border-pokedex-red
                   focus:ring-2 focus:ring-pokedex-red/10 transition-all"
      />
    </form>
  )
}
