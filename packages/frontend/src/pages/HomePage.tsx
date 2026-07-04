import { useState, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppLayout } from '../components/layout/AppLayout'
import { Button } from '../components/ui/Button'
import { PokeBall, PokeBallLarge } from '../components/ui/PokeBall'
import { useTranslation } from '../i18n/useTranslation'
import { useAuth } from '../hooks/useAuth'
import { useUserProgress } from '../hooks/useUserProgress'

const TOTAL_POKEMON = 898

const FEATURES = [
  {
    to: '/scan',
    color: '#cc1f1f',
    bg: 'bg-red-500/8',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
    titleKey: 'home.scan' as const,
    descKey: 'home.scanDesc' as const,
  },
  {
    to: '/gallery',
    color: '#00b4d8',
    bg: 'bg-cyan-500/8',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    titleKey: 'home.galleryLabel' as const,
    descKey: 'home.galleryDesc' as const,
  },
  {
    to: '/pokedex',
    color: '#f2b705',
    bg: 'bg-yellow-400/8',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    titleKey: 'home.pokedex' as const,
    descKey: 'home.pokedexDesc' as const,
  },
  {
    to: '/assistant',
    color: '#a855f7',
    bg: 'bg-purple-500/8',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    titleKey: 'home.assistant' as const,
    descKey: 'home.assistantDesc' as const,
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.32, ease: 'easeOut' },
  }),
}

