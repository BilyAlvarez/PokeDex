import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useUserStore } from '../../stores/userStore'
import { usePokemonStore } from '../../stores/pokemonStore'
import { usePreferencesStore } from '../../stores/preferencesStore'
import { useTranslation } from '../../i18n/useTranslation'
import { useAvatar } from '../../hooks/useAvatar'
import { TypeBadge } from '../pokedex/TypeBadge'
import { PokeBall } from '../ui/PokeBall'

const NAV_KEYS = [
  'home', 'scan', 'pokedex', 'gallery', 'assistant', 'search',
] as const

const NAV_ICONS: Record<string, React.ReactNode> = {
  home: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  scan: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  ),
  search: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  pokedex: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  gallery: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  assistant: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
}

const USER_MENU_KEYS = [
  { key: 'viewProfile' as const, to: '/profile' },
  { key: 'editProfile' as const, to: '/profile/edit' },
  { key: 'editCredentials' as const, to: '/profile/credentials' },
  { key: 'preferences' as const, to: '/profile/preferences' },
  { key: 'settingsAccessibility' as const, to: '/profile/settings' },
  { key: 'supportTickets' as const, to: '/profile/tickets' },
]

export function Navbar() {
  const { user } = useAuth()
  const logout = useUserStore(s => s.logout)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const overlayRef = useRef<HTMLDivElement>(null)
  const desktopSearchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const { list, loading, fetchList, total } = usePokemonStore()

  const { language, toggleLanguage, theme, toggleTheme } = usePreferencesStore()
  const { t } = useTranslation()
  const { spriteUrl } = useAvatar()

  const handleSearchOpen = () => {
    setSearchOpen(true)
    setSearchQuery('')
    setActiveIndex(-1)
    setTimeout(() => searchInputRef.current?.focus(), 100)
  }

  const handleSearchClose = useCallback(() => {
    setSearchOpen(false)
    setSearchQuery('')
    setActiveIndex(-1)
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setSearchQuery(q)
    setActiveIndex(-1)
    fetchList({ page: 1, limit: 8, search: q || undefined })
  }, [fetchList])

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, list.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0 && list[activeIndex]) {
      e.preventDefault()
      handleSearchClose()
      navigate(`/pokemon/${list[activeIndex].id}`)
    }
  }, [activeIndex, list, handleSearchClose, navigate])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        handleSearchClose()
      }
    }
    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchOpen, handleSearchClose])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target as Node)) {
        handleSearchClose()
      }
    }
    if (searchOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [searchOpen, handleSearchClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSearchClose()
    }
    if (searchOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen, handleSearchClose])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/login')
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="sticky top-0 z-30 bg-pokedex-red shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-2 h-14 flex items-center gap-4">

        <NavLink to="/home" className="flex items-center gap-2 shrink-0 group">
          <PokeBall variant="standard" size={22} className="opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-sm" />
          <img
            src={theme === 'dark'
              ? '/icons/logo-pokedex-contorno-azul.png'
              : '/icons/logo-pokedex-contorno-negro.png'}
            alt="Pokédex"
            className="h-8 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-sm hidden sm:block"
          />
        </NavLink>

        <div className="w-px h-5 bg-white/25 shrink-0 hidden sm:block" />

        <div className="flex-1 hidden sm:flex items-center gap-0.5 overflow-x-auto scrollbar-hide min-w-0">
          {NAV_KEYS.map(key => (
            key === 'search' ? (
              <button
                key={key}
                onClick={handleSearchOpen}
                className="sm:hidden flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
                           whitespace-nowrap transition-all duration-150 cursor-pointer
                           text-white/65 hover:text-white hover:bg-white/10"
                aria-label={t('nav.search')}
              >
                {NAV_ICONS[key]}
              </button>
            ) : (
              <NavLink
                key={key}
                to={`/${key === 'home' ? '' : key === 'pokedex' ? 'pokedex' : key}`}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
                   whitespace-nowrap transition-all duration-150
                   ${isActive
                     ? 'bg-white/20 text-white shadow-sm'
                     : 'text-white/65 hover:text-white hover:bg-white/10'}`
                }
              >
                {NAV_ICONS[key]}
                <span className="hidden sm:inline">{t(`nav.${key}`)}</span>
              </NavLink>
            )
          ))}
        </div>

        {/* Search bar — always visible, fills space on mobile */}
        <div ref={desktopSearchRef} className="flex items-center relative flex-1 sm:flex-none sm:shrink-0 mx-1 sm:mx-0">
          <div className="relative w-full">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50 pointer-events-none"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder={t('nav.search')}
              className="bg-white/15 border border-white/20 rounded-lg pl-8 pr-3 py-1.5
                         text-xs text-white placeholder-white/40 w-full sm:w-36 sm:focus:w-52
                         focus:outline-none focus:bg-white/25 focus:border-white/40 transition-all duration-200"
            />
          </div>

          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                className="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-xl shadow-2xl
                           border border-cream overflow-hidden z-50"
              >
                <div className="max-h-80 overflow-y-auto">
                  {searchQuery && loading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-5 h-5 border-2 border-pokedex-red border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {!searchQuery && (
                    <p className="text-center text-xs text-gray-400 py-6">{t('searchBar.placeholder')}</p>
                  )}
                  {searchQuery && !loading && list.length === 0 && (
                    <p className="text-center text-xs text-gray-400 py-6">{t('search.empty')}</p>
                  )}
                  <div ref={listRef}>
                  {!loading && list.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => { handleSearchClose(); navigate(`/pokemon/${p.id}`) }}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left cursor-pointer border-b border-cream/50 last:border-0 ${
                        i === activeIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-bone flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {p.spriteUrl
                          ? <img src={p.spriteUrl} alt={p.name} className="w-8 h-8 object-contain" />
                          : <span className="text-xs text-gray-400">?</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xxs text-gray-400 font-mono tabular-nums">
                            #{String(p.nationalDexNumber).padStart(3, '0')}
                          </span>
                          <span className="text-sm font-semibold text-charcoal capitalize truncate">{p.name}</span>
                        </div>
                        <div className="flex gap-1 mt-0.5">
                          {p.types.map(type => <TypeBadge key={type} type={type} size="sm" />)}
                        </div>
                      </div>
                    </button>
                  ))}
                  {searchQuery && !loading && list.length > 0 && total > list.length && (
                    <button
                      onClick={() => { handleSearchClose(); navigate('/search') }}
                      className="w-full text-center text-xs font-semibold text-pokedex-red py-3
                                 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      {t('search.results')} ({total})
                    </button>
                  )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Language & theme toggles (always visible) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-7 h-7 rounded-lg
                       text-white/65 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title={theme === 'light' ? t('nav.themeLight') : t('nav.themeDark')}
          >
            {theme === 'light' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>

          <button
            onClick={toggleLanguage}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-xxs font-bold
                       text-white/65 hover:text-white hover:bg-white/10 transition-all cursor-pointer
                       uppercase tracking-wider"
            title={language === 'en' ? t('nav.langEn') : t('nav.langEs')}
          >
            {language}
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `hidden sm:flex items-center gap-1 text-xxs font-mono font-bold px-2 py-1
                     rounded-md uppercase tracking-wider transition-colors
                     ${isActive
                       ? 'bg-pokedex-amber text-charcoal'
                       : 'border border-pokedex-amber/50 text-pokedex-amber hover:bg-pokedex-amber/15'}`
                  }
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  {t('nav.admin')}
                </NavLink>
              )}

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  className="flex items-center gap-1.5 cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-full bg-white/20 border border-white/30
                                  flex items-center justify-center flex-shrink-0 overflow-hidden
                                  group-hover:bg-white/30 transition-colors">
                    {spriteUrl ? (
                      <img src={spriteUrl} alt="avatar" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs font-bold text-white uppercase leading-none">
                        {user.username[0]}
                      </span>
                    )}
                  </div>
                  <svg className={`w-3 h-3 text-white/50 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                       fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -6 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                    className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl
                                  border border-cream py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-cream/80">
                      <p className="text-sm font-bold text-charcoal truncate">{user.username}</p>
                      <p className="text-xxs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      {USER_MENU_KEYS.map(item => (
                        <NavLink
                          key={item.key}
                          to={item.to}
                          onClick={closeMenu}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-4 py-2 text-sm transition-colors
                             ${isActive
                               ? 'bg-pokedex-red/5 text-pokedex-red font-semibold'
                               : 'text-charcoal hover:bg-gray-50'}`
                          }
                        >
                          {t(`nav.${item.key}`)}
                        </NavLink>
                      ))}
                    </div>
                    {user.role === 'ADMIN' && (
                      <div className="border-t border-cream/80 pt-1">
                        <NavLink
                          to="/admin"
                          onClick={closeMenu}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-4 py-2 text-sm transition-colors
                             ${isActive
                               ? 'bg-pokedex-red/5 text-pokedex-red font-semibold'
                               : 'text-charcoal hover:bg-gray-50'}`
                          }
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                          </svg>
                          {t('nav.admin')}
                        </NavLink>
                      </div>
                    )}
                    <div className="border-t border-cream/80 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-500
                                   hover:text-pokedex-red hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        {t('nav.logout')}
                      </button>
                    </div>
                    <div className="border-t border-cream/80 px-4 py-2">
                      <p className="text-xxs text-gray-400 text-center leading-relaxed">
                        Pokédex &mdash; <span className="font-medium text-gray-500">BMAS-DEV</span>
                      </p>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <NavLink
              to="/login"
              className="flex items-center gap-1.5 text-xs bg-white text-pokedex-red
                         font-semibold px-3 py-1.5 rounded-lg hover:bg-bone transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              {t('nav.signIn')}
            </NavLink>
          )}
        </div>
      </div>

      {/* Search overlay */}
      <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="sm:hidden absolute left-0 right-0 top-full z-50 px-4 pb-4"
          ref={overlayRef}
        >
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-cream dark:border-gray-700 overflow-hidden">
            <div className="p-4 pb-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={t('searchBar.placeholder')}
                  className="w-full bg-bone dark:bg-gray-700 border border-cream dark:border-gray-600 rounded-xl pl-10 pr-4 py-2.5
                             text-sm text-charcoal dark:text-gray-200 placeholder-gray-400
                             focus:outline-none focus:border-pokedex-red focus:ring-2 focus:ring-pokedex-red/10 transition-all"
                />
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto border-t border-cream dark:border-gray-700">
              {searchQuery && loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-pokedex-red border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!searchQuery && !loading && (
                <p className="text-center text-xs text-gray-400 py-8">{t('searchBar.placeholder')}</p>
              )}
              {searchQuery && !loading && list.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-8">{t('search.empty')}</p>
              )}
              <div ref={listRef}>
              {!loading && list.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => { handleSearchClose(); navigate(`/pokemon/${p.id}`) }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left cursor-pointer border-b border-cream/50 dark:border-gray-700/50 last:border-0 ${
                    i === activeIndex ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-bone dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {p.spriteUrl ? (
                      <img src={p.spriteUrl} alt={p.name} className="w-9 h-9 object-contain" />
                    ) : (
                      <span className="text-sm text-gray-400">?</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xxs text-gray-400 font-mono tabular-nums">
                        #{String(p.nationalDexNumber).padStart(3, '0')}
                      </span>
                      <span className="text-sm font-semibold text-charcoal dark:text-gray-200 capitalize truncate">
                        {p.name}
                      </span>
                    </div>
                    <div className="flex gap-1 mt-0.5">
                      {p.types.map(type => (
                        <TypeBadge key={type} type={type} size="sm" />
                      ))}
                    </div>
                  </div>
                  {total > 8 && (
                    <span className="text-xxs text-gray-400 shrink-0">{t('gallery.total')}</span>
                  )}
                </button>
              ))}
              {searchQuery && !loading && list.length > 0 && total > list.length && (
                <button
                  onClick={() => { handleSearchClose(); navigate('/') }}
                  className="w-full text-center text-xs font-semibold text-pokedex-red py-3
                             hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  {t('search.results')} ({total})
                </button>
              )}
            </div>
          </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </nav>
  )
}
