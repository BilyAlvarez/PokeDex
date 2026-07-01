import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from '../../i18n/useTranslation'

const LEFT_ITEMS = [
  {
    to: '/home',
    labelKey: 'nav.home' as const,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    to: '/gallery',
    labelKey: 'nav.gallery' as const,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
]

const RIGHT_ITEMS = [
  {
    to: '/pokedex',
    labelKey: 'nav.pokedex' as const,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    to: '/assistant',
    labelKey: 'nav.assistant' as const,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
]

function NavItem({ to, labelKey, icon }: { to: string; labelKey: string; icon: React.ReactNode }) {
  const { t } = useTranslation()
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 transition-colors duration-150
         ${isActive ? 'text-pokedex-red' : 'text-gray-400'}`
      }
    >
      {({ isActive }) => (
        <>
          <motion.span
            animate={{ scale: isActive ? 1.1 : 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {icon}
          </motion.span>
          <span className="text-[10px] font-semibold leading-none">{t(labelKey)}</span>
        </>
      )}
    </NavLink>
  )
}

export function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 app-card rounded-none border-x-0 border-b-0
                    flex items-end"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="w-full flex items-center h-16">

        {/* Left items */}
        {LEFT_ITEMS.map(item => (
          <NavItem key={item.to} {...item} />
        ))}

        {/* Center — Scan (featured) */}
        <div className="flex flex-col items-center justify-center flex-1 relative">
          <NavLink to="/scan" aria-label={t('nav.scan')}>
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.93 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg
                            -translate-y-4 border-4 border-white
                            ${isActive ? 'bg-pokedex-dark' : 'bg-pokedex-red'}`}
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              </motion.div>
            )}
          </NavLink>
        </div>

        {/* Right items */}
        {RIGHT_ITEMS.map(item => (
          <NavItem key={item.to} {...item} />
        ))}

      </div>
    </nav>
  )
}