export function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { progress } = useUserProgress()

  const [justLoggedIn] = useState<boolean>(() => {
    const flag = sessionStorage.getItem('pokedex-just-logged-in') === '1'
    if (flag) sessionStorage.removeItem('pokedex-just-logged-in')
    return flag
  })

  const caught = useMemo(() => progress.filter(p => p.status === 'CAUGHT').length, [progress])
  const seen = useMemo(() => progress.filter(p => p.status === 'SEEN' || p.status === 'CAUGHT').length, [progress])
  const caughtPct = caught > 0 ? Math.max(1, Math.round((caught / TOTAL_POKEMON) * 100)) : 0
  const seenPct = seen > 0 ? Math.max(1, Math.round((seen / TOTAL_POKEMON) * 100)) : 0

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-5">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <motion.div
          className="app-card p-6 sm:p-8 text-center"
          initial={justLoggedIn ? { opacity: 0, scale: 0.95, y: 20 } : false}
          animate={justLoggedIn ? { opacity: 1, scale: 1, y: 0 } : undefined}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="flex justify-center mb-4"
            initial={justLoggedIn ? { y: -40, opacity: 0 } : false}
            animate={justLoggedIn ? { y: 0, opacity: 1 } : undefined}
            transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 180, damping: 14 }}
          >
            <PokeBallLarge variant="standard" size={64} />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-black text-charcoal tracking-tight mb-2">
            {t('home.title')}
          </h1>
          <p className="text-sm text-gray-500">
            {user
              ? <>{t('home.welcomeBack')} <span className="font-bold text-charcoal">{user.username}</span></>
              : t('home.tagline')
            }
          </p>
          {!user && (
            <div className="mt-5">
              <Button onClick={() => navigate('/login')}>{t('home.getStarted')}</Button>
            </div>
          )}
        </motion.div>

        {/* ── Progress dashboard (logged in only) ──────────────────────────── */}
        {user && (
          <motion.div
            className="app-card p-5"
            custom={0}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-pokedex-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                <h2 className="dex-section-heading mb-0">{t('home.myProgress')}</h2>
              </div>
              <button
                onClick={() => navigate('/pokedex')}
                className="text-xs font-semibold text-pokedex-red hover:underline cursor-pointer"
              >
                {t('home.viewAll')} →
              </button>
            </div>

            {/* Stat numbers */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {/* Caught */}
              <div className="text-center bg-pokedex-cyan/8 rounded-xl py-3 px-2">
                <div className="flex justify-center mb-1.5">
                  <span className="w-8 h-8 rounded-full bg-pokedex-cyan/15 flex items-center justify-center">
                    <svg className="w-4 h-4 text-pokedex-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </div>
                <p className="text-2xl font-bold font-mono tabular-nums text-pokedex-cyan">{caught}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{t('home.caught')}</p>
              </div>
              {/* Seen */}
              <div className="text-center bg-pokedex-amber/8 rounded-xl py-3 px-2">
                <div className="flex justify-center mb-1.5">
                  <span className="w-8 h-8 rounded-full bg-pokedex-amber/15 flex items-center justify-center">
                    <svg className="w-4 h-4 text-pokedex-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                </div>
                <p className="text-2xl font-bold font-mono tabular-nums text-pokedex-amber">{seen - caught}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{t('home.seen')}</p>
              </div>
              {/* Remaining */}
              <div className="text-center bg-gray-100/60 rounded-xl py-3 px-2">
                <div className="flex justify-center mb-1.5">
                  <span className="w-8 h-8 rounded-full bg-gray-200/60 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                  </span>
                </div>
                <p className="text-2xl font-bold font-mono tabular-nums text-gray-400">{TOTAL_POKEMON - seen}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{t('home.remaining')}</p>
              </div>
            </div>

            {/* Progress bars */}
            <div className="space-y-2.5">
              <div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-pokedex-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{t('home.caught')}</span>
                  </div>
                  <span className="font-mono tabular-nums">{caughtPct}%</span>
                </div>
                <div className="bg-cream rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${caughtPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    className="h-full rounded-full bg-pokedex-cyan"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-pokedex-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{t('home.seen')}</span>
                  </div>
                  <span className="font-mono tabular-nums">{seenPct}%</span>
                </div>
                <div className="bg-cream rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${seenPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.35 }}
                    className="h-full rounded-full bg-pokedex-amber"
                  />
                </div>
              </div>
            </div>

            {/* Milestone hint */}
            {caught > 0 && caught < TOTAL_POKEMON && (
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <svg className="w-3 h-3 text-pokedex-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
                <p className="text-[11px] text-gray-400">
                  {TOTAL_POKEMON - caught} {t('home.moreToCatch')}
                </p>
              </div>
            )}
            {caught === 0 && (
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <svg className="w-3 h-3 text-pokedex-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                <p className="text-[11px] text-gray-400 italic">{t('home.startScanning')}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── What you can do ──────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-pokedex-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            <h2 className="dex-section-heading mb-0">{t('home.quickActions')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FEATURES.map(({ to, color, bg, icon, titleKey, descKey }, i) => (
              <motion.div
                key={to}
                custom={i + 1}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.96 }}
              >
                <NavLink
                  to={to}
                  className="app-card p-4 flex flex-col gap-2.5 h-full
                             hover:shadow-lg transition-[border-color,box-shadow] duration-200
                             hover:border-pokedex-red/25 cursor-pointer group"
                >
                  <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}
                       style={{ color }}>
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-charcoal leading-snug group-hover:text-pokedex-red transition-colors">
                      {t(titleKey)}
                    </p>
                    <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{t(descKey)}</p>
                  </div>
                </NavLink>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Global stats ─────────────────────────────────────────────────── */}
        <motion.section
          className="app-card p-5"
          custom={5}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-pokedex-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M3.284 14.253A8.959 8.959 0 013 12c0-1.012.166-1.987.457-2.918" />
            </svg>
            <h2 className="dex-section-heading mb-0">{t('home.worldStats')}</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {([
              { variant: 'standard', count: '898', label: t('home.pokemon'), color: 'text-pokedex-red' },
              { variant: 'great',    count: '18',  label: t('home.types'),   color: 'text-pokedex-cyan' },
              { variant: 'ultra',    count: '9',   label: t('home.generations'), color: 'text-pokedex-amber' },
            ] as const).map(({ variant, count, label, color }) => (
              <motion.button
                key={variant}
                onClick={() => navigate('/gallery')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex flex-col items-center cursor-pointer group rounded-xl py-2
                           hover:bg-pokedex-red/5 transition-colors duration-150"
              >
                <PokeBall variant={variant} size={26} />
                <p className={`text-2xl font-bold font-mono tabular-nums mt-2 ${color}`}>{count}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5
                              group-hover:text-pokedex-red transition-colors">{label}</p>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* ── Pokéball strip ───────────────────────────────────────────────── */}
        <motion.div
          className="app-card px-5 py-4 flex items-center justify-around"
          custom={6}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          {(['standard', 'great', 'ultra', 'master', 'premier'] as const).map((v, i) => {
            const labels = ['Poké', 'Great', 'Ultra', 'Master', 'Premier']
            return (
              <div key={v} className="flex flex-col items-center gap-1.5">
                <PokeBall variant={v} size={30} />
                <span className="text-[9px] font-mono text-gray-400">{labels[i]}</span>
              </div>
            )
          })}
        </motion.div>

      </div>
    </AppLayout>
  )
}
