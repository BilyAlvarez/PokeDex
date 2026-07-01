import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LoginForm } from '../components/auth/LoginForm'
import { RegisterForm } from '../components/auth/RegisterForm'
import { PokeBall, PokeBallLarge } from '../components/ui/PokeBall'
import { useTranslation } from '../i18n/useTranslation'

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Red background — mobile only */}
      <div
        className="absolute inset-0 md:hidden pointer-events-none"
        style={{ background: 'linear-gradient(155deg, #e03030 0%, #c01a1a 55%, #8b0e0e 100%)' }}
      />

      {/* ── Brand panel ─────────────────────────────────────────────────────
          Mobile: horizontal strip (logo left, pokéball right)
          Desktop: full-height left panel (logo top, pokéball center, stats bottom)
      ──────────────────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden shrink-0
                   hidden
                   md:flex md:flex-col md:items-center md:justify-center md:px-8 md:py-0
                   md:w-[44%] md:min-h-screen"
        style={{ background: 'linear-gradient(155deg, #e03030 0%, #c01a1a 55%, #8b0e0e 100%)' }}
      >
        {/* Corner decorative rings */}
        <div className="absolute -top-14 -left-14 w-56 h-56 rounded-full border-[18px] border-white/[0.07] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full border-[22px] border-white/[0.05] pointer-events-none" />

        {/* Brand logo */}
        <button
          onClick={() => navigate('/home')}
          className="relative z-10 cursor-pointer text-left md:text-center md:mb-12"
        >
          <div className="flex items-center gap-2.5 md:justify-center mb-0.5 md:mb-2">
            <PokeBall size={22} className="opacity-85" />
            <h1 className="text-lg md:text-2xl font-black tracking-[0.2em] text-white">POKÉDEX</h1>
          </div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/38">
            {t('login.footer')}
          </p>
        </button>

        {/* ── Animated Pokéball ────────────────────────────────────────────── */}
        <div className="relative z-10 hidden md:flex items-center justify-center">

          {/* Radar pulse rings — desktop only (too large for mobile strip) */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-white/20 hidden md:block"
              style={{ width: 158, height: 158 }}
              animate={{ scale: [1, 2.1, 2.1], opacity: [0.5, 0, 0] }}
              transition={{ repeat: Infinity, duration: 2.8, delay: i * 0.92, ease: 'easeOut' }}
            />
          ))}

          {/* Floating Pokéball */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="relative"
          >
            {/* Glow halo */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                filter: 'blur(24px)',
                background: 'radial-gradient(circle, rgba(255,255,255,0.48) 0%, transparent 62%)',
                transform: 'scale(1.15)',
              }}
            />
            <PokeBallLarge size={156} className="drop-shadow-2xl" />
          </motion.div>
        </div>

        {/* Stats — desktop only */}
        <div className="relative z-10 hidden md:flex items-center mt-10">
          {[
            { value: '1025', label: t('home.pokemon') },
            { value: '18', label: t('home.types') },
            { value: 'IX', label: t('home.generations') },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              {i > 0 && <div className="w-px h-7 bg-white/20 mx-5" />}
              <div className="text-center">
                <p className="text-xl font-black text-white/90 tabular-nums leading-none">{stat.value}</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/38 mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form panel ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-8 md:py-0 md:bg-bone">
        {/* Pokéball + logo — mobile only, above the card */}
        <div className="md:hidden flex flex-col items-center mb-6">
          <PokeBallLarge size={72} className="drop-shadow-lg" />
          <h1 className="text-xl font-black tracking-[0.2em] text-white mt-3">POKÉDEX</h1>
        </div>

        <div className="w-full max-w-sm bg-white rounded-2xl border border-cream shadow-lg px-6 py-7 md:px-7 md:py-8">

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`heading-${mode}`}
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -7 }}
              transition={{ duration: 0.14 }}
              className="mb-5"
            >
              <h2 className="text-xl md:text-2xl font-bold text-charcoal">
                {mode === 'login' ? t('login.signInSub') : t('login.registerSub')}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {mode === 'login' ? 'Welcome back, Trainer' : 'Join the Pokédex network'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Tab switcher */}
          <div className="flex bg-bone rounded-xl p-1 border border-cream mb-5">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer
                ${mode === 'login' ? 'bg-pokedex-red text-white shadow-sm' : 'text-gray-500 hover:text-charcoal'}`}
            >
              {t('login.signIn')}
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer
                ${mode === 'register' ? 'bg-pokedex-red text-white shadow-sm' : 'text-gray-500 hover:text-charcoal'}`}
            >
              {t('login.register')}
            </button>
          </div>

          {/* Animated form */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'register' ? 18 : -18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'register' ? -18 : 18 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {mode === 'login' ? <LoginForm /> : <RegisterForm />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
